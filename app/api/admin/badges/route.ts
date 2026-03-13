import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all badges, ordered by most recent
    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 most recent
    });

    return NextResponse.json({ badges });
  } catch (error: any) {
    console.error('Failed to fetch badges:', error);
    return NextResponse.json(
      { error: `Failed to fetch badges: ${error.message}` },
      { status: 500 }
    );
  }
}
