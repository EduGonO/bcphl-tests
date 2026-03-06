import React, { useMemo, useState } from "react";
import type { SupabaseBioEntry } from "../../../types/supabase";

type Props = {
  bios: SupabaseBioEntry[];
};

type EditState = {
  id: string;
  slug: string;
  name: string;
  role: string;
  rank: string;
  portraitBase: string;
  bioText: string;
};

const toEditState = (entry: SupabaseBioEntry): EditState => ({
  id: entry.id,
  slug: entry.slug,
  name: entry.name,
  role: entry.role ?? "",
  rank: String(entry.rank),
  portraitBase: entry.portraitBase ?? "",
  bioText: entry.bio.join("\n\n"),
});

const SupabaseBiosPanel: React.FC<Props> = ({ bios }) => {
  const [entries, setEntries] = useState(bios);
  const [selectedId, setSelectedId] = useState(bios[0]?.id ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? null,
    [entries, selectedId]
  );

  const [editState, setEditState] = useState<EditState | null>(
    selected ? toEditState(selected) : null
  );

  React.useEffect(() => {
    if (!selected) {
      setEditState(null);
      return;
    }
    setEditState(toEditState(selected));
  }, [selected]);

  const refresh = async () => {
    const response = await fetch("/api/supabase/bios");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Impossible de charger les bios.");
    }
    setEntries(payload.entries ?? []);
    setSelectedId((current: string | null) => {
      if (current && (payload.entries ?? []).some((entry: SupabaseBioEntry) => entry.id === current)) {
        return current;
      }
      return payload.entries?.[0]?.id ?? null;
    });
  };

  const save = async () => {
    if (!editState) return;

    const rank = Number(editState.rank);
    if (!Number.isFinite(rank)) {
      setStatus("Le rang doit être numérique.");
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/supabase/bios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editState.id,
          slug: editState.slug,
          name: editState.name,
          role: editState.role,
          rank,
          portraitBase: editState.portraitBase,
          bio: editState.bioText
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Échec de sauvegarde.");
      }

      setEntries(payload.entries ?? []);
      setStatus("Bio sauvegardée.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Échec de sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bios-panel">
      <header className="bios-panel__header">
        <h3>Bios de l’équipe</h3>
        <button onClick={refresh} type="button" className="bios-panel__refresh">↻</button>
      </header>
      <div className="bios-panel__body">
        <aside className="bios-panel__list">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={entry.id === selectedId ? "bios-panel__entry bios-panel__entry--active" : "bios-panel__entry"}
              onClick={() => setSelectedId(entry.id)}
            >
              <span>{entry.rank}. {entry.name}</span>
              <small>{entry.slug}</small>
            </button>
          ))}
        </aside>
        {editState ? (
          <div className="bios-panel__form">
            <input value={editState.name} onChange={(e) => setEditState({ ...editState, name: e.target.value })} placeholder="Nom" />
            <input value={editState.slug} onChange={(e) => setEditState({ ...editState, slug: e.target.value })} placeholder="Slug" />
            <input value={editState.role} onChange={(e) => setEditState({ ...editState, role: e.target.value })} placeholder="Rôle" />
            <input value={editState.rank} onChange={(e) => setEditState({ ...editState, rank: e.target.value })} placeholder="Rang" />
            <input
              value={editState.portraitBase}
              onChange={(e) => setEditState({ ...editState, portraitBase: e.target.value })}
              placeholder="portrait_base"
            />
            <textarea
              value={editState.bioText}
              onChange={(e) => setEditState({ ...editState, bioText: e.target.value })}
              rows={10}
              placeholder="Biographie (paragraphes séparés par une ligne vide)"
            />
            <div className="bios-panel__footer">
              <button onClick={save} type="button" disabled={saving}>
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
              {status && <p>{status}</p>}
            </div>
          </div>
        ) : (
          <p className="bios-panel__empty">Sélectionnez une bio pour commencer.</p>
        )}
      </div>
      <style jsx>{`
        .bios-panel { border: 1px solid rgba(0,0,0,.08); border-radius: 14px; padding: 10px; min-height: 0; display:flex; flex-direction:column; overflow:hidden; }
        .bios-panel__header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .bios-panel__header h3 { margin:0; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#5a5c62; }
        .bios-panel__refresh { width:30px; height:30px; border-radius:50%; border:none; background:#1f1f22; color:#fff; cursor:pointer; }
        .bios-panel__body { display:grid; grid-template-columns: 240px minmax(0,1fr); gap: 10px; min-height:0; flex:1; overflow:hidden; }
        .bios-panel__list { display:flex; flex-direction:column; gap:6px; overflow-y:auto; min-height:0; }
        .bios-panel__entry { text-align:left; border:1px solid rgba(0,0,0,.08); background:#fff; padding:8px 10px; border-radius:10px; display:flex; flex-direction:column; gap:2px; }
        .bios-panel__entry small { color:#787a80; }
        .bios-panel__entry--active { border-color: rgba(36,119,70,.35); box-shadow: inset 0 0 0 1px rgba(36,119,70,.2); }
        .bios-panel__form { display:grid; gap:8px; min-height:0; overflow-y:auto; padding-right:4px; }
        .bios-panel__form input, .bios-panel__form textarea { border:1px solid rgba(0,0,0,.12); border-radius:10px; padding:8px 10px; font:inherit; }
        .bios-panel__footer { display:flex; align-items:center; gap:8px; }
        .bios-panel__footer button { border:none; border-radius:999px; padding:8px 12px; background:#2b7a4a; color:#fff; text-transform:uppercase; font-size:11px; letter-spacing:.08em; }
        .bios-panel__footer p { margin:0; font-size:12px; color:#5a5c62; }
        .bios-panel__empty { margin:0; border:1px dashed rgba(0,0,0,.15); border-radius:10px; padding:18px; color:#7a7c82; font-size:12px; align-self:center; }
        @media (max-width: 900px) {
          .bios-panel__body { grid-template-columns: minmax(0,1fr); }
          .bios-panel__list { max-height: 220px; }
        }
      `}</style>
    </section>
  );
};

export default SupabaseBiosPanel;
