import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Froth - Measuring the froth in frontier AI",
  description: "Measuring the froth in frontier AI",
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
      </head>
      <body style={{ backgroundColor: '#F2ECD8' }}>
        <GoogleAnalytics />
        <SessionProvider>
        <div className="retro-container">
          {/* Header */}
          <header style={{ background: '#1a1a1a', borderBottom: '4px solid #1a1a1a' }} className="p-4 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div />
                <div className="text-center">
                  <h1 className="pixel-font glow-text" style={{ color: '#F5C518', fontSize: '37px' }}>
                    FROTH
                  </h1>
                  <p style={{ color: '#888', fontSize: '16px', fontFamily: 'VT323, monospace' }}>
                    MEASURING THE FROTH IN FRONTIER AI
                  </p>
                </div>
                <div />
              </div>
              <nav className="mt-4 flex justify-center gap-3 flex-wrap">
                {[
                  { href: '/', label: 'HOME' },
                  { href: '/leaderboard', label: 'LEADERBOARD' },
                  { href: '/submit', label: 'SUBMIT' },
                ].map(({ href, label }) => (
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
                    }}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 pb-8">
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
