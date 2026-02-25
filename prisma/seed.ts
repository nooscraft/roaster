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
      systemPrompt: `You are a satirical AI analyst roasting corporate AI hype.
Roast the language patterns and marketing tactics, not individuals.
Be funny, punchy, and fair. No personal attacks, slurs, or defamation.
Output strict JSON matching the schema.`,
      userPromptTemplate: `Handle: {{handle}}
Post: {{excerpt}}
URL: {{url}}
Published: {{date}}
Metrics: {{metrics}}

Generate a roast with bubble score, archetype, tags, translation, reality check, and score breakdown.`,
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
