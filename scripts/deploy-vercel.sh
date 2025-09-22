#!/bin/bash

# Vercel Deployment Script
echo "🚀 Deploying to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if this is first time deployment
if [ ! -f ".vercel/project.json" ]; then
    echo "🔧 First time deployment - setting up project..."
    vercel --confirm
else
    echo "📦 Deploying existing project..."
    vercel --prod
fi

echo "✅ Deployment complete!"
echo "🔗 Your app should be available at the URL shown above"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Set up PostgreSQL database (Vercel Postgres, Supabase, or PlanetScale)"
echo "2. Add environment variables in Vercel dashboard:"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - NEXTAUTH_URL (your vercel app URL)"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - Google Sheets API credentials"
echo "3. Run database migration if using PostgreSQL"
echo "4. Test user management and data sync functionality"