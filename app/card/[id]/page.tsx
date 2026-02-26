import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BubbleScoreMeter } from '@/components/retro/BubbleScoreMeter';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  const roast = await prisma.roast.findUnique({
    where: { id, status: 'APPROVED' },
    include: {
      post: {
        include: { source: true },
      },
    },
  });

  if (!roast) {
    notFound();
  }

  return (
    <div
      data-share-card
      className="w-[1200px] h-[630px] flex flex-col p-10 box-border"
      style={{
        background: '#F2ECD8',
        border: '4px solid #1a1a1a',
        boxShadow: '6px 6px 0 #1a1a1a',
        fontFamily: '"VT323", monospace',
      }}
    >
      {/* Header: FROTH + score */}
      <div className="flex justify-between items-center mb-6">
        <h1
          className="pixel-font"
          style={{ fontSize: '28px', color: '#1a1a1a', textShadow: '2px 2px 0 #F5C518' }}
        >
          FROTH
        </h1>
        <div className="flex items-center gap-2">
          <BubbleScoreMeter score={roast.bubbleScore} size="sm" />
        </div>
      </div>

      {/* Archetype + handle */}
      <div className="mb-4">
        <p
          className="pixel-font mb-1"
          style={{ fontSize: '10px', color: '#888' }}
        >
          @{roast.post.source.handle}
        </p>
        <p
          className="pixel-font font-bold"
          style={{ fontSize: '14px', color: '#c0392b', lineHeight: 1.6 }}
        >
          {roast.archetype}
        </p>
      </div>

      {/* Translation */}
      <div
        className="flex-1 flex flex-col justify-center mb-4"
        style={{
          background: '#fff',
          border: '3px solid #1a1a1a',
          borderLeft: '6px solid #F5C518',
          padding: '16px 20px',
        }}
      >
        <p
        style={{
          fontSize: '26px',
          color: '#1a1a1a',
          lineHeight: 1.4,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}
        >
          "{(roast.sections as any)?.translation}"
        </p>
      </div>

      {/* Reality check - truncated if needed */}
      <p
        style={{
          fontSize: '22px',
          color: '#1a1a1a',
          lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {(roast.sections as any)?.realityCheck}
      </p>

      {/* Footer */}
      <p
        className="pixel-font text-center mt-2"
        style={{ fontSize: '8px', color: '#888' }}
      >
        froth.wtf — MEASURING THE FROTH IN FRONTIER AI
      </p>
    </div>
  );
}
