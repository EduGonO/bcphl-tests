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
    if (!editState) {
      return;
    }

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
      <header>
        <h3>Bios de l’équipe</h3>
        <button onClick={refresh} type="button">Rafraîchir</button>
      </header>
      <div className="bios-panel__body">
        <aside>
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={entry.id === selectedId ? "active" : ""}
              onClick={() => setSelectedId(entry.id)}
            >
              {entry.rank}. {entry.name}
            </button>
          ))}
        </aside>
        {editState ? (
          <div className="form">
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
            <button onClick={save} type="button" disabled={saving}>
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </button>
            {status && <p>{status}</p>}
          </div>
        ) : (
          <p>Aucune bio sélectionnée.</p>
        )}
      </div>
      <style jsx>{`
        .bios-panel { border: 1px solid rgba(0,0,0,.08); border-radius: 12px; padding: 14px; margin-top: 16px; }
        header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .bios-panel__body { display:grid; grid-template-columns: 260px 1fr; gap: 12px; }
        aside { display:flex; flex-direction:column; gap: 6px; max-height: 500px; overflow:auto; }
        aside button { text-align:left; border:1px solid #ddd; background:#fff; padding:8px; border-radius:8px; }
        aside button.active { border-color:#2b7a4a; }
        .form { display:grid; gap:8px; }
        input, textarea { border:1px solid #ddd; border-radius:8px; padding:8px; font:inherit; }
      `}</style>
    </section>
  );
};

export default SupabaseBiosPanel;
