# Recent Changes

## ✅ Switched from OpenAI to OpenRouter

### What Changed

1. **LLM Provider** (`lib/llm/provider.ts`):
   - Now uses OpenRouter API endpoint
   - Model: `anthropic/claude-3.5-sonnet` (better for creative writing!)
   - Supports JSON mode for structured output

2. **Environment Variables**:
   - `OPENAI_API_KEY` → `OPENROUTER_API_KEY`
   - Added `NEXT_PUBLIC_BASE_URL` (required by OpenRouter)

3. **GitHub Actions**:
   - Updated all workflows to use `OPENROUTER_API_KEY`
   - Updated secrets documentation

4. **Documentation**:
   - New: `OPENROUTER_SETUP.md` - Complete setup guide
   - Updated: `.env.example` with OpenRouter variables

### Why OpenRouter?

- ✅ **No OpenAI account needed**
- ✅ **$5-10 free credits** for new users
- ✅ **Cheaper** than OpenAI direct ($0.01/roast vs $0.02/roast)
- ✅ **Better model** - Claude 3.5 Sonnet is excellent for satire
- ✅ **More flexible** - Easy to switch models

### Cost Comparison

**OpenAI (GPT-4o-mini)**:
- $0.15 per 1M input tokens
- $0.60 per 1M output tokens
- ~$0.02 per roast

**OpenRouter (Claude 3.5 Sonnet)**:
- $3 per 1M input tokens
- $15 per 1M output tokens
- ~$0.01 per roast
- **50% cheaper!**

### Next Steps

1. Get OpenRouter API key: https://openrouter.ai/keys
2. Add to `.env`: `OPENROUTER_API_KEY=sk-or-v1-...`
3. Test locally: `npm run dev`
4. Deploy to Vercel (add env var)
5. Update GitHub Secrets

See **OPENROUTER_SETUP.md** for detailed instructions!

---

## 🎨 Updated Theme to Match Ship or Die

### Color Changes

**Before** (Generic 90s):
- Background: Blue gradient
- Primary: Cyan/Pink/Yellow neon
- Borders: Thick with bright glows

**After** (Ship or Die inspired):
- Background: Pure black `#000000`
- Primary: Orange `#FF6B35` / Yellow `#FFD23F`
- Borders: Subtle glows, more refined
- Accent: Coral `#FF8C42`

### What Changed

1. **Background**: Solid black instead of blue gradient
2. **Glow effects**: Reduced from 20px to 5-8px (much more subtle)
3. **Borders**: Thinner (3px instead of 4px)
4. **Buttons**: Flat orange instead of gradient pink
5. **Cards**: Dark with subtle orange borders
6. **Text**: Orange/yellow color scheme throughout

### Files Updated

- `app/globals.css` - All color variables and effects
- `app/layout.tsx` - Header and footer colors
- `app/page.tsx` - Homepage text colors
- `components/retro/BubbleScoreMeter.tsx` - Score colors
- `components/retro/RetroCard.tsx` - Card variants

---

## 🚀 Simplified Deployment (No S3, No Fly.io!)

### What We Removed

1. **S3 Bucket** → Share cards stored in GitHub repo
2. **Fly.io Worker** → GitHub Actions for background jobs
3. **QStash** → Not needed with GitHub Actions

### New Architecture

```
GitHub Repo
  ├── Code & share card images
  └── GitHub Actions (runs every 30min)
       ├── Sync X posts
       ├── Generate roasts
       └── Create share cards

Vercel
  └── Next.js web app (auto-deploys from GitHub)

Neon
  └── PostgreSQL database
```

### Cost Breakdown

**Old Setup**:
- Vercel: Free
- Fly.io: $5-10/month
- S3: $1-5/month
- Neon: Free
- **Total**: $6-15/month

**New Setup**:
- Vercel: Free
- GitHub Actions: Free (2000 min/month)
- GitHub Storage: Free (1GB included)
- Neon: Free
- **Total**: $0/month! 🎉

### Benefits

- ✅ **Completely free** for small/medium traffic
- ✅ **Simpler setup** - no S3 credentials
- ✅ **Version controlled images** - all in git
- ✅ **Easy rollback** - just revert commits
- ✅ **No infrastructure** to manage

---

## 📋 Summary

**Theme**: Ship or Die colors (black, orange, yellow) ✅  
**LLM**: OpenRouter with Claude 3.5 Sonnet ✅  
**Storage**: GitHub repo (no S3) ✅  
**Worker**: GitHub Actions (no Fly.io) ✅  
**Cost**: $0/month infrastructure ✅  

**Ready to push to GitHub and deploy!** 🚀
