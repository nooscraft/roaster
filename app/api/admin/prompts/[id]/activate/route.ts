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

    await prisma.promptVersion.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const updated = await prisma.promptVersion.update({
      where: { id },
      data: { isActive: true },
    });

    logger.info('Prompt version activated', {
      promptId: id,
      name: updated.name,
      activatedBy: session.user.email,
    });

    return NextResponse.json({ prompt: updated });
  } catch (error) {
    logger.error('Failed to activate prompt', { error });
    return NextResponse.json(
      { error: 'Failed to activate prompt' },
      { status: 500 }
    );
  }
}
