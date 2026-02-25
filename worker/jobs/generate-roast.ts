import { PrismaClient } from '@prisma/client';
import { logger } from '../../lib/logger';
import { llmProvider } from '../../lib/llm/provider';
import { calculateBaseScore } from '../../lib/roast/bubble-scorer';
import { checkSafety, checkOptOut, rewriteToComply } from '../../lib/roast/safety-filter';
import { roastOutputSchema } from '../../lib/roast/schema';

const prisma = new PrismaClient();

export async function generateRoastJob(postId: string) {
  logger.info({ postId }, 'Generate roast job started');
  
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { source: true },
    });

    if (!post) {
      logger.warn({ postId }, 'Post not found');
      return;
    }

    // Skip if already roasted
    const existing = await prisma.roast.findUnique({ where: { postId } });
    if (existing) {
      logger.info({ postId }, 'Post already roasted, skipping');
      return;
    }

    const isOptedOut = await checkOptOut(
      post.source.handle,
      post.url,
      prisma
    );

    if (isOptedOut) {
      logger.info({
        postId,
        handle: post.source.handle,
      }, 'Post source is opted out, skipping');
      return;
    }

    const promptVersion = await prisma.promptVersion.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!promptVersion) {
      logger.error('No active prompt version found');
      return;
    }

    const baseScoreResult = calculateBaseScore(post.textExcerpt);
    logger.info({
      postId,
      baseScore: baseScoreResult.score,
      reasoning: baseScoreResult.reasoning,
    }, 'Base bubble score calculated');

    const userPrompt = promptVersion.userPromptTemplate
      .replace('{{handle}}', post.source.handle)
      .replace('{{excerpt}}', post.textExcerpt)
      .replace('{{url}}', post.url)
      .replace('{{date}}', post.publishedAt.toISOString())
      .replace('{{metrics}}', JSON.stringify(post.publicMetrics || {}));

    let roastOutput = await llmProvider.generateRoast(
      promptVersion.systemPrompt,
      userPrompt
    );

    const allContent = [
      roastOutput.translation,
      roastOutput.realityCheck,
      roastOutput.archetype,
      ...roastOutput.tags,
      ...roastOutput.scoreBreakdown.map(s => s.reason),
      roastOutput.awardCandidate || '',
    ].join(' ');

    let safetyCheck = await checkSafety(allContent, post.source.handle);

    if (!safetyCheck.safe) {
      logger.warn({
        postId,
        violations: safetyCheck.violations,
      }, 'Roast failed safety check, attempting rewrite');

      const rewritten = await rewriteToComply(allContent, safetyCheck.violations);
      safetyCheck = await checkSafety(rewritten, post.source.handle);

      if (!safetyCheck.safe) {
        logger.error({
          postId,
          violations: safetyCheck.violations,
        }, 'Roast failed safety check after rewrite');

        await prisma.roast.create({
          data: {
            postId: post.id,
            status: 'REJECTED',
            bubbleScore: roastOutput.bubbleScore,
            archetype: roastOutput.archetype,
            tags: roastOutput.tags,
            sections: {
              translation: roastOutput.translation,
              realityCheck: roastOutput.realityCheck,
              scoreBreakdown: roastOutput.scoreBreakdown,
              awardCandidate: roastOutput.awardCandidate,
              rejectionReason: safetyCheck.reason,
            },
            promptVersionId: promptVersion.id,
          },
        });

        return;
      }
    }

    const roast = await prisma.roast.create({
      data: {
        postId: post.id,
        status: 'PENDING',
        bubbleScore: roastOutput.bubbleScore,
        archetype: roastOutput.archetype,
        tags: roastOutput.tags,
        sections: {
          translation: roastOutput.translation,
          realityCheck: roastOutput.realityCheck,
          scoreBreakdown: roastOutput.scoreBreakdown,
          awardCandidate: roastOutput.awardCandidate,
        },
        promptVersionId: promptVersion.id,
      },
    });

    logger.info({
      roastId: roast.id,
      postId,
      status: roast.status,
      bubbleScore: roast.bubbleScore,
    }, 'Roast created successfully');

  } catch (error) {
    logger.error({ postId, error }, 'Generate roast job failed');
    throw error;
  }
}
