# Quick Start Guide

Get the AI Bubble Roster running in 5 minutes!

## Option 1: With Neon (Recommended - No Local Setup)

1. **Create a free Neon database**:
   - Go to https://neon.tech
   - Sign up (free tier)
   - Create a new project
   - Copy the connection string

2. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

3. **Run migrations and seed**:
```bash
npx prisma migrate dev
npx prisma db seed
```

4. **Start the app**:
```bash
npm run dev
```

Visit http://localhost:3000 (or the port shown in terminal)

## Option 2: With Local PostgreSQL

1. **Install PostgreSQL**:
```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
```

2. **Create database**:
```bash
createdb roster
```

3. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL=postgresql://localhost:5432/roster
```

4. **Run migrations and seed**:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Start the app**:
```bash
npm run dev
```

## Minimal Configuration

For just testing the UI (no auth, no X API, no OpenAI):

**.env minimal setup**:
```
DATABASE_URL=postgresql://localhost:5432/roster
NEXTAUTH_SECRET=any-random-string-here
NEXTAUTH_URL=http://localhost:3000
```

This gives you:
- ✅ Retro theme and UI
- ✅ Database with seed data
- ✅ All pages working
- ❌ No admin access (needs GitHub OAuth)
- ❌ No post syncing (needs X API)
- ❌ No roast generation (needs OpenAI)

## Full Configuration

For complete functionality, add to `.env`:

```
# GitHub OAuth (for admin access)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
ADMIN_EMAIL_ALLOWLIST=your-email@example.com

# X API (for post syncing)
X_BEARER_TOKEN=your_bearer_token

# OpenAI (for roast generation)
OPENAI_API_KEY=sk-your-key
```

## Verify It's Working

1. **Homepage**: Should show retro theme with filters
2. **Database**: Run `npx prisma studio` to browse data
3. **Seed Data**: Should see 5 example handles (OpenAI, AnthropicAI, etc.)

## Troubleshooting

### "Authentication failed against database"
- Check DATABASE_URL is correct
- Verify database exists: `psql -l | grep roster`
- Test connection: `psql $DATABASE_URL`

### "Port 3000 is in use"
- Next.js will auto-use another port (e.g., 3002)
- Check terminal output for actual port

### "Failed to fetch"
- Database not running or not migrated
- Run: `npx prisma migrate dev`

## Next Steps

Once running:
1. Browse the retro-themed homepage
2. Check out the leaderboard page
3. Try the submit form
4. Set up GitHub OAuth for admin access
5. Add X API credentials to sync real posts
6. Add OpenAI key to generate roasts

See **GETTING_STARTED.md** for detailed setup instructions!
