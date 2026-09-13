import fs from 'node:fs';
import path from 'node:path';

export function detectCiCd(dirPath: string): boolean {
  return (
    fs.existsSync(path.join(dirPath, '.github', 'workflows')) ||
    fs.existsSync(path.join(dirPath, '.gitlab-ci.yml')) ||
    fs.existsSync(path.join(dirPath, 'Jenkinsfile')) ||
    fs.existsSync(path.join(dirPath, 'azure-pipelines.yml')) ||
    fs.existsSync(path.join(dirPath, 'bitbucket-pipelines.yml'))
  );
}
