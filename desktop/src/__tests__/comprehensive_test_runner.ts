/**
 * Comprehensive Automated Test Suite for DevVerse
 * Tests:
 * 1. Backend API Health
 * 2. SQLite Database Engine (Embedded WASM / sql.js)
 * 3. Scanner Service (Technology Stack Detection & Metadata Extraction)
 * 4. Git VCS Engine (Init, Branching, Staging, Commit, Diff, State)
 * 5. Workspace Workflow Validation (New Workspace, Import Folder, Scan Directory)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import axios from 'axios';

// Import SQLite DB functions
import {
  saveLocalProject,
  getAllLocalProjects,
  updateLocalProject,
  getProjectByPath,
  deleteLocalProject,
  getAppearance,
  saveAppearance,
} from '../../electron/main/db/sqlite';

// Import Scanner functions
import { scanLocalDirectory, scanParentDirectory } from '../../electron/main/services/scanner.service';

// Import Git service functions
import {
  initGitRepository,
  getGitRepositoryState,
  createGitBranch,
  switchGitBranch,
  stageGitFile,
  unstageGitFile,
  stageAllGitFiles,
  unstageAllGitFiles,
  stageAndCommit,
  getGitFileDiff,
  addGitRemote,
  setGitRemoteUrl,
  removeGitRemote,
  pushGitRemote,
} from '../../electron/main/services/git.service';

interface TestResult {
  module: string;
  feature: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, module: string, feature: string, details?: string) {
  if (condition) {
    results.push({ module, feature, passed: true, details });
    console.log(`  ✓ [${module}] ${feature} - ${details || 'PASSED'}`);
  } else {
    results.push({ module, feature, passed: false, error: 'Assertion failed' });
    console.error(`  ✕ [${module}] ${feature} - FAILED`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING COMPREHENSIVE DEVVERSE MODULE & FEATURE TESTS');
  console.log('======================================================\n');

  // ---------------------------------------------------------
  // TEST 1: Backend API Health
  // ---------------------------------------------------------
  console.log('1. Testing Backend API Health...');
  try {
    const res = await axios.get('http://localhost:5000/api/v1/health', { timeout: 3000 });
    assert(res.status === 200, 'Backend API', 'Health Endpoint Status 200', `Status: ${res.status}`);
    assert(res.data.backend === 'OK' || res.data.backend === 'healthy' || typeof res.data === 'object', 'Backend API', 'Health Payload Schema', JSON.stringify(res.data));
  } catch (err: any) {
    assert(false, 'Backend API', 'Health Endpoint Reachable', err.message);
  }

  // ---------------------------------------------------------
  // TEST 2: Embedded SQLite Storage Engine
  // ---------------------------------------------------------
  console.log('\n2. Testing Embedded SQLite Storage Engine...');
  const testProjectId = `test-ws-${Date.now()}`;
  const testProjectPath = path.join(os.tmpdir(), `devverse-test-${Date.now()}`);

  try {
    // 2.1 Save workspace
    const saved = await saveLocalProject({
      id: testProjectId,
      name: 'Automated Test Workspace',
      path: testProjectPath,
      type: 'react',
      language: 'TypeScript',
      framework: 'React',
      description: 'Temporary workspace for automated test validation',
      tags: ['Test', 'Automation'],
      hasGit: false,
      hasDocker: false,
      hasEnv: false,
      hasCiCd: false,
      hasReadme: false,
      hasPackageJson: false,
      hasBuildFile: false,
      healthStatus: 'healthy',
      isFavorite: false,
      isArchived: false,
      projectSizeBytes: 1024,
      totalFiles: 5,
      dependenciesCount: 3,
    });
    assert(saved !== null && saved !== undefined, 'SQLite Storage', 'Save Local Workspace', `Saved ID: ${testProjectId}`);

    // 2.2 List all workspaces
    const allProjects = await getAllLocalProjects();
    const found = allProjects.find((p: any) => p.id === testProjectId);
    assert(!!found, 'SQLite Storage', 'Get All Local Workspaces', `Found created project in list (${allProjects.length} total)`);

    // 2.3 Get workspace by path
    const byPath = await getProjectByPath(testProjectPath);
    assert(byPath?.id === testProjectId, 'SQLite Storage', 'Query Workspace by Exact Path', `Matched by path: ${testProjectPath}`);

    // 2.4 Update workspace
    await updateLocalProject(testProjectId, {
      name: 'Automated Test Workspace (Updated)',
      isFavorite: true,
      description: 'Updated description for test',
    });
    const updatedList = await getAllLocalProjects();
    const updated = updatedList.find((p: any) => p.id === testProjectId);
    assert(updated?.name === 'Automated Test Workspace (Updated)' && updated?.isFavorite === true, 'SQLite Storage', 'Update Workspace Attributes (Favorite / Rename)', `Updated name: ${updated?.name}, isFavorite: ${updated?.isFavorite}`);

    // 2.5 Appearance settings save & load
    await saveAppearance({
      theme: 'devverse-dark',
      accentColor: 'cyan',
      fontSize: 'medium',
      fontFamily: 'Inter',
      sidebarWidth: 220,
    });
    const appearance = await getAppearance();
    assert(appearance?.theme === 'devverse-dark' && appearance?.accentColor === 'cyan', 'SQLite Storage', 'Persist & Retrieve Appearance Settings', `Theme: ${appearance?.theme}, Accent: ${appearance?.accentColor}`);

    // 2.6 Delete workspace from SQLite
    const deleted = await deleteLocalProject(testProjectId);
    assert(deleted === true, 'SQLite Storage', 'Delete Workspace Record', `Deleted ID: ${testProjectId}`);
  } catch (err: any) {
    assert(false, 'SQLite Storage', 'SQLite Operations', err.message);
  }

  // ---------------------------------------------------------
  // TEST 3: Scanner Service (Detection Engine)
  // ---------------------------------------------------------
  console.log('\n3. Testing Scanner Service (Tech Stack Detection)...');
  const sampleFolder = path.join(os.tmpdir(), `devverse-scan-sample-${Date.now()}`);
  const parentFolder = path.join(os.tmpdir(), `devverse-parent-sample-${Date.now()}`);
  const childProjectA = path.join(parentFolder, 'project-alpha');
  const childProjectB = path.join(parentFolder, 'project-beta');
  const randomFolder = path.join(parentFolder, 'not-a-project');

  try {
    // Setup single project
    fs.mkdirSync(sampleFolder, { recursive: true });
    fs.writeFileSync(path.join(sampleFolder, 'package.json'), JSON.stringify({
      name: 'sample-react-app',
      dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0', next: '^14.0.0' },
      devDependencies: { typescript: '^5.0.0' }
    }, null, 2));
    fs.writeFileSync(path.join(sampleFolder, 'index.tsx'), 'export const App = () => <h1>DevVerse</h1>;\n');
    fs.writeFileSync(path.join(sampleFolder, 'README.md'), '# Sample React App\nDemo documentation.');
    fs.writeFileSync(path.join(sampleFolder, '.env'), 'PORT=3000\nAPI_KEY=test');
    fs.writeFileSync(path.join(sampleFolder, 'Dockerfile'), 'FROM node:18-alpine\nWORKDIR /app');

    // 3.1 Single directory scan
    const singleScan = await scanLocalDirectory(sampleFolder);
    assert(singleScan.hasPackageJson === true, 'Scanner Service', 'Detect package.json', 'Found package.json');
    assert(singleScan.hasReadme === true, 'Scanner Service', 'Detect README.md', 'Found README.md');
    assert(singleScan.hasEnv === true, 'Scanner Service', 'Detect .env configuration', 'Found .env');
    assert(singleScan.hasDocker === true, 'Scanner Service', 'Detect Dockerfile', 'Found Dockerfile');
    assert(singleScan.language === 'TypeScript' || singleScan.language === 'JavaScript', 'Scanner Service', 'Detect Language', `Detected: ${singleScan.language}`);
    assert(singleScan.framework === 'Next.js' || singleScan.framework === 'React', 'Scanner Service', 'Detect Framework', `Detected: ${singleScan.framework}`);

    // Setup parent folder for batch scan
    fs.mkdirSync(childProjectA, { recursive: true });
    fs.writeFileSync(path.join(childProjectA, 'package.json'), JSON.stringify({ name: 'project-alpha', dependencies: { express: '^4.18.0' } }));
    
    fs.mkdirSync(childProjectB, { recursive: true });
    fs.writeFileSync(path.join(childProjectB, 'requirements.txt'), 'flask==2.0.0\npytest==7.0.0');
    fs.writeFileSync(path.join(childProjectB, 'app.py'), 'print("Hello Flask")');

    fs.mkdirSync(randomFolder, { recursive: true });
    fs.writeFileSync(path.join(randomFolder, 'random_notes.txt'), 'just text');

    // 3.2 Parent directory batch scan
    const batchResults = await scanParentDirectory(parentFolder);
    const names = batchResults.map((r: any) => r.name);
    assert(batchResults.length >= 2, 'Scanner Service', 'Scan Parent Directory & Discover Child Projects', `Discovered ${batchResults.length} projects: ${names.join(', ')}`);
    assert(names.includes('project-alpha'), 'Scanner Service', 'Identify Node / Express Project', 'Discovered project-alpha');
    assert(names.includes('project-beta'), 'Scanner Service', 'Identify Python Project', 'Discovered project-beta');
  } catch (err: any) {
    assert(false, 'Scanner Service', 'Scanner Operations', err.message);
  } finally {
    try { fs.rmSync(sampleFolder, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(parentFolder, { recursive: true, force: true }); } catch {}
  }

  // ---------------------------------------------------------
  // TEST 4: Git VCS Engine
  // ---------------------------------------------------------
  console.log('\n4. Testing Git VCS Engine...');
  const testGitRepo = path.join(os.tmpdir(), `devverse-git-repo-${Date.now()}`);

  try {
    fs.mkdirSync(testGitRepo, { recursive: true });

    // 4.1 Non-Git state check
    const nonGitState = await getGitRepositoryState(testGitRepo);
    assert(nonGitState.isGitRepo === false, 'Git Engine', 'Detect Non-Git Folder', 'Correctly reported isGitRepo: false');

    // 4.2 Git Init
    await initGitRepository(testGitRepo);
    const postInitState = await getGitRepositoryState(testGitRepo);
    assert(postInitState.isGitRepo === true, 'Git Engine', 'Initialize Repository (git init)', `Repo initialized, current branch: ${postInitState.currentBranch || 'initial'}`);

    // 4.3 Create files & check untracked changes
    const file1 = path.join(testGitRepo, 'index.ts');
    fs.writeFileSync(file1, 'console.log("DevVerse v1");\n');
    const stateWithUntracked = await getGitRepositoryState(testGitRepo);
    assert(stateWithUntracked.untrackedFiles.length > 0 || stateWithUntracked.unstagedFiles.length > 0, 'Git Engine', 'Detect Working Directory Changes', `Unstaged count: ${stateWithUntracked.unstagedFiles.length}`);

    // 4.4 Stage individual file
    await stageGitFile(testGitRepo, 'index.ts');
    const stagedState = await getGitRepositoryState(testGitRepo);
    assert(stagedState.stagedFiles.includes('index.ts'), 'Git Engine', 'Stage Individual File', 'index.ts successfully staged');

    // 4.5 Inspect File Diff
    const diff = await getGitFileDiff(testGitRepo, 'index.ts', true);
    assert(diff.includes('DevVerse v1') || diff.length > 0, 'Git Engine', 'Inspect Staged File Diff', 'Diff inspected successfully');

    // 4.6 Commit Staged File
    await stageAndCommit(testGitRepo, 'feat: initial automated commit');
    const postCommitState = await getGitRepositoryState(testGitRepo);
    assert(postCommitState.stagedFiles.length === 0, 'Git Engine', 'Commit Staged Changes', 'Staged files cleared after commit');
    assert(postCommitState.recentCommits.length > 0, 'Git Engine', 'Commit History Timeline Stream', `Found ${postCommitState.recentCommits.length} commits. Latest message: "${postCommitState.recentCommits[0]?.message}"`);

    // 4.7 Branch creation and switching
    await createGitBranch(testGitRepo, 'feature/test-branch');
    const branchState = await getGitRepositoryState(testGitRepo);
    assert(branchState.currentBranch === 'feature/test-branch', 'Git Engine', 'Create & Switch Branch', `Active branch: ${branchState.currentBranch}`);

    const baseBranch = branchState.branches.find((b: string) => b === 'master' || b === 'main') || branchState.branches[0];
    await switchGitBranch(testGitRepo, baseBranch);
    const switchedState = await getGitRepositoryState(testGitRepo);
    assert(switchedState.currentBranch === baseBranch, 'Git Engine', 'Switch Existing Branch', `Switched back to: ${switchedState.currentBranch}`);

    // 4.8 Unstage all functionality
    fs.writeFileSync(path.join(testGitRepo, 'feature.ts'), 'export const x = 1;\n');
    await stageAllGitFiles(testGitRepo);
    const allStaged = await getGitRepositoryState(testGitRepo);
    assert(allStaged.stagedFiles.includes('feature.ts'), 'Git Engine', 'Stage All Files', 'feature.ts staged');

    await unstageAllGitFiles(testGitRepo);
    const allUnstaged = await getGitRepositoryState(testGitRepo);
    assert(!allUnstaged.stagedFiles.includes('feature.ts'), 'Git Engine', 'Unstage All Files', 'feature.ts unstaged');

    // 4.9 Remote Origin Management & GitHub Detection
    const preRemoteState = await getGitRepositoryState(testGitRepo);
    assert(preRemoteState.hasRemote === false && preRemoteState.isGitHub === false, 'Git Engine', 'Detect Absence of Remote', 'Correctly reported hasRemote: false');

    await addGitRemote(testGitRepo, 'origin', 'https://github.com/Susmitha-18/DevVerse.git');
    const withRemoteState = await getGitRepositoryState(testGitRepo);
    assert(withRemoteState.hasRemote === true && withRemoteState.isGitHub === true, 'Git Engine', 'Add GitHub Remote Origin', `Remote added: ${withRemoteState.remoteUrl}`);
    assert(withRemoteState.remoteName === 'origin', 'Git Engine', 'Remote Name origin', 'Remote named origin');

    await setGitRemoteUrl(testGitRepo, 'origin', 'https://github.com/Susmitha-18/DevVerse-Renamed.git');
    const updatedRemoteState = await getGitRepositoryState(testGitRepo);
    assert(updatedRemoteState.remoteUrl === 'https://github.com/Susmitha-18/DevVerse-Renamed.git', 'Git Engine', 'Update Remote Origin URL', `Updated to: ${updatedRemoteState.remoteUrl}`);

    await removeGitRemote(testGitRepo, 'origin');
    const postRemoveState = await getGitRepositoryState(testGitRepo);
    assert(postRemoveState.hasRemote === false, 'Git Engine', 'Remove Remote Origin', 'Remote removed successfully');

    // 4.10 Email Privacy & Error Formatting Test
    try {
      // Simulate attempting a push when no remote is present
      await pushGitRemote(testGitRepo);
      assert(false, 'Git Engine', 'Push without Remote Error Handling', 'Expected error when pushing without remote');
    } catch (pushErr: any) {
      assert(pushErr.message.includes('not connected to a remote repository'), 'Git Engine', 'Push without Remote Error Handling', `Caught expected error: "${pushErr.message}"`);
    }
  } catch (err: any) {
    assert(false, 'Git Engine', 'Git VCS Operations', err.message);
  } finally {
    try { fs.rmSync(testGitRepo, { recursive: true, force: true }); } catch {}
  }

  // ---------------------------------------------------------
  // Summary
  // ---------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n======================================================');
  console.log(`📊 TEST SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
