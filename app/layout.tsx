import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "AI Bubble Roster - Roasting the Hype",
  description: "A satirical feed roasting AI corporate hype and buzzword theater",
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
      <body>
        <SessionProvider>
        <div className="starfield" aria-hidden="true">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        
        <div className="retro-container">
          <header className="border-b-4 border-orange-500 bg-black/80 p-4 mb-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="pixel-font text-orange-500 text-center mb-2 glow-text">
                AI BUBBLE ROSTER
              </h1>
              <p className="text-center text-yellow-400 text-sm">
                🔥 ROASTING THE HYPE SINCE 2026 🔥
              </p>
              <nav className="mt-4 flex justify-center gap-4 flex-wrap">
                <a href="/" className="text-yellow-400 hover:text-orange-500 transition-colors">
                  [HOME]
                </a>
                <a href="/leaderboard" className="text-yellow-400 hover:text-orange-500 transition-colors">
                  [LEADERBOARD]
                </a>
                <a href="/submit" className="text-yellow-400 hover:text-orange-500 transition-colors">
                  [SUBMIT]
                </a>
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 pb-8">
            {children}
          </main>

          <footer className="border-t-4 border-orange-500 bg-black/80 p-6 mt-12">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-orange-500 pixel-font text-xs mb-2">
                <span className="blink">🔥</span> SHIP OR DIE <span className="blink">🔥</span>
              </p>
              <p className="text-yellow-400 text-sm">
                Parody content. No personal attacks. Just roasting the patterns.
              </p>
              <p className="text-orange-400 text-xs mt-2">
                Made with 💾 and 🕹️ in the spirit of Ship or Die
              </p>
            </div>
          </footer>
        </div>
        </SessionProvider>
      </body>
    </html>
  );
}
