interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private globalConcurrency = 0;
  private maxGlobalConcurrency = 5;
  private dailyCreditsUsed = 0;
  private dailyBudget: number;
  private lastReset: Date;

  constructor(dailyBudget: number = 1000) {
    this.dailyBudget = dailyBudget;
    this.lastReset = new Date();
    this.resetDailyIfNeeded();
  }

  private resetDailyIfNeeded() {
    const now = new Date();
    const daysSinceReset = Math.floor(
      (now.getTime() - this.lastReset.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceReset >= 1) {
      this.dailyCreditsUsed = 0;
      this.lastReset = now;
    }
  }

  private getOrCreateBucket(key: string): TokenBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: 15,
        lastRefill: Date.now(),
        capacity: 15,
        refillRate: 15 / (15 * 60 * 1000),
      });
    }
    return this.buckets.get(key)!;
  }

  private refillBucket(bucket: TokenBucket) {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = timePassed * bucket.refillRate;
    
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  async acquireToken(key: string, cost: number = 1): Promise<void> {
    this.resetDailyIfNeeded();

    if (this.dailyCreditsUsed + cost > this.dailyBudget) {
      throw new Error('Daily budget exceeded. Ingestion paused.');
    }

    while (this.globalConcurrency >= this.maxGlobalConcurrency) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const bucket = this.getOrCreateBucket(key);
    
    while (true) {
      this.refillBucket(bucket);
      
      if (bucket.tokens >= cost) {
        bucket.tokens -= cost;
        this.globalConcurrency++;
        this.dailyCreditsUsed += cost;
        return;
      }
      
      const waitTime = (cost - bucket.tokens) / bucket.refillRate;
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 1000)));
    }
  }

  releaseToken() {
    this.globalConcurrency = Math.max(0, this.globalConcurrency - 1);
  }

  getDailyCreditsUsed(): number {
    this.resetDailyIfNeeded();
    return this.dailyCreditsUsed;
  }

  getDailyBudget(): number {
    return this.dailyBudget;
  }

  setDailyBudget(budget: number) {
    this.dailyBudget = budget;
  }
}

export const rateLimiter = new RateLimiter(
  parseInt(process.env.DAILY_X_CREDIT_BUDGET || '1000', 10)
);
