import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { handle, context } = await request.json();

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json(
        { error: 'Invalid handle' },
        { status: 400 }
      );
    }

    const cleanHandle = handle.replace('@', '').trim();

    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      return NextResponse.json(
        { error: 'Invalid handle format' },
        { status: 400 }
      );
    }

    const existing = await prisma.source.findUnique({
      where: { handle: cleanHandle },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Handle already exists or is pending review' },
        { status: 409 }
      );
    }

    const source = await prisma.source.create({
      data: {
        handle: cleanHandle,
        enabled: false,
        type: 'X_HANDLE',
      },
    });

    logger.info({
      handle: cleanHandle,
      context,
    }, 'Handle submitted for review');

    return NextResponse.json({
      message: 'Handle submitted successfully',
      source,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to submit handle');
    return NextResponse.json(
      { error: 'Failed to submit handle' },
      { status: 500 }
    );
  }
}
