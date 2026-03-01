'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BubbleScoreMeter } from './retro/BubbleScoreMeter';

interface RoastCardProps {
  roast: {
    id: string;
    approvedAt?: string | null;
    bubbleScore: number;
    archetype: string;
    tags: string[];
    sections: any;
    post: {
      url?: string;
      textExcerpt?: string;
      source: {
        handle: string;
      };
      publishedAt: string;
    };
  };
}

export function RoastCard({ roast }: RoastCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [copied, setCopied] = useState(false);
  const handle = roast.post.source.handle;
  const xProfileUrl = `https://x.com/${handle}`;
  const tweetUrl = roast.post.url;
  const roastTimestamp = roast.approvedAt ?? roast.post.publishedAt;
  const roastTimeMs = new Date(roastTimestamp).getTime();
  const isLatestRoast = !Number.isNaN(roastTimeMs) && Date.now() - roastTimeMs <= 24 * 60 * 60 * 1000;
  const latestAccent = '#c0392b';

  const getRoastUrl = () => {
    if (typeof window === 'undefined') return `/roast/${roast.id}`;
    return `${window.location.origin}/roast/${roast.id}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getRoastUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleShareOnX = () => {
    const roastUrl = getRoastUrl();
    const shareText = `This one got a ${roast.bubbleScore.toFixed(1)}/10 bubble score on @${handle} 😮`;
    const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(roastUrl)}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="roast-card"
      style={{
        fontSize: '14px',
        position: 'relative',
        ...(isLatestRoast
          ? {
              borderColor: latestAccent,
              boxShadow: `5px 5px 0 ${latestAccent}`,
            }
          : {}),
      }}
    >
      {isLatestRoast && (
        <span
          className="pixel-font"
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            fontSize: '7px',
            lineHeight: 1.3,
            color: '#fff',
            background: latestAccent,
            border: `2px solid ${latestAccent}`,
            padding: '4px 7px',
            display: 'inline-block',
            zIndex: 1,
            boxShadow: '2px 2px 0 #1a1a1a',
          }}
        >
          LATEST
        </span>
      )}
      {/* Handle + Score row */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <a href={xProfileUrl} target="_blank" rel="noopener noreferrer" className="roast-handle">
            @{handle}
          </a>
          {tweetUrl && (
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontSize: '16px',
                color: '#1a1a1a',
                fontFamily: 'VT323, monospace',
                textDecoration: 'underline',
                marginTop: '6px',
              }}
            >
              View on X ↗
            </a>
          )}
        </div>
        <BubbleScoreMeter score={roast.bubbleScore} size="sm" />
      </div>

      {/* Archetype */}
      <p className="mb-3" style={{
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '11px',
        color: '#c0392b',
        lineHeight: '1.6',
      }}>
        {roast.archetype}
      </p>

      {/* Original post */}
      {roast.post.textExcerpt && (
        <div style={{
          background: '#f9f9f9',
          border: '2px solid #1a1a1a',
          borderLeft: '5px solid #1a1a1a',
          padding: '10px 12px',
          marginBottom: '12px',
          fontFamily: 'VT323, monospace',
          fontSize: '17px',
          color: '#333',
          lineHeight: '1.4',
        }}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px', color: '#888', display: 'block', marginBottom: '6px' }}>
            ORIGINAL POST
          </span>
          "{roast.post.textExcerpt.length > 160
            ? roast.post.textExcerpt.substring(0, 160) + '…'
            : roast.post.textExcerpt}"
        </div>
      )}

      {/* Translation */}
      <div className="roast-translation">
        <span className="roast-label">WHAT THEY MEANT</span>
        <p style={{ fontSize: '17px' }}>{roast.sections?.translation}</p>
      </div>

      {/* Tags */}
      <p
        className="mt-3"
        style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#777', lineHeight: 1.2 }}
      >
        {roast.tags.slice(0, 3).join(' · ')}
      </p>

      {/* Footer */}
      <div className="flex flex-wrap justify-between items-center gap-2 mt-3 pt-3 border-t-2 border-black">
        <span style={{ fontSize: '12px', color: '#888', fontFamily: 'VT323, monospace' }}>
          {new Date(roast.post.publishedAt).toLocaleDateString()}
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleShareOnX}
            className="roast-view-btn"
            style={{
              border: '2px solid #1d4ed8',
              cursor: 'pointer',
              fontSize: '7px',
              padding: '9px 10px',
              minWidth: '86px',
              background: '#ffffff',
              color: '#1a1a1a',
              boxShadow: '3px 3px 0 #1d4ed8',
            }}
          >
            SHARE X
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`roast-view-btn copy-btn ${copied ? 'copy-btn--success' : ''}`}
            style={{
              border: 'none',
              cursor: 'pointer',
              fontSize: '7px',
              padding: '9px 10px',
              minWidth: '92px',
              background: copied ? '#27ae60' : '#4b5563',
              color: '#fff',
              boxShadow: '3px 3px 0 #1a1a1a',
            }}
          >
            {copied ? 'COPIED ✓' : 'COPY LINK'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsNavigating(true);
              router.push(`/roast/${roast.id}`);
            }}
            disabled={isNavigating}
            className="roast-view-btn"
            style={{
              border: 'none',
              cursor: isNavigating ? 'wait' : 'pointer',
              fontSize: '7px',
              padding: '9px 10px',
              minWidth: '96px',
              background: '#F5C518',
              color: '#1a1a1a',
              boxShadow: '3px 3px 0 #1a1a1a',
            }}
          >
            {isNavigating ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'roast-spin 0.6s linear infinite',
                  }}
                />
                LOAD
              </span>
            ) : (
              'MORE →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
