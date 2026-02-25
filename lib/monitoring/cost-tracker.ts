import { logger } from '../logger';

interface CostEntry {
  service: 'x-api' | 'openai';
  amount: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class CostTracker {
  private entries: CostEntry[] = [];
  private dailyTotals: Map<string, { xApi: number; openai: number }> = new Map();

  private getDateKey(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  trackXApiCredits(credits: number, metadata?: Record<string, any>) {
    const entry: CostEntry = {
      service: 'x-api',
      amount: credits,
      timestamp: new Date(),
      metadata,
    };

    this.entries.push(entry);
    
    const dateKey = this.getDateKey();
    const daily = this.dailyTotals.get(dateKey) || { xApi: 0, openai: 0 };
    daily.xApi += credits;
    this.dailyTotals.set(dateKey, daily);

    logger.info('X API credits tracked', {
      credits,
      dailyTotal: daily.xApi,
      ...metadata,
    });
  }

  trackOpenAITokens(tokens: number, metadata?: Record<string, any>) {
    const entry: CostEntry = {
      service: 'openai',
      amount: tokens,
      timestamp: new Date(),
      metadata,
    };

    this.entries.push(entry);
    
    const dateKey = this.getDateKey();
    const daily = this.dailyTotals.get(dateKey) || { xApi: 0, openai: 0 };
    daily.openai += tokens;
    this.dailyTotals.set(dateKey, daily);

    logger.info('OpenAI tokens tracked', {
      tokens,
      dailyTotal: daily.openai,
      ...metadata,
    });
  }

  getDailyTotal(service: 'x-api' | 'openai', date: Date = new Date()): number {
    const dateKey = this.getDateKey(date);
    const daily = this.dailyTotals.get(dateKey);
    
    if (!daily) return 0;
    
    return service === 'x-api' ? daily.xApi : daily.openai;
  }

  getTodayTotals(): { xApi: number; openai: number } {
    const dateKey = this.getDateKey();
    return this.dailyTotals.get(dateKey) || { xApi: 0, openai: 0 };
  }

  checkBudgets(): {
    xApi: { used: number; budget: number; exceeded: boolean };
    openai: { used: number; budget: number; exceeded: boolean };
  } {
    const totals = this.getTodayTotals();
    const xApiBudget = parseInt(process.env.DAILY_X_CREDIT_BUDGET || '1000', 10);
    const openAiBudget = parseInt(process.env.DAILY_OPENAI_TOKEN_BUDGET || '100000', 10);

    return {
      xApi: {
        used: totals.xApi,
        budget: xApiBudget,
        exceeded: totals.xApi >= xApiBudget,
      },
      openai: {
        used: totals.openai,
        budget: openAiBudget,
        exceeded: totals.openai >= openAiBudget,
      },
    };
  }

  getRecentEntries(limit: number = 100): CostEntry[] {
    return this.entries.slice(-limit);
  }

  clearOldEntries(daysToKeep: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.entries = this.entries.filter(
      (entry) => entry.timestamp >= cutoffDate
    );

    const cutoffKey = this.getDateKey(cutoffDate);
    for (const [key] of this.dailyTotals) {
      if (key < cutoffKey) {
        this.dailyTotals.delete(key);
      }
    }

    logger.info('Cleared old cost entries', { cutoffDate, daysToKeep });
  }
}

export const costTracker = new CostTracker();

setInterval(() => {
  costTracker.clearOldEntries(7);
}, 24 * 60 * 60 * 1000);
