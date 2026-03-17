import { signOut } from 'next-auth/react';
import React from 'react';
import type { WorkspaceMode } from './supabaseWorkspaceTypes';

type Props = {
  currentMode: WorkspaceMode;
  setCurrentMode: (mode: WorkspaceMode) => void;
  articleCount: number;
  biosCount: number;
  canShowSession: boolean;
  sessionEmail: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  createOpen: boolean;
  onToggleCreate: () => void;
};

const WorkspaceHeader: React.FC<Props> = ({ currentMode, setCurrentMode, articleCount, biosCount, canShowSession, sessionEmail, isRefreshing, onRefresh, createOpen, onToggleCreate }) => (
  <header className="supabase-panel__header">
    <div className="supabase-panel__left">
      <div className="supabase-panel__mode-toggle" role="tablist" aria-label="Mode d’édition">
        <button type="button" role="tab" aria-selected={currentMode === 'articles'} className={currentMode === 'articles' ? 'supabase-panel__mode-btn supabase-panel__mode-btn--active' : 'supabase-panel__mode-btn'} onClick={() => setCurrentMode('articles')}>Articles</button>
        <button type="button" role="tab" aria-selected={currentMode === 'bios'} className={currentMode === 'bios' ? 'supabase-panel__mode-btn supabase-panel__mode-btn--active' : 'supabase-panel__mode-btn'} onClick={() => setCurrentMode('bios')}>Bios</button>
      </div>
      <p className="supabase-panel__subtitle">{currentMode === 'articles' ? `${articleCount} article${articleCount > 1 ? 's' : ''} en ligne` : `${biosCount} bio${biosCount > 1 ? 's' : ''} disponibles`}</p>
    </div>
    <div className="supabase-panel__right">
      {canShowSession && <div className="supabase-panel__session"><div className="supabase-panel__session-info"><span className="supabase-panel__session-label">Connecté·e</span><span className="supabase-panel__session-email">{sessionEmail}</span></div><button type="button" className="supabase-panel__signout" onClick={() => signOut()}>Déconnexion</button></div>}
      <div className="supabase-panel__actions">
        <button type="button" className={`supabase-button supabase-button--icon ${isRefreshing ? 'is-spinning' : ''}`} onClick={onRefresh} aria-label="Actualiser" title="Actualiser">↻</button>
        {currentMode === 'articles' && <button type="button" className="supabase-button supabase-button--icon" onClick={onToggleCreate} aria-label={createOpen ? 'Fermer la création' : 'Nouvel article'} title={createOpen ? 'Fermer' : 'Nouvel article'}>{createOpen ? '×' : '+'}</button>}
      </div>
    </div>
  </header>
);

export default WorkspaceHeader;
