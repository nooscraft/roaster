import { prisma } from '@/lib/prisma';

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
  const [approvedRoastCount, roastHandles, firstApprovedRoast, roastTimes] = await Promise.all([
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

  return {
    approvedRoastCount,
    uniqueHandleCount: handlesSorted.length,
    handlesSorted,
    firstApprovedAt: firstApprovedRoast?.approvedAt ?? null,
    peakRoastHour,
    activeRoastHours,
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
  } = await getStatsData();

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="pixel-font glow-text mb-2" style={{ fontSize: '18px', color: '#1a1a1a' }}>
          FROTH'S STATS
        </h1>
        <p style={{ color: '#666', fontFamily: 'VT323, monospace', fontSize: '22px' }}>
          Quantifying professional delusion, one post at a time.
        </p>
      </div>

      <div className="retro-card mb-8">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          WHEN DID THIS CHAOS START?
        </p>
        {firstApprovedAt ? (
          <>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#1a1a1a', lineHeight: 1.2 }}>
              {formatExactTimestamp(firstApprovedAt)}
            </p>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666', marginTop: '8px' }}>
              The exact moment the roast factory went live.
            </p>
          </>
        ) : (
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#666' }}>
            No approved roasts yet. The cannon is loaded, but not fired.
          </p>
        )}
      </div>

      <div className="grid gap-5 mb-8 md:grid-cols-2">
        <div className="retro-card">
          <p className="pixel-font mb-2" style={{ fontSize: '10px', color: '#1a1a1a' }}>
            HANDLES CURRENTLY IN THE BLENDER
          </p>
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666', marginTop: '8px' }}>
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
                  className="roast-tag text-[15px] md:text-[15px]"
                  style={{ padding: '5px 11px', textDecoration: 'none' }}
                >
                  @{handle} x{count}
                </a>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#666', marginTop: '10px' }}>
              No handles yet. Corporate serenity is temporary.
            </p>
          )}
        </div>

        <div className="retro-card">
          <p className="pixel-font mb-2" style={{ fontSize: '10px', color: '#1a1a1a' }}>
            TOTAL ROASTS SERVED
          </p>
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '30px', color: '#1a1a1a', lineHeight: 1.1 }}>
            {approvedRoastCount}
          </p>
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666', marginTop: '8px' }}>
            Cups poured. Buzzwords harmed.
          </p>
        </div>
      </div>

      <div className="retro-card mb-8">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          HOW BUBBLE SCORE IS CALCULATED
        </p>
        <div style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#1a1a1a', lineHeight: 1.35 }}>
          <p>Start at <strong>5.0</strong> (neutral corporate nonsense baseline).</p>
          <p>Add points for buzzwords like <strong>agentic</strong>, <strong>frontier</strong>, <strong>paradigm shift</strong> (capped at +3).</p>
          <p>Add <strong>+0.8</strong> for benchmark flexes with no context.</p>
          <p>Add <strong>+0.7</strong> for stealth-mode teasers ("coming soon", "big announcement").</p>
          <p>Subtract <strong>1.5</strong> when actual shipping evidence appears (versions/docs/GitHub links).</p>
          <p>Clamp final score between <strong>0</strong> and <strong>10</strong>, because even chaos needs governance.</p>
        </div>
      </div>

      <div className="retro-card">
        <p className="pixel-font mb-3" style={{ fontSize: '10px', color: '#1a1a1a' }}>
          WHAT TIME OF DAY WE ROAST
        </p>
        {activeRoastHours.length === 0 ? (
          <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#666' }}>
            No approved roasts yet. The shift starts when the first buzzword drops.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '22px', color: '#1a1a1a', lineHeight: 1.25 }}>
              Peak roast window: <strong>{formatHourRangeUtc(peakRoastHour.hour)}</strong>
            </p>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666', marginTop: '8px', marginBottom: '10px' }}>
              Yes, we run this operation in shifts.
            </p>
            <div className="flex flex-wrap gap-2">
              {activeRoastHours
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((entry) => (
                  <span key={entry.hour} className="roast-tag text-[15px] md:text-[15px]" style={{ padding: '5px 11px' }}>
                    {formatHourRangeUtc(entry.hour)} x{entry.count}
                  </span>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
