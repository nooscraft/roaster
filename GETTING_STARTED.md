# Getting Started with AI Bubble Roster

This guide will help you get the AI Bubble Roster up and running locally.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Set up database
npx prisma migrate dev
npx prisma db seed

# 4. Start the development server
npm run dev

# 5. In another terminal, start the worker
cd worker
npm install
npm run dev
```

Visit `http://localhost:3000` to see the app!

## Detailed Setup

### 1. Environment Variables

You need to configure the following in your `.env` file:

#### Required for Basic Functionality
- `DATABASE_URL`: PostgreSQL connection string
  - Local: `postgresql://user:password@localhost:5432/roster`
  - Or use a free Neon database: https://neon.tech

- `NEXTAUTH_SECRET`: Random string for session encryption
  ```bash
  openssl rand -base64 32
  ```

- `NEXTAUTH_URL`: Your app URL
  - Local: `http://localhost:3000`
  - Production: `https://your-domain.vercel.app`

#### Required for Admin Access
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials
  - Create at: https://github.com/settings/developers
  - Callback URL: `http://localhost:3000/api/auth/callback/github`

- `ADMIN_EMAIL_ALLOWLIST`: Your GitHub email
  - Example: `your-email@example.com`

#### Required for Full Functionality
- `X_BEARER_TOKEN`: X API v2 Bearer Token
  - Get from: https://developer.twitter.com/en/portal/dashboard
  - Requires Basic or higher tier ($100/month minimum)

- `OPENAI_API_KEY`: OpenAI API key
  - Get from: https://platform.openai.com/api-keys

#### Optional
- `S3_*`: For share card storage (can skip initially)
- `DAILY_X_CREDIT_BUDGET`: Default is 1000
- `DAILY_OPENAI_TOKEN_BUDGET`: Default is 100000

### 2. Database Setup

The project uses PostgreSQL with Prisma ORM.

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb roster

# Update .env
DATABASE_URL="postgresql://localhost:5432/roster"
```

**Option B: Neon (Recommended)**
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string to `.env`

**Run Migrations**
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

This will:
- Create all database tables
- Seed example handles (OpenAI, AnthropicAI, etc.)
- Create the initial prompt version

### 3. GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: AI Bubble Roster (Local)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add to `.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### 4. X API Setup (Optional for Testing)

The X API is required for production but you can test without it:

**For Testing Without X API:**
- The app will work but won't sync posts
- You can still test the admin UI, theme, and database

**To Get X API Access:**
1. Apply at https://developer.twitter.com/en/portal/petition/essential/basic-info
2. Choose Basic tier ($100/month) or higher
3. Create a project and app
4. Generate a Bearer Token
5. Add to `.env`:
   ```
   X_BEARER_TOKEN=your_bearer_token
   ```

### 5. OpenAI API Setup (Optional for Testing)

**For Testing Without OpenAI:**
- The app will work but won't generate roasts
- You can manually create test data

**To Get OpenAI API Access:**
1. Sign up at https://platform.openai.com
2. Add payment method
3. Create an API key
4. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

## Testing the App

### 1. Start the Web App
```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the retro-themed homepage.

### 2. Access the Admin Panel

1. Click the admin link or visit `http://localhost:3000/admin`
2. Sign in with GitHub
3. You should see the admin dashboard

### 3. Add a Test Handle

1. Go to Admin > Handles
2. You should see the seeded example handles
3. Click "Sync Now" on one of them (requires X API)

### 4. Start the Worker (For Full Functionality)

In a new terminal:
```bash
cd worker
npm install
npm run dev
```

The worker will:
- Sync posts from X every 30 seconds
- Generate roasts for new posts
- Log activity to console

### 5. Test the Full Flow

1. **Sync Posts**: Worker fetches posts from enabled handles
2. **Generate Roasts**: Worker creates roasts (requires OpenAI)
3. **Moderate**: Go to Admin > Roasts to approve/reject
4. **View Public**: Approved roasts appear on homepage

## Common Issues

### "Failed to fetch sources"
- Check that the database is running
- Verify DATABASE_URL is correct
- Run `npx prisma db push` to sync schema

### "Unauthorized" in Admin Panel
- Verify your GitHub email matches ADMIN_EMAIL_ALLOWLIST
- Check GitHub OAuth credentials
- Clear browser cookies and try again

### Worker Not Syncing
- Check X_BEARER_TOKEN is set
- Verify handles are enabled in Admin > Handles
- Check worker logs for errors

### Roasts Not Generating
- Check OPENAI_API_KEY is set
- Verify prompt version is active (Admin > Prompts)
- Check worker logs for errors

## Development Tips

### View Database
```bash
npx prisma studio
```

This opens a GUI to browse your database at `http://localhost:5555`.

### Reset Database
```bash
npx prisma migrate reset
```

This will:
- Drop all tables
- Run migrations
- Run seed

### Check Logs
- Web app: Check terminal running `npm run dev`
- Worker: Check terminal running `npm run dev` in worker/
- Database queries: Set `DEBUG=prisma:query` in .env

### Hot Reload
- Web app: Auto-reloads on file changes
- Worker: Use `npm run dev` (uses tsx watch)

## Next Steps

Once you have the app running locally:

1. **Customize the Theme**: Edit `app/globals.css` for colors/fonts
2. **Adjust Prompts**: Go to Admin > Prompts to tweak roast generation
3. **Add More Handles**: Add handles you want to track
4. **Test Moderation**: Generate and approve/reject roasts
5. **Deploy**: Follow `DEPLOYMENT.md` when ready

## Need Help?

- Check the main README.md for architecture details
- Review DEPLOYMENT.md for production setup
- Check the plan file for implementation details
- Look at the code comments for specific functionality

## Minimum Viable Setup

Want to just see the UI without X/OpenAI?

```bash
# 1. Install and setup database only
npm install
npx prisma migrate dev
npx prisma db seed

# 2. Minimal .env
DATABASE_URL="postgresql://localhost:5432/roster"
NEXTAUTH_SECRET="any-random-string"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
ADMIN_EMAIL_ALLOWLIST="your-email@example.com"

# 3. Start app
npm run dev
```

This gives you:
- ✅ Retro theme and UI
- ✅ Admin panel
- ✅ Database management
- ❌ No post syncing (needs X API)
- ❌ No roast generation (needs OpenAI)

You can manually insert test data via Prisma Studio!
