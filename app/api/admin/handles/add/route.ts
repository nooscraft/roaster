import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { xApiClient } from '@/lib/x-api/client';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { handle } = await request.json();

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({ error: 'Invalid handle' }, { status: 400 });
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
        { error: 'Handle already exists' },
        { status: 409 }
      );
    }

    let xUserId: string | null = null;
    try {
      const user = await xApiClient.getUserByUsername(cleanHandle);
      if (user) {
        xUserId = user.id;
      }
    } catch (error) {
      logger.warn({ handle: cleanHandle, error }, 'Failed to resolve X user ID');
    }

    const source = await prisma.source.create({
      data: {
        handle: cleanHandle,
        xUserId,
        enabled: true,
        type: 'X_HANDLE',
      },
    });

    logger.info({ handle: cleanHandle, xUserId }, 'Handle added');

    return NextResponse.json({ source });
  } catch (error) {
    logger.error({ error }, 'Failed to add handle');
    return NextResponse.json(
      { error: 'Failed to add handle' },
      { status: 500 }
    );
  }
}
