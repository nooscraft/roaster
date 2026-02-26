import { chromium } from 'playwright';
import { prisma } from '../../lib/prisma';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

async function generateShareCards() {
  console.log('🎨 Starting share card generation...');

  // Find approved roasts without share images
  const roasts = await prisma.roast.findMany({
    where: {
      status: 'APPROVED',
      shareImageUrl: null,
    },
    take: 20, // Limit to avoid long runs
    include: {
      post: {
        include: {
          source: true,
        },
      },
    },
  });

  console.log(`Found ${roasts.length} roasts needing share cards`);

  if (roasts.length === 0) {
    console.log('✅ All roasts already have share cards');
    return;
  }

  // Launch browser
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });

  for (const roast of roasts) {
    const filename = `roast-${roast.id}.png`;
    const filepath = join(process.cwd(), 'public', 'share-cards', filename);

    if (existsSync(filepath)) {
      console.log(`Skipping roast ${roast.id} - card already exists`);
      if (!roast.shareImageUrl) {
        const shareImageUrl = `/share-cards/${filename}`;
        await prisma.roast.update({ where: { id: roast.id }, data: { shareImageUrl } });
        console.log(`  Updated DB with shareImageUrl`);
      }
      continue;
    }

    try {
      const cardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/card/${roast.id}`;
      console.log(`Generating card for roast ${roast.id}...`);

      // Navigate to card page
      await page.goto(cardUrl, { waitUntil: 'networkidle' });

      // Take screenshot
      const screenshot = await page.screenshot({ type: 'png' });

      // Save to public/share-cards/
      writeFileSync(filepath, screenshot);

      // Update database with relative URL
      const shareImageUrl = `/share-cards/${filename}`;
      await prisma.roast.update({
        where: { id: roast.id },
        data: { shareImageUrl },
      });

      console.log(`✅ Generated share card: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to generate card for roast ${roast.id}:`, error);
    }
  }

  await browser.close();
  await prisma.$disconnect();

  console.log('🎉 Share card generation complete!');
}

generateShareCards().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
