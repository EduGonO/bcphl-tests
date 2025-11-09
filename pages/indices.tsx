import Head from "next/head";
import type { GetServerSideProps } from "next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import TopNav from "../app/components/TopNav";
import SupabaseWorkspace from "../app/components/indices/SupabaseWorkspace";
import { Article } from "../types";
import { getArticleRecords } from "../lib/articleService";
import { categoryConfigMap, defaultCategoryColor } from "../config/categoryColors";
import { getSupabaseServerClient } from "../lib/supabase/serverClient";
import {
  formatSupabaseError,
  loadSupabaseCategorySummaries,
} from "../lib/supabase/content";
import type {
  SupabaseArticleDetail,
  SupabaseCategorySummary,
} from "../types/supabase";

/* ---- types ------------------------------------------------------ */
export type Entry = Article;
export type Cat = { name: string; color: string; entries: Entry[] };

interface Props {
  cats: Cat[];
  supabaseCats: SupabaseCategorySummary[];
  supabaseError?: string | null;
}

/* ---- helpers ---------------------------------------------------- */
const fetchText = (c: string, s: string) =>
  fetch(`/api/file?cat=${c}&slug=${s}`).then(r => r.text());

const fetchMedia = (c: string, s: string) =>
  fetch(`/api/media?cat=${c}&slug=${s}`).then(r => r.json() as Promise<string[]>);

const saveText = (c: string, s: string, body: string) =>
  fetch("/api/save-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cat: c, slug: s, body }),
  });

const upload = async (cat: string, slug: string, file: File) => {
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const r = await fetch("/api/upload-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body : JSON.stringify({ cat, slug, filename: file.name, data }),
  });
  return (await r.json()).path as string;
};

const META_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "author", label: "Auteur" },
  { key: "date", label: "Date" },
] as const;

