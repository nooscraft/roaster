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

    const roast = await prisma.roast.findUnique({
      where: { id },
      include: { post: { include: { source: true } } },
    });

    if (!roast) {
      return NextResponse.json({ error: 'Roast not found' }, { status: 404 });
    }

    const updated = await prisma.roast.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    logger.info('Roast approved', {
      roastId: id,
      handle: roast.post.source.handle,
      approvedBy: session.user.email,
    });

    return NextResponse.json({ roast: updated });
  } catch (error) {
    logger.error('Failed to approve roast', { error });
    return NextResponse.json(
      { error: 'Failed to approve roast' },
      { status: 500 }
    );
  }
}
