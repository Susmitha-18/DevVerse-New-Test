import fs from 'node:fs';
import path from 'node:path';

import { detectLanguages } from './detectors/language.detector';
import { detectFramework } from './detectors/framework.detector';
import { detectProjectType } from './detectors/projectType.detector';
import { detectGit } from './detectors/git.detector';
import { detectDocker } from './detectors/docker.detector';
import { detectCiCd } from './detectors/cicd.detector';

export interface DirectoryScanResult {
  name: string;
  path: string;
  type: string;
  language: string;
  languageBreakdown?: string;
  framework?: string;
  projectType?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  description?: string;
  tags?: string[];
  hasGit: boolean;
  gitBranch?: string;
  hasRemote?: boolean;
  remoteUrl?: string;
  isGitHub?: boolean;
  hasDocker: boolean;
  hasEnv: boolean;
  hasCiCd: boolean;
  hasReadme: boolean;
  hasPackageJson: boolean;
  hasBuildFile: boolean;
  healthStatus: 'healthy' | 'warning' | 'error';
  projectSizeBytes?: number;
  totalFiles?: number;
  dependenciesCount?: number;
}

/**
 * Scan a single project directory using modular detectors
 */
export function scanLocalDirectory(dirPath: string): DirectoryScanResult {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }

  const folderName = path.basename(dirPath);
  const tagsSet = new Set<string>();

  // 1. Language Detection
  const langResult = detectLanguages(dirPath);
  const language = langResult.primaryLanguage;
  const languageBreakdown = langResult.languageBreakdown;

  if (language !== 'Unknown') {
    tagsSet.add(language);
  }

  // 2. Framework Detection
  const fwResult = detectFramework(dirPath);
  const framework = fwResult.framework;
  const type = fwResult.typeCategory;
  const dependenciesCount = fwResult.dependenciesCount;
  const confidence = fwResult.confidence !== 'Low' ? fwResult.confidence : langResult.confidence;

  if (framework !== 'Unknown') {
    tagsSet.add(framework);
  }

  // 3. Project Type Classification
  const projectType = detectProjectType(dirPath, language, framework);

  // 4. Git Detection & Remote GitHub Detection
  const { hasGit, gitBranch, hasRemote, remoteUrl, isGitHub } = detectGit(dirPath);
  if (hasGit) tagsSet.add('Git');
  if (isGitHub) tagsSet.add('GitHub');

  // 5. Docker Detection
  const hasDocker = detectDocker(dirPath);
  if (hasDocker) tagsSet.add('Docker');

  // 6. CI/CD Detection
  const hasCiCd = detectCiCd(dirPath);
  if (hasCiCd) tagsSet.add('CI/CD');

  // 7. Env & Readme & Build Config Detection
  const hasEnv =
    fs.existsSync(path.join(dirPath, '.env')) ||
    fs.existsSync(path.join(dirPath, '.env.example')) ||
    fs.existsSync(path.join(dirPath, '.env.local'));
  if (hasEnv) tagsSet.add('Env');

  const hasReadme =
    fs.existsSync(path.join(dirPath, 'README.md')) ||
    fs.existsSync(path.join(dirPath, 'readme.md')) ||
    fs.existsSync(path.join(dirPath, 'README.txt'));

  const pkgJsonPath = path.join(dirPath, 'package.json');
  const hasPackageJson = fs.existsSync(pkgJsonPath);

  const hasBuildFile =
    hasPackageJson ||
    fs.existsSync(path.join(dirPath, 'vite.config.ts')) ||
    fs.existsSync(path.join(dirPath, 'vite.config.js')) ||
    fs.existsSync(path.join(dirPath, 'tsconfig.json')) ||
    fs.existsSync(path.join(dirPath, 'webpack.config.js')) ||
    fs.existsSync(path.join(dirPath, 'Makefile')) ||
    fs.existsSync(path.join(dirPath, 'pom.xml')) ||
    fs.existsSync(path.join(dirPath, 'Cargo.toml')) ||
    fs.existsSync(path.join(dirPath, 'go.mod'));

  let description: string | undefined = undefined;
  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) as { description?: string };
      if (pkg.description) description = pkg.description;
    } catch {
      // ignore
    }
  }

  // 8. Size & File Stats
  let projectSizeBytes = 0;
  let totalFiles = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist') {
        continue;
      }
      totalFiles++;
      if (entry.isFile()) {
        try {
          const stats = fs.statSync(path.join(dirPath, entry.name));
          projectSizeBytes += stats.size;
        } catch {
          // ignore
        }
      }
    }
  } catch {
    totalFiles = 0;
  }

  // 9. Compute Health Status
  let healthStatus: 'healthy' | 'warning' | 'error' = 'healthy';
  if (!hasPackageJson && !hasBuildFile && language === 'Unknown') {
    healthStatus = 'warning'; // Never error out completely; mark importable warning
  } else if (!hasGit || !hasReadme || !hasEnv) {
    healthStatus = 'warning';
  }

  return {
    name: folderName,
    path: dirPath,
    type,
    language,
    languageBreakdown,
    framework,
    projectType,
    confidence,
    description,
    tags: Array.from(tagsSet),
    hasGit,
    gitBranch,
    hasRemote,
    remoteUrl,
    isGitHub,
    hasDocker,
    hasEnv,
    hasCiCd,
    hasReadme,
    hasPackageJson,
    hasBuildFile,
    healthStatus,
    projectSizeBytes,
    totalFiles,
    dependenciesCount,
  };
}

/**
 * Check if a directory path looks like a project root (has manifest, git, or source files)
 */
function isProjectFolder(dirPath: string): boolean {
  try {
    const markers = [
      'package.json',
      'composer.json',
      'artisan',
      'pom.xml',
      'build.gradle',
      'build.gradle.kts',
      'requirements.txt',
      'pyproject.toml',
      'Cargo.toml',
      'go.mod',
      'pubspec.yaml',
      'Gemfile',
      'CMakeLists.txt',
      'Makefile',
      '.git',
      'index.html',
    ];
    for (const marker of markers) {
      if (fs.existsSync(path.join(dirPath, marker))) return true;
    }
    const entries = fs.readdirSync(dirPath);
    return entries.some((e) => e.endsWith('.csproj') || e.endsWith('.sln'));
  } catch {
    return false;
  }
}

/**
 * Recursively scan a parent directory for child project folders
 * Gracefully handles permission errors and inaccessible directories.
 */
export function scanParentDirectory(parentPath: string): DirectoryScanResult[] {
  if (!fs.existsSync(parentPath)) {
    return [];
  }

  const results: DirectoryScanResult[] = [];

  try {
    const entries = fs.readdirSync(parentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'vendor') {
        continue;
      }

      const fullPath = path.join(parentPath, entry.name);
      try {
        if (isProjectFolder(fullPath)) {
          const scan = scanLocalDirectory(fullPath);
          results.push(scan);
        }
      } catch {
        // Handle individual folder permission errors gracefully
      }
    }
  } catch {
    // Handle parent directory permission errors gracefully
  }

  return results;
}
