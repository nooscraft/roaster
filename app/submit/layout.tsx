import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth-eight.vercel.app';

export const metadata: Metadata = {
  title: 'Submit a Handle',
  description:
    'Know a founder who thinks they\'re disrupting gravity? Submit an X handle for Froth to roast. We\'ll measure the buzzword density and give it a bubble score.',
  alternates: {
    canonical: `${BASE_URL}/submit`,
  },
  openGraph: {
    title: 'Submit a Handle | Froth',
    description:
      'Submit an X handle for Froth to roast. We\'ll measure the buzzword density and give it a bubble score.',
    url: `${BASE_URL}/submit`,
  },
  twitter: {
    title: 'Submit a Handle | Froth',
    description:
      'Submit an X handle for Froth to roast. We\'ll measure the buzzword density and give it a bubble score.',
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
