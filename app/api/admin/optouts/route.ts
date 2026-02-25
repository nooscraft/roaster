import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const optOuts = await prisma.optOut.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ optOuts });
  } catch (error) {
    console.error('Failed to fetch opt-outs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opt-outs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchType, value } = await request.json();

    if (!matchType || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const optOut = await prisma.optOut.create({
      data: {
        matchType,
        value,
      },
    });

    logger.info('Opt-out added', { matchType, value });

    return NextResponse.json({ optOut });
  } catch (error) {
    logger.error('Failed to add opt-out', { error });
    return NextResponse.json(
      { error: 'Failed to add opt-out' },
      { status: 500 }
    );
  }
}
