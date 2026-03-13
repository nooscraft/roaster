import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

function getScoreColor(score: number): string {
  if (score < 3) return '#22c55e';
  if (score < 6) return '#F5C518';
  if (score < 8) return '#f97316';
  return '#ef4444';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const badge = await prisma.badge.findUnique({ where: { id } });

    if (!badge) {
      return new Response('Badge not found', { status: 404 });
    }

    const scoreColor = getScoreColor(badge.bubbleScore);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F2ECD8',
            padding: '60px',
          }}
        >
          {/* Card container */}
          <div
            style={{
              background: '#fff',
              border: '6px solid #1a1a1a',
              boxShadow: '12px 12px 0 #1a1a1a',
              padding: '48px 60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '1000px',
            }}
          >
            {/* Badge title */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#1a1a1a',
                marginBottom: '24px',
                letterSpacing: '4px',
              }}
            >
              I SURVIVED FROTH
            </div>

            {/* Handle */}
            <div
              style={{
                background: '#F5C518',
                border: '4px solid #1a1a1a',
                padding: '12px 24px',
                fontSize: '36px',
                fontWeight: 900,
                color: '#1a1a1a',
                marginBottom: '32px',
              }}
            >
              @{badge.handle}
            </div>

            {/* Score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  fontSize: '120px',
                  fontWeight: 900,
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {badge.bubbleScore}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#888',
                  marginTop: '8px',
                  letterSpacing: '2px',
                }}
              >
                BUBBLE SCORE
              </div>
            </div>

            {/* Roast text */}
            <div
              style={{
                background: '#f9f9f9',
                border: '4px solid #1a1a1a',
                borderLeft: '10px solid #1a1a1a',
                padding: '24px 28px',
                maxWidth: '800px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  color: '#1a1a1a',
                  lineHeight: 1.4,
                  textAlign: 'left',
                }}
              >
                {badge.roastText.length > 200
                  ? badge.roastText.substring(0, 200) + '...'
                  : badge.roastText}
              </div>
            </div>

            {/* Branding */}
            <div
              style={{
                fontSize: '20px',
                color: '#999',
              }}
            >
              Analyzed by{' '}
              <span style={{ color: '#F5C518', fontWeight: 700 }}>froth.live</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
