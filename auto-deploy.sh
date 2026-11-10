#!/usr/bin/env bash
# ==============================================================================
# Auto Deploy Script for Delitrade
# Builds production assets, commits changes, pushes to main, and publishes to gh-pages.
# ==============================================================================

set -e

echo "🚀 Starting automated build and deploy..."

# Ensure Node is in PATH if locally installed
if [ -d "$HOME/.local/node/bin" ]; then
  export PATH="$HOME/.local/node/bin:$PATH"
fi

# 1. Build the production site with 404 fallback
echo "🔨 Building production assets..."
npm run build

# 2. Stage and commit changes if any exist
if [[ -n $(git status -s) ]]; then
  echo "📦 Committing updated changes..."
  git add -A
  MSG="${1:-auto deploy: update website changes and production bundle}"
  git commit -m "$MSG"
fi

# 3. Push source code to GitHub main branch
echo "⬆️ Pushing changes to GitHub main branch..."
git push origin main

# 4. Deploy production bundle to gh-pages branch
echo "🌐 Publishing to GitHub Pages (gh-pages branch)..."
npm run deploy

echo ""
echo "✅ Auto-deploy completed successfully!"
echo "🔗 Storefront: https://arshadrahiman.github.io/deligo_trade/"
echo "🔐 Admin:      https://arshadrahiman.github.io/deligo_trade/#admin"

