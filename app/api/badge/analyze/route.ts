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
    temperature: 0.9,
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content?.trim() || 'Your timeline is a mystery wrapped in an enigma.';
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
    const roastPrompt = `You are a savage AI roast generator. Analyze this person's X profile and roast them based on their bio and recent tweets. Be funny, sharp, and a bit mean (but not cruel). Focus on:
- Buzzword density (agentic, paradigm shift, frontier, etc.)
- Vague claims without substance
- Benchmark flexing without context
- Stealth mode / "coming soon" energy
- Gap between bio promises and tweet reality

Bio: "${bio || 'No bio'}"
Recent tweets:
${top5Tweets.map((t, i) => `${i + 1}. "${t.text}"`).join('\n')}

Generate a 2-3 sentence roast. Make it shareable and funny. Do NOT use hashtags or emojis. Do NOT start with "Here's the roast" or any meta commentary - just deliver the roast directly.`;

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
