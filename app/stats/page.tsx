import { prisma } from '@/lib/prisma';
import { BubbleTrendChart } from '@/components/stats/BubbleTrendChart';

type HandleRow = {
  post: {
    source: {
      handle: string;
    };
  };
};

function formatExactTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

function formatHourRangeUtc(hour: number): string {
  const nextHour = (hour + 1) % 24;
  const paddedHour = String(hour).padStart(2, '0');
  const paddedNextHour = String(nextHour).padStart(2, '0');
  return `${paddedHour}:00-${paddedNextHour}:00 UTC`;
}

async function getStatsData() {
  const [approvedRoastCount, roastHandles, firstApprovedRoast, roastTimes, roastTrendRows] = await Promise.all([
    prisma.roast.count({ where: { status: 'APPROVED' } }),
    prisma.roast.findMany({
      where: { status: 'APPROVED' },
      select: {
        post: {
          select: {
            source: {
              select: { handle: true },
            },
          },
        },
      },
    }),
    prisma.roast.findFirst({
      where: { status: 'APPROVED', approvedAt: { not: null } },
      orderBy: { approvedAt: 'asc' },
      select: { approvedAt: true },
    }),
    prisma.roast.findMany({
      where: { status: 'APPROVED', approvedAt: { not: null } },
      select: { approvedAt: true },
    }),
    prisma.roast.findMany({
      where: { status: 'APPROVED', approvedAt: { not: null } },
      select: { approvedAt: true, bubbleScore: true },
    }),
  ]);

  const countsByHandle = (roastHandles as HandleRow[]).reduce<Record<string, number>>((acc, row) => {
    const handle = row.post.source.handle;
    acc[handle] = (acc[handle] || 0) + 1;
    return acc;
  }, {});

  const handlesSorted = Object.entries(countsByHandle).sort((a, b) => b[1] - a[1]);
  const roastCountsByHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
  }));

  for (const row of roastTimes) {
    if (!row.approvedAt) continue;
    const utcHour = row.approvedAt.getUTCHours();
    roastCountsByHour[utcHour].count += 1;
  }

  const peakRoastHour = [...roastCountsByHour].sort((a, b) => b.count - a.count)[0];
  const activeRoastHours = roastCountsByHour.filter((entry) => entry.count > 0);
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recentWindowStart = now - sevenDaysMs;
  const previousWindowStart = now - sevenDaysMs * 2;

  const recentScores = roastTrendRows
    .filter((row) => row.approvedAt && row.approvedAt.getTime() >= recentWindowStart)
    .map((row) => row.bubbleScore);

  const previousScores = roastTrendRows
    .filter(
      (row) =>
        row.approvedAt &&
        row.approvedAt.getTime() >= previousWindowStart &&
        row.approvedAt.getTime() < recentWindowStart
    )
    .map((row) => row.bubbleScore);

  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  const recentAverageScore = average(recentScores);
  const previousAverageScore = average(previousScores);
  const trendDelta = recentAverageScore - previousAverageScore;

  let trendLabel = 'STABLE CHAOS';
  let trendMessage =
    'Roughly the same level of performative optimism. Nobody is learning, but nobody is escalating either.';
  let trendColor = '#666';

  if (recentScores.length === 0 && previousScores.length === 0) {
    trendLabel = 'NO SIGNAL YET';
    trendMessage = 'Not enough roast data yet. The nonsense graph is still booting.';
    trendColor = '#666';
  } else if (trendDelta >= 0.3) {
    trendLabel = 'GETTING WORSE';
    trendMessage =
      'Bubble score is climbing. Industry confidence is up, while concrete details remain on vacation.';
    trendColor = '#c0392b';
  } else if (trendDelta <= -0.3) {
    trendLabel = 'GETTING BETTER';
    trendMessage =
      'Bubble score is dropping. Slightly fewer buzzword fireworks, slightly more reality entering the chat.';
    trendColor = '#1f7a3d';
  }

  const trendDays = 30;
  const formatDayKey = (date: Date) => date.toISOString().slice(0, 10);
  const dailyMap = new Map<string, { label: string; sum: number; count: number }>();

  for (let i = trendDays - 1; i >= 0; i--) {
    const date = new Date(now - i * oneDayMs);
    const key = formatDayKey(date);
    const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dailyMap.set(key, { label, sum: 0, count: 0 });
  }

  for (const row of roastTrendRows) {
    if (!row.approvedAt) continue;
    const key = formatDayKey(row.approvedAt);
    const day = dailyMap.get(key);
    if (!day) continue;
    day.sum += row.bubbleScore;
    day.count += 1;
  }

  const trendPoints = Array.from(dailyMap.values()).map((day) => ({
    label: day.label,
    avgScore: day.count > 0 ? parseFloat((day.sum / day.count).toFixed(2)) : 0,
    roastCount: day.count,
  }));

  return {
    approvedRoastCount,
    uniqueHandleCount: handlesSorted.length,
    handlesSorted,
    firstApprovedAt: firstApprovedRoast?.approvedAt ?? null,
    peakRoastHour,
    activeRoastHours,
    recentAverageScore,
    previousAverageScore,
    recentSampleSize: recentScores.length,
    previousSampleSize: previousScores.length,
    trendDelta,
    trendLabel,
    trendMessage,
    trendColor,
    trendPoints,
  };
}

