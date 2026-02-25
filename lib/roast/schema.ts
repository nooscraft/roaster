import { z } from 'zod';

export const scoreBreakdownItemSchema = z.object({
  label: z.string(),
  score: z.number().min(0).max(10),
  reason: z.string().optional().default(''),
});

// Claude returns score_breakdown as an object like:
// { "buzzword_density": 8.5, "hype_inflation": 8.7 }
// This transforms it into our array format
function normalizeScoreBreakdown(
  val: unknown
): Array<{ label: string; score: number; reason: string }> {
  if (Array.isArray(val)) {
    return val
      .filter((item) => typeof item === 'object' && item !== null)
      .filter((item) => typeof (item as any).score === 'number')
      .map((item: any) => ({
        label: String(item.label ?? item.name ?? 'Score'),
        score: Number(item.score),
        reason: String(item.reason ?? item.comment ?? ''),
      }));
  }

  if (typeof val === 'object' && val !== null) {
    return Object.entries(val as Record<string, unknown>)
      .filter(([, v]) => typeof v === 'number')
      .map(([label, score]) => ({
        label: label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        score: Number(score),
        reason: '',
      }));
  }

  return [];
}

// Coerce reality_check to string in case Claude returns an object
const coerceToString = z.preprocess((val) => {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return JSON.stringify(val);
  return String(val ?? '');
}, z.string());

// Normalize keys: unwrap { roast: {...} } or { handle, roast } if present; accept snake_case and camelCase
function normalizeKeys(obj: unknown): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return {};
  const raw = obj as Record<string, unknown>;
  const inner = (raw.roast ?? raw) as Record<string, unknown>;
  return {
    bubble_score: inner.bubble_score ?? inner.bubbleScore,
    archetype: inner.archetype,
    tags: inner.tags,
    translation: inner.translation ?? inner.corporate_speak,
    reality_check:
      inner.reality_check ??
      inner.realityCheck ??
      inner.actual_meaning ??
      inner.human_translation,
    score_breakdown: inner.score_breakdown ?? inner.scoreBreakdown,
    award_candidate: inner.award_candidate ?? inner.awardCandidate,
  };
}

// Schema that accepts both snake_case and camelCase from LLM
const rawRoastOutputSchema = z.preprocess(normalizeKeys, z
  .object({
    bubble_score: z.number().transform((n) => Math.min(10, Math.max(0, n))), // clamp 0-10
    archetype: z.string(),
    tags: z.array(z.string()),
    translation: coerceToString,
    reality_check: coerceToString,
    score_breakdown: z.unknown(),
    award_candidate: z.string().optional().nullable(),
  })
  .passthrough());

// Transform to camelCase + normalize score_breakdown
export const roastOutputSchema = rawRoastOutputSchema.transform((data) => ({
  bubbleScore: data.bubble_score,
  archetype: data.archetype,
  tags: data.tags,
  translation: data.translation,
  realityCheck: data.reality_check,
  scoreBreakdown: normalizeScoreBreakdown(data.score_breakdown),
  awardCandidate: data.award_candidate ?? undefined,
}));

export type RoastOutput = z.infer<typeof roastOutputSchema>;
export type ScoreBreakdownItem = z.infer<typeof scoreBreakdownItemSchema>;
