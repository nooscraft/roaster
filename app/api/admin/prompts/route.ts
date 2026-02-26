import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_JSON_SCHEMA = {
  type: 'object',
  required: ['bubbleScore', 'archetype', 'tags', 'translation', 'realityCheck', 'scoreBreakdown'],
  properties: {
    bubbleScore: { type: 'number', minimum: 0, maximum: 10 },
    archetype: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    translation: { type: 'string' },
    realityCheck: { type: 'string' },
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
    awardCandidate: { type: 'string' },
  },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompts = await prisma.promptVersion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, systemPrompt, userPromptTemplate } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (!systemPrompt?.trim()) {
      return NextResponse.json(
        { error: 'System prompt is required' },
        { status: 400 }
      );
    }
    if (!userPromptTemplate?.trim()) {
      return NextResponse.json(
        { error: 'User prompt template is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.promptVersion.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: `A prompt version named "${name.trim()}" already exists` },
        { status: 400 }
      );
    }

    const prompt = await prisma.promptVersion.create({
      data: {
        name: name.trim(),
        systemPrompt: systemPrompt.trim(),
        userPromptTemplate: userPromptTemplate.trim(),
        jsonSchema: (body.jsonSchema as object) ?? DEFAULT_JSON_SCHEMA,
        isActive: false,
      },
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Failed to create prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt version' },
      { status: 500 }
    );
  }
}
