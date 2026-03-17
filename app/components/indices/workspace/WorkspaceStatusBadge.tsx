import React from 'react';
import type { StatusTone } from './supabaseWorkspaceTypes';

const WorkspaceStatusBadge: React.FC<{ tone: StatusTone; label: string }> = ({ tone, label }) => (
  <span className={`supabase-editor__status supabase-editor__status--${tone}`}>{label}</span>
);

export default WorkspaceStatusBadge;
