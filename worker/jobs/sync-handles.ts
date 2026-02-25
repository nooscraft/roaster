import { PrismaClient } from '@prisma/client';
import { xApiClient } from '../../lib/x-api/client';
import { generateRawHash, shouldSkipPost } from '../../lib/ingestion/deduper';
import { logger } from '../../lib/logger';
import { costTracker } from '../../lib/monitoring/cost-tracker';

const prisma = new PrismaClient();

export async function syncHandlesJob() {
  const startTime = Date.now();
  logger.info('Starting sync handles job');

  try {
    const sources = await prisma.source.findMany({
      where: { enabled: true },
    });

    logger.info(`Found ${sources.length} enabled sources`);

    let totalPostsFetched = 0;
    let totalNewPosts = 0;
    const errors: string[] = [];

    for (const source of sources) {
      try {
        await syncSource(source);
        totalPostsFetched++;
      } catch (error) {
        logger.error({
          handle: source.handle,
          error,
        }, 'Failed to sync source');
        errors.push(`${source.handle}: ${error}`);
      }
    }

    const duration = Date.now() - startTime;
    logger.info({
      duration,
      totalSources: sources.length,
      totalPostsFetched,
      totalNewPosts,
      errors: errors.length,
    }, 'Sync handles job completed');
  } catch (error) {
    logger.error({ error }, 'Sync handles job failed');
    throw error;
  }
}

async function syncSource(source: any) {
  logger.info({ handle: source.handle }, 'Syncing source');

  if (!source.xUserId) {
    logger.info({ handle: source.handle }, 'Resolving X user ID');
    const user = await xApiClient.getUserByUsername(source.handle);
    
    if (!user) {
      logger.warn({ handle: source.handle }, 'Failed to resolve X user');
      return;
    }

    await prisma.source.update({
      where: { id: source.id },
      data: { xUserId: user.id },
    });

    source.xUserId = user.id;
    logger.info({ handle: source.handle, xUserId: user.id }, 'X user ID resolved');
  }

  const posts = await xApiClient.getUserTimeline(source.xUserId, {
    maxResults: 3,
    sinceId: source.sinceId || undefined,
    excludeRetweets: true,
  });

  logger.info({
    handle: source.handle,
    count: posts.length,
  }, 'Fetched posts');

  let newPostsCount = 0;
  let latestPostId = source.sinceId;

  for (const post of posts) {
    try {
      if (shouldSkipPost(post, { skipReposts: true })) {
        logger.debug('Skipping post', { postId: post.id, reason: 'repost' });
        continue;
      }

      const rawHash = generateRawHash(post.text);

      const existing = await prisma.post.findFirst({
        where: {
          OR: [
            { externalId: post.id, sourceId: source.id },
            { rawHash },
          ],
        },
      });

      if (existing) {
        logger.debug('Post already exists', { postId: post.id });
        continue;
      }

      const newPost = await prisma.post.create({
        data: {
          sourceId: source.id,
          externalId: post.id,
          url: `https://twitter.com/${source.handle}/status/${post.id}`,
          publishedAt: new Date(post.created_at),
          textExcerpt: post.text.substring(0, 500),
          lang: post.lang,
          publicMetrics: post.public_metrics || {},
          rawHash,
        },
      });

      newPostsCount++;
      logger.info({
        postId: newPost.id,
        externalId: post.id,
        handle: source.handle,
      }, 'New post created');

      if (!latestPostId || post.id > latestPostId) {
        latestPostId = post.id;
      }
    } catch (error) {
      logger.error({
        postId: post.id,
        handle: source.handle,
        error,
      }, 'Failed to process post');
    }
  }

  await prisma.source.update({
    where: { id: source.id },
    data: {
      lastSyncedAt: new Date(),
      sinceId: latestPostId,
    },
  });

  logger.info({
    handle: source.handle,
    newPosts: newPostsCount,
  }, 'Source sync completed');

  costTracker.trackXApiCredits(2, {
    handle: source.handle,
    operation: 'sync',
  });
}
