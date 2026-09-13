import fs from 'node:fs';
import path from 'node:path';

export function detectDocker(dirPath: string): boolean {
  return (
    fs.existsSync(path.join(dirPath, 'Dockerfile')) ||
    fs.existsSync(path.join(dirPath, 'docker-compose.yml')) ||
    fs.existsSync(path.join(dirPath, 'docker-compose.yaml')) ||
    fs.existsSync(path.join(dirPath, 'compose.yaml'))
  );
}
