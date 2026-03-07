import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth-eight.vercel.app';

export const metadata: Metadata = {
  title: 'Weekly Leaderboard',
  description:
    'Who said the most with the least this week. Froth\'s weekly leaderboard: Most Agentic, Biggest Bubble, Most Grounded, Benchmark Theater, and Stealth Mode awards.',
  alternates: {
    canonical: `${BASE_URL}/leaderboard`,
  },
  openGraph: {
    title: 'Weekly Leaderboard | Froth',
    description:
      'Who said the most with the least this week. Froth\'s weekly leaderboard of AI buzzword champions.',
    url: `${BASE_URL}/leaderboard`,
  },
  twitter: {
    title: 'Weekly Leaderboard | Froth',
    description:
      'Who said the most with the least this week. Froth\'s weekly leaderboard of AI buzzword champions.',
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
