import { BubbleScoreMeter } from './retro/BubbleScoreMeter';

interface RoastCardProps {
  roast: {
    id: string;
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
  const handle = roast.post.source.handle;
  const xProfileUrl = `https://x.com/${handle}`;

  return (
    <div className="roast-card" style={{ fontSize: '14px' }}>
      {/* Handle + Score row */}
      <div className="flex justify-between items-center mb-3">
        <a href={xProfileUrl} target="_blank" rel="noopener noreferrer" className="roast-handle">
          @{handle}
        </a>
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

      {/* Original tweet */}
      {roast.post.textExcerpt && (
        <div style={{
          background: '#f9f9f9',
          border: '2px solid #1a1a1a',
          borderLeft: '5px solid #1a1a1a',
          padding: '10px 12px',
          marginBottom: '12px',
          fontFamily: 'VT323, monospace',
          fontSize: '16px',
          color: '#333',
          lineHeight: '1.4',
        }}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '7px', color: '#888', display: 'block', marginBottom: '6px' }}>
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
        <p style={{ fontSize: '16px' }}>{roast.sections?.translation}</p>
      </div>

      {/* Tags */}
      <div className="flex gap-1 flex-wrap mt-3">
        {roast.tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="roast-tag" style={{ fontSize: '11px' }}>#{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-black">
        <span style={{ fontSize: '12px', color: '#888', fontFamily: 'VT323, monospace' }}>
          {new Date(roast.post.publishedAt).toLocaleDateString()}
        </span>
        <a href={`/roast/${roast.id}`} className="roast-view-btn">MORE →</a>
      </div>
    </div>
  );
}
