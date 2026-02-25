import { z } from 'zod';

export const scoreBreakdownItemSchema = z.object({
  label: z.string(),
  score: z.number().min(0).max(10),
  reason: z.string(),
});

export const roastOutputSchema = z.object({
  bubbleScore: z.number().min(0).max(10),
  archetype: z.string(),
  tags: z.array(z.string()),
  translation: z.string(),
  realityCheck: z.string(),
  scoreBreakdown: z.array(scoreBreakdownItemSchema).length(3),
  awardCandidate: z.string().optional(),
});

export type RoastOutput = z.infer<typeof roastOutputSchema>;
export type ScoreBreakdownItem = z.infer<typeof scoreBreakdownItemSchema>;
