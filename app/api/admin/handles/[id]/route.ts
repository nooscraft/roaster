import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function DELETE(
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

    await prisma.source.delete({
      where: { id },
    });

    logger.info({ handle: source.handle }, 'Handle deleted');

    return NextResponse.json({ message: 'Handle deleted' });
  } catch (error) {
    logger.error({ error }, 'Failed to delete handle');
    return NextResponse.json(
      { error: 'Failed to delete handle' },
      { status: 500 }
    );
  }
}
