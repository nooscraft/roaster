import { rateLimiter } from './rate-limiter';
import { logger } from '../logger';

interface XUser {
  id: string;
  username: string;
  name: string;
}

interface XPost {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  referenced_tweets?: Array<{
    type: string;
    id: string;
  }>;
  lang?: string;
}

interface XTimelineResponse {
  data?: XPost[];
  meta?: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
}

export class XAPIClient {
  private bearerToken: string;
  private baseUrl = 'https://api.x.com/2';

  constructor(bearerToken?: string) {
    this.bearerToken = bearerToken || process.env.X_BEARER_TOKEN || '';
    if (!this.bearerToken) {
      logger.warn('X_BEARER_TOKEN not configured');
    }
  }

  private async request<T>(
    endpoint: string,
    cost: number = 1,
    retries: number = 3
  ): Promise<T> {
    const key = `x-api-${endpoint.split('?')[0]}`;
    
    await rateLimiter.acquireToken(key, cost);

    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          const retryAfter = parseInt(response.headers.get('x-rate-limit-reset') || '60', 10);
          logger.warn(`Rate limited. Retrying after ${retryAfter}s`, { endpoint });
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.request<T>(endpoint, cost, retries - 1);
        }

        const errorText = await response.text();
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = JSON.stringify(errorJson, null, 2);
        } catch {}
        
        logger.error('X API error', {
          endpoint,
          status: response.status,
          error: errorDetails,
          duration,
        });
        
        console.error('\n🚨 X API Error Details:');
        console.error(`   Endpoint: ${endpoint}`);
        console.error(`   Status: ${response.status}`);
        console.error(`   Response: ${errorDetails}\n`);
        
        throw new Error(`X API error: ${response.status} - ${errorDetails}`);
      }

      const data = await response.json();
      
      logger.info('X API request successful', {
        endpoint,
        status: response.status,
        duration,
        creditsUsed: cost,
      });

      return data as T;
    } finally {
      rateLimiter.releaseToken();
    }
  }

  async getUserByUsername(username: string): Promise<XUser | null> {
    try {
      const cleanUsername = username.replace('@', '');
      const response = await this.request<{ data: XUser }>(
        `/users/by/username/${cleanUsername}`,
        1
      );
      return response.data || null;
    } catch (error) {
      logger.error('Failed to get user by username', { username, error });
      return null;
    }
  }

  async getUserTimeline(
    userId: string,
    options: {
      maxResults?: number;
      sinceId?: string;
      excludeReplies?: boolean;
      excludeRetweets?: boolean;
    } = {}
  ): Promise<XPost[]> {
    try {
      // Exclude replies and retweets — original posts only
      // GET https://api.x.com/2/users/:id/tweets?exclude=replies,retweets
      const params = new URLSearchParams({
        max_results: Math.max(5, Math.min(100, options.maxResults || 10)).toString(),
        exclude: 'replies,retweets',
        'tweet.fields': 'created_at,public_metrics,referenced_tweets,lang',
      });

      if (options.sinceId) {
        params.set('since_id', options.sinceId);
      }

      const response = await this.request<XTimelineResponse>(
        `/users/${userId}/tweets?${params.toString()}`,
        1
      );

      return response.data || [];
    } catch (error) {
      logger.error('Failed to get user timeline', { userId, error });
      return [];
    }
  }

  async getPost(postId: string): Promise<XPost | null> {
    try {
      const response = await this.request<{ data: XPost }>(
        `/tweets/${postId}?tweet.fields=created_at,public_metrics,referenced_tweets,lang`,
        1
      );
      return response.data || null;
    } catch (error) {
      logger.error('Failed to get post', { postId, error });
      return null;
    }
  }

  getDailyCreditsUsed(): number {
    return rateLimiter.getDailyCreditsUsed();
  }

  getDailyBudget(): number {
    return rateLimiter.getDailyBudget();
  }
}

export const xApiClient = new XAPIClient();
