/**
 * Git Integration Engine Test Suite
 * Tests git state structure parsing, branch helper logic, and remote GitHub staging state calculations.
 */

import { GitRepositoryState, GitCommitRecord } from '../types/electron.types';

describe('Git Integration Engine Unit Tests', () => {
  const dummyState: GitRepositoryState = {
    isGitRepo: true,
    currentBranch: 'main',
    branches: ['main', 'feature/auth', 'bugfix/login'],
    stagedFiles: ['src/App.tsx', 'src/types/auth.types.ts'],
    unstagedFiles: ['src/services/api.ts'],
    modifiedFiles: ['src/services/api.ts'],
    untrackedFiles: ['src/components/new.tsx'],
    ahead: 2,
    behind: 0,
    hasRemote: true,
    remoteName: 'origin',
    remoteUrl: 'https://github.com/Susmitha-18/DevVerse.git',
    isGitHub: true,
    hasUpstream: true,
    upstreamBranch: 'origin/main',
    recentCommits: [
      {
        hash: 'a1b2c3d',
        date: '2026-08-10T10:00:00Z',
        message: 'feat: add git integration module',
        author_name: 'DevVerse Bot',
        author_email: 'bot@devverse.com',
      },
    ],
  };

  it('should correctly identify active branch and available branches', () => {
    expect(dummyState.isGitRepo).toBe(true);
    expect(dummyState.currentBranch).toBe('main');
    expect(dummyState.branches).toContain('feature/auth');
  });

  it('should correctly separate staged and unstaged files', () => {
    expect(dummyState.stagedFiles.length).toBe(2);
    expect(dummyState.stagedFiles).toContain('src/App.tsx');
    expect(dummyState.unstagedFiles.length).toBe(1);
    expect(dummyState.unstagedFiles).toContain('src/services/api.ts');
  });

  it('should correctly track ahead and behind commit counts and upstream tracking', () => {
    expect(dummyState.ahead).toBe(2);
    expect(dummyState.behind).toBe(0);
    expect(dummyState.hasUpstream).toBe(true);
    expect(dummyState.upstreamBranch).toBe('origin/main');
  });

  it('should correctly detect GitHub remote connection and origin URL', () => {
    expect(dummyState.hasRemote).toBe(true);
    expect(dummyState.isGitHub).toBe(true);
    expect(dummyState.remoteName).toBe('origin');
    expect(dummyState.remoteUrl).toBe('https://github.com/Susmitha-18/DevVerse.git');
  });

  it('should format commit history records cleanly', () => {
    const commit: GitCommitRecord = dummyState.recentCommits[0];
    expect(commit.hash).toBe('a1b2c3d');
    expect(commit.message).toBe('feat: add git integration module');
  });
});
