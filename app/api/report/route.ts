import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { roastId, reason, details } = await request.json();

    if (!roastId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const roast = await prisma.roast.findUnique({
      where: { id: roastId, status: 'APPROVED' },
    });

    if (!roast) {
      return NextResponse.json(
        { error: 'Roast not found' },
        { status: 404 }
      );
    }

    const report = await prisma.report.create({
      data: {
        roastId,
        reason,
        details: details || null,
        status: 'PENDING',
      },
    });

    logger.info('Report submitted', {
      reportId: report.id,
      roastId,
      reason,
    });

    return NextResponse.json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    logger.error('Failed to submit report', { error });
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
