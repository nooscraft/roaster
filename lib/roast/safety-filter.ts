import { logger } from '../logger';

const BANNED_PATTERNS = [
  /\b(idiot|stupid|dumb|moron|retard)\b/i,
  /\b(fraud|scam|criminal|illegal)\b/i,
  /\b(kill|die|death|murder)\b/i,
  /\b(racist|sexist|homophobic)\b/i,
];

const PERSONAL_ATTACK_PATTERNS = [
  /\b(you are|you're|he is|she is|they are)\s+(stupid|dumb|idiot|incompetent)/i,
  /\b(liar|lying|lies)\b/i,
  /\b(should be fired|should resign|should quit)\b/i,
];

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  violations: string[];
}

export async function checkSafety(
  content: string,
  handle?: string
): Promise<SafetyCheckResult> {
  const violations: string[] = [];

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`Banned content: ${pattern.source}`);
    }
  }

  for (const pattern of PERSONAL_ATTACK_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`Personal attack: ${pattern.source}`);
    }
  }

  if (handle) {
    const handlePattern = new RegExp(`@?${handle}\\s+(is|are)\\s+(bad|terrible|awful|incompetent)`, 'i');
    if (handlePattern.test(content)) {
      violations.push('Direct personal attack on handle');
    }
  }

  const safe = violations.length === 0;

  if (!safe) {
    logger.warn('Safety check failed', { violations, handle });
  }

  return {
    safe,
    reason: violations.length > 0 ? violations.join('; ') : undefined,
    violations,
  };
}

export async function rewriteToComply(
  content: string,
  originalViolations: string[]
): Promise<string> {
  logger.info('Attempting to rewrite content to comply', {
    violations: originalViolations,
  });

  let rewritten = content;

  rewritten = rewritten.replace(/\b(idiot|stupid|dumb|moron)\b/gi, 'misguided');
  rewritten = rewritten.replace(/\b(fraud|scam)\b/gi, 'questionable');
  rewritten = rewritten.replace(/\b(liar|lying|lies)\b/gi, 'inaccurate');
  rewritten = rewritten.replace(/\b(you are|you're|he is|she is|they are)\s+/gi, 'This approach is ');

  return rewritten;
}

export async function checkOptOut(
  handle: string,
  url: string,
  prisma: any
): Promise<boolean> {
  const optOuts = await prisma.optOut.findMany();

  for (const optOut of optOuts) {
    if (optOut.matchType === 'HANDLE' && optOut.value.toLowerCase() === handle.toLowerCase()) {
      logger.info('Handle is opted out', { handle });
      return true;
    }

    if (optOut.matchType === 'URL_PREFIX' && url.startsWith(optOut.value)) {
      logger.info('URL matches opt-out prefix', { url, prefix: optOut.value });
      return true;
    }
  }

  return false;
}
