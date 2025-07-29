#!/bin/bash
echo "🚀 Starting Cloudflare Pages build..."

# Install dependencies
npm ci

# Run the build command
npm run build:pages

echo "✅ Build completed. Output directory: out"
ls -la out/ || echo "❌ Output directory not created"