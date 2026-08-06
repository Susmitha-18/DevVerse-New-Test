import fs from 'node:fs';
import path from 'node:path';

export interface DirectoryScanResult {
  name: string;
  path: string;
  type: string;          // e.g. 'react' | 'next' | 'node' | 'vue' | 'angular' | 'express' | 'spring' | 'python' | 'go' | 'electron' | 'unknown'
  language: string;      // e.g. 'TypeScript' | 'JavaScript' | 'Java' | 'Python' | 'Go' | 'Rust'
  framework?: string;    // e.g. 'React', 'Next.js', 'Vue', 'Spring Boot', 'Express', 'Electron'
  description?: string;
  tags?: string[];
  hasGit: boolean;
  gitBranch?: string;
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

export function scanLocalDirectory(dirPath: string): DirectoryScanResult {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }

  const folderName = path.basename(dirPath);

  let type = 'unknown';
  let language = 'Unknown';
  let framework: string | undefined = undefined;
  let description: string | undefined = undefined;
  let dependenciesCount = 0;
  const tagsSet = new Set<string>();

  const pkgJsonPath = path.join(dirPath, 'package.json');
  const goModPath = path.join(dirPath, 'go.mod');
  const pyProjectPath = path.join(dirPath, 'pyproject.toml');
  const cargoPath = path.join(dirPath, 'Cargo.toml');
  const pomPath = path.join(dirPath, 'pom.xml');
  const gradlePath = path.join(dirPath, 'build.gradle');

  // 1. Detect Package & Language & Framework
  const hasPackageJson = fs.existsSync(pkgJsonPath);

  if (hasPackageJson) {
    try {
      const content = fs.readFileSync(pkgJsonPath, 'utf8');
      const pkg = JSON.parse(content) as {
        description?: string;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      if (pkg.description) {
        description = pkg.description;
      }

      const deps = pkg.dependencies || {};
      const devDeps = pkg.devDependencies || {};
      const allDeps = { ...deps, ...devDeps };
      dependenciesCount = Object.keys(allDeps).length;

      if (allDeps['electron']) {
        type = 'electron';
        framework = 'Electron';
        tagsSet.add('Desktop');
      } else if (allDeps['next']) {
        type = 'next';
        framework = 'Next.js';
        tagsSet.add('SSR');
      } else if (allDeps['@angular/core']) {
        type = 'angular';
        framework = 'Angular';
        tagsSet.add('Frontend');
      } else if (allDeps['vue']) {
        type = 'vue';
        framework = 'Vue';
        tagsSet.add('Frontend');
      } else if (allDeps['react']) {
        type = 'react';
        framework = 'React';
        tagsSet.add('Frontend');
      } else if (allDeps['express']) {
        type = 'express';
        framework = 'Express';
        tagsSet.add('Backend');
      } else {
        type = 'node';
        framework = 'Node.js';
        tagsSet.add('Backend');
      }

      const hasTsConfig = fs.existsSync(path.join(dirPath, 'tsconfig.json'));
      if (allDeps['typescript'] || hasTsConfig) {
        language = 'TypeScript';
        tagsSet.add('TypeScript');
      } else {
        language = 'JavaScript';
        tagsSet.add('JavaScript');
      }
    } catch {
      type = 'node';
      language = 'JavaScript';
      framework = 'Node.js';
    }
  } else if (fs.existsSync(pomPath) || fs.existsSync(gradlePath)) {
    type = 'spring';
    language = 'Java';
    framework = 'Spring Boot';
    tagsSet.add('Backend');
    tagsSet.add('Java');
  } else if (fs.existsSync(goModPath)) {
    type = 'go';
    language = 'Go';
    framework = 'Go Standard Module';
    tagsSet.add('Backend');
    tagsSet.add('Go');
  } else if (fs.existsSync(pyProjectPath) || fs.existsSync(path.join(dirPath, 'requirements.txt'))) {
    type = 'python';
    language = 'Python';
    framework = 'Python Project';
    tagsSet.add('Backend');
    tagsSet.add('Python');
  } else if (fs.existsSync(cargoPath)) {
    type = 'rust';
    language = 'Rust';
    framework = 'Cargo Crate';
    tagsSet.add('Systems');
    tagsSet.add('Rust');
  }

  // 2. Detect Git
  const gitDir = path.join(dirPath, '.git');
  const hasGit = fs.existsSync(gitDir);
  let gitBranch: string | undefined = undefined;

  if (hasGit) {
    tagsSet.add('Git');
    try {
      const headPath = path.join(gitDir, 'HEAD');
      if (fs.existsSync(headPath)) {
        const headContent = fs.readFileSync(headPath, 'utf8').trim();
        if (headContent.startsWith('ref: refs/heads/')) {
          gitBranch = headContent.replace('ref: refs/heads/', '');
        }
      }
    } catch {
      gitBranch = 'main';
    }
  }

  // 3. Detect Docker
  const hasDocker =
    fs.existsSync(path.join(dirPath, 'Dockerfile')) ||
    fs.existsSync(path.join(dirPath, 'docker-compose.yml')) ||
    fs.existsSync(path.join(dirPath, 'docker-compose.yaml'));
  if (hasDocker) tagsSet.add('Docker');

  // 4. Detect Env
  const hasEnv =
    fs.existsSync(path.join(dirPath, '.env')) ||
    fs.existsSync(path.join(dirPath, '.env.example')) ||
    fs.existsSync(path.join(dirPath, '.env.local'));
  if (hasEnv) tagsSet.add('Env');

  // 5. Detect CI/CD
  const hasCiCd =
    fs.existsSync(path.join(dirPath, '.github', 'workflows')) ||
    fs.existsSync(path.join(dirPath, '.gitlab-ci.yml')) ||
    fs.existsSync(path.join(dirPath, 'azure-pipelines.yml')) ||
    fs.existsSync(path.join(dirPath, 'bitbucket-pipelines.yml'));
  if (hasCiCd) tagsSet.add('CI/CD');

  // 6. Detect Readme
  const hasReadme =
    fs.existsSync(path.join(dirPath, 'README.md')) ||
    fs.existsSync(path.join(dirPath, 'readme.md')) ||
    fs.existsSync(path.join(dirPath, 'README.txt'));

  // 7. Detect Build File
  const hasBuildFile =
    fs.existsSync(path.join(dirPath, 'vite.config.ts')) ||
    fs.existsSync(path.join(dirPath, 'vite.config.js')) ||
    fs.existsSync(path.join(dirPath, 'tsconfig.json')) ||
    fs.existsSync(path.join(dirPath, 'webpack.config.js')) ||
    fs.existsSync(path.join(dirPath, 'Makefile')) ||
    fs.existsSync(path.join(dirPath, 'pom.xml'));

  // 8. Calculate Folder Quick Stats (First level count + size)
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
          // ignore stat errors
        }
      }
    }
  } catch {
    totalFiles = 0;
  }

  // 9. Compute Workspace Health
  // Healthy: Has package manager file OR build file AND git OR docker
  // Warning: Missing git or readme or env
  // Error: No package/build file found AND no recognized source language
  let healthStatus: 'healthy' | 'warning' | 'error' = 'healthy';

  if (!hasPackageJson && !hasBuildFile && language === 'Unknown') {
    healthStatus = 'error';
  } else if (!hasGit || !hasReadme || !hasEnv) {
    healthStatus = 'warning';
  }

  return {
    name: folderName,
    path: dirPath,
    type,
    language,
    framework,
    description,
    tags: Array.from(tagsSet),
    hasGit,
    gitBranch,
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
