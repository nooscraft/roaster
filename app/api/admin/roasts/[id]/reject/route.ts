import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });

    logger.info('Roast rejected', {
      roastId: id,
      handle: roast.post.source.handle,
      rejectedBy: session.user.email,
    });

    return NextResponse.json({ roast: updated });
  } catch (error) {
    logger.error('Failed to reject roast', { error });
    return NextResponse.json(
      { error: 'Failed to reject roast' },
      { status: 500 }
    );
  }
}
