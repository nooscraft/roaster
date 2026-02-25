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

    const updated = await prisma.source.update({
      where: { id },
      data: { enabled: !source.enabled },
    });

    logger.info('Handle toggled', {
      handle: source.handle,
      enabled: updated.enabled,
    });

    return NextResponse.json({ source: updated });
  } catch (error) {
    logger.error('Failed to toggle handle', { error });
    return NextResponse.json(
      { error: 'Failed to toggle handle' },
      { status: 500 }
    );
  }
}
