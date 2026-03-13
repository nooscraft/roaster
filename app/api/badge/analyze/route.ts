import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { XAPIClient } from '@/lib/x-api/client';
import { calculateBaseScore } from '@/lib/roast/bubble-scorer';
import OpenAI from 'openai';

const CACHE_TTL_HOURS = 24;

async function generateSimpleRoast(prompt: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005',
      'X-Title': 'Froth',
    },
  });

  const completion = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-haiku',
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.0,
    max_tokens: 500,
  });

  let roast = completion.choices[0]?.message?.content?.trim() || 'Your timeline is so bland, even the algorithm gave up trying to recommend it to people.';
  
  // Strip out meta commentary prefixes
  const metaPrefixes = [
    /^Here's a roast.*?:\s*/i,
    /^Here is a roast.*?:\s*/i,
    /^Here's the roast.*?:\s*/i,
    /^Here is the roast.*?:\s*/i,
    /^Here's a.*?roast.*?:\s*/i,
    /^Here is a.*?roast.*?:\s*/i,
    /^Based on.*?:\s*/i,
    /^Looking at.*?:\s*/i,
    /^Analyzing.*?:\s*/i,
  ];
  
  for (const prefix of metaPrefixes) {
    roast = roast.replace(prefix, '');
  }
  
  return roast.trim();
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

    // Calculate bubble score for bio
    const bioScore = bio ? calculateBaseScore(bio) : { score: 5.0, reasoning: [] };

    // Calculate bubble score for each tweet
    const tweetScores = top5Tweets.map((tweet) => {
      const result = calculateBaseScore(tweet.text);
      return {
        text: tweet.text,
        score: result.score,
        reasoning: result.reasoning,
      };
    });

    // Overall score: 30% bio, 70% tweets average
    const avgTweetScore = tweetScores.reduce((sum, t) => sum + t.score, 0) / tweetScores.length;
    const overallScore = parseFloat(
      (bioScore.score * 0.3 + avgTweetScore * 0.7).toFixed(1)
    );

    // Generate roast using LLM
    const roastPrompt = `You are a comedy roast generator for a satirical website that roasts AI/tech industry hype and buzzwords. Users voluntarily submit their own profiles for comedic analysis. This is consensual entertainment similar to a comedy roast show.

Analyze this X profile and write a funny, satirical roast focusing on their use of buzzwords, corporate speak, and tech industry clichés. This is about roasting IDEAS and LANGUAGE PATTERNS, not personal attacks. Focus on:

BUZZWORD ANALYSIS:
- Overuse of terms like: agentic, paradigm shift, frontier, revolutionary, transformative, disruptive
- Corporate speak and jargon density
- Vague claims without substance ("10x better" at what?)
- "Stealth mode" / "launching soon" / "coming soon" that never materializes
- Gap between bio promises and actual tweet content

STYLE PATTERNS:
- LinkedIn-style humble bragging
- Overly confident claims vs actual demonstrated output
- Trying too hard to sound important or visionary
- Generic startup founder clichés
- Contradictions between different posts

Bio: "${bio || 'No bio provided'}"
Recent tweets:
${top5Tweets.map((t, i) => `${i + 1}. "${t.text}"`).join('\n')}

Write a 4-5 sentence comedic roast that:
- Is funny and shareable
- Focuses on their LANGUAGE and CONTENT patterns (not them personally)
- References specific buzzwords or phrases they actually used
- Is creative and witty
- Maintains a playful, satirical tone

Do NOT use hashtags or emojis. Do NOT include meta commentary - deliver the roast directly.`;

    const roastText = await generateSimpleRoast(roastPrompt);

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
