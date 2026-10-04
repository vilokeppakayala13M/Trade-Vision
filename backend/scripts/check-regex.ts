import * as fs from 'fs';
import * as path from 'path';
const safeRegex = require('safe-regex');

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.ts') && !dirPath.endsWith('.spec.ts')) {
      callback(dirPath);
    }
  });
}

function checkRegexInFiles() {
  let hasUnsafe = false;
  
  walkDir(path.join(__dirname, '../src'), (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple naive extraction of regex literals for demonstration
    // A robust version would use an AST parser like typescript compiler API
    const regexPattern = /\/([^\/]+)\/([gimsuy]*)/g;
    let match;
    while ((match = regexPattern.exec(content)) !== null) {
      // Very basic heuristic to skip comments/urls
      if (match[0].includes('//') || match[0].includes('http')) continue;
      
      try {
        const regexStr = match[1];
        // If safe-regex says it's unsafe, warn
        if (!safeRegex(match[0])) {
          console.warn(`\n[WARNING] Potentially unsafe ReDoS regex found in ${filePath}`);
          console.warn(`Regex: ${match[0]}`);
          hasUnsafe = true;
        }
      } catch (e) {
        // Ignore parse errors from naive extraction
      }
    }
  });

  if (hasUnsafe) {
    console.error('\nSecurity Audit: Found potentially unsafe regular expressions! Please review them to prevent ReDoS.');
    process.exit(1);
  } else {
    console.log('Security Audit: All regular expressions passed ReDoS checks.');
  }
}

checkRegexInFiles();
