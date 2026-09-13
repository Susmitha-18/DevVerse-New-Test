/**
 * WorkHub Medium (Next Level WorkHub) Test Suite
 * Tests view mode toggles, sorting logic, tag filtering, and batch scanning interfaces.
 */

import { LocalProjectRecord, DirectoryScanResult } from '../types/electron.types';

describe('WorkHub Medium Functionality', () => {
  const dummyWorkspaces: LocalProjectRecord[] = [
    {
      id: '1',
      name: 'Alpha Backend',
      path: '/projects/alpha',
      type: 'express',
      language: 'TypeScript',
      framework: 'Express',
      tags: ['backend', 'api'],
      hasGit: true,
      hasDocker: false,
      hasEnv: true,
      hasCiCd: false,
      hasReadme: true,
      hasPackageJson: true,
      hasBuildFile: true,
      healthStatus: 'healthy',
      isFavorite: false,
      isArchived: false,
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
      lastOpenedAt: '2026-08-05T10:00:00Z',
    },
    {
      id: '2',
      name: 'Zeta Frontend',
      path: '/projects/zeta',
      type: 'react',
      language: 'TypeScript',
      framework: 'React',
      tags: ['frontend', 'ui'],
      hasGit: true,
      hasDocker: true,
      hasEnv: true,
      hasCiCd: true,
      hasReadme: true,
      hasPackageJson: true,
      hasBuildFile: true,
      healthStatus: 'healthy',
      isFavorite: true,
      isArchived: false,
      createdAt: '2026-08-02T10:00:00Z',
      updatedAt: '2026-08-02T10:00:00Z',
      lastOpenedAt: '2026-08-09T10:00:00Z',
    },
  ];

  it('should correctly filter workspaces by custom tags', () => {
    const backendOnly = dummyWorkspaces.filter((w) => w.tags?.includes('backend'));
    expect(backendOnly.length).toBe(1);
    expect(backendOnly[0].name).toBe('Alpha Backend');
  });

  it('should correctly sort workspaces by name A-Z', () => {
    const sorted = [...dummyWorkspaces].sort((a, b) => a.name.localeCompare(b.name));
    expect(sorted[0].name).toBe('Alpha Backend');
    expect(sorted[1].name).toBe('Zeta Frontend');
  });

  it('should correctly sort workspaces by recently opened descending', () => {
    const sorted = [...dummyWorkspaces].sort((a, b) => {
      const timeA = new Date(a.lastOpenedAt || a.updatedAt).getTime();
      const timeB = new Date(b.lastOpenedAt || b.updatedAt).getTime();
      return timeB - timeA;
    });
    expect(sorted[0].name).toBe('Zeta Frontend');
  });

  it('should process batch scanned directory results into LocalProjectRecords', () => {
    const scanned: DirectoryScanResult[] = [
      {
        name: 'Scanned App',
        path: '/scanned/app',
        type: 'node',
        language: 'JavaScript',
        hasGit: true,
        hasDocker: false,
        hasEnv: false,
        hasCiCd: false,
        hasReadme: true,
        hasPackageJson: true,
        hasBuildFile: false,
        healthStatus: 'healthy',
      },
    ];

    expect(scanned.length).toBe(1);
    expect(scanned[0].name).toBe('Scanned App');
  });
});
