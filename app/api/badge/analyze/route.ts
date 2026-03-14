import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { XAPIClient } from '@/lib/x-api/client';
import OpenAI from 'openai';

const CACHE_TTL_HOURS = 24;

function createOpenRouterClient() {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005',
      'X-Title': 'Froth',
    },
  });
}

async function generateScoreAndRoast(prompt: string): Promise<string> {
  const client = createOpenRouterClient();
  const completion = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-haiku',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: 900,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

export async function POST(request: NextRequest) {
  try {
    const { handle } = await request.json();

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    const cleanHandle = handle.replace('@', '').trim();

    if (!cleanHandle) {
      return NextResponse.json(
        { error: 'Invalid handle' },
        { status: 400 }
      );
    }

    // Check if we analyzed this handle recently (within 24h)
    const recentBadge = await prisma.badge.findFirst({
      where: {
        handle: cleanHandle,
        createdAt: {
          gte: new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentBadge) {
      return NextResponse.json({
        id: recentBadge.id,
        handle: recentBadge.handle,
        bubbleScore: recentBadge.bubbleScore,
        roastText: recentBadge.roastText,
        badgeUrl: `/badge/${recentBadge.id}`,
        cached: true,
      });
    }

    // Fetch user profile and tweets from X API
    const xClient = new XAPIClient();
    
    // Get user info (with bio)
    const userResponse = await fetch(
      `https://api.x.com/2/users/by/username/${cleanHandle}?user.fields=description`,
      {
        headers: {
          Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
        },
      }
    );

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return NextResponse.json(
          { error: 'This handle doesn\'t exist. Either you typo\'d or they got banned for posting too much truth.' },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch user: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const user = userData.data;
    const bio = user?.description || '';

    // Get user's recent tweets
    const tweets = await xClient.getUserTimeline(user.id, {
      maxResults: 20,
      excludeReplies: true,
      excludeRetweets: true,
    });

    if (tweets.length === 0) {
      return NextResponse.json(
        { error: 'No tweets found. Either this account is private, or they\'re too scared to post anything roastable.' },
        { status: 400 }
      );
    }

    // Take top 5 tweets (by recency)
    const top5Tweets = tweets.slice(0, 5);

    // Let the LLM score AND roast at the same time for accuracy
    const scoreAndRoastPrompt = `TASK: You are a comedic roast generator for a satirical website. Someone submitted this X profile to be roasted. This is consensual comedy — they want the roast.

IMPORTANT — Identify account type first (from handle, bio, and content style):
- PERSONAL: Individual person (casual posts, opinions, life stuff, "views my own", personal handle like @johndoe)
- BRAND/CORP/ORG: Company, brand, or org account (corporate tone, "we're building", product announcements, official branding)

ROAST TONE based on account type:
- If PERSONAL: Roast the person directly — "Your timeline...", "You...", "Your bio..."
- If BRAND/CORP/ORG: Roast the account/brand, NOT a person — "This account's content...", "The marketing team here...", "This brand's corporate speak...", "Whoever runs this account..."

Analyze this X profile and return a JSON response with two fields:

1. "score" (number 1.0–10.0, one decimal): A "bubble score" measuring how much hype/self-importance/corporate speak is in the content. Use this scale:
   - 1-2: Completely grounded, no hype at all
   - 3-4: Mild self-promotion, mostly normal
   - 5-6: Noticeable hype or buzzwords
   - 7-8: Heavy buzzword usage, big claims, vague promises
   - 9-10: Peak delusion, maximum buzzword density, zero substance

2. "roast" (string): A lengthy, 7-10 sentence roast that goes hard. Voice: sharp and refined — like a Comedy Central roast writer or a respected satirist. The humor lands through clever observation, precise language, and wit; it should feel professionally written, something a critic would quote. Really go after the ego — the gap between how they present themselves and what they actually deliver, the performative self-importance, the curated persona. Pile it on. Keep the language elevated — no slang, no colloquialisms (e.g. avoid "bro", "vibes" as a noun, "slay"). Use the appropriate tone (person vs brand) based on your account-type assessment. Be specific to what they actually wrote. No hashtags, no emojis, no meta commentary.

Profile to analyze:
Handle: @${cleanHandle}
Bio: "${bio || 'No bio'}"
Recent tweets:
${top5Tweets.map((t, i) => `${i + 1}. "${t.text}"`).join('\n')}

Respond with ONLY valid JSON, nothing else:
{"score": X.X, "roast": "..."}`;

    const llmResponse = await generateScoreAndRoast(scoreAndRoastPrompt);
    
    let overallScore = 5.0;
    let roastText = '';
    
    try {
      // Extract JSON from the response (handle cases where LLM adds extra text)
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        overallScore = Math.min(10, Math.max(1, parseFloat(parsed.score) || 5.0));
        roastText = parsed.roast || '';
      }
    } catch (e) {
      console.error('Failed to parse LLM JSON response:', e);
    }
    
    // Fallback if parsing failed
    if (!roastText) {
      roastText = llmResponse;
    }

    // Save to database
    const badge = await prisma.badge.create({
      data: {
        handle: cleanHandle,
        bubbleScore: overallScore,
        roastText,
        bioText: bio || null,
        tweetSamples: top5Tweets.map((t) => t.text),
      },
    });

    return NextResponse.json({
      id: badge.id,
      handle: badge.handle,
      bubbleScore: badge.bubbleScore,
      roastText: badge.roastText,
      badgeUrl: `/badge/${badge.id}`,
      cached: false,
    });
  } catch (error: any) {
    console.error('Badge analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze handle. Please try again.' },
      { status: 500 }
    );
  }
}
