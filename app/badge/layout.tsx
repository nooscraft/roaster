import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Your Badge | Froth',
  description: 'Drop any X handle — yours, a friend\'s, or that VC you\'ve been side-eyeing. Get their bubble score and a savage roast. Share your "I Survived Froth" badge.',
  openGraph: {
    title: 'Get Your Badge | Froth',
    description: 'Drop any X handle. Get their bubble score, a savage roast, and a shareable badge.',
    images: ['/og-badge.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Your Badge | Froth',
    description: 'Drop any X handle. Get their bubble score and a savage roast.',
    images: ['/og-badge.png'],
  },
};

export default function BadgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
