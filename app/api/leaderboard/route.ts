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

    let leaderboard = await calculateLeaderboard(startOfWeek, endOfWeek);
    let rangeStart = startOfWeek;
    let rangeEnd = endOfWeek;
    let rangeLabel: 'current_week' | 'last_30_days' = 'current_week';

    // If this week has no eligible winners yet, fallback to recent data.
    if (Object.keys(leaderboard).length === 0) {
      const fallbackStart = new Date(now);
      fallbackStart.setDate(now.getDate() - 30);
      fallbackStart.setHours(0, 0, 0, 0);

      leaderboard = await calculateLeaderboard(fallbackStart, now);
      rangeStart = fallbackStart;
      rangeEnd = now;
      rangeLabel = 'last_30_days';
    }

    return NextResponse.json({
      leaderboard,
      week: {
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
        label: rangeLabel,
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
