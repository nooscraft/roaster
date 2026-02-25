#!/bin/bash

echo "🚀 Setting up local database for AI Bubble Roster"
echo ""

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Install PostgreSQL:"
    echo "  macOS: brew install postgresql@16"
    echo "  Ubuntu: sudo apt install postgresql"
    echo ""
    exit 1
fi

echo "Creating database 'roster'..."
createdb roster 2>/dev/null || echo "Database 'roster' already exists"

echo ""
echo "✅ Database created!"
echo ""
echo "Update your .env file with:"
echo "DATABASE_URL=\"postgresql://$(whoami)@localhost:5432/roster\""
echo ""
echo "Then run:"
echo "  npx prisma migrate dev"
echo "  npx prisma db seed"
echo ""
