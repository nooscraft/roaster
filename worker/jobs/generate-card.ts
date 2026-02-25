import { PrismaClient } from '@prisma/client';
import { logger } from '../../lib/logger';

const prisma = new PrismaClient();

export async function generateCardJob(roastId: string) {
  logger.info('Generate card job started', { roastId });
  
  try {
    const roast = await prisma.roast.findUnique({
      where: { id: roastId },
      include: { post: { include: { source: true } } },
    });

    if (!roast) {
      logger.warn('Roast not found', { roastId });
      return;
    }

    logger.info('Card generation placeholder', {
      roastId,
      handle: roast.post.source.handle,
    });

  } catch (error) {
    logger.error('Generate card job failed', { roastId, error });
    throw error;
  }
}
