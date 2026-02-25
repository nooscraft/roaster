import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroBadge } from '@/components/retro/RetroBadge';
import { BubbleScoreMeter } from '@/components/retro/BubbleScoreMeter';
import { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const roast = await prisma.roast.findUnique({
    where: { id: params.id, status: 'APPROVED' },
    include: {
      post: {
        include: { source: true },
      },
    },
  });

  if (!roast) {
    return {
      title: 'Roast Not Found',
    };
  }

  return {
    title: `Roast: ${roast.archetype} from @${roast.post.source.handle}`,
    description: roast.sections.translation,
  };
}

export default async function RoastDetailPage({ params }: PageProps) {
  const roast = await prisma.roast.findUnique({
    where: { id: params.id, status: 'APPROVED' },
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <a
          href="/"
          className="text-cyan-300 hover:text-cyan-200 text-sm"
        >
          ← Back to Feed
        </a>
      </div>

      <RetroCard variant="pink" className="mb-6">
        <div className="flex justify-center mb-6">
          <BubbleScoreMeter score={roast.bubbleScore} size="lg" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl text-yellow-300 pixel-font mb-2 glow-text">
            {roast.archetype}
          </h1>
          <h2 className="text-2xl text-pink-400 font-bold mb-4">
            @{roast.post.source.handle}
          </h2>
          <div className="flex justify-center gap-2 flex-wrap">
            {roast.tags.map((tag, i) => (
              <RetroBadge key={i}>#{tag}</RetroBadge>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-black/30 border-2 border-cyan-400">
          <h3 className="text-cyan-300 font-bold mb-2">Original Post</h3>
          <p className="text-white mb-3">{roast.post.textExcerpt}</p>
          <a
            href={roast.post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 text-sm"
          >
            View on X →
          </a>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-purple-900/50 border-2 border-cyan-400">
            <h3 className="text-cyan-300 font-bold mb-2 pixel-font text-sm">
              📝 TRANSLATION
            </h3>
            <p className="text-white text-lg italic">
              {roast.sections.translation}
            </p>
          </div>

          <div className="p-4 bg-purple-900/50 border-2 border-yellow-400">
            <h3 className="text-yellow-300 font-bold mb-2 pixel-font text-sm">
              ⚡ REALITY CHECK
            </h3>
            <p className="text-white text-lg">
              {roast.sections.realityCheck}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-pink-400 font-bold mb-4 pixel-font">
            📊 SCORE BREAKDOWN
          </h3>
          <div className="space-y-3">
            {roast.sections.scoreBreakdown?.map((item: any, i: number) => (
              <div key={i} className="p-4 bg-black/30 border-2 border-purple-600">
                <div className="flex justify-between items-center mb-2">
                  <strong className="text-cyan-300 text-lg">{item.label}</strong>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-4 bg-black border-2 border-cyan-400">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-pink-500"
                        style={{ width: `${(item.score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-yellow-300 font-bold pixel-font text-sm">
                      {item.score}/10
                    </span>
                  </div>
                </div>
                <p className="text-white">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {roast.sections.awardCandidate && (
          <div className="p-4 bg-gradient-to-r from-pink-600 to-purple-600 border-2 border-yellow-400">
            <h3 className="text-yellow-300 font-bold mb-2 pixel-font">
              🏆 AWARD CANDIDATE
            </h3>
            <p className="text-white text-lg">
              {roast.sections.awardCandidate}
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t-2 border-cyan-400">
          <div className="flex justify-between items-center">
            <p className="text-cyan-300 text-sm">
              Posted: {new Date(roast.post.publishedAt).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }}
                className="px-3 py-2 bg-purple-800 hover:bg-purple-700 text-sm"
              >
                📋 COPY LINK
              </button>
              <a
                href={`/report?roastId=${roast.id}`}
                className="px-3 py-2 bg-red-800 hover:bg-red-700 text-sm"
              >
                ⚠️ REPORT
              </a>
            </div>
          </div>
        </div>
      </RetroCard>
    </div>
  );
}
