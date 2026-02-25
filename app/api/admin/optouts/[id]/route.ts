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

    await prisma.optOut.delete({
      where: { id },
    });

    logger.info('Opt-out deleted', { id });

    return NextResponse.json({ message: 'Opt-out deleted' });
  } catch (error) {
    logger.error('Failed to delete opt-out', { error });
    return NextResponse.json(
      { error: 'Failed to delete opt-out' },
      { status: 500 }
    );
  }
}
