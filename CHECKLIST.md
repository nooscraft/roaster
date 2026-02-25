# AI Bubble Roster - Setup Checklist

Use this checklist to get your AI Bubble Roster up and running.

## ☑️ Initial Setup

- [ ] Clone/download the project
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`

## ☑️ Database Setup (Choose One)

### Option A: Neon (Recommended)
- [ ] Create account at https://neon.tech
- [ ] Create new project
- [ ] Copy connection string
- [ ] Paste into `.env` as `DATABASE_URL`
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npx prisma db seed`

### Option B: Local PostgreSQL
- [ ] Install PostgreSQL
- [ ] Start PostgreSQL service
- [ ] Run `createdb roster`
- [ ] Update `.env`: `DATABASE_URL=postgresql://localhost:5432/roster`
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npx prisma db seed`

## ☑️ Basic Testing (No External APIs)

- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Verify retro theme loads
- [ ] Check homepage shows filters
- [ ] Visit `/leaderboard`
- [ ] Visit `/submit`
- [ ] Run `npx prisma studio` to browse seed data

## ☑️ GitHub OAuth (For Admin Access)

- [ ] Go to https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Set Homepage URL: `http://localhost:3000`
- [ ] Set Callback URL: `http://localhost:3000/api/auth/callback/github`
- [ ] Copy Client ID to `.env` as `GITHUB_CLIENT_ID`
- [ ] Generate and copy Client Secret to `.env` as `GITHUB_CLIENT_SECRET`
- [ ] Add your GitHub email to `.env` as `ADMIN_EMAIL_ALLOWLIST`
- [ ] Generate random string: `openssl rand -base64 32`
- [ ] Add to `.env` as `NEXTAUTH_SECRET`
- [ ] Restart dev server
- [ ] Visit `/admin` and sign in
- [ ] Verify admin dashboard loads

## ☑️ X API Setup (For Post Syncing)

- [ ] Apply for X API access at https://developer.twitter.com
- [ ] Choose Basic tier ($100/month minimum)
- [ ] Create project and app
- [ ] Generate Bearer Token
- [ ] Add to `.env` as `X_BEARER_TOKEN`
- [ ] Restart dev server
- [ ] Go to Admin > Handles
- [ ] Click "Sync Now" on a handle
- [ ] Check terminal logs for sync activity

## ☑️ OpenAI Setup (For Roast Generation)

- [ ] Create account at https://platform.openai.com
- [ ] Add payment method
- [ ] Create API key
- [ ] Add to `.env` as `OPENAI_API_KEY`
- [ ] Restart dev server and worker
- [ ] Trigger a sync to generate roasts
- [ ] Go to Admin > Roasts
- [ ] Verify roasts are being generated

## ☑️ Worker Setup (For Background Jobs)

- [ ] Open new terminal
- [ ] Run `cd worker && npm install`
- [ ] Run `npm run dev`
- [ ] Verify "Worker started" in logs
- [ ] Check for sync job every 30 seconds
- [ ] Monitor for errors

## ☑️ Full Flow Testing

- [ ] Worker syncs posts from enabled handles
- [ ] Posts appear in database (check Prisma Studio)
- [ ] Roasts are generated automatically
- [ ] Go to Admin > Roasts
- [ ] Approve a roast
- [ ] Visit homepage
- [ ] Verify approved roast appears
- [ ] Click "View Full Roast"
- [ ] Test filters (handle, score range)
- [ ] Visit leaderboard
- [ ] Submit a report
- [ ] Check Admin > Reports

## ☑️ Production Deployment

### Vercel (Web App)
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Configure environment variables
- [ ] Set build command: `prisma generate && next build`
- [ ] Deploy
- [ ] Update GitHub OAuth callback URL to production domain
- [ ] Test production site

### Fly.io (Worker)
- [ ] Install Fly CLI
- [ ] Run `fly auth login`
- [ ] Run `fly launch`
- [ ] Set secrets with `fly secrets set`
- [ ] Run `fly deploy`
- [ ] Check logs with `fly logs`
- [ ] Verify worker is syncing

### Database (Production)
- [ ] Use Neon production database
- [ ] Run `DATABASE_URL="..." npx prisma migrate deploy`
- [ ] Run `DATABASE_URL="..." npx prisma db seed`
- [ ] Verify data in Neon dashboard

## ☑️ Post-Launch Monitoring

- [ ] Check Vercel logs for errors
- [ ] Monitor Fly.io worker logs
- [ ] Check `/api/health` endpoint
- [ ] Monitor X API credit usage
- [ ] Monitor OpenAI token usage
- [ ] Review pending roasts daily
- [ ] Check reports regularly
- [ ] Verify no budget overruns

## ☑️ Optional Enhancements

- [ ] Set up S3 for share cards
- [ ] Configure Playwright for screenshots
- [ ] Add email notifications
- [ ] Implement user accounts
- [ ] Add voting system
- [ ] Create public API
- [ ] Add RSS feed
- [ ] Upgrade to X API Filtered Stream

---

## 🆘 Troubleshooting

### Issue: "Authentication failed against database"
**Solution**: Check DATABASE_URL is correct and database exists

### Issue: "Port 3000 is in use"
**Solution**: Next.js auto-selects another port, check terminal output

### Issue: "Unauthorized" in admin panel
**Solution**: Verify your GitHub email is in ADMIN_EMAIL_ALLOWLIST

### Issue: Worker not syncing
**Solution**: Check X_BEARER_TOKEN is set and handles are enabled

### Issue: Roasts not generating
**Solution**: Check OPENAI_API_KEY is set and prompt version is active

---

## 📚 Documentation Reference

- **QUICKSTART.md** - 5-minute setup guide
- **GETTING_STARTED.md** - Detailed local development setup
- **DEPLOYMENT.md** - Production deployment guide
- **README.md** - Project overview and architecture
- **PROJECT_SUMMARY.md** - Complete feature summary
- **STATUS.md** - Current implementation status (this file)

---

## ✅ Current Status Summary

**Implementation**: 100% Complete  
**Documentation**: Complete  
**Deployment Configs**: Ready  
**Testing**: Ready for local testing  
**Production**: Ready to deploy  

**Next Step**: Set up database connection and run migrations!
