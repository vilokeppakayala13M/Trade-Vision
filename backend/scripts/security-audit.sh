#!/bin/bash
echo "Starting Security Audit..."

# 1. Run NPM Audit
echo "Running npm audit..."
npm audit --production

# 2. Check for insecure regexes
echo "Checking for unsafe regex patterns (ReDoS)..."
npx ts-node scripts/check-regex.ts
if [ $? -ne 0 ]; then
  echo "Regex check failed. Aborting."
  exit 1
fi

# 3. Linting
echo "Running security linter (if configured)..."
npm run lint

echo "Security Audit completed successfully."
