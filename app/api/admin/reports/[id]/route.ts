import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
      },
    });

    logger.info('Report updated', {
      reportId: id,
      status,
      reviewedBy: session.user.email,
    });

    return NextResponse.json({ report: updated });
  } catch (error) {
    logger.error('Failed to update report', { error });
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
