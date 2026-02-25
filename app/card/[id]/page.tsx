import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BubbleScoreMeter } from '@/components/retro/BubbleScoreMeter';

interface PageProps {
  params: { id: string };
}

export default async function CardPage({ params }: PageProps) {
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
    <div
      className="w-[1200px] h-[630px] flex items-center justify-center p-8"
      style={{
        background: 'linear-gradient(135deg, #000080 0%, #000040 100%)',
      }}
    >
      <div className="w-full h-full border-4 border-cyan-400 bg-purple-900/80 p-8 flex flex-col justify-between">
        <div>
          <h1 className="pixel-font text-4xl text-yellow-300 text-center mb-4 glow-text">
            FROTH
          </h1>
          <div className="flex justify-center mb-6">
            <BubbleScoreMeter score={roast.bubbleScore} size="md" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl text-pink-400 font-bold text-center mb-4">
            {roast.archetype}
          </h2>
          <h3 className="text-2xl text-cyan-300 text-center mb-6">
            @{roast.post.source.handle}
          </h3>
          <p className="text-white text-xl text-center italic mb-4">
            "{roast.sections.translation}"
          </p>
          <p className="text-yellow-300 text-lg text-center">
            {roast.sections.realityCheck}
          </p>
        </div>

        <div className="text-center">
          <p className="text-cyan-300 text-sm">
            froth.wtf
          </p>
        </div>
      </div>
    </div>
  );
}
