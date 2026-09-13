/**
 * Local Git Version Control & Remote GitHub Service — DevVerse Desktop
 */

import simpleGit, { SimpleGit, StatusResult, LogResult, BranchSummary } from 'simple-git';
import fs from 'node:fs';

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
  hasRemote: boolean;
  remoteName?: string;
  remoteUrl?: string;
  isGitHub: boolean;
  hasUpstream: boolean;
  upstreamBranch?: string;
}

export interface GitRemoteResult {
  success: boolean;
  remoteName: string;
  remoteUrl: string;
  isGitHub: boolean;
}

/**
 * Format raw git error into clean user-friendly messages for all users and environments.
 */
function formatGitError(err: unknown, defaultMessage = 'Git operation failed.'): Error {
  const msg = (err as Error)?.message || String(err);

  if (
    msg.includes('GH007') ||
    msg.includes('push would publish a private email') ||
    msg.includes('email privacy restrictions') ||
    msg.includes('private email address')
  ) {
    return new Error(
      'GitHub rejected this push because one or more commits use an email address that is marked private in your GitHub account (GH007).\n\n' +
      'Guidance to resolve:\n' +
      '1. Configure your Git commit email to your GitHub-provided noreply email:\n' +
      '   git config user.email "ID+username@users.noreply.github.com"\n' +
      '2. Amend or recreate the affected commits if necessary.\n' +
      '3. Alternatively, adjust your GitHub Email Privacy settings at https://github.com/settings/emails (uncheck "Block command line pushes that expose my email").'
    );
  }

  if (
    msg.includes('Authentication failed') ||
    msg.includes('could not read Username') ||
    msg.includes('Permission denied (publickey)') ||
    msg.includes('Invalid username or token') ||
    msg.includes('fatal: Authentication') ||
    msg.includes('not authorized')
  ) {
    return new Error('Git authentication failed. Please configure GitHub authentication using Git Credential Manager or SSH and try again.');
  }

  if (msg.includes('CONFLICT') || msg.includes('Merge conflict') || msg.includes('Automatic merge failed')) {
    return new Error('Pull failed because there are merge conflicts. Please resolve conflicts locally.');
  }

  if (msg.includes('Updates were rejected because the remote contains work') || msg.includes('non-fast-forward')) {
    return new Error('Push rejected: Remote repository has changes that you do not have locally. Please pull remote changes first.');
  }

  if (
    msg.includes('Could not resolve host') ||
    msg.includes('Failed to connect') ||
    msg.includes('Network is unreachable') ||
    msg.includes('Connection timed out')
  ) {
    return new Error('Unable to connect to the remote repository. Please check your internet connection and repository URL.');
  }

  if (msg.includes('repository') && msg.includes('not found')) {
    return new Error('GitHub repository not found or access denied. Please verify the URL and your repository permissions.');
  }

  if (msg.includes('No such remote') || msg.includes('fatal: No such remote')) {
    return new Error('This workspace is not connected to a remote repository.');
  }

  return new Error(msg.replace(/^Error:\s*/, '') || defaultMessage);
}

export async function getGitRepositoryState(projectPath: string): Promise<GitRepositoryState> {
  if (!fs.existsSync(projectPath)) {
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
      hasRemote: false,
      isGitHub: false,
      hasUpstream: false,
    };
  }

  const git: SimpleGit = simpleGit(projectPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
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
      hasRemote: false,
      isGitHub: false,
      hasUpstream: false,
    };
  }

  try {
    const [status, branchesSummary, logSummary, remotes]: [StatusResult, BranchSummary, LogResult, any[]] = await Promise.all([
      git.status(),
      git.branchLocal(),
      git.log({ maxCount: 25 }).catch(() => ({ all: [], latest: null, total: 0 })),
      git.getRemotes(true).catch(() => []),
    ]);

    const recentCommits: GitCommitRecord[] = (logSummary.all || []).map((c) => ({
      hash: c.hash.substring(0, 7),
      date: c.date,
      message: c.message,
      author_name: c.author_name,
      author_email: c.author_email,
    }));

    // Remote detection
    const originRemote = remotes.find((r) => r.name === 'origin') || remotes[0];
    const remoteName = originRemote?.name;
    const remoteUrl = originRemote?.refs?.fetch || originRemote?.refs?.push || originRemote?.refs?.fetchUrl || undefined;
    const hasRemote = Boolean(remoteUrl);
    const isGitHub = Boolean(remoteUrl && remoteUrl.toLowerCase().includes('github.com'));

    // Upstream tracking branch status
    const upstreamBranch = status.tracking || undefined;
    const hasUpstream = Boolean(upstreamBranch);
    const ahead = hasUpstream ? (status.ahead || 0) : 0;
    const behind = hasUpstream ? (status.behind || 0) : 0;

    return {
      isGitRepo: true,
      currentBranch: status.current || 'main',
      branches: branchesSummary.all || [status.current || 'main'],
      stagedFiles: status.staged || [],
      unstagedFiles: status.not_added.concat(status.modified.filter((f) => !status.staged.includes(f))),
      modifiedFiles: status.modified || [],
      untrackedFiles: status.not_added || [],
      ahead,
      behind,
      recentCommits,
      hasRemote,
      remoteName,
      remoteUrl,
      isGitHub,
      hasUpstream,
      upstreamBranch,
    };
  } catch (_err: unknown) {
    void _err;
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
      hasRemote: false,
      isGitHub: false,
      hasUpstream: false,
    };
  }
}

