import React, { useState, useRef } from 'react';
import { LocalProjectRecord, DirectoryScanResult } from '@/types/electron.types';

export type AddMethod =
  | 'existing'
  | 'clone'
  | 'import_zip'
  | 'empty'
  | 'template';

export interface StarterTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  framework: string;
  icon: string;
  description: string;
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  { id: 'react', name: 'React App', category: 'Frontend', language: 'TypeScript', framework: 'React', icon: '⚛️', description: 'Modern React SPA with Vite and TypeScript' },
  { id: 'next', name: 'Next.js App', category: 'SSR', language: 'TypeScript', framework: 'Next.js', icon: '▲', description: 'Full-stack React framework with App Router' },
  { id: 'node', name: 'Node.js API', category: 'Backend', language: 'JavaScript', framework: 'Node.js', icon: '🟢', description: 'Clean Node.js REST API starter' },
  { id: 'express', name: 'Express Server', category: 'Backend', language: 'TypeScript', framework: 'Express', icon: '🚂', description: 'Production-ready Express server structure' },
  { id: 'mern', name: 'MERN Stack', category: 'Fullstack', language: 'TypeScript', framework: 'React / Express', icon: '🥞', description: 'MongoDB, Express, React, Node boilerplate' },
  { id: 'java', name: 'Java Console', category: 'Backend', language: 'Java', framework: 'Java Standard', icon: '☕', description: 'Standard Java project structure' },
  { id: 'spring', name: 'Spring Boot API', category: 'Backend', language: 'Java', framework: 'Spring Boot', icon: '🍃', description: 'Enterprise Spring Boot microservice scaffolding' },
  { id: 'python', name: 'Python Service', category: 'Backend', language: 'Python', framework: 'FastAPI', icon: '🐍', description: 'FastAPI microservice template' },
  { id: 'go', name: 'Go Microservice', category: 'Backend', language: 'Go', framework: 'Go Standard', icon: '🐹', description: 'High-performance Go service template' },
  { id: 'electron', name: 'Electron Desktop', category: 'Desktop', language: 'TypeScript', framework: 'Electron', icon: '⚡', description: 'Cross-platform desktop application boilerplate' },
  { id: 'vue', name: 'Vue 3 SPA', category: 'Frontend', language: 'TypeScript', framework: 'Vue', icon: '🟢', description: 'Vue 3 + Vite starter template' },
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: LocalProjectRecord) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeMethod, setActiveMethod] = useState<AddMethod>('existing');
  const [selectedPath, setSelectedPath] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StarterTemplate | null>(STARTER_TEMPLATES[0]);
  const [projectName, setProjectName] = useState('');
  const [scanResult, setScanResult] = useState<DirectoryScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleScanPath = async (dirPath: string) => {
    const cleanPath = dirPath.trim();
    setSelectedPath(cleanPath);
    setError(null);
    setScanResult(null);

    if (!cleanPath) return;

    setLoading(true);
    try {
      if (window.devverse?.projects) {
        const scan = await window.devverse.projects.scanDirectory(cleanPath);
        setScanResult(scan);
        setProjectName(scan.name);
      } else {
        const folderName = cleanPath.split(/[/\\]/).filter(Boolean).pop() || 'Local Workspace';
        setScanResult({
          name: folderName,
          path: cleanPath,
          type: 'node',
          language: 'TypeScript',
          framework: 'Node.js',
          description: 'Local workspace project directory',
          tags: ['Local', 'TypeScript'],
          hasGit: true,
          gitBranch: 'main',
          hasDocker: true,
          hasEnv: true,
          hasCiCd: false,
          hasReadme: true,
          hasPackageJson: true,
          hasBuildFile: true,
          healthStatus: 'healthy',
          projectSizeBytes: 1024 * 50,
          totalFiles: 12,
          dependenciesCount: 5,
        });
        setProjectName(folderName);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Could not scan directory. Please verify the folder path.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseClick = async () => {
    setError(null);
    if (window.devverse?.projects) {
      try {
        const folderPath = await window.devverse.projects.selectFolder();
        if (folderPath) {
          void handleScanPath(folderPath);
          return;
        }
      } catch (err: unknown) {
        console.warn('[Electron Folder Pick Warning]:', err);
      }
    }

    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.click();
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const firstFile = files[0];
    const relativePath = firstFile.webkitRelativePath || '';
    const folderName = relativePath.split('/')[0] || 'My Project';
    const fullPath = `D:\\DevVerse\\projects\\${folderName}`;
    void handleScanPath(fullPath);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalPath = selectedPath.trim();
    let name = projectName.trim();

    if (activeMethod === 'existing' && !finalPath) {
      setError('Please select or type a valid local folder path.');
      return;
    }

    if (activeMethod === 'clone' && !repoUrl.trim()) {
      setError('Please enter a valid Git Repository URL.');
      return;
    }

    if (activeMethod === 'template' && !name) {
      name = `${selectedTemplate?.name || 'Workspace'}_App`;
    }

    if (!finalPath) {
      const sanitizedName = (name || 'New_Workspace').replace(/\s+/g, '_');
      finalPath = `D:\\DevVerse\\projects\\${sanitizedName}`;
    }

    setLoading(true);
    try {
      const folderName = name || scanResult?.name || finalPath.split(/[/\\]/).filter(Boolean).pop() || 'Workspace';
      const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const projectPayload: Omit<LocalProjectRecord, 'createdAt' | 'updatedAt'> = {
        id,
        name: folderName,
        path: finalPath,
        type: activeMethod === 'template' ? selectedTemplate?.id || 'node' : scanResult?.type || 'node',
        language: activeMethod === 'template' ? selectedTemplate?.language || 'TypeScript' : scanResult?.language || 'TypeScript',
        framework: activeMethod === 'template' ? selectedTemplate?.framework : scanResult?.framework,
        description: activeMethod === 'template' ? selectedTemplate?.description : scanResult?.description,
        tags: activeMethod === 'template' ? [selectedTemplate?.category || 'Template'] : scanResult?.tags || ['Local'],
        hasGit: true,
        gitBranch: 'main',
        hasDocker: activeMethod === 'template',
        hasEnv: activeMethod === 'template',
        hasCiCd: false,
        hasReadme: true,
        hasPackageJson: true,
        hasBuildFile: true,
        healthStatus: 'healthy',
        isFavorite: false,
        isArchived: false,
        isRunning: false,
        projectSizeBytes: 1024 * 100,
        totalFiles: 8,
        dependenciesCount: 4,
        lastOpenedAt: new Date().toISOString(),
      };

      let saved: LocalProjectRecord;
      if (window.devverse?.projects) {
        if (window.devverse.projects.getByPath) {
          const existingPath = await window.devverse.projects.getByPath(projectPayload.path);
          if (existingPath) {
            setError('A workspace with this directory path already exists in DevVerse.');
            setLoading(false);
            return;
          }
        }
        saved = await window.devverse.projects.save(projectPayload);
      } else {
        saved = { ...projectPayload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }

      onSuccess(saved);
      onClose();
      setSelectedPath('');
      setRepoUrl('');
      setZipFile(null);
      setScanResult(null);
      setProjectName('');
    } catch (err: unknown) {
      console.error('[DevVerse Save Error]:', err);
      setError((err as Error).message || 'Failed to initialize workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        className="enterprise-glass"
        style={{
          width: '100%',
          maxWidth: 680,
          borderRadius: 14,
          border: '1px solid var(--border-medium)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Add Developer Workspace
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Choose a creation method to organize local projects in SQLite
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-app)', padding: '4px 8px' }}>
          {[
            { id: 'existing', label: '📂 Open Folder' },
            { id: 'clone', label: '🌿 Clone Git' },
            { id: 'import_zip', label: '📦 Import ZIP' },
            { id: 'empty', label: '📄 Empty Workspace' },
            { id: 'template', label: '🚀 Starter Template' },
          ].map((tab) => {
            const isActive = activeMethod === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveMethod(tab.id as AddMethod);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <form onSubmit={(e) => void handleSaveProject(e)} style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', fontSize: 11 }}>
              ⚠️ {error}
            </div>
          )}

          {/* METHOD 1: Open Existing Folder */}
          {activeMethod === 'existing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Local Directory Path
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={selectedPath}
                  onChange={(e) => void handleScanPath(e.target.value)}
                  placeholder="e.g. D:\DevVerse\my-project"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => void handleBrowseClick()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Browse...
                </button>
                <input
                  type="file"
                  ref={hiddenFileInputRef}
                  onChange={handleFolderInputChange}
                  style={{ display: 'none' }}
                  {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
                />
              </div>

              {scanResult && (
                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: 11 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>
                    ✓ Project Scanned: {scanResult.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Type: {scanResult.type} • Language: {scanResult.language} • Git: {scanResult.hasGit ? 'Yes' : 'No'} • Health: {scanResult.healthStatus}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* METHOD 2: Clone Git Repository */}
          {activeMethod === 'clone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Git Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository.git"
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Will clone repository locally into your DevVerse workspace directory.
              </p>
            </div>
          )}

          {/* METHOD 3: Import ZIP */}
          {activeMethod === 'import_zip' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Upload Project Archive (.zip)
              </label>
              <div
                onClick={() => zipInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 10,
                  padding: 24,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-app)',
                }}
              >
                <div style={{ fontSize: 28 }}>📦</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>
                  {zipFile ? zipFile.name : 'Click to select ZIP archive'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Extracts source code directly into your local workspace.
                </div>
              </div>
              <input
                type="file"
                ref={zipInputRef}
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* METHOD 4: Create Empty Workspace */}
          {activeMethod === 'empty' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Workspace Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. My_Empty_Service"
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* METHOD 5: Starter Templates */}
          {activeMethod === 'template' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Starter Template ({STARTER_TEMPLATES.length} available)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {STARTER_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-app)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span>{tmpl.icon}</span>
                        <strong style={{ fontSize: 12, color: 'var(--text-primary)' }}>{tmpl.name}</strong>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tmpl.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Project Name Overwrite */}
          {activeMethod !== 'empty' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                Display Name (Optional Override)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={scanResult?.name || selectedTemplate?.name || 'Workspace Name'}
                style={{
                  padding: '7px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Footer Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Initializing...' : 'Add Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
