const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define regex patterns for typical secrets
const SECRET_PATTERNS = [
  {
    name: 'Google Gemini API Key',
    regex: /AIzaSy[A-Za-z0-9\-_]{33}/g,
  },
  {
    name: 'Google OAuth Client ID',
    regex: /[0-9]+-[A-Za-z0-9_]{32}\.apps\.googleusercontent\.com/g,
  },
  {
    name: 'Google Client Secret',
    regex: /GOCSPX-[A-Za-z0-9\-_]{28}/g,
  },
  {
    name: 'Anthropic API Key',
    regex: /sk-ant-sid[0-9]{2}-[A-Za-z0-9\-_]{80,95}/g,
  },
  {
    name: 'AWS Access Key ID',
    regex: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: 'Finnhub API Key',
    // Finnhub keys: 40 character alphanumeric strings
    regex: /\b[a-z0-9]{40}\b/gi,
    // Exclude common safe words or hashes that might trigger false positives
    exclude: (match) => {
      // Check if it's a known non-secret like placeholders
      const lowers = match.toLowerCase();
      return lowers.includes('dummy') || lowers.includes('your_');
    }
  }
];

// Specific known compromised values we want to ensure never get recommitted
const KNOWN_COMPROMISED_VALUES = [
  process.env.FINNHUB_API_KEY,
  process.env.GEMINI_API_KEY,
  process.env.JWT_SECRET,
  process.env.JWT_REFRESH_SECRET,
];

// Files matching these patterns are completely blocked
const BLOCKED_FILE_PATTERNS = [
  /\.env$/i,
  /\.env\.(local|development|production|staging|test)$/i,
];

// Helper to mask secrets for safe printing
function maskSecret(secret) {
  if (secret.length <= 8) return '********';
  return secret.slice(0, 4) + '...' + secret.slice(-4);
}

function getStagedFiles() {
  try {
    // Get list of staged files, excluding deleted ones
    const output = execSync('git diff --cached --name-only --diff-filter=d', { encoding: 'utf-8' });
    return output.split('\n').map(f => f.trim()).filter(Boolean);
  } catch (error) {
    // If Git is not in PATH or we aren't in a git repo during execution
    console.warn('\x1b[33mWarning: Git command failed or not found. Cannot determine staged files. Skipping pre-commit scan.\x1b[0m');
    return [];
  }
}

function scan() {
  const stagedFiles = getStagedFiles();
  let hasErrors = false;

  for (const file of stagedFiles) {
    // 1. Check if the file is a blocked env file
    const fileBase = path.basename(file);
    const isBlockedFile = BLOCKED_FILE_PATTERNS.some(regex => regex.test(fileBase));
    if (isBlockedFile && !file.endsWith('.env.example')) {
      console.error(`\x1b[31mError: Blocked environment file staged for commit: ${file}\x1b[0m`);
      console.error(`\x1b[31mNever commit active environment files (.env, .env.local, etc.). Use .env.example templates instead.\x1b[0m`);
      hasErrors = true;
      continue;
    }

    // Skip node_modules, build outputs, or binary files if they somehow got staged
    if (file.includes('node_modules/') || file.includes('.next/') || file.includes('dist/')) {
      continue;
    }

    // 2. Block accidental debug or test routes in Next.js API folder
    const normalizedPath = file.replace(/\\/g, '/');
    if (
      normalizedPath.includes('src/app/api/') &&
      /(test|debug|dev)/i.test(normalizedPath) &&
      !/\.(test|spec)\.(ts|js|tsx|jsx)$/i.test(normalizedPath)
    ) {
      console.error(`\x1b[31mError: Potential public test/debug API route staged: ${file}\x1b[0m`);
      console.error(`\x1b[31mTest and debug endpoints must not be deployed to production. Remove this route or verify its safety.\x1b[0m`);
      hasErrors = true;
      continue;
    }

    // Read file content
    let content;
    try {
      content = fs.readFileSync(file, 'utf-8');
    } catch (err) {
      // Could be binary or unreadable file
      continue;
    }

    const lines = content.split('\n');

    // 2. Scan each line for secrets
    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;

      // Check for known compromised values specifically
      for (const compromised of KNOWN_COMPROMISED_VALUES) {
        if (line.includes(compromised)) {
          console.error(`\x1b[31mError: Compromised credential found in ${file}:${lineNumber}\x1b[0m`);
          console.error(`\x1b[31mValue: "${maskSecret(compromised)}" matches a known revoked/weak secret.\x1b[0m`);
          hasErrors = true;
        }
      }

      // Check regex patterns
      for (const pattern of SECRET_PATTERNS) {
        let match;
        // Reset regex index for safety
        pattern.regex.lastIndex = 0;
        
        while ((match = pattern.regex.exec(line)) !== null) {
          const matchedValue = match[0];
          
          // Apply custom exclusion filters if they exist
          if (pattern.exclude && pattern.exclude(matchedValue)) {
            continue;
          }

          // Also avoid matching placeholders inside .env.example files
          if (file.endsWith('.env.example') && (matchedValue.includes('your_') || matchedValue.includes('dummy') || matchedValue.includes('placeholder'))) {
            continue;
          }

          console.error(`\x1b[31mError: Potential ${pattern.name} found in ${file}:${lineNumber}\x1b[0m`);
          console.error(`\x1b[31mPattern Match: "${maskSecret(matchedValue)}"\x1b[0m`);
          hasErrors = true;
        }
      }
    });
  }

  if (hasErrors) {
    console.error('\n\x1b[31mCommit blocked! Please remove the credentials or unstage the files before committing.\x1b[0m');
    process.exit(1);
  } else {
    if (stagedFiles.length > 0) {
      console.log('\x1b[32m✔ Pre-commit secrets scan completed. No secrets detected.\x1b[0m');
    }
  }
}

scan();
