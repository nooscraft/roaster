import { prisma } from '../lib/prisma';

async function main() {
  console.log('Cleaning posts, roasts, reports, and resetting sinceId...');

  const reportsDeleted = await prisma.report.deleteMany({});
  console.log(`  Deleted ${reportsDeleted.count} reports`);

  const roastsDeleted = await prisma.roast.deleteMany({});
  console.log(`  Deleted ${roastsDeleted.count} roasts`);

  const postsDeleted = await prisma.post.deleteMany({});
  console.log(`  Deleted ${postsDeleted.count} posts`);

  const sourcesUpdated = await prisma.source.updateMany({
    data: { sinceId: null, lastSyncedAt: null },
  });
  console.log(`  Reset sinceId and lastSyncedAt on ${sourcesUpdated.count} sources`);

  console.log('Done. You can run sync and generate-roasts to test your new prompt.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
