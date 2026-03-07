import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Home } from "pixelarticons/react/Home";
import { Trophy } from "pixelarticons/react/Trophy";
import { Upload } from "pixelarticons/react/Upload";
import { Analytics } from "pixelarticons/react/Analytics";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://froth-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Froth - Measuring the froth in frontier AI",
    template: "%s | Froth",
  },
  description:
    "Froth measures the buzzword density in AI announcements. We roast corporate hype with bubble scores, translations, and reality checks — one post at a time.",
  keywords: ["AI", "bubble score", "buzzwords", "startup", "parody", "roast", "frontier AI"],
  authors: [{ name: "Froth" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Froth",
    title: "Froth - Measuring the froth in frontier AI",
    description:
      "Froth measures the buzzword density in AI announcements. We roast corporate hype with bubble scores, translations, and reality checks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Froth - Measuring the froth in frontier AI",
    description:
      "Froth measures the buzzword density in AI announcements. We roast corporate hype with bubble scores, translations, and reality checks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Froth",
              url: BASE_URL,
              description:
                "Froth measures the buzzword density in AI announcements. We roast corporate hype with bubble scores, translations, and reality checks.",
              publisher: {
                "@type": "Organization",
                name: "Froth",
                url: BASE_URL,
              },
            }),
          }}
        />
      </head>
      <body style={{ backgroundColor: '#F2ECD8' }}>
        <GoogleAnalytics />
        <SessionProvider>
        <div className="retro-container min-h-screen flex flex-col">
          {/* Header */}
          <header style={{ background: '#1a1a1a', borderBottom: '4px solid #1a1a1a' }} className="p-4 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div />
                <div className="text-center">
                  <div className="pixel-font glow-text" style={{ color: '#F5C518', fontSize: '37px' }} aria-hidden="true">
                    FROTH
                  </div>
                  <p style={{ color: '#888', fontSize: '16px', fontFamily: 'VT323, monospace' }}>
                    MEASURING THE FROTH IN FRONTIER AI
                  </p>
                </div>
                <div />
              </div>
              <nav className="mt-4 flex justify-center gap-3 flex-wrap">
                {[
                  { href: '/', label: 'HOME', Icon: Home },
                  { href: '/leaderboard', label: 'LEADERBOARD', Icon: Trophy },
                  { href: '/submit', label: 'SUBMIT', Icon: Upload },
                  { href: '/stats', label: 'STATS', Icon: Analytics },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    style={{
                      background: '#F5C518',
                      color: '#1a1a1a',
                      border: '2px solid #F5C518',
                      padding: '4px 12px',
                      fontFamily: '"Press Start 2P", cursive',
                      fontSize: '9px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Icon width={14} height={14} />
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <main className="w-full max-w-7xl mx-auto px-4 pb-8 flex-1">
            {children}
          </main>

          <footer style={{ background: '#1a1a1a', borderTop: '4px solid #1a1a1a' }} className="p-6 mt-12">
            <div className="max-w-7xl mx-auto text-center">
              <p className="pixel-font mb-2" style={{ color: '#F5C518', fontSize: '10px' }}>
                FROTH
              </p>
              <p style={{ color: '#888', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                Parody content. Roasting corporate hype, not people.
              </p>
              <p style={{ color: '#f5c518', fontFamily: 'VT323, monospace', fontSize: '12px', marginTop: '8px' }}>
                Made with reckless VC money, delusional optimism, and absolutely zero adult supervision 🚀
              </p>
            </div>
          </footer>
        </div>
        </SessionProvider>
      </body>
    </html>
  );
}