/* ---- component -------------------------------------------------- */
const Editor: React.FC<Props> = ({ cats, supabaseCats, supabaseError }) => {
  const { data: session } = useSession();

  /* selection */
  const [cat, setCat]   = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  /* doc state */
  const [yaml, setYaml]     = useState<Record<string,string>>({});
  const [body, setBody]     = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStat]   = useState<"idle"|"saving"|"saved"|"err">("idle");
  const txtRef = useRef<HTMLTextAreaElement>(null);
  const fileRef= useRef<HTMLInputElement>(null);

  const dirty = useRef(false);
  const mark  = () => (dirty.current = true);

  /* derived data -------------------------------------------------- */
  const activeEntry = useMemo(() => {
    if (!cat || !slug) return null;
    const category = cats.find((c) => c.name === cat);
    return category?.entries.find((entry) => entry.slug === slug) ?? null;
  }, [cat, slug, cats]);

  const metrics = useMemo(() => {
    const content = body.trim();
    const wordCount = content ? content.split(/\s+/).length : 0;
    const characters = content.replace(/\s+/g, "").length;
    const paragraphs = content ? content.split(/\n{2,}/).filter(Boolean).length : 0;
    const readingMinutes = wordCount === 0 ? 0 : Math.max(1, Math.round(wordCount / 200));

    return {
      wordCount,
      characters,
      paragraphs,
      readingMinutes,
    };
  }, [body]);

  const headerImageName = useMemo(() => {
    const value = yaml["header-image"] ?? "";
    if (!value) return "–";
    const parts = value.split("/");
    return parts[parts.length - 1];
  }, [yaml]);

  const digestState = (() => {
    if (status === "saving") {
      return { label: "enregistrement…", tone: "saving" } as const;
    }
    if (dirty.current) {
      return { label: "modifications non enregistrées", tone: "dirty" } as const;
    }
    if (status === "saved") {
      return { label: "enregistré", tone: "saved" } as const;
    }
    return { label: "stable", tone: "idle" } as const;
  })();

  /* load article -------------------------------------------------- */
  const load = useCallback(async (c: string, s: string) => {
    setStat("idle");
    dirty.current = false;

    const raw = await fetchText(c, s);
    const mediaList = await fetchMedia(c, s);

    let meta: Record<string, string> = {};
    let content = raw;
    const m = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/m.exec(raw);
    if (m) {
      meta = {};
      m[1].split("\n").forEach((l) => {
        const [k, ...v] = l.split(":");
        if (k && v.length) meta[k.trim()] = v.join(":").trim();
      });
      content = m[2].trim();
    }

    setYaml(meta);
    setBody(content);
    setImages(() => {
      const base = Array.from(new Set(mediaList));
      const headerImage = meta["header-image"]?.trim();
      if (headerImage && !base.includes(headerImage)) {
        base.push(headerImage);
      }
      return base;
    });

    setCat(c);
    setSlug(s);
    setTimeout(() => txtRef.current?.focus(), 50);
  }, []);

  /* save ---------------------------------------------------------- */
  const save = useCallback(async () => {
    if (!cat || !slug || !dirty.current) return;
    setStat("saving");
    const front =
      "---\n" +
      Object.entries(yaml).map(([k,v])=>`${k}: ${v}`).join("\n") +
      "\n---\n\n";
    await saveText(cat, slug, front + body);
    dirty.current = false;
    setStat("saved"); setTimeout(()=>setStat("idle"),1200);
  },[cat,slug,yaml,body]);

  /* keyboard shortcut */
  useEffect(()=>{
    const f = (e:KeyboardEvent)=>{
      if((e.metaKey||e.ctrlKey)&&e.key==="s"){ e.preventDefault(); save(); }
    };
    window.addEventListener("keydown",f); return ()=>window.removeEventListener("keydown",f);
  },[save]);

  const entryMeta = (entry: Entry) => {
    const metaParts = [entry.author, entry.date]
      .filter(Boolean)
      .filter(value => !/^unknown\s/i.test(value));
    return metaParts.join(" · ");
  };

  /* UI ------------------------------------------------------------ */
  return (
    <>
      <Head>
        <title>Bicéphale · Indices</title>
      </Head>
      <TopNav />
      <main className="indices">
        <div className="indices__container">
          <div className="indices__layout">
            <aside className="sidebar">
              <div className="sidebar__session">
              <div className="sidebar__session-info">
                <span className="sidebar__session-label">Session</span>
                <span className="sidebar__session-email">{session?.user?.email}</span>
              </div>
              <button onClick={() => signOut()} className="sidebar__signout">Déconnexion</button>
            </div>

            {activeEntry && (
              <section className="summary">
                <div className="summary__header">
                  <span className="summary__label">Résumé</span>
                  <span className={`summary__status summary__status--${digestState.tone}`}>
                    {digestState.label}
                  </span>
                </div>
                <h2 className="summary__title">{yaml.title || activeEntry.title}</h2>
                <p className="summary__meta">
                  {[yaml.author || activeEntry.author, yaml.date || activeEntry.date]
                    .filter(Boolean)
                    .join(" · ") || "Métadonnées à compléter"}
                </p>
                <dl className="summary__grid">
                  <div>
                    <dt>Mots</dt>
                    <dd>{metrics.wordCount.toLocaleString("fr-FR")}</dd>
                  </div>
                  <div>
                    <dt>Lecture</dt>
                    <dd>{metrics.readingMinutes ? `~${metrics.readingMinutes} min` : "–"}</dd>
                  </div>
                  <div>
                    <dt>Paragraphes</dt>
                    <dd>{metrics.paragraphs || "–"}</dd>
                  </div>
                  <div>
                    <dt>Caractères</dt>
                    <dd>{metrics.characters.toLocaleString("fr-FR")}</dd>
                  </div>
                  <div>
                    <dt>Catégorie</dt>
                    <dd>{cat}</dd>
                  </div>
                  <div>
                    <dt>Slug</dt>
                    <dd>{slug}</dd>
                  </div>
                  <div>
                    <dt>Image</dt>
                    <dd>{headerImageName}</dd>
                  </div>
                </dl>
              </section>
            )}

            <div className="sidebar__list">
              {cats.map((c) => (
                <section className="category" key={c.name}>
                  <header className="category__header">
                    <span className="category__dot" style={{ background: c.color }} />
                    <span className="category__label">{c.name}</span>
                  </header>
                  <ul className="category__entries">
                    {c.entries.map((e) => (
                      <li key={e.slug}>
                        <button
                          className={cat === c.name && slug === e.slug ? "entry entry--active" : "entry"}
                          onClick={() => load(c.name, e.slug)}
                        >
                          <span className="entry__title">{e.title}</span>
                          {entryMeta(e) && <span className="entry__meta">{entryMeta(e)}</span>}
                          {e.preview && <span className="entry__preview">{e.preview}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </aside>

          <section className="editor">
            <header className="editor__header">
              <div>
                <h1>Indices</h1>
                <span className="editor__path">
                  {cat && slug ? `${cat} / ${slug}` : "Sélectionnez un article"}
                </span>
              </div>
              {status === "saved" && <span className="editor__badge">Enregistré</span>}
            </header>

            {cat && slug ? (
              <>
                <div className="editor__scroll">
                  <div className="meta">
                    {META_FIELDS.map(({ key, label }) => (
                      <label key={key} className="meta__field">
                        <span>{label}</span>
                        <input
                          value={yaml[key] || ""}
                          onChange={(e) => {
                            setYaml({ ...yaml, [key]: e.target.value });
                            mark();
                          }}
                        />
                      </label>
                    ))}
                    <label className="meta__field">
                      <span>Image d’en-tête</span>
                      <select
                        value={yaml["header-image"] || ""}
                        onChange={(e) => {
                          setYaml({ ...yaml, "header-image": e.target.value });
                          mark();
                        }}
                      >
                        <option value="">– sélectionner –</option>
                        {images.map((p) => (
                          <option key={p} value={p}>
                            {p.split("/").pop()}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="media-tools">
                    <button onClick={() => fileRef.current?.click()} className="media-tools__upload">
                      Importer une image…
                    </button>
                    <input
                      type="file"
                      ref={fileRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f || !cat || !slug) return;
                        const p = await upload(cat, slug, f);
                        setImages((x) => [...x, p]);
                        setYaml({ ...yaml, "header-image": p });
                        mark();
                      }}
                    />
                  </div>

                  {images.length > 0 && (
                    <div className="thumbnails">
                      {images.map((p) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={p}
                          src={p}
                          alt=""
                          title={p.split("/").pop()}
                          className={yaml["header-image"] === p ? "thumbnails__item thumbnails__item--active" : "thumbnails__item"}
                          onClick={() => {
                            setYaml({ ...yaml, "header-image": p });
                            mark();
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <label className="editor__content">
                    <span>Contenu</span>
                    <textarea
                      ref={txtRef}
                      value={body}
                      onChange={(e) => {
                        setBody(e.target.value);
                        mark();
                      }}
                    />
                  </label>
                </div>

                <footer className="editor__footer">
                  <button className="save" disabled={status === "saving"} onClick={save}>
                    {status === "saving" ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  {status === "saving" && <span className="editor__progress">Sauvegarde en cours…</span>}
                  {status === "err" && <span className="editor__error">Erreur lors de l’enregistrement</span>}
                </footer>
              </>
            ) : (
              <div className="editor__empty">Choisissez un article pour commencer</div>
            )}
          </section>
        </div>
        <SupabaseWorkspace categories={supabaseCats} error={supabaseError} />
      </div>
    </main>

      <style jsx>{`
        .indices {
          min-height: calc(100vh - 64px);
          padding: 24px 32px 32px;
          background: #f3f3f5;
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }
        .indices__container {
          width: 100%;
          max-width: 1440px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .indices__layout {
          width: 100%;
          display: flex;
          gap: 24px;
          min-height: calc(100vh - 80px);
        }
        .sidebar {
          width: 340px;
          display: flex;
          flex-direction: column;
          padding: 20px 18px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          box-shadow: 0 12px 24px rgba(15, 15, 15, 0.04);
          gap: 18px;
        }
        .sidebar__session {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .sidebar__session-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: "SF Pro Text", "Helvetica Neue", sans-serif;
        }
        .sidebar__session-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #8b8d94;
        }
        .sidebar__session-email {
          font-size: 13px;
          color: #1f1f23;
          font-weight: 500;
          line-height: 1.3;
          word-break: break-word;
        }
        .sidebar__signout {
          border: none;
          background: transparent;
          color: #a62f21;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          cursor: pointer;
        }
        .summary {
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          padding: 16px;
          background: #fafafb;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .summary__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #83858b;
        }
        .summary__label {
          font-weight: 600;
        }
        .summary__status {
          padding: 2px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 10px;
          letter-spacing: 0.18em;
        }
        .summary__status--idle {
          border-color: rgba(0, 0, 0, 0.08);
          color: #61646b;
        }
        .summary__status--saving {
          border-color: rgba(153, 118, 18, 0.3);
          background: rgba(153, 118, 18, 0.08);
          color: #83630f;
        }
        .summary__status--dirty {
          border-color: rgba(158, 54, 42, 0.3);
          background: rgba(158, 54, 42, 0.08);
          color: #a63c2b;
        }
        .summary__status--saved {
          border-color: rgba(36, 119, 70, 0.28);
          background: rgba(36, 119, 70, 0.08);
          color: #2b7a4a;
        }
        .summary__title {
          margin: 0;
          font-size: 17px;
          line-height: 1.3;
          color: #1b1d21;
          font-weight: 600;
        }
        .summary__meta {
          margin: 0;
          font-size: 12px;
          color: #5a5c62;
          line-height: 1.4;
        }
        .summary__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          font-size: 11px;
        }
        .summary__grid dt {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #8c8e95;
        }
        .summary__grid dd {
          margin: 0;
          font-size: 13px;
          color: #26282d;
          font-weight: 500;
        }
        .sidebar__list {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .category__header {
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-size: 10px;
          color: #7a7c82;
        }
        .category__dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .category__entries {
          list-style: none;
          margin: 8px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .entry {
          width: 100%;
          text-align: left;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 10px;
          background: #ffffff;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          font-family: "SF Pro Text", "Helvetica Neue", sans-serif;
        }
        .entry:hover {
          border-color: rgba(0, 0, 0, 0.18);
          box-shadow: 0 6px 18px rgba(16, 16, 18, 0.08);
        }
        .entry--active {
          border-color: rgba(0, 0, 0, 0.35);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        .entry__title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2024;
          line-height: 1.4;
        }
        .entry__meta {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #787a80;
        }
        .entry__preview {
          font-size: 11px;
          color: #60626a;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .editor {
          flex: 1;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 16px 32px rgba(15, 15, 15, 0.04);
        }
        .editor__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .editor__header h1 {
          margin: 0;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: #1f1f22;
        }
        .editor__path {
          display: block;
          margin-top: 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7a7c82;
        }
        .editor__badge {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(36, 119, 70, 0.12);
          color: #2b7a4a;
        }
        .editor__scroll {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .meta__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #71737b;
        }
        .meta__field input,
        .meta__field select {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #f7f8f9;
          font-size: 13px;
          color: #1f2024;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .meta__field input:focus,
        .meta__field select:focus {
          outline: none;
          border-color: rgba(0, 0, 0, 0.32);
          background: #ffffff;
        }
        .media-tools {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
        }
        .media-tools__upload {
          border: 1px solid rgba(0, 0, 0, 0.16);
          border-radius: 999px;
          padding: 8px 18px;
          background: transparent;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          cursor: pointer;
        }
        .media-tools__upload:hover {
          background: #f1f2f4;
        }
        .thumbnails {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .thumbnails__item {
          width: 96px;
          height: 68px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s ease, opacity 0.2s ease;
        }
        .thumbnails__item:hover {
          opacity: 0.85;
        }
        .thumbnails__item--active {
          border-color: rgba(0, 0, 0, 0.4);
        }
        .editor__content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #6f7178;
        }
        textarea {
          flex: 1;
          min-height: 420px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          padding: 18px;
          font-family: "SF Mono", "Source Code Pro", monospace;
          font-size: 13px;
          line-height: 1.55;
          color: #16181c;
          background: #fdfdfd;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        textarea:focus {
          outline: none;
          border-color: rgba(0, 0, 0, 0.35);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
        }
        .editor__footer {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 18px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          margin-top: 20px;
        }
        .save {
          border-radius: 999px;
          padding: 10px 30px;
          border: none;
          background: #111217;
          color: #ffffff;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          cursor: pointer;
        }
        .save:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .editor__progress,
        .editor__error {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .editor__progress {
          color: #7a5e16;
        }
        .editor__error {
          color: #a02f21;
        }
        .editor__empty {
          margin: auto;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7a7c82;
        }
        @media (max-width: 1200px) {
          .indices {
            padding: 20px;
          }
          .indices__container {
            gap: 18px;
          }
          .indices__layout {
            flex-direction: column;
            height: auto;
          }
          .sidebar {
            width: 100%;
            flex-direction: column;
            padding: 18px;
            max-height: none;
          }
          .sidebar__list {
            max-height: 320px;
          }
        }
        @media (max-width: 768px) {
          .indices {
            padding: 16px;
          }
          .indices__container {
            gap: 16px;
          }
          .indices__layout {
            gap: 16px;
          }
          .editor {
            padding: 20px;
          }
          textarea {
            min-height: 300px;
          }
        }
      `}</style>
    </>
  );
};

/* ---- server side list ------------------------------------------ */
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const allowed = new Set(["creation", "reflexion"]);
  const records = getArticleRecords().filter(
    (record) =>
      record.sourceType === "flat" &&
      allowed.has(record.article.category.toLowerCase())
  );

  const parseDate = (value: string) => {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
    const normalized = value.replace(/(\d{1,2})\s([A-Za-zéûôà]+)\s(\d{4})/, "$3-$2-$1");
    const fallback = Date.parse(normalized);
    return Number.isNaN(fallback) ? 0 : fallback;
  };

  const categoryMeta = new Map<string, { name: string; color: string }>();
  const grouped = new Map<string, Entry[]>();

  records.forEach((record) => {
    const article = record.article;
    const key = article.category.toLowerCase();
    const existing = grouped.get(key) ?? [];
    existing.push(article);
    grouped.set(key, existing);

    if (!categoryMeta.has(key)) {
      const match = Object.entries(categoryConfigMap).find(
        ([name]) => name.toLowerCase() === key
      );
      const displayName = match ? match[0] : article.category;
      const color = match ? match[1].color : defaultCategoryColor;
      categoryMeta.set(key, { name: displayName, color });
    }
  });

  const order = ["creation", "reflexion"];
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA !== -1 || indexB !== -1) {
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }
    return a.localeCompare(b);
  });

  const cats: Cat[] = sortedKeys.map((key) => {
    const items = grouped.get(key) ?? [];
    const meta = categoryMeta.get(key) ?? { name: key, color: defaultCategoryColor };
    const entries = [...items].sort((a, b) => parseDate(b.date) - parseDate(a.date));
    return {
      name: meta.name,
      color: meta.color,
      entries,
    };
  });

  let supabaseCats: SupabaseCategorySummary[] = [];
  let supabaseError: string | null = null;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      supabaseError =
        "Configurer SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY pour activer Supabase.";
    } else {
      supabaseCats = await loadSupabaseCategorySummaries(supabase);
    }
  } catch (error) {
    supabaseError = formatSupabaseError(error);
  }

  return { props: { cats, supabaseCats, supabaseError } };
};

export default Editor;
