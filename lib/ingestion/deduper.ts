import crypto from 'crypto';

export function generateRawHash(text: string): string {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

export function isRepost(post: any): boolean {
  if (!post.referenced_tweets) return false;

  return post.referenced_tweets.some(
    (ref: any) => ref.type === 'retweeted' || ref.type === 'quoted'
  );
}

/**
 * Check if post is a reply using referenced_tweets (client-side filter for edge cases).
 * Used before creating Post records so replies never get roasted (no LLM cost).
 */
export function isReply(post: any): boolean {
  if (!post.referenced_tweets) return false;
  return post.referenced_tweets.some((ref: any) => ref.type === 'replied_to');
}

export function shouldSkipPost(post: any, config: {
  skipReposts?: boolean;
  skipReplies?: boolean;
  allowedLanguages?: string[];
} = {}): boolean {
  // Skip replies — filter before DB insert so they never get roasted (saves LLM cost)
  if (config.skipReplies !== false && isReply(post)) {
    return true;
  }

  if (config.skipReposts && isRepost(post)) {
    return true;
  }

  if (config.allowedLanguages && config.allowedLanguages.length > 0) {
    if (!post.lang || !config.allowedLanguages.includes(post.lang)) {
      return true;
    }
  }

  return false;
}
