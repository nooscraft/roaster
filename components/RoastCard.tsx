import { RetroCard } from './retro/RetroCard';
import { RetroBadge } from './retro/RetroBadge';
import { BubbleScoreMeter } from './retro/BubbleScoreMeter';

interface RoastCardProps {
  roast: {
    id: string;
    bubbleScore: number;
    archetype: string;
    tags: string[];
    sections: any;
    post: {
      source: {
        handle: string;
      };
      publishedAt: string;
    };
  };
}

export function RoastCard({ roast }: RoastCardProps) {
  return (
    <RetroCard variant="cyan">
      <div className="flex justify-between items-start mb-4">
        <BubbleScoreMeter score={roast.bubbleScore} size="sm" />
        <RetroBadge>{roast.archetype}</RetroBadge>
      </div>
      <h3 className="text-pink-400 font-bold text-xl mb-2">
        @{roast.post.source.handle}
      </h3>
      <p className="text-cyan-300 text-sm italic mb-3">
        {roast.sections.translation}
      </p>
      <p className="text-yellow-300 text-sm mb-4">
        {roast.sections.realityCheck}
      </p>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {roast.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-purple-800 text-cyan-300"
            >
              #{tag}
            </span>
          ))}
        </div>
        <a
          href={`/roast/${roast.id}`}
          className="text-pink-400 hover:text-pink-300 text-sm font-bold"
        >
          VIEW FULL ROAST →
        </a>
      </div>
      <p className="text-cyan-300 text-xs mt-3 opacity-70">
        {new Date(roast.post.publishedAt).toLocaleDateString()}
      </p>
    </RetroCard>
  );
}
