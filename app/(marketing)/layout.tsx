import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth-eight.vercel.app';

export const metadata: Metadata = {
  title: 'Froth - Measuring the froth in frontier AI',
  description:
    'Froth measures the buzzword density in AI announcements. We roast corporate hype with bubble scores, translations, and reality checks — one post at a time.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'Froth - Measuring the froth in frontier AI',
    description:
      'Froth measures the buzzword density in AI announcements. We roast corporate hype with bubble scores, translations, and reality checks.',
    url: BASE_URL,
  },
  twitter: {
    title: 'Froth - Measuring the froth in frontier AI',
    description:
      'Froth measures the buzzword density in AI announcements. We roast corporate hype with bubble scores, translations, and reality checks.',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
