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

  let maxAgenticScore = 0;
  let maxAgenticRoast = null;
  for (const roast of roasts) {
    const text = roast.post.textExcerpt.toLowerCase();
    const agenticCount = (text.match(/agentic/g) || []).length;
    if (agenticCount > maxAgenticScore) {
      maxAgenticScore = agenticCount;
      maxAgenticRoast = roast;
    }
  }
  if (maxAgenticRoast) {
    leaderboard['most_agentic'] = {
      category: 'Most Agentic',
      roast: maxAgenticRoast,
      score: maxAgenticScore,
    };
  }

  const biggestBubble = roasts.reduce((max, roast) =>
    roast.bubbleScore > (max?.bubbleScore || 0) ? roast : max
  , null as any);
  if (biggestBubble) {
    leaderboard['biggest_bubble'] = {
      category: 'Biggest Bubble',
      roast: biggestBubble,
      score: biggestBubble.bubbleScore,
    };
  }

  const mostGrounded = roasts.reduce((min, roast) =>
    roast.bubbleScore < (min?.bubbleScore || 10) ? roast : min
  , null as any);
  if (mostGrounded) {
    leaderboard['most_grounded'] = {
      category: 'Most Grounded',
      roast: mostGrounded,
      score: mostGrounded.bubbleScore,
    };
  }

  let maxBenchmarkScore = 0;
  let maxBenchmarkRoast = null;
  for (const roast of roasts) {
    const text = roast.post.textExcerpt.toLowerCase();
    const benchmarkCount = 
      (text.match(/sota|state of the art|outperforms|beats gpt/g) || []).length;
    if (benchmarkCount > maxBenchmarkScore) {
      maxBenchmarkScore = benchmarkCount;
      maxBenchmarkRoast = roast;
    }
  }
  if (maxBenchmarkRoast) {
    leaderboard['benchmark_theater'] = {
      category: 'Benchmark Theater Champion',
      roast: maxBenchmarkRoast,
      score: maxBenchmarkScore,
    };
  }

  let maxStealthScore = 0;
  let maxStealthRoast = null;
  for (const roast of roasts) {
    const text = roast.post.textExcerpt.toLowerCase();
    const stealthCount = 
      (text.match(/coming soon|stay tuned|big announcement/g) || []).length;
    if (stealthCount > maxStealthScore) {
      maxStealthScore = stealthCount;
      maxStealthRoast = roast;
    }
  }
  if (maxStealthRoast) {
    leaderboard['stealth_mode'] = {
      category: 'Stealth Mode Master',
      roast: maxStealthRoast,
      score: maxStealthScore,
    };
  }

  return leaderboard;
}
