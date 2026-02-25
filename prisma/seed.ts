import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const promptVersion = await prisma.promptVersion.upsert({
    where: { name: 'roast-v1' },
    update: {},
    create: {
      name: 'roast-v1',
      isActive: true,
      systemPrompt: `You are a savage, dry-witted comedian roasting AI corporate hype. Think: Arrested Development narrator meets a burnt-out SV engineer. Be FUNNY, specific, and ruthless about the bullshit — but roast the language and patterns, never the individual person.

Rules:
- Use specific details from the post, not generic commentary
- Punch up the absurdity with analogies (e.g. "like announcing your new stapler is a paradigm shift")
- Keep it SHORT and punchy — no waffle
- Be witty, not mean-spirited

You MUST respond with ONLY valid JSON. No other text before or after.
{
  "bubble_score": <number 0-10>,
  "archetype": "<one hilarious short phrase, e.g. 'Benchmark Theater Kid'>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "translation": "<1-2 sentences: the hilariously honest version of what they said>",
  "reality_check": "<1-2 sentences: the cold splash of water>",
  "score_breakdown": {
    "buzzword_density": <0-10>,
    "hype_inflation": <0-10>,
    "vagueness_factor": <0-10>
  },
  "award_candidate": "<a ridiculous trophy name they deserve, e.g. 'Golden Vaporware Award 2026'>"
}`,
      userPromptTemplate: `@{{handle}} just posted this banger:

"{{excerpt}}"

Roast it. Be specific, funny, and devastating. Max 2 sentences each for translation and reality_check.`,
      jsonSchema: {
        type: 'object',
        required: ['bubbleScore', 'archetype', 'tags', 'translation', 'realityCheck', 'scoreBreakdown'],
        properties: {
          bubbleScore: {
            type: 'number',
            minimum: 0,
            maximum: 10,
          },
          archetype: {
            type: 'string',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          translation: {
            type: 'string',
          },
          realityCheck: {
            type: 'string',
          },
          scoreBreakdown: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              type: 'object',
              required: ['label', 'score', 'reason'],
              properties: {
                label: { type: 'string' },
                score: { type: 'number', minimum: 0, maximum: 10 },
                reason: { type: 'string' },
              },
            },
          },
          awardCandidate: {
            type: 'string',
          },
        },
      },
    },
  });

  console.log('Created prompt version:', promptVersion.name);

  const exampleHandles = ['OpenAI', 'AnthropicAI', 'GoogleAI', 'MetaAI', 'MistralAI'];

  for (const handle of exampleHandles) {
    const source = await prisma.source.upsert({
      where: { handle },
      update: {},
      create: {
        handle,
        type: 'X_HANDLE',
        enabled: true,
      },
    });
    console.log('Created source:', source.handle);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
