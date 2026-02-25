import { PrismaClient } from '@prisma/client';
import { logger } from '../../lib/logger';

const prisma = new PrismaClient();

export async function generateCardJob(roastId: string) {
  logger.info({ roastId }, 'Generate card job started');
  
  try {
    const roast = await prisma.roast.findUnique({
      where: { id: roastId },
      include: { post: { include: { source: true } } },
    });

    if (!roast) {
      logger.warn({ roastId }, 'Roast not found');
      return;
    }

    logger.info({
      roastId,
      handle: roast.post.source.handle,
    }, 'Card generation placeholder');

  } catch (error) {
    logger.error({ roastId, error }, 'Generate card job failed');
    throw error;
  }
}
