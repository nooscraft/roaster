import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [totalPosts, totalRoasts, pendingRoasts, pendingReports] = await Promise.all([
    prisma.post.count(),
    prisma.roast.count({ where: { status: 'APPROVED' } }),
    prisma.roast.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  return NextResponse.json({
    totalPosts,
    totalRoasts,
    pendingRoasts,
    pendingReports,
  });
}
