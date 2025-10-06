#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cp "$ROOT/src/locks/landing/page.lock.tsx"        "$ROOT/src/app/page.tsx"
cp "$ROOT/src/locks/landing/Doodle.lock.tsx"      "$ROOT/src/ui/Doodle.tsx"
cp "$ROOT/src/locks/landing/FeatureCard.lock.tsx" "$ROOT/src/ui/FeatureCard.tsx"
cp "$ROOT/src/locks/landing/Brand.lock.tsx"       "$ROOT/src/ui/Brand.tsx"

echo "✅ Landing restored from src/locks/landing/"
echo "   Now run:  npm run dev"
