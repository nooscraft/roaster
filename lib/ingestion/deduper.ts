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

export function shouldSkipPost(post: any, config: {
  skipReposts?: boolean;
  allowedLanguages?: string[];
} = {}): boolean {
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
