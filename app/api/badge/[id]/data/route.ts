import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const badge = await prisma.badge.findUnique({ 
      where: { id },
      select: {
        handle: true,
        bubbleScore: true,
        roastText: true,
      }
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Failed to fetch badge data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge data' },
      { status: 500 }
    );
  }
}
