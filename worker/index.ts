import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger';
import { syncHandlesJob } from './jobs/sync-handles';
import { generateRoastJob } from './jobs/generate-roast';
import { generateCardJob } from './jobs/generate-card';

const prisma = new PrismaClient();

interface Job {
  type: 'SYNC_HANDLES' | 'GENERATE_ROAST' | 'GENERATE_CARD';
  payload: any;
}

class Worker {
  private running = false;
  private pollInterval = 30000;

  async start() {
    this.running = true;
    logger.info('Worker started');

    this.scheduleSyncJob();

    while (this.running) {
      await this.processJobs();
      await this.sleep(5000);
    }
  }

  async stop() {
    this.running = false;
    await prisma.$disconnect();
    logger.info('Worker stopped');
  }

  private scheduleSyncJob() {
    setInterval(async () => {
      if (this.running) {
        logger.info('Scheduled sync job triggered');
        await syncHandlesJob();
      }
    }, this.pollInterval);

    syncHandlesJob();
  }

  private async processJobs() {
    try {
    } catch (error) {
      logger.error('Error processing jobs', { error });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const worker = new Worker();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

worker.start().catch((error) => {
  logger.error('Worker failed to start', { error });
  process.exit(1);
});
