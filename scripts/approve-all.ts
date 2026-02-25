import { prisma } from '../lib/prisma';

async function approveAll() {
  console.log('✅ Approving all pending roasts...\n');

  const result = await prisma.roast.updateMany({
    where: { status: 'PENDING' },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  console.log(`Approved ${result.count} roasts!`);
  console.log('\n🎉 All roasts are now visible on the homepage!\n');

  await prisma.$disconnect();
}

approveAll().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
