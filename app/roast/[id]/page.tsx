import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BubbleScoreMeter } from '@/components/retro/BubbleScoreMeter';
import { Metadata } from 'next';
import { CopyButton } from './CopyButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const roast = await prisma.roast.findUnique({
    where: { id, status: 'APPROVED' },
    include: { post: { include: { source: true } } },
  });

  if (!roast) return { title: 'Roast Not Found' };

  const title = `${roast.archetype} — @${roast.post.source.handle}`;
  const description = (roast.sections as any).translation;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth-eight.vercel.app';
  const imageUrl = roast.shareImageUrl ? `${baseUrl}${roast.shareImageUrl}` : undefined;
  const canonicalUrl = `${baseUrl}/roast/${id}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function RoastDetailPage({ params }: PageProps) {
  const { id } = await params;
  const roast = await prisma.roast.findUnique({
    where: { id, status: 'APPROVED' },
    include: { post: { include: { source: true } } },
  });

  if (!roast) notFound();

  const sections = roast.sections as any;
  const handle = roast.post.source.handle;
  const xProfileUrl = `https://x.com/${handle}`;
  const siteBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth-eight.vercel.app';
  const roastUrl = `${siteBaseUrl}/roast/${roast.id}`;
  const shareText = `This one got a ${roast.bubbleScore.toFixed(1)}/10 bubble score on @${handle} 😮`;
  const shareIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(roastUrl)}`;
  const scoreBreakdown: Array<{ label: string; score: number; reason?: string }> =
    sections.scoreBreakdown || [];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: roast.archetype,
    description: sections.translation,
    author: {
      '@type': 'Organization',
      name: 'Froth',
      url: siteBaseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Froth',
      url: siteBaseUrl,
    },
    datePublished: roast.post.publishedAt,
    dateModified: roast.approvedAt || roast.post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': roastUrl,
    },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Back */}
      <a
        href="/"
        className="retro-button inline-block mb-6"
        style={{ fontSize: '9px', padding: '8px 16px' }}
      >
        ← BACK TO FEED
      </a>

      <div className="retro-card">
        {/* Score + Handle */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <a
              href={xProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="roast-handle"
            >
              @{handle}
            </a>
            <h1 className="mt-3" style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '13px',
              color: '#c0392b',
              lineHeight: '1.6',
            }}>
              {roast.archetype}
            </h1>
          </div>
          <BubbleScoreMeter score={roast.bubbleScore} size="md" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-6">
          {roast.tags.map((tag, i) => (
            <span key={i} className="roast-tag">#{tag}</span>
          ))}
        </div>

        {/* Original post */}
        <div style={{
          background: '#f9f9f9',
          border: '2px solid #1a1a1a',
          borderLeft: '5px solid #1a1a1a',
          padding: '14px 16px',
          marginBottom: '20px',
          fontFamily: 'VT323, monospace',
          fontSize: '18px',
          color: '#333',
        }}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#888', display: 'block', marginBottom: '8px' }}>
            ORIGINAL POST
          </span>
          "{roast.post.textExcerpt}"
          {roast.post.url && (
            <a
              href={roast.post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2"
              style={{ fontSize: '14px', color: '#888', textDecoration: 'underline' }}
            >
              View on X →
            </a>
          )}
        </div>

        {/* Translation */}
        <div className="roast-translation mb-4">
          <span className="roast-label">WHAT THEY MEANT</span>
          <p style={{ fontSize: '20px' }}>{sections.translation}</p>
        </div>

        {/* Reality check */}
        <div className="roast-reality mb-6">
          <span className="roast-label">REALITY CHECK</span>
          <p style={{ fontSize: '20px' }}>{sections.realityCheck}</p>
        </div>

        {/* Score breakdown */}
        {scoreBreakdown.length > 0 && (
          <div className="mb-6">
            <p className="roast-label mb-3">SCORE BREAKDOWN</p>
            <div className="flex flex-col gap-3">
              {scoreBreakdown.map((item, i) => (
                <div key={i} style={{ border: '2px solid #1a1a1a', padding: '12px' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', fontWeight: 'bold' }}>
                      {item.label}
                    </span>
                    <span className="retro-badge">{item.score}/10</span>
                  </div>
                  <div style={{ background: '#eee', height: '8px', border: '2px solid #1a1a1a' }}>
                    <div
                      style={{
                        width: `${(item.score / 10) * 100}%`,
                        height: '100%',
                        background: '#F5C518',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Award */}
        {sections.awardCandidate && (
          <div style={{
            background: '#F5C518',
            border: '3px solid #1a1a1a',
            boxShadow: '4px 4px 0 #1a1a1a',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <span className="roast-label">AWARD</span>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' }}>
              🏆 {sections.awardCandidate}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4" style={{ borderTop: '2px solid #1a1a1a' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#888' }}>
            {new Date(roast.post.publishedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <a
              href={shareIntentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="roast-view-btn"
              style={{
                border: '2px solid #1d4ed8',
                background: '#ffffff',
                color: '#1a1a1a',
                boxShadow: '3px 3px 0 #1d4ed8',
              }}
            >
              SHARE X
            </a>
            <CopyButton />
            <a
              href={`/report?roastId=${roast.id}`}
              className="roast-view-btn"
              style={{ background: '#c0392b' }}
            >
              ⚠ REPORT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