export async function switchGitBranch(projectPath: string, branchName: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) throw new Error('No Git repository found in this workspace.');
    await git.checkout(branchName);
  } catch (err) {
    throw formatGitError(err, `Failed to switch to branch ${branchName}`);
  }
}

export async function createGitBranch(projectPath: string, branchName: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) throw new Error('No Git repository found in this workspace.');
    await git.checkoutLocalBranch(branchName);
  } catch (err) {
    throw formatGitError(err, `Failed to create branch ${branchName}`);
  }
}

export async function stageGitFile(projectPath: string, filePath: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) throw new Error('No Git repository found in this workspace.');
    await git.add(filePath);
  } catch (err) {
    throw formatGitError(err, `Failed to stage file ${filePath}`);
  }
}

export async function unstageGitFile(projectPath: string, filePath: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) throw new Error('No Git repository found in this workspace.');
    await git.reset(['--', filePath]);
  } catch (err) {
    throw formatGitError(err, `Failed to unstage file ${filePath}`);
  }
}

export async function stageAllGitFiles(projectPath: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) throw new Error('No Git repository found in this workspace.');
    await git.add('.');
  } catch (err) {
    throw formatGitError(err, 'Failed to stage all files');
  }
}

export async function unstageAllGitFiles(projectPath: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) throw new Error('No Git repository found in this workspace.');
    await git.reset(['HEAD']);
  } catch (err) {
    throw formatGitError(err, 'Failed to unstage files');
  }
}

export async function getGitFileDiff(projectPath: string, filePath: string, staged = false): Promise<string> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) throw new Error('No Git repository found in this workspace.');
    if (staged) {
      return await git.diff(['--staged', '--', filePath]);
    }
    return await git.diff(['--', filePath]);
  } catch (err) {
    throw formatGitError(err, `Failed to get diff for ${filePath}`);
  }
}

export async function initGitRepository(projectPath: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace path does not exist on disk.');
  const git: SimpleGit = simpleGit(projectPath);
  try {
    await git.init();
  } catch (err) {
    throw formatGitError(err, 'Failed to initialize Git repository');
  }
}

