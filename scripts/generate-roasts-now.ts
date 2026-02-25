import { prisma } from '../lib/prisma';
import { llmProvider } from '../lib/llm/provider';
import { calculateBaseScore } from '../lib/roast/bubble-scorer';
import { checkOptOut } from '../lib/roast/safety-filter';

async function generateRoastsNow() {
  console.log('🔥 Starting roast generation...\n');

  // Get active prompt version
  const promptVersion = await prisma.promptVersion.findFirst({
    where: { isActive: true },
  });

  if (!promptVersion) {
    console.error('❌ No active prompt version found!');
    process.exit(1);
  }

  // Get posts without roasts
  const posts = await prisma.post.findMany({
    where: { roast: null },
    take: 10,
    include: { source: true },
  });

  console.log(`Found ${posts.length} posts to roast\n`);

  if (posts.length === 0) {
    console.log('✅ All posts already have roasts!');
    await prisma.$disconnect();
    return;
  }

  for (const post of posts) {
    try {
      console.log(`\n🎯 Roasting post from @${post.source.handle}...`);
      console.log(`   "${post.textExcerpt.substring(0, 80)}..."`);

      // Check opt-out
      const optedOut = await checkOptOut(post.source.handle, post.url, prisma);
      if (optedOut) {
        console.log('   ⏭️  Skipped (opted out)');
        continue;
      }

      // Calculate base score
      const { score: baseScore } = calculateBaseScore(post.textExcerpt);

      // Generate roast
      const userPrompt = promptVersion.userPromptTemplate
        .replace('{{handle}}', post.source.handle)
        .replace('{{excerpt}}', post.textExcerpt)
        .replace('{{url}}', post.url)
        .replace('{{date}}', post.publishedAt.toISOString())
        .replace('{{metrics}}', JSON.stringify(post.publicMetrics));

      console.log('   🤖 Calling LLM...');
      const roastOutput = await llmProvider.generateRoast(
        promptVersion.systemPrompt,
        userPrompt
      );

      const status = 'PENDING';

      // Create roast (auto-approved)
      await prisma.roast.create({
        data: {
          postId: post.id,
          promptVersionId: promptVersion.id,
          bubbleScore: roastOutput.bubbleScore,
          archetype: roastOutput.archetype,
          tags: roastOutput.tags,
          sections: roastOutput as any,
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      console.log(`   ✅ Roast created (${status})`);
      console.log(`   📊 Bubble Score: ${roastOutput.bubbleScore}/10`);
      console.log(`   🏷️  Tags: ${roastOutput.tags.join(', ')}`);
    } catch (error: any) {
      console.error(`   ❌ Failed:`, error.message);
    }
  }

  // Show summary
  const totalRoasts = await prisma.roast.count();
  const pendingRoasts = await prisma.roast.count({
    where: { status: 'PENDING' },
  });
  const approvedRoasts = await prisma.roast.count({
    where: { status: 'APPROVED' },
  });

  console.log('\n📊 Summary:');
  console.log(`  Total roasts: ${totalRoasts}`);
  console.log(`  Pending approval: ${pendingRoasts}`);
  console.log(`  Approved: ${approvedRoasts}`);

  console.log('\n✅ Generation complete!\n');

  await prisma.$disconnect();
}

generateRoastsNow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
