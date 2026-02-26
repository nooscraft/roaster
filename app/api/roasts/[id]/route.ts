import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roast = await prisma.roast.findUnique({
    where: { id, status: 'APPROVED' },
    include: { post: { include: { source: true } } },
  });
  if (!roast) {
    return NextResponse.json({ error: 'Roast not found' }, { status: 404 });
  }
  return NextResponse.json({
    archetype: roast.archetype,
    handle: roast.post.source.handle,
  });
}
