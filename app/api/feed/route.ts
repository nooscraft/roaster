import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const tag = searchParams.get('tag');
    const minScore = parseFloat(searchParams.get('minScore') || '0');
    const maxScore = parseFloat(searchParams.get('maxScore') || '10');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = searchParams.get('sort') || 'latest';

    const where: any = {
      status: 'APPROVED',
      bubbleScore: {
        gte: minScore,
        lte: maxScore,
      },
    };

    if (handle) {
      where.post = {
        source: {
          handle: {
            contains: handle,
            mode: 'insensitive',
          },
        },
      };
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    let orderBy: any = { approvedAt: 'desc' };
    if (sort === 'score') {
      orderBy = { bubbleScore: 'desc' };
    }

    const roasts = await prisma.roast.findMany({
      where,
      include: {
        post: {
          include: {
            source: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Shuffle so different handles are interleaved (Fisher-Yates)
    for (let i = roasts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roasts[i], roasts[j]] = [roasts[j], roasts[i]];
    }

    const total = await prisma.roast.count({ where });

    // Global most recent roast approved time (for "last baked" display)
    const newest = await prisma.roast.findFirst({
      where: { status: 'APPROVED', approvedAt: { not: null } },
      orderBy: { approvedAt: 'desc' },
      select: { approvedAt: true },
    });
    const newestApprovedAt = newest?.approvedAt?.toISOString() ?? null;

    return NextResponse.json({
      roasts,
      newestApprovedAt,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
