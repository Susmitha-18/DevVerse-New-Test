import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { LocalProjectRecord } from '@/types/electron.types';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { WorkspaceCard } from '@/components/projects/WorkspaceCard';
import { WorkspaceHeader, FilterCategory, SortOption } from '@/components/projects/WorkspaceHeader';
import { WorkspaceDetailsDrawer } from '@/components/projects/WorkspaceDetailsDrawer';
import { WorkspaceSettingsModal } from '@/components/projects/WorkspaceSettingsModal';
import { BulkActionsBar } from '@/components/projects/BulkActionsBar';
import { WorkspaceStatusSummary } from '@/components/projects/WorkspaceStatusSummary';
import { StorageAndStats } from '@/components/projects/StorageAndStats';
import { RecentActivityFeed } from '@/components/projects/RecentActivityFeed';

export const WorkspacesPage: React.FC = () => {
  const [projects, setProjects] = useState<LocalProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Selected Workspace for Details & Settings
  const [detailsWorkspace, setDetailsWorkspace] = useState<LocalProjectRecord | null>(null);
  const [settingsWorkspace, setSettingsWorkspace] = useState<LocalProjectRecord | null>(null);

  // Controls & Bulk State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let list: LocalProjectRecord[] = [];
      if (window.devverse?.projects) {
        list = await window.devverse.projects.list();
      }

      const localStored: LocalProjectRecord[] = JSON.parse(localStorage.getItem('devverse_local_projects') || '[]');
      const combinedMap = new Map<string, LocalProjectRecord>();

      localStored.forEach((p) => combinedMap.set(p.path, p));
      list.forEach((p) => combinedMap.set(p.path, p));

      setProjects(Array.from(combinedMap.values()));
    } catch (err: unknown) {
      console.warn('[Workspaces Load Error]:', err);
      const localStored: LocalProjectRecord[] = JSON.parse(localStorage.getItem('devverse_local_projects') || '[]');
      setProjects(localStored);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    const all = new Set(processedWorkspaces.map((p) => p.id));
    setSelectedIds(all);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, isFavorite: !currentStatus } : p));
    setProjects(updated);

    const target = updated.find((p) => p.id === id);
    if (target && window.devverse?.projects) {
      await window.devverse.projects.save(target);
    }
    localStorage.setItem('devverse_local_projects', JSON.stringify(updated));
  };

  const handleSaveSettings = async (updatedWorkspace: LocalProjectRecord) => {
    const updated = projects.map((p) => (p.id === updatedWorkspace.id ? updatedWorkspace : p));
    setProjects(updated);

    if (window.devverse?.projects) {
      await window.devverse.projects.save(updatedWorkspace);
    }
    localStorage.setItem('devverse_local_projects', JSON.stringify(updated));
  };

  const handleDeleteProject = async (workspace: LocalProjectRecord) => {
    if (!confirm(`Are you sure you want to remove workspace "${workspace.name}" from DevVerse? (Disk files remain intact)`)) return;

    try {
      if (window.devverse?.projects) {
        await window.devverse.projects.delete(workspace.id);
      }
      const updated = projects.filter((p) => p.id !== workspace.id && p.path !== workspace.path);
      setProjects(updated);
      localStorage.setItem('devverse_local_projects', JSON.stringify(updated));

      if (detailsWorkspace?.id === workspace.id) setDetailsWorkspace(null);
      if (settingsWorkspace?.id === workspace.id) setSettingsWorkspace(null);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete workspace.');
    }
  };

  // Bulk Handlers
  const handleBulkFavorite = () => {
    const updated = projects.map((p) => (selectedIds.has(p.id) ? { ...p, isFavorite: true } : p));
    setProjects(updated);
    localStorage.setItem('devverse_local_projects', JSON.stringify(updated));
    setSelectedIds(new Set());
  };

  const handleBulkArchive = () => {
    const updated = projects.map((p) => (selectedIds.has(p.id) ? { ...p, isArchived: true } : p));
    setProjects(updated);
    localStorage.setItem('devverse_local_projects', JSON.stringify(updated));
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedList = projects.filter((p) => selectedIds.has(p.id));
    const jsonStr = JSON.stringify(selectedList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devverse_workspaces_export_${Date.now()}.json`;
    a.click();
  };

  const handleBulkOpen = () => {
    const selectedList = projects.filter((p) => selectedIds.has(p.id));
    selectedList.forEach((p) => {
      void handleOpenExplorer(p.path);
    });
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected workspaces?`)) return;
    const updated = projects.filter((p) => !selectedIds.has(p.id));
    setProjects(updated);
    localStorage.setItem('devverse_local_projects', JSON.stringify(updated));
    setSelectedIds(new Set());
  };

  const handleOpenExplorer = async (path: string) => {
    if (window.devverse?.projects) {
      await window.devverse.projects.openExplorer(path);
    } else {
      alert(`Opening directory: ${path}`);
    }
  };

  const showV2Placeholder = (featureName: string) => {
    alert(`${featureName}: Coming in Version 2`);
  };

  // Favorites vs Regular Partition
  const favoriteWorkspaces = useMemo(() => projects.filter((p) => p.isFavorite), [projects]);

  // Filter & Search Engine
  const processedWorkspaces = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.path.toLowerCase().includes(q) ||
          p.language.toLowerCase().includes(q) ||
          (p.framework && p.framework.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }

    switch (activeFilter) {
      case 'favorites':
        result = result.filter((p) => p.isFavorite);
        break;
      case 'healthy':
        result = result.filter((p) => p.healthStatus === 'healthy' || !p.healthStatus);
        break;
      case 'warning':
        result = result.filter((p) => p.healthStatus === 'warning');
        break;
      case 'error':
        result = result.filter((p) => p.healthStatus === 'error');
        break;
      case 'git':
        result = result.filter((p) => p.hasGit);
        break;
      case 'docker':
        result = result.filter((p) => p.hasDocker);
        break;
      case 'env':
        result = result.filter((p) => p.hasEnv);
        break;
      case 'readme':
        result = result.filter((p) => p.hasReadme);
        break;
      case 'running':
        result = result.filter((p) => p.isRunning);
        break;
      case 'archived':
        result = result.filter((p) => p.isArchived);
        break;
      default:
        result = result.filter((p) => !p.isArchived);
        break;
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (activeSort) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'modified':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'recently_opened':
          comparison = new Date(a.lastOpenedAt || 0).getTime() - new Date(b.lastOpenedAt || 0).getTime();
          break;
        case 'size':
          comparison = (a.projectSizeBytes || 0) - (b.projectSizeBytes || 0);
          break;
        case 'language':
          comparison = a.language.localeCompare(b.language);
          break;
        case 'health':
          const rank = { healthy: 1, warning: 2, error: 3 };
          comparison = rank[a.healthStatus || 'healthy'] - rank[b.healthStatus || 'healthy'];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, searchQuery, activeFilter, activeSort, sortOrder]);

  return (
    <div style={{ flex: 1, display: 'flex', background: 'var(--bg-app)', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <main style={{ flex: 1, padding: '14px 20px', overflowY: 'auto' }}>
          {/* 1. PRIMARY PRIORITY: WORKSPACE HEADER & FILTERS */}
          <WorkspaceHeader
            totalCount={projects.length}
            filteredCount={processedWorkspaces.length}
            viewMode={viewMode}
            activeFilter={activeFilter}
            activeSort={activeSort}
            sortOrder={sortOrder}
            onViewModeChange={setViewMode}
            onFilterChange={setActiveFilter}
            onSortChange={setActiveSort}
            onToggleSortOrder={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            onAddWorkspace={() => setShowModal(true)}
            onCloneRepo={() => alert('Clone Git Repository: Select folder in wizard')}
            onImportProject={() => setShowModal(true)}
            onRefresh={() => void loadProjects()}
          />

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', fontSize: 12, marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          {/* 2. PRIMARY PRIORITY: WORKSPACE CARDS GRID / LIST */}
          {loading ? (
            <div style={{ color: 'var(--accent-cyan)', fontSize: 13, fontWeight: 600, padding: 20 }}>
              Scanning local developer workspaces...
            </div>
          ) : processedWorkspaces.length === 0 ? (
            <div className="enterprise-card" style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 20 }}>
              <div style={{ fontSize: 36 }}>📁</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>No Workspaces Found</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
                {searchQuery || activeFilter !== 'all'
                  ? 'No local workspaces match your filter criteria or search query.'
                  : 'Add a local project folder to organize Git repositories, Docker containers, and environment files.'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{ padding: '9px 18px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 12, cursor: 'pointer', marginTop: 8 }}
              >
                + Add Workspace
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
              {processedWorkspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  viewMode="grid"
                  isSelectable
                  isSelected={selectedIds.has(ws.id)}
                  onToggleSelect={handleToggleSelect}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenFolder={handleOpenExplorer}
                  onViewDetails={setDetailsWorkspace}
                  onOpenSettings={setSettingsWorkspace}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {processedWorkspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  viewMode="list"
                  isSelectable
                  isSelected={selectedIds.has(ws.id)}
                  onToggleSelect={handleToggleSelect}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenFolder={handleOpenExplorer}
                  onViewDetails={setDetailsWorkspace}
                  onOpenSettings={setSettingsWorkspace}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}

          {/* 3. SECONDARY PRIORITY: RECENT ACTIVITY FEED */}
          <RecentActivityFeed />

          {/* 4. TERTIARY PRIORITY: STORAGE INFORMATION & TECH STATISTICS */}
          <StorageAndStats workspaces={projects} />
        </main>
      </div>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => void loadProjects()}
      />

      <WorkspaceDetailsDrawer
        workspace={detailsWorkspace}
        isOpen={Boolean(detailsWorkspace)}
        onClose={() => setDetailsWorkspace(null)}
        onOpenFolder={handleOpenExplorer}
        onOpenSettings={(w) => {
          setDetailsWorkspace(null);
          setSettingsWorkspace(w);
        }}
      />

      <WorkspaceSettingsModal
        workspace={settingsWorkspace}
        isOpen={Boolean(settingsWorkspace)}
        onClose={() => setSettingsWorkspace(null)}
        onSave={handleSaveSettings}
        onDelete={handleDeleteProject}
      />

      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={processedWorkspaces.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkFavorite={handleBulkFavorite}
        onBulkArchive={handleBulkArchive}
        onBulkExport={handleBulkExport}
        onBulkOpen={handleBulkOpen}
        onBulkDelete={handleBulkDelete}
        onV2FeatureClick={showV2Placeholder}
      />
    </div>
  );
};
