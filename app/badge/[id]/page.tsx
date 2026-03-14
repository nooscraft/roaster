import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const badge = await prisma.badge.findUnique({ where: { id } });

  if (!badge) {
    return { title: 'Badge Not Found' };
  }

  const title = `@${badge.handle} got a ${badge.bubbleScore}/10 bubble score`;
  const description = badge.roastText.substring(0, 160);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth.live';
  const badgeUrl = `${baseUrl}/badge/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: badgeUrl,
      images: [`${baseUrl}/og-badge.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-badge.png`],
    },
  };
}

export default async function BadgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const badge = await prisma.badge.findUnique({ where: { id } });

  if (!badge) {
    notFound();
  }

  const getScoreColor = (score: number) => {
    if (score < 3) return '#22c55e'; // green - grounded
    if (score < 6) return '#F5C518'; // yellow - mild hype
    if (score < 8) return '#f97316'; // orange - hyped
    return '#ef4444'; // red - full bubble
  };

  const scoreColor = getScoreColor(badge.bubbleScore);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth.live';
  const shareUrl = `${baseUrl}/badge/${badge.id}`;
  const shareText = `I got roasted on Froth and survived with a bubble score of ${badge.bubbleScore}/10 😮`;
  const xIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Badge Card */}
      <div className="retro-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <p
          className="pixel-font"
          style={{
            fontSize: '10px',
            color: '#1a1a1a',
            marginBottom: '16px',
            letterSpacing: '2px',
          }}
        >
          I SURVIVED FROTH
        </p>

        <a
          href={`https://x.com/${badge.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="roast-handle"
          style={{ fontSize: '14px', marginBottom: '20px' }}
        >
          @{badge.handle}
        </a>

        <div style={{ margin: '24px 0' }}>
          <p
            className="pixel-font"
            style={{
              fontSize: '48px',
              color: scoreColor,
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {badge.bubbleScore}
          </p>
          <p
            className="pixel-font"
            style={{ fontSize: '10px', color: '#888', letterSpacing: '1px' }}
          >
            BUBBLE SCORE
          </p>
        </div>

        <div
          style={{
            background: '#f9f9f9',
            border: '2px solid #1a1a1a',
            borderLeft: '5px solid #1a1a1a',
            padding: '16px',
            marginTop: '24px',
            textAlign: 'left',
          }}
        >
          <p
            className="pixel-font"
            style={{ fontSize: '8px', color: '#888', marginBottom: '8px' }}
          >
            THE ROAST
          </p>
          <p
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '20px',
              color: '#1a1a1a',
              lineHeight: 1.4,
            }}
          >
            {badge.roastText}
          </p>
        </div>

        <p
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: '14px',
            color: '#999',
            marginTop: '20px',
          }}
        >
          Analyzed by{' '}
          <Link href="/" style={{ color: '#F5C518', textDecoration: 'underline' }}>
            froth.live
          </Link>
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <a
          href={xIntentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="retro-button"
          style={{ textDecoration: 'none' }}
        >
          SHARE ON X →
        </a>
        <Link href="/badge" className="retro-button" style={{ textDecoration: 'none' }}>
          ANALYZE ANOTHER
        </Link>
      </div>

      {/* Details */}
      {badge.bioText && (
        <div className="retro-card mt-6" style={{ padding: '16px' }}>
          <p className="pixel-font mb-2" style={{ fontSize: '9px', color: '#1a1a1a' }}>
            BIO ANALYZED
          </p>
          <p
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '18px',
              color: '#666',
              lineHeight: 1.4,
            }}
          >
            "{badge.bioText}"
          </p>
        </div>
      )}
    </div>
  );
}
