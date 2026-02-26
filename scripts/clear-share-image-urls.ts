import { prisma } from '../lib/prisma';

async function main() {
  const result = await prisma.roast.updateMany({
    data: { shareImageUrl: null },
  });
  console.log(`Cleared shareImageUrl for ${result.count} roasts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
