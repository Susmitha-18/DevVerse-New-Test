/**
 * Modular Project Detector Test Suite
 * Tests detection against sample project fixtures for PHP, Laravel, React, Node, Python, Django, Java/Spring, C#, C++, Go, Rust, Flutter, and unknown projects.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { scanLocalDirectory } from '../../electron/main/services/scanner.service';

describe('Modular Project Detector Engine', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devverse-test-'));
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it('1. PHP project → PHP, Web Application', () => {
    fs.writeFileSync(path.join(tempDir, 'index.php'), '<?php echo "Hello World"; ?>');
    fs.writeFileSync(path.join(tempDir, 'header.php'), '<?php ?>');
    fs.writeFileSync(path.join(tempDir, 'style.css'), 'body { color: red; }');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('PHP');
    expect(scan.framework).toBe('Unknown');
    expect(scan.projectType).toBe('Web Application');
    expect(scan.languageBreakdown).toContain('PHP');
    expect(scan.healthStatus).toBe('warning'); // missing git/env
  });

  it('2. Laravel project → PHP + Laravel', () => {
    fs.writeFileSync(path.join(tempDir, 'artisan'), '#!/usr/bin/env php');
    fs.writeFileSync(path.join(tempDir, 'composer.json'), JSON.stringify({ require: { 'laravel/framework': '^10.0' } }));
    fs.writeFileSync(path.join(tempDir, 'app.php'), '<?php ?>');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('PHP');
    expect(scan.framework).toBe('Laravel');
    expect(scan.projectType).toBe('Full-stack application');
    expect(scan.confidence).toBe('High');
  });

  it('3. React project → JavaScript/TypeScript + React', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({ dependencies: { react: '^18.0.0', typescript: '^5.0.0' } }));
    fs.writeFileSync(path.join(tempDir, 'App.tsx'), 'export const App = () => <div>Hello</div>;');
    fs.writeFileSync(path.join(tempDir, 'styles.css'), 'h1 { margin: 0; }');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('TypeScript');
    expect(scan.framework).toBe('React');
    expect(scan.projectType).toBe('Web Application');
    expect(scan.confidence).toBe('High');
  });

  it('4. Node.js project → JavaScript/Node.js', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'my-node-app' }));
    fs.writeFileSync(path.join(tempDir, 'index.js'), 'console.log("Hello Node");');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('JavaScript');
    expect(scan.framework).toBe('Node.js');
    expect(scan.confidence).toBe('High');
  });

  it('5. Python Django project → Python + Django', () => {
    fs.writeFileSync(path.join(tempDir, 'manage.py'), '#!/usr/bin/env python');
    fs.writeFileSync(path.join(tempDir, 'views.py'), 'def index(request): pass');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('Python');
    expect(scan.framework).toBe('Django');
    expect(scan.projectType).toBe('Backend/API');
  });

  it('6. Java Spring Boot project → Java + Spring Boot', () => {
    fs.writeFileSync(path.join(tempDir, 'pom.xml'), '<project><dependencies><dependency><groupId>org.springframework.boot</groupId></dependency></dependencies></project>');
    fs.writeFileSync(path.join(tempDir, 'Application.java'), 'public class Application {}');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('Java');
    expect(scan.framework).toBe('Spring Boot');
    expect(scan.projectType).toBe('Backend/API');
  });

  it('7. C# .NET project → C# + .NET', () => {
    fs.writeFileSync(path.join(tempDir, 'App.csproj'), '<Project Sdk="Microsoft.NET.Sdk"></Project>');
    fs.writeFileSync(path.join(tempDir, 'Program.cs'), 'Console.WriteLine("Hello");');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('C#');
    expect(scan.framework).toBe('.NET / ASP.NET');
  });

  it('8. C++ CMake project → C/C++ + CMake', () => {
    fs.writeFileSync(path.join(tempDir, 'CMakeLists.txt'), 'cmake_minimum_required(VERSION 3.10)');
    fs.writeFileSync(path.join(tempDir, 'main.cpp'), '#include <iostream>');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('C++');
    expect(scan.framework).toBe('CMake');
    expect(scan.projectType).toBe('CLI / Systems application');
  });

  it('9. Go project → Go + Go Standard Module', () => {
    fs.writeFileSync(path.join(tempDir, 'go.mod'), 'module example.com/app');
    fs.writeFileSync(path.join(tempDir, 'main.go'), 'package main');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('Go');
    expect(scan.framework).toBe('Go Standard Module');
  });

  it('10. Rust Cargo project → Rust + Cargo Crate', () => {
    fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '[package]\nname = "app"');
    fs.writeFileSync(path.join(tempDir, 'main.rs'), 'fn main() {}');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('Rust');
    expect(scan.framework).toBe('Cargo Crate');
  });

  it('11. Flutter project → Dart + Flutter', () => {
    fs.writeFileSync(path.join(tempDir, 'pubspec.yaml'), 'name: my_app\nenvironment:\n  sdk: ">=2.12.0 <3.0.0"');
    fs.writeFileSync(path.join(tempDir, 'main.dart'), 'void main() {}');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('Dart');
    expect(scan.framework).toBe('Flutter');
    expect(scan.projectType).toBe('Mobile application');
  });

  it('12. Unknown custom project → detects language breakdown and marks framework as Unknown without failure', () => {
    fs.writeFileSync(path.join(tempDir, 'script.py'), 'print("hello")');
    fs.writeFileSync(path.join(tempDir, 'helper.py'), 'def help(): pass');
    fs.writeFileSync(path.join(tempDir, 'index.html'), '<h1>Title</h1>');

    const scan = scanLocalDirectory(tempDir);
    expect(scan.language).toBe('Python');
    expect(scan.framework).toBe('Unknown');
    expect(scan.languageBreakdown).toContain('Python');
    expect(scan.languageBreakdown).toContain('HTML');
    expect(scan.healthStatus).not.toBe('error'); // Never fail
  });
});
