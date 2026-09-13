import fs from 'node:fs';
import path from 'node:path';

export interface LanguageDetectionResult {
  primaryLanguage: string;
  languageBreakdown: string;
  confidence: 'High' | 'Medium' | 'Low';
  stats: Record<string, number>;
}

const EXTENSION_MAP: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.py': 'Python',
  '.pyw': 'Python',
  '.java': 'Java',
  '.php': 'PHP',
  '.c': 'C',
  '.h': 'C',
  '.cpp': 'C++',
  '.hpp': 'C++',
  '.cc': 'C++',
  '.cxx': 'C++',
  '.cs': 'C#',
  '.go': 'Go',
  '.rs': 'Rust',
  '.rb': 'Ruby',
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  '.swift': 'Swift',
  '.dart': 'Dart',
  '.html': 'HTML',
  '.htm': 'HTML',
  '.css': 'CSS',
  '.scss': 'CSS',
  '.sass': 'CSS',
  '.less': 'CSS',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.ps1': 'PowerShell',
};

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'target',
  'vendor',
  'venv',
  '.venv',
  '__pycache__',
  '.idea',
  '.vscode',
  'bin',
  'obj',
  '.gradle',
]);

export function detectLanguages(dirPath: string): LanguageDetectionResult {
  const extCounts: Record<string, number> = {};
  let totalFiles = 0;

  function scanDir(currentDir: string, depth = 0) {
    if (depth > 4) return; // limit depth for performance
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
            scanDir(path.join(currentDir, entry.name), depth + 1);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          const lang = EXTENSION_MAP[ext];
          if (lang) {
            extCounts[lang] = (extCounts[lang] || 0) + 1;
            totalFiles++;
          }
        }
      }
    } catch {
      // Catch permission or read errors gracefully
    }
  }

  scanDir(dirPath);

  if (totalFiles === 0) {
    return {
      primaryLanguage: 'Unknown',
      languageBreakdown: 'None detected',
      confidence: 'Low',
      stats: {},
    };
  }

  // Calculate percentages
  const sorted = Object.entries(extCounts).sort((a, b) => b[1] - a[1]);
  const parts: string[] = [];
  const primary = sorted[0]?.[0] || 'Unknown';

  for (const [lang, count] of sorted) {
    const pct = Math.round((count / totalFiles) * 100);
    if (pct > 0) {
      parts.push(`${lang} ${pct}%`);
    }
  }

  const breakdownString = parts.join(', ');

  return {
    primaryLanguage: primary,
    languageBreakdown: breakdownString || `${primary} 100%`,
    confidence: totalFiles > 3 ? 'High' : 'Medium',
    stats: extCounts,
  };
}
