import fs from 'node:fs';
import path from 'node:path';

export function detectProjectType(
  dirPath: string,
  primaryLang: string,
  framework: string,
): string {
  const fwLower = framework.toLowerCase();
  const langLower = primaryLang.toLowerCase();

  if (fs.existsSync(path.join(dirPath, 'lerna.json')) || fs.existsSync(path.join(dirPath, 'pnpm-workspace.yaml'))) {
    return 'Monorepo';
  }
  if (fwLower.includes('electron') || fwLower.includes('tauri')) {
    return 'Desktop application';
  }
  if (fwLower.includes('flutter') || fs.existsSync(path.join(dirPath, 'pubspec.yaml'))) {
    return 'Mobile application';
  }
  if (fwLower.includes('next') || fwLower.includes('laravel') || fwLower.includes('rails')) {
    return 'Full-stack application';
  }
  if (fwLower.includes('express') || fwLower.includes('nestjs') || fwLower.includes('fastapi') || fwLower.includes('django') || fwLower.includes('spring')) {
    return 'Backend/API';
  }
  if (fwLower.includes('react') || fwLower.includes('vue') || fwLower.includes('angular') || langLower.includes('html')) {
    return 'Web Application';
  }
  if (fs.existsSync(path.join(dirPath, 'index.html'))) {
    return 'Static website';
  }
  if (langLower.includes('go') || langLower.includes('rust') || langLower.includes('c')) {
    return 'CLI / Systems application';
  }
  if (primaryLang !== 'Unknown') {
    return 'Web Application';
  }
  return 'Unknown project';
}
