# OpenRouter Setup Guide

OpenRouter gives you access to multiple AI models (Claude, GPT-4, Llama, etc.) through a single API. It's often cheaper and more flexible than using OpenAI directly.

## Why OpenRouter?

- ✅ **No OpenAI account needed**
- ✅ **Access to Claude 3.5 Sonnet** (better for creative writing)
- ✅ **Pay-as-you-go** (no monthly minimums)
- ✅ **Often cheaper** than direct API access
- ✅ **Free credits** for new users ($5-10)
- ✅ **Multiple models** to choose from

## Setup Steps

### 1. Create OpenRouter Account

1. Go to https://openrouter.ai
2. Sign up with GitHub or email
3. Verify your email

### 2. Add Credits

1. Go to https://openrouter.ai/credits
2. Add $5-10 to start (goes a long way!)
3. Payment via credit card or crypto

### 3. Get API Key

1. Go to https://openrouter.ai/keys
2. Click "Create Key"
3. Give it a name: "AI Bubble Roster"
4. Copy the key (starts with `sk-or-v1-...`)

### 4. Add to Environment

**Local development** (`.env`):
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Production** (Vercel):
- Go to your Vercel project settings
- Add environment variable:
  - Name: `OPENROUTER_API_KEY`
  - Value: `sk-or-v1-your-key-here`
- Add: `NEXT_PUBLIC_BASE_URL` = `https://yourdomain.com`

**GitHub Actions**:
- Go to `https://github.com/nooscraft/roster/settings/secrets/actions`
- Add secret:
  - Name: `OPENROUTER_API_KEY`
  - Value: `sk-or-v1-your-key-here`
- Add: `NEXT_PUBLIC_BASE_URL` = `https://yourdomain.com`

## Current Model

We're using **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet`) because:
- Excellent at creative/satirical writing
- Great at following complex instructions
- Reliable JSON output
- Good price/performance ratio

## Cost Estimates

Claude 3.5 Sonnet pricing (via OpenRouter):
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

**Typical roast generation**:
- ~1,000 input tokens (prompt + post)
- ~500 output tokens (roast)
- **Cost per roast**: ~$0.01

**Monthly estimates** (100 roasts/day):
- 3,000 roasts/month
- **Total cost**: ~$30/month

Much cheaper than GPT-4! And you get free credits to start.

## Alternative Models

You can easily switch models by changing the model name in `lib/llm/provider.ts`:

### Budget Options
```typescript
model: 'meta-llama/llama-3.1-8b-instruct:free' // FREE!
model: 'google/gemini-flash-1.5' // $0.075 per 1M tokens
```

### Premium Options
```typescript
model: 'anthropic/claude-3-opus' // Best quality, $15/$75 per 1M
model: 'openai/gpt-4-turbo' // OpenAI's best, $10/$30 per 1M
```

### Balanced Options (Current)
```typescript
model: 'anthropic/claude-3.5-sonnet' // Great quality, $3/$15 per 1M
model: 'openai/gpt-4o-mini' // Good quality, $0.15/$0.60 per 1M
```

## Testing

Test your setup:

```bash
# Start dev server
npm run dev

# In another terminal, test roast generation
curl -X POST http://localhost:3000/api/admin/handles/add \
  -H "Content-Type: application/json" \
  -d '{"handle": "OpenAI"}'

# Check logs for OpenRouter API calls
```

## Monitoring Usage

1. Go to https://openrouter.ai/activity
2. See all API calls and costs
3. Set up budget alerts
4. Monitor token usage

## Troubleshooting

### "Invalid API key"
- Check key starts with `sk-or-v1-`
- Verify it's set in `.env`
- Restart dev server

### "Insufficient credits"
- Add more credits at https://openrouter.ai/credits
- Check current balance

### "Model not found"
- Verify model name is correct
- Check https://openrouter.ai/models for available models

### "Rate limited"
- OpenRouter has generous rate limits
- Wait a minute and try again
- Consider upgrading plan if needed

## Free Tier

OpenRouter gives new users **$5-10 in free credits**! That's enough for:
- 500-1000 roasts
- Several weeks of testing
- Full feature development

Perfect for getting started!

## Next Steps

1. ✅ Get OpenRouter API key
2. ✅ Add to `.env`
3. ✅ Test locally
4. ✅ Deploy to Vercel
5. ✅ Add to GitHub Secrets
6. ✅ Start roasting! 🔥

**No OpenAI account needed. No monthly minimums. Just pay for what you use!**