export async function addGitRemote(
  projectPath: string,
  arg2: string,
  arg3?: string
): Promise<GitRemoteResult> {
  // Determine remoteName and remoteUrl flexibly
  let remoteName = 'origin';
  let remoteUrl = '';

  if (arg3 !== undefined && arg3.trim() !== '') {
    // Invoked as (projectPath, remoteName, remoteUrl)
    remoteName = arg2 || 'origin';
    remoteUrl = arg3;
  } else {
    // Invoked as (projectPath, remoteUrl)
    remoteUrl = arg2;
  }

  const trimmedUrl = (remoteUrl || '').trim();
  const trimmedName = (remoteName || 'origin').trim();

  // 1. Validate workspace directory path exists
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Workspace directory does not exist: ${projectPath}`);
  }

  const git: SimpleGit = simpleGit(projectPath);

  // 2. Validate repository is a valid Git repository
  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    throw new Error('No Git repository found in this workspace. Please initialize Git first.');
  }

  // 3. Validate URL format (HTTPS or SSH)
  if (!trimmedUrl) {
    throw new Error('Remote repository URL cannot be empty.');
  }

  const isValidGitUrl =
    /^(https?:\/\/|git@|ssh:\/\/|git:\/\/)[^\s]+$/i.test(trimmedUrl) ||
    trimmedUrl.includes('github.com') ||
    trimmedUrl.includes('gitlab.com') ||
    trimmedUrl.includes('bitbucket.org');

  if (!isValidGitUrl) {
    throw new Error('Please enter a valid HTTPS (e.g. https://github.com/user/repo.git) or SSH (e.g. git@github.com:user/repo.git) repository URL.');
  }

  try {
    // 4. Check if remote already exists
    const remotes = await git.getRemotes(true).catch(() => []);
    const existing = remotes.find((r) => r.name === trimmedName);

    if (existing) {
      // 5. Update existing remote with git remote set-url
      await git.remote(['set-url', trimmedName, trimmedUrl]);
    } else {
      // 6. Add new remote with git remote add
      await git.addRemote(trimmedName, trimmedUrl);
    }

    const isGitHub = trimmedUrl.toLowerCase().includes('github.com');

    return {
      success: true,
      remoteName: trimmedName,
      remoteUrl: trimmedUrl,
      isGitHub,
    };
  } catch (err) {
    throw formatGitError(err, `Failed to configure remote repository "${trimmedName}"`);
  }
}

export async function setGitRemoteUrl(
  projectPath: string,
  remoteName = 'origin',
  remoteUrl: string
): Promise<GitRemoteResult> {
  return await addGitRemote(projectPath, remoteName, remoteUrl);
}

export async function removeGitRemote(
  projectPath: string,
  remoteName = 'origin'
): Promise<{ success: boolean; remoteName: string }> {
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Workspace directory does not exist: ${projectPath}`);
  }

  const git: SimpleGit = simpleGit(projectPath);
  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    throw new Error('No Git repository found in this workspace.');
  }

  const name = (remoteName || 'origin').trim();
  try {
    await git.removeRemote(name);
    return { success: true, remoteName: name };
  } catch (err) {
    throw formatGitError(err, `Failed to remove remote "${name}"`);
  }
}

export async function pullGitRemote(projectPath: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace directory does not exist.');
  const git: SimpleGit = simpleGit(projectPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    throw new Error('No Git repository found in this workspace.');
  }

  // 1. Verify remote exists
  const remotes = await git.getRemotes(true).catch(() => []);
  if (remotes.length === 0) {
    throw new Error('This workspace is not connected to a remote repository. Please connect a GitHub repository first.');
  }

  // 2. Perform pull
  try {
    const status = await git.status();
    const branch = status.current || 'main';
    const remoteName = remotes.find((r) => r.name === 'origin')?.name || remotes[0].name;

    if (status.tracking) {
      await git.pull();
    } else {
      // Pull directly from the remote branch if tracking is not explicitly established
      await git.pull(remoteName, branch).catch(() => git.pull());
    }
  } catch (err) {
    throw formatGitError(err, 'Pull operation failed.');
  }
}

export async function pushGitRemote(projectPath: string): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace directory does not exist.');
  const git: SimpleGit = simpleGit(projectPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    throw new Error('No Git repository found in this workspace.');
  }

  // 1. Verify remote exists
  const remotes = await git.getRemotes(true).catch(() => []);
  if (remotes.length === 0) {
    throw new Error('This workspace is not connected to a remote repository. Please connect a GitHub repository first.');
  }

  const remoteName = remotes.find((r) => r.name === 'origin')?.name || remotes[0].name;
  const status = await git.status();
  const branch = status.current || 'main';

  // 2. Perform push (set upstream if branch is not yet tracking remote)
  try {
    if (!status.tracking) {
      await git.push(['-u', remoteName, branch]);
    } else {
      await git.push();
    }
  } catch (err) {
    const errMessage = (err as Error)?.message || '';
    if (
      errMessage.includes('no upstream branch') ||
      errMessage.includes('set-upstream') ||
      errMessage.includes('has no upstream branch')
    ) {
      try {
        await git.push(['-u', remoteName, branch]);
        return;
      } catch (retryErr) {
        throw formatGitError(retryErr, 'Push operation failed.');
      }
    }
    throw formatGitError(err, 'Push operation failed.');
  }
}

export async function stageAndCommit(projectPath: string, message: string, filesToStage?: string[]): Promise<void> {
  if (!fs.existsSync(projectPath)) throw new Error('Workspace directory does not exist.');
  const git: SimpleGit = simpleGit(projectPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    throw new Error('No Git repository found in this workspace.');
  }

  if (filesToStage && filesToStage.length > 0) {
    await git.add(filesToStage);
  }

  const status = await git.status();
  if (status.staged.length === 0) {
    throw new Error('No staged files to commit. Please stage files before committing.');
  }

  try {
    await git.commit(message);
  } catch (err) {
    throw formatGitError(err, 'Commit failed.');
  }
}
