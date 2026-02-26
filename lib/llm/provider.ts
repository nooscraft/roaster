import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { logger } from '../logger';
import { costTracker } from '../monitoring/cost-tracker';
import { roastOutputSchema, RoastOutput } from '../roast/schema';

export class LLMProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005',
        'X-Title': 'Froth',
      },
    });
  }

  async generateRoast(
    systemPrompt: string,
    userPrompt: string,
    maxRetries: number = 3
  ): Promise<RoastOutput> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        const completion = await this.client.chat.completions.create({
          model: 'anthropic/claude-3.5-haiku',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.9,
          max_tokens: 2000,
        });

        const duration = Date.now() - startTime;

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response from LLM');
        }

        // Parse JSON response and validate with Zod
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (parseError) {
          console.error('❌ JSON Parse Error:', parseError);
          console.error('Raw content (first 1000 chars):', content.substring(0, 1000));
          throw new Error(`Failed to parse JSON: ${parseError}`);
        }

        // Validate and transform with Zod
        const result = roastOutputSchema.parse(parsed);

        const tokensUsed =
          (completion.usage?.prompt_tokens || 0) +
          (completion.usage?.completion_tokens || 0);

        costTracker.trackOpenAITokens(tokensUsed, {
          model: 'anthropic/claude-3.5-haiku',
          duration,
          attempt,
        });

        logger.info('LLM generation successful', {
          duration,
          tokensUsed,
          attempt,
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        logger.warn('LLM generation attempt failed', {
          attempt,
          error: lastError.message,
        });

        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          logger.info(`Retrying after ${backoffMs}ms`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    logger.error('LLM generation failed after all retries', {
      error: lastError,
      maxRetries,
    });
    throw lastError || new Error('LLM generation failed');
  }

  async rewriteForCompliance(
    originalContent: string,
    violations: string[]
  ): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are a content moderator. Rewrite the following roast to comply with these guidelines:
- No personal attacks or slurs
- Roast the pattern/language, not the person
- Keep it funny and punchy
- No defamation or false claims`,
          },
          {
            role: 'user',
            content: `Original content (violations: ${violations.join(', ')}):\n\n${originalContent}\n\nRewrite to comply:`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const rewritten = completion.choices[0]?.message?.content || originalContent;

      logger.info('Content rewritten for compliance', {
        originalLength: originalContent.length,
        rewrittenLength: rewritten.length,
      });

      return rewritten;
    } catch (error) {
      logger.error('Failed to rewrite content', { error });
      return originalContent;
    }
  }
}

export const llmProvider = new LLMProvider();
