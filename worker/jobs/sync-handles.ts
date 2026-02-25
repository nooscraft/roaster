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
        logger.error('Failed to sync source', {
          handle: source.handle,
          error,
        });
        errors.push(`${source.handle}: ${error}`);
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Sync handles job completed', {
      duration,
      totalSources: sources.length,
      totalPostsFetched,
      totalNewPosts,
      errors: errors.length,
    });
  } catch (error) {
    logger.error('Sync handles job failed', { error });
    throw error;
  }
}

async function syncSource(source: any) {
  logger.info('Syncing source', { handle: source.handle });

  if (!source.xUserId) {
    logger.info('Resolving X user ID', { handle: source.handle });
    const user = await xApiClient.getUserByUsername(source.handle);
    
    if (!user) {
      logger.warn('Failed to resolve X user', { handle: source.handle });
      return;
    }

    await prisma.source.update({
      where: { id: source.id },
      data: { xUserId: user.id },
    });

    source.xUserId = user.id;
    logger.info('X user ID resolved', { handle: source.handle, xUserId: user.id });
  }

  const posts = await xApiClient.getUserTimeline(source.xUserId, {
    maxResults: 20,
    sinceId: source.sinceId || undefined,
    excludeRetweets: true,
  });

  logger.info('Fetched posts', {
    handle: source.handle,
    count: posts.length,
  });

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
      logger.info('New post created', {
        postId: newPost.id,
        externalId: post.id,
        handle: source.handle,
      });

      if (!latestPostId || post.id > latestPostId) {
        latestPostId = post.id;
      }
    } catch (error) {
      logger.error('Failed to process post', {
        postId: post.id,
        handle: source.handle,
        error,
      });
    }
  }

  await prisma.source.update({
    where: { id: source.id },
    data: {
      lastSyncedAt: new Date(),
      sinceId: latestPostId,
    },
  });

  logger.info('Source sync completed', {
    handle: source.handle,
    newPosts: newPostsCount,
  });

  costTracker.trackXApiCredits(2, {
    handle: source.handle,
    operation: 'sync',
  });
}