export default async function StatsPage() {
  const {
    approvedRoastCount,
    uniqueHandleCount,
    handlesSorted,
    firstApprovedAt,
    peakRoastHour,
    activeRoastHours,
    recentAverageScore,
    previousAverageScore,
    recentSampleSize,
    previousSampleSize,
    trendDelta,
    trendLabel,
    trendMessage,
    trendColor,
    trendPoints,
  } = await getStatsData();

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="pixel-font glow-text mb-2" style={{ fontSize: '18px', color: '#1a1a1a' }}>
          FROTH'S STATS
        </h1>
        <p style={{ color: '#666', fontFamily: 'VT323, monospace', fontSize: '20px', lineHeight: 1.25 }}>
          Tracking corporate confidence levels with charts, timestamps, and absolutely zero mercy.
        </p>
      </div>

      <div className="retro-card p-4 md:p-5 mb-8">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          WHEN DID THIS CHAOS START?
        </p>
        {firstApprovedAt ? (
          <>
            <p className="text-[20px] md:text-[24px]" style={{ fontFamily: 'VT323, monospace', color: '#1a1a1a', lineHeight: 1.2 }}>
              {formatExactTimestamp(firstApprovedAt)}
            </p>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#666', marginTop: '8px', lineHeight: 1.2 }}>
              The exact moment the roast factory went live.
            </p>
          </>
        ) : (
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666', lineHeight: 1.2 }}>
            No approved roasts yet. The cannon is loaded, but not fired.
          </p>
        )}
      </div>

      <div className="grid gap-5 mb-8 md:grid-cols-2">
        <div className="retro-card p-4 md:p-5">
          <p className="pixel-font mb-2" style={{ fontSize: '10px', color: '#1a1a1a' }}>
            HANDLES CURRENTLY IN THE BLENDER
          </p>
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#666', marginTop: '8px', lineHeight: 1.2 }}>
            {uniqueHandleCount} distinct handles. Click to inspect their timeline of confidence.
          </p>
          {handlesSorted.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {handlesSorted.map(([handle, count]) => (
                <a
                  key={handle}
                  href={`https://x.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="roast-tag text-[13px] md:text-[15px]"
                  style={{ padding: '4px 8px', textDecoration: 'none', lineHeight: 1.15 }}
                >
                  @{handle} x{count}
                </a>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666', marginTop: '10px', lineHeight: 1.2 }}>
              No handles yet. Corporate serenity is temporary.
            </p>
          )}
        </div>

        <div className="retro-card p-4 md:p-5">
          <p className="pixel-font mb-2" style={{ fontSize: '10px', color: '#1a1a1a' }}>
            TOTAL ROASTS SERVED
          </p>
          <p className="text-[26px] md:text-[30px]" style={{ fontFamily: 'VT323, monospace', color: '#1a1a1a', lineHeight: 1.1 }}>
            {approvedRoastCount}
          </p>
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#666', marginTop: '8px', lineHeight: 1.2 }}>
            Cups poured. Buzzwords harmed.
          </p>
        </div>
      </div>

      <div className="retro-card p-4 md:p-5 mb-8" id="bubble-score-rules">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          HOW BUBBLE SCORE IS CALCULATED
        </p>
        <div style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#1a1a1a', lineHeight: 1.3 }}>
          <p>Start at <strong>5.0</strong> (neutral corporate nonsense baseline).</p>
          <p>Add points for buzzwords like <strong>agentic</strong>, <strong>frontier</strong>, <strong>paradigm shift</strong> (capped at +3).</p>
          <p>Add <strong>+0.8</strong> for benchmark flexes with no context.</p>
          <p>Add <strong>+0.7</strong> for stealth-mode teasers ("coming soon", "big announcement").</p>
          <p>Subtract <strong>1.5</strong> when actual shipping evidence appears (versions/docs/GitHub links).</p>
          <p>Clamp final score between <strong>0</strong> and <strong>10</strong>, because even chaos needs governance.</p>
        </div>
      </div>

      <div className="retro-card p-4 md:p-5 mb-8">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          BUBBLE TREND (LAST 30 DAYS)
        </p>
        <p style={{ fontFamily: 'VT323, monospace', fontSize: '17px', color: '#666', marginBottom: '8px', lineHeight: 1.2 }}>
          Red line = average delusion score. Bars = roast volume. We brought charts to a roast fight.
        </p>
        <BubbleTrendChart data={trendPoints} />
      </div>

      <div className="retro-card p-4 md:p-5 mb-8">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          IS THE INDUSTRY HEALING OR GETTING WORSE?
        </p>
        <div
          style={{
            display: 'inline-block',
            background: trendColor,
            color: '#fff',
            border: '3px solid #1a1a1a',
            boxShadow: '4px 4px 0 #1a1a1a',
            padding: '12px 20px',
            marginBottom: '12px',
          }}
        >
          <p className="pixel-font" style={{ fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
            INDUSTRY STATUS: {trendLabel}
          </p>
        </div>
        <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#1a1a1a', lineHeight: 1.2 }}>
          {trendMessage}
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#555', lineHeight: 1.2 }}>
            Last 7d avg: <strong>{recentAverageScore.toFixed(2)}</strong> ({recentSampleSize} roasts)
          </span>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#555', lineHeight: 1.2 }}>
            Previous 7d avg: <strong>{previousAverageScore.toFixed(2)}</strong> ({previousSampleSize} roasts)
          </span>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#555', lineHeight: 1.2 }}>
            Delta: <strong>{trendDelta >= 0 ? '+' : ''}{trendDelta.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      <div className="retro-card p-4 md:p-5">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          WHAT TIME OF DAY WE ROAST
        </p>
        {activeRoastHours.length === 0 ? (
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666', lineHeight: 1.2 }}>
            No approved roasts yet. The shift starts when the first buzzword drops.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#1a1a1a', lineHeight: 1.2 }}>
              Peak roast window: <strong>{formatHourRangeUtc(peakRoastHour.hour)}</strong>
            </p>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#666', marginTop: '8px', marginBottom: '10px', lineHeight: 1.2 }}>
              Yes, we run this operation in shifts.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
