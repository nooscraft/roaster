interface BuzzwordConfig {
  word: string;
  weight: number;
}

const BUZZWORDS: BuzzwordConfig[] = [
  { word: 'agentic', weight: 1.5 },
  { word: 'frontier', weight: 1.2 },
  { word: 'revolutionary', weight: 1.0 },
  { word: 'breakthrough', weight: 1.0 },
  { word: 'game-changing', weight: 1.0 },
  { word: 'paradigm shift', weight: 1.2 },
  { word: 'disrupting', weight: 0.8 },
  { word: 'transformative', weight: 0.8 },
];

const BENCHMARK_KEYWORDS = [
  'SOTA',
  'state of the art',
  'outperforms',
  'beats GPT',
  'surpasses',
  'best in class',
];

const STEALTH_KEYWORDS = [
  'coming soon',
  'stay tuned',
  'big announcement',
  'launching soon',
  'excited to announce',
  'can\'t wait to share',
];

const SHIPPING_EVIDENCE = [
  /v\d+\.\d+/,
  /github\.com/,
  /docs\./,
  /release notes/i,
  /changelog/i,
  /available now/i,
];

export function calculateBaseScore(text: string): {
  score: number;
  reasoning: string[];
} {
  const lowerText = text.toLowerCase();
  let score = 5.0;
  const reasoning: string[] = [];

  let buzzwordDensity = 0;
  for (const { word, weight } of BUZZWORDS) {
    const regex = new RegExp(word, 'gi');
    const matches = (text.match(regex) || []).length;
    if (matches > 0) {
      buzzwordDensity += matches * weight;
      reasoning.push(`Found "${word}" ${matches} time(s) (+${(matches * weight).toFixed(1)})`);
    }
  }

  if (buzzwordDensity > 0) {
    score += Math.min(buzzwordDensity, 3);
  }

  let hasShippingEvidence = false;
  for (const pattern of SHIPPING_EVIDENCE) {
    if (pattern.test(text)) {
      hasShippingEvidence = true;
      break;
    }
  }

  if (hasShippingEvidence) {
    score -= 1.5;
    reasoning.push('Has shipping evidence (version/docs/github) (-1.5)');
  }

  let benchmarkCount = 0;
  for (const keyword of BENCHMARK_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      benchmarkCount++;
    }
  }

  if (benchmarkCount > 0) {
    const hasContext = /dataset|hardware|baseline|compared to/i.test(text);
    if (!hasContext) {
      score += benchmarkCount * 0.8;
      reasoning.push(`Benchmark claims without context (+${(benchmarkCount * 0.8).toFixed(1)})`);
    } else {
      reasoning.push('Benchmark claims with context (neutral)');
    }
  }

  let stealthCount = 0;
  for (const keyword of STEALTH_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      stealthCount++;
    }
  }

  if (stealthCount > 0) {
    score += stealthCount * 0.7;
    reasoning.push(`Stealth mode language (+${(stealthCount * 0.7).toFixed(1)})`);
  }

  score = Math.max(0, Math.min(10, score));

  return {
    score: parseFloat(score.toFixed(1)),
    reasoning,
  };
}
