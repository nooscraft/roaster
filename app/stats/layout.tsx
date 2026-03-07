import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth-eight.vercel.app';

export const metadata: Metadata = {
  title: 'Stats',
  description:
    'Froth\'s stats: bubble score trends, roast volume, peak roast hours, and whether the AI industry is healing or getting worse. Charts, timestamps, and zero mercy.',
  alternates: {
    canonical: `${BASE_URL}/stats`,
  },
  openGraph: {
    title: 'Stats | Froth',
    description:
      'Tracking corporate confidence levels with charts, timestamps, and absolutely zero mercy.',
    url: `${BASE_URL}/stats`,
  },
  twitter: {
    title: 'Stats | Froth',
    description:
      'Tracking corporate confidence levels with charts, timestamps, and absolutely zero mercy.',
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
