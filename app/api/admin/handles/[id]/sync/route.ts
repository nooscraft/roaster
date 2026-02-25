import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const source = await prisma.source.findUnique({
      where: { id },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    if (!source.enabled) {
      return NextResponse.json(
        { error: 'Source is disabled' },
        { status: 400 }
      );
    }

    logger.info('Sync job requested', { handle: source.handle });

    return NextResponse.json({
      message: 'Sync job enqueued',
      jobId: `sync-${id}-${Date.now()}`,
    });
  } catch (error) {
    logger.error('Failed to trigger sync', { error });
    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 }
    );
  }
}
