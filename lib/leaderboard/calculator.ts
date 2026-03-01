import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LeaderboardEntry {
  category: string;
  roast: any;
  score: number;
}

export async function calculateLeaderboard(
  startDate: Date,
  endDate: Date
): Promise<Record<string, LeaderboardEntry>> {
  const roasts = await prisma.roast.findMany({
    where: {
      status: 'APPROVED',
      approvedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      post: {
        include: { source: true },
      },
    },
  });

  const leaderboard: Record<string, LeaderboardEntry> = {};
  const usedRoastIds = new Set<string>();

  const sortedByBubbleDesc = [...roasts].sort((a, b) => b.bubbleScore - a.bubbleScore);
  const sortedByBubbleAsc = [...roasts].sort((a, b) => a.bubbleScore - b.bubbleScore);

  const firstUnused = (items: any[]) => items.find((item) => !usedRoastIds.has(item.id)) || null;

  const biggestBubble = firstUnused(sortedByBubbleDesc);
  if (biggestBubble) {
    usedRoastIds.add(biggestBubble.id);
    leaderboard['biggest_bubble'] = {
      category: 'Biggest Bubble',
      roast: biggestBubble,
      score: biggestBubble.bubbleScore,
    };
  }

  const mostGrounded = firstUnused(sortedByBubbleAsc);
  if (mostGrounded) {
    usedRoastIds.add(mostGrounded.id);
    leaderboard['most_grounded'] = {
      category: 'Most Grounded',
      roast: mostGrounded,
      score: mostGrounded.bubbleScore,
    };
  }

  const agenticCandidates = [...roasts]
    .map((roast) => {
      const text = roast.post.textExcerpt.toLowerCase();
      const score = (text.match(/agentic/g) || []).length;
      return { roast, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  const mostAgentic = agenticCandidates.find((entry) => !usedRoastIds.has(entry.roast.id));
  if (mostAgentic) {
    usedRoastIds.add(mostAgentic.roast.id);
    leaderboard['most_agentic'] = {
      category: 'Most Agentic',
      roast: mostAgentic.roast,
      score: mostAgentic.score,
    };
  }

  const benchmarkCandidates = [...roasts]
    .map((roast) => {
      const text = roast.post.textExcerpt.toLowerCase();
      const score = (text.match(/sota|state of the art|outperforms|beats gpt/g) || []).length;
      return { roast, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  const benchmarkTheater = benchmarkCandidates.find((entry) => !usedRoastIds.has(entry.roast.id));
  if (benchmarkTheater) {
    usedRoastIds.add(benchmarkTheater.roast.id);
    leaderboard['benchmark_theater'] = {
      category: 'Benchmark Theater Champion',
      roast: benchmarkTheater.roast,
      score: benchmarkTheater.score,
    };
  }

  const stealthCandidates = [...roasts]
    .map((roast) => {
      const text = roast.post.textExcerpt.toLowerCase();
      const score = (text.match(/coming soon|stay tuned|big announcement/g) || []).length;
      return { roast, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  const stealthMode = stealthCandidates.find((entry) => !usedRoastIds.has(entry.roast.id));
  if (stealthMode) {
    usedRoastIds.add(stealthMode.roast.id);
    leaderboard['stealth_mode'] = {
      category: 'Stealth Mode Master',
      roast: stealthMode.roast,
      score: stealthMode.score,
    };
  }

  return leaderboard;
}
