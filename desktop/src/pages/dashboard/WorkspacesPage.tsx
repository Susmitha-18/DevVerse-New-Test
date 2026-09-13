/**
 * WorkspacesPage — DevVerse Workspace Hub
 *
 * Clean reconstruction. Orchestrates workspace management.
 * This page does NOT implement Git, Docker, AI, or any other DevVerse module.
 * Those are navigated to via the Actions menu.
 *
 * Phase 1: Foundation — list, search, filter, cards, actions menu, rename, delete.
 * Phase 2: New Workspace modal.
 * Phase 3: Import Project modal.
 * Phase 4+: Properties, Properties drawer, etc.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Layout
import { Sidebar } from '@/components/layout/Sidebar';

// Types
import { LocalProjectRecord } from '@/types/electron.types';

// Existing hooks (reused)
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaceActions } from '@/hooks/useWorkspaceActions';
import { useWorkspaceSearch } from '@/hooks/useWorkspaceSearch';
import { useWorkspaceFilters } from '@/hooks/useWorkspaceFilters';

// New WorkHub components
import { WH_Header } from '@/components/workhub/WH_Header';
import { WH_ActionBar } from '@/components/workhub/WH_ActionBar';
import { WH_Summary } from '@/components/workhub/WH_Summary';
import { WH_Filters } from '@/components/workhub/WH_Filters';
import { WH_WorkspaceCard } from '@/components/workhub/WH_WorkspaceCard';
import { WH_EmptyState } from '@/components/workhub/WH_EmptyState';
import { WH_LoadingState } from '@/components/workhub/WH_LoadingState';
import { WH_RenameModal } from '@/components/workhub/WH_RenameModal';
import { WH_DeleteConfirm } from '@/components/workhub/WH_DeleteConfirm';
import { WH_NewWorkspaceModal } from '@/components/workhub/WH_NewWorkspaceModal';
import { WH_ImportFolderModal } from '@/components/workhub/WH_ImportFolderModal';
import { WH_PropertiesModal } from '@/components/workhub/WH_PropertiesModal';
import { WH_DirectoryScannerModal } from '@/components/workhub/WH_DirectoryScannerModal';
import { SortOption, ViewMode } from '@/components/workhub/WH_ActionBar';
import { DirectoryScanResult } from '@/types/electron.types';

// ─────────────────────────────────────────────────────────────────────────────

import { useActiveWorkspace } from '@/context/ActiveWorkspaceContext';

export const WorkspacesPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveWorkspace } = useActiveWorkspace();

  // ── Data & Core Hooks ──────────────────────────────────────────────────────
  const {
    projects,
    loading,
    refresh,
    saveWorkspace,
    removeWorkspace,
    deleteWorkspaceFromDisk,
  } = useWorkspace();
  const actions = useWorkspaceActions(saveWorkspace, removeWorkspace);

  // ── Search ─────────────────────────────────────────────────────────────────
  const { searchQuery, setSearchQuery, searchedWorkspaces } = useWorkspaceSearch(projects);

  // ── Filters (All / Favorites / Archived) ───────────────────────────────────
  const { activeFilter, setActiveFilter, filteredWorkspaces } = useWorkspaceFilters(searchedWorkspaces);

  // ── Stats ──────────────────────────────────────────────────────────────────
  // useWorkspaceStats(projects);

  // ── Recent count (opened in last 7 days) ───────────────────────────────────
  const recentCount = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return projects.filter(
      (p) => !p.isArchived && new Date(p.lastOpenedAt || p.updatedAt).getTime() > cutoff
    ).length;
  }, [projects]);

  // ── Filter counts ──────────────────────────────────────────────────────────
  const nonArchivedCount = useMemo(
    () => projects.filter((p) => !p.isArchived).length,
    [projects]
  );
  const favoritesCount = useMemo(
    () => projects.filter((p) => p.isFavorite && !p.isArchived).length,
    [projects]
  );
  const archivedCount = useMemo(
    () => projects.filter((p) => p.isArchived).length,
    [projects]
  );

  // ── Modal States ───────────────────────────────────────────────────────────
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [showImportFolderModal, setShowImportFolderModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<LocalProjectRecord | null>(null);
  const [propertiesTarget, setPropertiesTarget] = useState<LocalProjectRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocalProjectRecord | null>(null);
  const [deleteMode, setDeleteMode] = useState<'remove' | 'delete'>('remove');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const existingPathsSet = useMemo(() => new Set(projects.map((p) => p.path)), [projects]);

  // ── WorkHub Medium Controls State ──────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract unique tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  // Apply Tag Filter & Sort
  const processedWorkspaces = useMemo(() => {
    let list = [...filteredWorkspaces];

    // Filter by tag if selected
    if (selectedTag) {
      list = list.filter((p) => p.tags?.includes(selectedTag));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'recent') {
        const timeA = new Date(a.lastOpenedAt || a.updatedAt).getTime();
        const timeB = new Date(b.lastOpenedAt || b.updatedAt).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'type') {
        const stackA = a.framework || a.language || a.type || '';
        const stackB = b.framework || b.language || b.type || '';
        return stackA.localeCompare(stackB);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return list;
  }, [filteredWorkspaces, selectedTag, sortBy]);

  const handleBatchImport = useCallback(async (scannedProjects: DirectoryScanResult[]) => {
    const now = new Date().toISOString();
    for (const p of scannedProjects) {
      const record: LocalProjectRecord = {
        id: crypto.randomUUID(),
        name: p.name,
        path: p.path,
        type: p.type || 'unknown',
        language: p.language || 'Plain Text',
        framework: p.framework,
        description: p.description || '',
        tags: p.tags || [],
        hasGit: p.hasGit,
        gitBranch: p.gitBranch,
        hasRemote: p.hasRemote,
        remoteUrl: p.remoteUrl,
        isGitHub: p.isGitHub,
        hasDocker: p.hasDocker,
        hasEnv: p.hasEnv,
        hasCiCd: p.hasCiCd,
        hasReadme: p.hasReadme,
        hasPackageJson: p.hasPackageJson,
        hasBuildFile: p.hasBuildFile,
        healthStatus: p.healthStatus || 'healthy',
        isFavorite: false,
        isArchived: false,
        projectSizeBytes: p.projectSizeBytes || 0,
        totalFiles: p.totalFiles || 0,
        dependenciesCount: p.dependenciesCount || 0,
        createdAt: now,
        updatedAt: now,
      };
      await saveWorkspace(record);
    }
    void refresh();
  }, [saveWorkspace, refresh]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleOpenWorkspace = useCallback(async (ws: LocalProjectRecord) => {
    // 1. Update lastOpenedAt in SQLite
    const updated = { ...ws, lastOpenedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await saveWorkspace(updated);
    // 2. Set as active workspace context
    setActiveWorkspace(updated);
    // 3. Navigate to Workspace Overview (NOT Properties modal)
    void navigate('/dashboard/workspace');
  }, [setActiveWorkspace, saveWorkspace, navigate]);

  const handleToggleFavorite = useCallback((ws: LocalProjectRecord) => {
    void actions.toggleFavorite(ws);
  }, [actions]);

  const handleArchive = useCallback((ws: LocalProjectRecord) => {
    void actions.toggleArchive(ws);
  }, [actions]);

  const handleRename = useCallback((ws: LocalProjectRecord, newName: string) => {
    void actions.renameWorkspace(ws, newName);
  }, [actions]);

  const handleExport = useCallback((ws: LocalProjectRecord) => {
    actions.exportWorkspace(ws);
  }, [actions]);

  const handleRemove = useCallback((ws: LocalProjectRecord) => {
    setDeleteMode('remove');
    setDeleteTarget(ws);
  }, []);

  const handleDelete = useCallback((ws: LocalProjectRecord) => {
    setDeleteMode('delete');
    setDeleteTarget(ws);
  }, []);

  const handleConfirmDelete = useCallback((ws: LocalProjectRecord) => {
    if (deleteMode === 'remove') {
      void removeWorkspace(ws.id);
    } else {
      void deleteWorkspaceFromDisk(ws.id, ws.path);
    }
  }, [deleteMode, removeWorkspace, deleteWorkspaceFromDisk]);

  const handleGit = useCallback((ws: LocalProjectRecord) => {
    setActiveWorkspace(ws);
    void navigate('/dashboard/git');
  }, [setActiveWorkspace, navigate]);

  const handleDocker = useCallback((ws: LocalProjectRecord) => {
    setActiveWorkspace(ws);
    setNoticeMessage(`Docker module integration for ${ws.name} will be available in the Advanced WorkHub milestone.`);
  }, [setActiveWorkspace]);

  const handleAI = useCallback((ws: LocalProjectRecord) => {
    setActiveWorkspace(ws);
    setNoticeMessage(`AI DevOps assistant for ${ws.name} will be available in the Advanced WorkHub milestone.`);
  }, [setActiveWorkspace]);

  const handleProperties = useCallback((ws: LocalProjectRecord) => {
    setPropertiesTarget(ws);
  }, []);

  const handleRefreshMetadata = useCallback(async (ws: LocalProjectRecord) => {
    try {
      await window.devverse?.projects?.rescan(ws.id, ws.path);
      void refresh();
    } catch (err) {
      console.error('[WorkHub] Rescan failed:', err);
    }
  }, [refresh]);

  const handleCopyPath = useCallback((ws: LocalProjectRecord) => {
    void navigator.clipboard.writeText(ws.path);
  }, []);

  const handleNewWorkspace = useCallback(() => {
    setShowNewWorkspaceModal(true);
  }, []);

  const handleWorkspaceCreated = useCallback(() => {
    void refresh();
  }, [refresh]);

  // handleImportProject removed — WH_ImportFolderModal handles this workflow correctly.

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        background: 'var(--bg-app)',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Sidebar — unchanged */}
      <Sidebar />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <WH_Header
          workspaceCount={nonArchivedCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => void refresh()}
          isLoading={loading}
        />

        {/* ── Action Bar ───────────────────────────────────────────────── */}
        <WH_ActionBar
          onNewWorkspace={handleNewWorkspace}
          onImportProject={() => setShowImportFolderModal(true)}
          onScanDirectory={() => setShowScannerModal(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {/* ── Summary Row ──────────────────────────────────────────────── */}
        <WH_Summary
          total={nonArchivedCount}
          favorites={favoritesCount}
          recent={recentCount}
        />

        {/* ── Filter Tabs ──────────────────────────────────────────────── */}
        <WH_Filters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          totalCount={nonArchivedCount}
          favoritesCount={favoritesCount}
          archivedCount={archivedCount}
          availableTags={availableTags}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div
          style={{
            height: 1,
            background: 'var(--border-subtle)',
            margin: '14px 24px 0',
            flexShrink: 0,
          }}
        />

        {/* ── Scrollable Content Area ───────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px 24px',
          }}
        >
          {/* Loading State */}
          {loading && <WH_LoadingState count={6} />}

          {/* Empty / No-Results States */}
          {!loading && processedWorkspaces.length === 0 && (
            <WH_EmptyState
              filter={activeFilter}
              hasWorkspaces={projects.length > 0}
              searchQuery={searchQuery}
              onCreateWorkspace={handleNewWorkspace}
              onImportProject={() => setShowImportFolderModal(true)}
              onClearSearch={() => setSearchQuery('')}
            />
          )}

          {/* Workspace Grid / List */}
          {!loading && processedWorkspaces.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                gap: viewMode === 'grid' ? 12 : 8,
              }}
            >
              {processedWorkspaces.map((ws) => (
                <WH_WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  viewMode={viewMode}
                  onOpenWorkspace={handleOpenWorkspace}
                  onOpenFolder={(path) => void actions.openFolder(path)}
                  onOpenTerminal={(path) => void actions.openTerminal(path)}
                  onOpenVsCode={(path) => void actions.openVsCode(path)}
                  onOpenCursor={(path) => void actions.openCursor(path)}
                  onToggleFavorite={handleToggleFavorite}
                  onRename={(w) => setRenameTarget(w)}
                  onArchive={handleArchive}
                  onProperties={handleProperties}
                  onRefreshMetadata={handleRefreshMetadata}
                  onCopyPath={handleCopyPath}
                  onGit={handleGit}
                  onDocker={handleDocker}
                  onAI={handleAI}
                  onExport={handleExport}
                  onRemove={handleRemove}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}

      {/* New Workspace Modal */}
      <WH_NewWorkspaceModal
        isOpen={showNewWorkspaceModal}
        onClose={() => setShowNewWorkspaceModal(false)}
        onCreated={handleWorkspaceCreated}
        saveWorkspace={saveWorkspace}
      />

      {/* Single Import Folder Modal */}
      <WH_ImportFolderModal
        isOpen={showImportFolderModal}
        onClose={() => setShowImportFolderModal(false)}
        onImported={handleWorkspaceCreated}
        saveWorkspace={saveWorkspace}
      />

      {/* Directory Scanner & Batch Importer Modal */}
      <WH_DirectoryScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onBatchImport={handleBatchImport}
        existingPaths={existingPathsSet}
      />

      {/* Rename Modal */}
      <WH_RenameModal
        workspace={renameTarget}
        onConfirm={handleRename}
        onClose={() => setRenameTarget(null)}
      />

      {/* Remove / Delete Confirm */}
      <WH_DeleteConfirm
        workspace={deleteTarget}
        mode={deleteMode}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Properties Modal */}
      <WH_PropertiesModal
        workspace={propertiesTarget}
        isOpen={!!propertiesTarget}
        onClose={() => setPropertiesTarget(null)}
      />

      {/* Notice / Coming Soon Modal */}
      {noticeMessage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setNoticeMessage(null)}>
          <div style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 24, maxWidth: 420, width: '90%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ margin: '0 0 12px', color: '#f0f2f8', fontSize: 16 }}>DevVerse V1 Feature Notice</h4>
            <p style={{ margin: '0 0 20px', color: '#9aa3bc', fontSize: 13, lineHeight: 1.5 }}>{noticeMessage}</p>
            <button onClick={() => setNoticeMessage(null)} style={{ background: '#38bdf8', color: '#000', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
};
