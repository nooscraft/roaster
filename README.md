# AI Bubble Roster

A satirical web app that roasts AI corporate hype and buzzword theater with a retro 90s aesthetic.

## Features

- 🎯 **X API Integration**: Automatically tracks curated X handles and ingests posts
- 🤖 **LLM-Powered Roasts**: Generates satirical commentary on AI hype using OpenAI
- 🔒 **Safety Guardrails**: Content moderation and safety filters to prevent personal attacks
- 👮 **Admin Moderation**: Manual approval workflow for all generated roasts
- 📊 **Bubble Scoring**: Algorithmic scoring of AI hype based on buzzwords and patterns
- 🏆 **Weekly Leaderboard**: Awards for the most notable achievements in hype
- 🎨 **90s Retro Theme**: Nostalgic web design with pixel fonts and neon colors
- 📝 **Report System**: Community reporting for inappropriate content
- 🚫 **Opt-Out Management**: Easy opt-out for handles that don't want to be tracked

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Upstash QStash
- **Worker**: Node.js background worker
- **LLM**: OpenAI API (gpt-4o-mini)
- **Auth**: NextAuth.js with GitHub OAuth
- **Deployment**: Vercel (web), Fly.io (worker), Neon (database)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- X API Bearer Token
- OpenAI API Key
- GitHub OAuth App credentials

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd roster
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `DATABASE_URL`: PostgreSQL connection string
- `X_BEARER_TOKEN`: X API v2 bearer token
- `OPENAI_API_KEY`: OpenAI API key
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `ADMIN_EMAIL_ALLOWLIST`: Comma-separated list of admin emails

4. Run database migrations:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Running the Worker

The worker process handles post ingestion and roast generation:

```bash
cd worker
npm install
npm run dev
```

## Deployment

### Web App (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy:
```bash
vercel --prod
```

### Worker (Fly.io)

1. Install Fly CLI and authenticate:
```bash
fly auth login
```

2. Create a new Fly app:
```bash
fly launch
```

3. Set secrets:
```bash
fly secrets set DATABASE_URL="..." OPENAI_API_KEY="..." X_BEARER_TOKEN="..."
```

4. Deploy:
```bash
fly deploy
```

### Database (Neon)

1. Create a Neon project at https://neon.tech
2. Copy the connection string
3. Run migrations:
```bash
DATABASE_URL="..." npx prisma migrate deploy
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── leaderboard/       # Leaderboard page
│   ├── roast/[id]/        # Roast detail page
│   └── submit/            # Submit handle page
├── components/            # React components
│   └── retro/            # Retro-themed components
├── lib/                   # Shared libraries
│   ├── llm/              # LLM provider
│   ├── roast/            # Roast generation logic
│   ├── x-api/            # X API client
│   └── monitoring/       # Cost tracking
├── prisma/               # Database schema and migrations
├── worker/               # Background worker
│   └── jobs/            # Worker jobs
└── types/                # TypeScript types
```

## Admin Panel

Access the admin panel at `/admin` (requires GitHub OAuth with allowlisted email).

Features:
- **Dashboard**: System status and quick actions
- **Handles**: Manage tracked X handles
- **Roasts**: Review and approve/reject generated roasts
- **Reports**: Review user-submitted reports
- **Prompts**: Manage LLM prompt versions
- **Opt-outs**: Manage opt-out requests

## Content Guidelines

This project roasts **corporate hype and buzzword theater**, not individuals:

✅ **Good targets**:
- Marketing language and patterns
- Buzzwords and jargon
- Unsubstantiated claims
- Vaporware announcements

❌ **Off limits**:
- Personal attacks
- Harassment
- Defamation
- Slurs or hate speech

## Contributing

Contributions are welcome! Please:
1. Follow the Rust-style guidelines in `.cursor/rules/`
2. Test your changes locally
3. Submit a pull request with a clear description

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by the 90s web aesthetic
- Built with modern web technologies
- Powered by OpenAI and X API
