import { prisma } from '../lib/prisma';
import { xApiClient } from '../lib/x-api/client';
import { logger } from '../lib/logger';
import { generateRawHash, shouldSkipPost } from '../lib/ingestion/deduper';

async function syncNow() {
  console.log('🚀 Starting manual sync...\n');

  // Get all enabled sources
  const sources = await prisma.source.findMany({
    where: { enabled: true },
  });

  console.log(`Found ${sources.length} enabled handles:\n`);
  sources.forEach(s => console.log(`  - @${s.handle}`));
  console.log('');

  for (const source of sources) {
    try {
      console.log(`\n📡 Syncing @${source.handle}...`);

      // Resolve X user ID if missing
      if (!source.xUserId) {
        console.log('  Resolving X user ID...');
        const user = await xApiClient.getUserByUsername(source.handle);
        if (!user) {
          console.log(`  ⚠️ Could not resolve user ID for @${source.handle}, skipping`);
          continue;
        }
        await prisma.source.update({
          where: { id: source.id },
          data: { xUserId: user.id },
        });
        console.log(`  ✅ User ID: ${user.id}`);
      }

      // Fetch recent posts
      console.log('  Fetching recent posts...');
      const posts = await xApiClient.getUserTimeline(source.xUserId!, {
        maxResults: 3,
        sinceId: source.sinceId || undefined,
        excludeRetweets: true,
      });

      console.log(`  Found ${posts.length} posts`);

      let newPosts = 0;
      for (const post of posts) {
        // Skip reposts/retweets
        if (shouldSkipPost(post)) {
          continue;
        }

        // Check if already exists
        const existing = await prisma.post.findFirst({
          where: {
            OR: [
              { externalId: post.id },
              { rawHash: generateRawHash(post.text) },
            ],
          },
        });

        if (existing) {
          continue;
        }

        // Create new post
        await prisma.post.create({
          data: {
            sourceId: source.id,
            externalId: post.id,
            url: `https://x.com/${source.handle}/status/${post.id}`,
            textExcerpt: post.text.substring(0, 500),
            rawHash: generateRawHash(post.text),
            publishedAt: new Date(post.created_at),
            publicMetrics: post.public_metrics,
          },
        });

        newPosts++;
      }

      // Update source
      if (posts.length > 0) {
        await prisma.source.update({
          where: { id: source.id },
          data: {
            lastSyncedAt: new Date(),
            sinceId: posts[0].id,
          },
        });
      }

      console.log(`  ✅ Added ${newPosts} new posts`);
    } catch (error: any) {
      console.error(`  ❌ Error syncing @${source.handle}:`);
      console.error(`     ${error.message}`);
      console.error(`     Full error:`, error);
    }
  }

  // Show summary
  const totalPosts = await prisma.post.count();
  const totalRoasts = await prisma.roast.count();

  console.log('\n📊 Summary:');
  console.log(`  Total posts: ${totalPosts}`);
  console.log(`  Total roasts: ${totalRoasts}`);
  console.log(`  Posts without roasts: ${totalPosts - totalRoasts}`);

  console.log('\n✅ Sync complete!\n');

  await prisma.$disconnect();
}

syncNow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
