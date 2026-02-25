import { NextResponse } from 'next/server';
import { calculateLeaderboard } from '@/lib/leaderboard/calculator';

export async function GET() {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const leaderboard = await calculateLeaderboard(startOfWeek, endOfWeek);

    return NextResponse.json({
      leaderboard,
      week: {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to calculate leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to calculate leaderboard' },
      { status: 500 }
    );
  }
}
