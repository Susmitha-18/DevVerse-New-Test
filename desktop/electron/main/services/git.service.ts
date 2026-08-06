/**
 * Local Git Version Control Service — DevVerse Desktop
 */

import simpleGit, { SimpleGit, StatusResult, LogResult, BranchSummary } from 'simple-git';

export interface GitCommitRecord {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
}

export interface GitRepositoryState {
  isGitRepo: boolean;
  currentBranch: string;
  branches: string[];
  stagedFiles: string[];
  unstagedFiles: string[];
  modifiedFiles: string[];
  untrackedFiles: string[];
  ahead: number;
  behind: number;
  recentCommits: GitCommitRecord[];
}

export async function getGitRepositoryState(projectPath: string): Promise<GitRepositoryState> {
  const git: SimpleGit = simpleGit(projectPath);

  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    return {
      isGitRepo: false,
      currentBranch: '',
      branches: [],
      stagedFiles: [],
      unstagedFiles: [],
      modifiedFiles: [],
      untrackedFiles: [],
      ahead: 0,
      behind: 0,
      recentCommits: [],
    };
  }

  const [status, branchesSummary, logSummary]: [StatusResult, BranchSummary, LogResult] = await Promise.all([
    git.status(),
    git.branchLocal(),
    git.log({ maxCount: 20 }),
  ]);

  const recentCommits: GitCommitRecord[] = logSummary.all.map((c) => ({
    hash: c.hash.substring(0, 7),
    date: c.date,
    message: c.message,
    author_name: c.author_name,
    author_email: c.author_email,
  }));

  return {
    isGitRepo: true,
    currentBranch: status.current || 'main',
    branches: branchesSummary.all,
    stagedFiles: status.staged,
    unstagedFiles: status.not_added.concat(status.modified.filter((f) => !status.staged.includes(f))),
    modifiedFiles: status.modified,
    untrackedFiles: status.not_added,
    ahead: status.ahead,
    behind: status.behind,
    recentCommits,
  };
}

export async function switchGitBranch(projectPath: string, branchName: string): Promise<void> {
  const git: SimpleGit = simpleGit(projectPath);
  await git.checkout(branchName);
}

export async function createGitBranch(projectPath: string, branchName: string): Promise<void> {
  const git: SimpleGit = simpleGit(projectPath);
  await git.checkoutLocalBranch(branchName);
}

export async function stageAndCommit(projectPath: string, message: string, filesToStage?: string[]): Promise<void> {
  const git: SimpleGit = simpleGit(projectPath);

  if (filesToStage && filesToStage.length > 0) {
    await git.add(filesToStage);
  } else {
    await git.add('.'); // Stage all changes
  }

  await git.commit(message);
}
