import fs from 'node:fs';
import path from 'node:path';

export interface FrameworkDetectionResult {
  framework: string;
  typeCategory: string; // e.g. 'react' | 'express' | 'laravel' | 'spring' | 'django' | etc.
  confidence: 'High' | 'Medium' | 'Low';
  dependenciesCount: number;
}

export function detectFramework(dirPath: string): FrameworkDetectionResult {
  const pkgJsonPath = path.join(dirPath, 'package.json');
  const composerPath = path.join(dirPath, 'composer.json');
  const pyprojectPath = path.join(dirPath, 'pyproject.toml');
  const reqsPath = path.join(dirPath, 'requirements.txt');
  const pomPath = path.join(dirPath, 'pom.xml');
  const gradlePath = path.join(dirPath, 'build.gradle');
  const gradleKtsPath = path.join(dirPath, 'build.gradle.kts');
  const goModPath = path.join(dirPath, 'go.mod');
  const cargoPath = path.join(dirPath, 'Cargo.toml');
  const pubspecPath = path.join(dirPath, 'pubspec.yaml');
  const gemfilePath = path.join(dirPath, 'Gemfile');
  const cmakePath = path.join(dirPath, 'CMakeLists.txt');
  const makefilePath = path.join(dirPath, 'Makefile');

  // 1. Node.js / JavaScript / TypeScript Ecosystem
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const content = fs.readFileSync(pkgJsonPath, 'utf8');
      const pkg = JSON.parse(content) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const depsCount = Object.keys(allDeps).length;

      if (allDeps['electron']) {
        return { framework: 'Electron', typeCategory: 'electron', confidence: 'High', dependenciesCount: depsCount };
      }
      if (allDeps['next']) {
        return { framework: 'Next.js', typeCategory: 'next', confidence: 'High', dependenciesCount: depsCount };
      }
      if (allDeps['@nestjs/core']) {
        return { framework: 'NestJS', typeCategory: 'express', confidence: 'High', dependenciesCount: depsCount };
      }
      if (allDeps['@angular/core']) {
        return { framework: 'Angular', typeCategory: 'angular', confidence: 'High', dependenciesCount: depsCount };
      }
      if (allDeps['vue']) {
        return { framework: 'Vue', typeCategory: 'vue', confidence: 'High', dependenciesCount: depsCount };
      }
      if (allDeps['react']) {
        return { framework: 'React', typeCategory: 'react', confidence: 'High', dependenciesCount: depsCount };
      }
      if (allDeps['express']) {
        return { framework: 'Express', typeCategory: 'express', confidence: 'High', dependenciesCount: depsCount };
      }
      return { framework: 'Node.js', typeCategory: 'node', confidence: 'High', dependenciesCount: depsCount };
    } catch {
      return { framework: 'Node.js', typeCategory: 'node', confidence: 'Medium', dependenciesCount: 0 };
    }
  }

  // 2. PHP Ecosystem (Laravel, Symfony, WordPress)
  if (fs.existsSync(composerPath) || fs.existsSync(path.join(dirPath, 'artisan'))) {
    let framework = 'PHP Project';
    if (fs.existsSync(path.join(dirPath, 'artisan'))) {
      framework = 'Laravel';
    } else if (fs.existsSync(composerPath)) {
      try {
        const composerStr = fs.readFileSync(composerPath, 'utf8');
        if (composerStr.includes('laravel/framework')) framework = 'Laravel';
        else if (composerStr.includes('symfony/')) framework = 'Symfony';
      } catch {
        // ignore
      }
    }
    return { framework, typeCategory: 'php', confidence: 'High', dependenciesCount: 0 };
  }

  if (fs.existsSync(path.join(dirPath, 'wp-config.php'))) {
    return { framework: 'WordPress', typeCategory: 'php', confidence: 'High', dependenciesCount: 0 };
  }

  // 3. Python Ecosystem (Django, Flask, FastAPI)
  if (fs.existsSync(pyprojectPath) || fs.existsSync(reqsPath) || fs.existsSync(path.join(dirPath, 'manage.py'))) {
    let framework = 'Python Project';
    if (fs.existsSync(path.join(dirPath, 'manage.py'))) {
      framework = 'Django';
    } else if (fs.existsSync(reqsPath)) {
      try {
        const reqs = fs.readFileSync(reqsPath, 'utf8');
        if (reqs.includes('django')) framework = 'Django';
        else if (reqs.includes('fastapi')) framework = 'FastAPI';
        else if (reqs.includes('flask')) framework = 'Flask';
      } catch {
        // ignore
      }
    }
    return { framework, typeCategory: 'python', confidence: 'High', dependenciesCount: 0 };
  }

  // 4. Java Ecosystem (Spring Boot, Maven, Gradle)
  if (fs.existsSync(pomPath) || fs.existsSync(gradlePath) || fs.existsSync(gradleKtsPath)) {
    let framework = 'Java Project';
    try {
      const pomStr = fs.existsSync(pomPath) ? fs.readFileSync(pomPath, 'utf8') : '';
      const gradleStr = fs.existsSync(gradlePath) ? fs.readFileSync(gradlePath, 'utf8') : '';
      if (pomStr.includes('spring') || gradleStr.includes('spring')) {
        framework = 'Spring Boot';
      }
    } catch {
      // ignore
    }
    return { framework, typeCategory: 'spring', confidence: 'High', dependenciesCount: 0 };
  }

  // 5. C# / .NET Ecosystem
  try {
    const entries = fs.readdirSync(dirPath);
    const csProj = entries.find((e) => e.endsWith('.csproj') || e.endsWith('.sln'));
    if (csProj) {
      return { framework: '.NET / ASP.NET', typeCategory: 'csharp', confidence: 'High', dependenciesCount: 0 };
    }
  } catch {
    // ignore
  }

  // 6. Flutter / Dart
  if (fs.existsSync(pubspecPath)) {
    return { framework: 'Flutter', typeCategory: 'flutter', confidence: 'High', dependenciesCount: 0 };
  }

  // 7. Ruby / Rails
  if (fs.existsSync(gemfilePath)) {
    let framework = 'Ruby Project';
    try {
      const gemStr = fs.readFileSync(gemfilePath, 'utf8');
      if (gemStr.includes('rails')) framework = 'Ruby on Rails';
    } catch {
      // ignore
    }
    return { framework, typeCategory: 'ruby', confidence: 'High', dependenciesCount: 0 };
  }

  // 8. Go Module
  if (fs.existsSync(goModPath)) {
    return { framework: 'Go Standard Module', typeCategory: 'go', confidence: 'High', dependenciesCount: 0 };
  }

  // 9. Rust Cargo
  if (fs.existsSync(cargoPath)) {
    return { framework: 'Cargo Crate', typeCategory: 'rust', confidence: 'High', dependenciesCount: 0 };
  }

  // 10. C / C++ CMake / Makefile
  if (fs.existsSync(cmakePath)) {
    return { framework: 'CMake', typeCategory: 'cpp', confidence: 'High', dependenciesCount: 0 };
  }
  if (fs.existsSync(makefilePath)) {
    return { framework: 'Makefile Project', typeCategory: 'cpp', confidence: 'Medium', dependenciesCount: 0 };
  }

  // Fallback / Unknown
  return { framework: 'Unknown', typeCategory: 'unknown', confidence: 'Low', dependenciesCount: 0 };
}
