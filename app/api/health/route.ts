import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { xApiClient } from '@/lib/x-api/client';
import { costTracker } from '@/lib/monitoring/cost-tracker';

export async function GET() {
  const checks: Record<string, { status: string; details?: any }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'healthy' };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  checks.xApi = {
    status: process.env.X_BEARER_TOKEN ? 'configured' : 'not_configured',
    details: {
      creditsUsedToday: xApiClient.getDailyCreditsUsed(),
      dailyBudget: xApiClient.getDailyBudget(),
    },
  };

  checks.openai = {
    status: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
  };

  const costSummary = costTracker.getTodayTotals();
  checks.costs = {
    status: 'tracking',
    details: {
      xApiCreditsToday: costSummary.xApi,
      openaiTokensToday: costSummary.openai,
    },
  };

  const budgetStatus = costTracker.checkBudgets();
  checks.budgets = {
    status:
      budgetStatus.xApi.exceeded || budgetStatus.openai.exceeded
        ? 'exceeded'
        : 'ok',
    details: budgetStatus,
  };

  const allHealthy =
    checks.database.status === 'healthy' &&
    !budgetStatus.xApi.exceeded &&
    !budgetStatus.openai.exceeded;

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
