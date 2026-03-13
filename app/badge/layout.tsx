import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Your Badge | Froth',
  description: 'Analyze your X timeline and get roasted by AI. Receive your bubble score and a shareable "I Survived Froth" badge.',
  openGraph: {
    title: 'Get Your Badge | Froth',
    description: 'Analyze your X timeline and get roasted by AI. Receive your bubble score and a shareable badge.',
    images: ['/og-badge.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Your Badge | Froth',
    description: 'Analyze your X timeline and get roasted by AI.',
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
