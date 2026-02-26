# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Accounts**:
   - Vercel account (for web app)
   - Fly.io account (for worker)
   - Neon account (for database)
   - GitHub account (for OAuth)
   - X Developer account with API access
   - OpenAI account with API access

2. **CLI Tools**:
   - Vercel CLI: `npm i -g vercel`
   - Fly CLI: `curl -L https://fly.io/install.sh | sh`
   - Prisma CLI: Included in project dependencies

## Step 1: Database Setup (Neon)

1. Go to https://neon.tech and create a new project
2. In the Neon dashboard, you'll see two connection strings:
   - **Pooled** (recommended for serverless): `ep-xxx-pooler.region.aws.neon.tech` port **6543** — use for `DATABASE_URL`
   - **Direct**: `ep-xxx.region.aws.neon.tech` port **5432** — use for `DIRECT_URL` (migrations)
3. Set in `.env` / Vercel:
   - `DATABASE_URL` = pooled connection string (faster for serverless, avoids cold-start overhead)
   - `DIRECT_URL` = direct connection string (required for `prisma migrate`)
4. Run migrations:
```bash
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

4. Seed the database:
```bash
DATABASE_URL="your-connection-string" npx prisma db seed
```

## Step 2: GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: AI Bubble Roster
   - Homepage URL: `https://your-domain.vercel.app`
   - Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`
4. Save the Client ID and Client Secret

## Step 3: Generate Secrets

Generate a secure secret for NextAuth:
```bash
openssl rand -base64 32
```

## Step 4: Web App Deployment (Vercel)

1. Push your code to GitHub

2. Go to https://vercel.com and import your repository

3. Configure environment variables in Vercel:
```
DATABASE_URL=postgresql://...@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://...@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=sk-...
X_BEARER_TOKEN=...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generated-secret>
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
ADMIN_EMAIL_ALLOWLIST=your-email@example.com
S3_BUCKET=...
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://s3.amazonaws.com
DAILY_X_CREDIT_BUDGET=1000
DAILY_OPENAI_TOKEN_BUDGET=100000
```

4. Set build command:
```
prisma generate && next build
```

5. Deploy:
```bash
vercel --prod
```

## Step 5: Worker Deployment (Fly.io)

1. Navigate to your project directory

2. Create a Fly app:
```bash
fly launch --name roster-worker --region sjc
```

3. Set secrets:
```bash
fly secrets set \
  DATABASE_URL="postgresql://..." \
  OPENAI_API_KEY="sk-..." \
  X_BEARER_TOKEN="..." \
  DAILY_X_CREDIT_BUDGET="1000" \
  DAILY_OPENAI_TOKEN_BUDGET="100000"
```

4. Deploy:
```bash
fly deploy
```

5. Check logs:
```bash
fly logs
```

## Step 6: Verify Deployment

1. **Web App Health Check**:
   - Visit `https://your-domain.vercel.app/api/health`
   - Should return status: "healthy"

2. **Worker Health**:
   - Check Fly.io logs: `fly logs`
   - Should see "Worker started" message

3. **Admin Access**:
   - Visit `https://your-domain.vercel.app/admin`
   - Sign in with GitHub
   - Should see admin dashboard

4. **Add Test Handle**:
   - Go to Admin > Handles
   - Add a test handle (e.g., "OpenAI")
   - Click "Sync Now"
   - Check worker logs for sync activity

## Step 7: Configure X API Costs

The X API uses a credit-based system. Monitor your usage:

1. Check current usage:
   - Visit `/api/health`
   - Look at `checks.costs.details`

2. Adjust budget if needed:
   - Update `DAILY_X_CREDIT_BUDGET` in Vercel and Fly.io
   - Redeploy both services

## Step 8: Optional - S3 Setup for Share Cards

If you want share card generation:

1. Create an S3 bucket (or use Cloudflare R2)
2. Configure CORS for public read
3. Create IAM user with upload permissions
4. Add S3 credentials to environment variables
5. Redeploy web app

## Monitoring

### Vercel
- View logs: https://vercel.com/dashboard
- Monitor function execution times
- Check for errors in deployment logs

### Fly.io
- View logs: `fly logs`
- Monitor metrics: `fly status`
- Check resource usage: `fly dashboard`

### Database
- Neon dashboard: https://console.neon.tech
- Monitor connection count
- Check query performance

## Scaling

### Increase Worker Capacity
```bash
fly scale count 2  # Run 2 worker instances
fly scale vm shared-cpu-2x  # Upgrade VM size
```

### Adjust Sync Frequency
Edit `worker/index.ts`:
```typescript
private pollInterval = 30000;  // 30 seconds (more frequent)
```

### Add More Handles
- Go to Admin > Handles
- Add handles gradually
- Monitor X API credit usage

## Troubleshooting

### Worker Not Syncing
1. Check Fly.io logs: `fly logs`
2. Verify X_BEARER_TOKEN is set correctly
3. Check X API rate limits
4. Ensure database is accessible

### Roasts Not Generating
1. Check OpenAI API key is valid
2. Verify prompt version is active (Admin > Prompts)
3. Check worker logs for errors
4. Ensure daily token budget not exceeded

### Admin Panel Not Accessible
1. Verify GitHub OAuth credentials
2. Check ADMIN_EMAIL_ALLOWLIST includes your email
3. Clear browser cookies and try again
4. Check Vercel logs for auth errors

### Database Connection Issues
1. Verify DATABASE_URL is correct
2. Check Neon project is active
3. Ensure connection pooling is configured
4. Test connection: `npx prisma db pull`

## Maintenance

### Update Dependencies
```bash
npm update
npx prisma generate
vercel --prod
fly deploy
```

### Backup Database
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Rotate Secrets
1. Generate new secrets
2. Update in Vercel and Fly.io
3. Redeploy both services
4. Update GitHub OAuth callback URL if needed

## Cost Estimates

- **Vercel**: Free tier should be sufficient for moderate traffic
- **Fly.io**: ~$5-10/month for worker instance
- **Neon**: Free tier includes 0.5GB storage
- **X API**: Pay-per-use, budget accordingly
- **OpenAI**: ~$0.15 per 1M tokens (gpt-4o-mini)

Total estimated cost: **$10-30/month** depending on usage.
