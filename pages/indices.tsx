import React, {
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
  useRef,
} from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Header from "../app/components/Header";

// ---------- types ----------
export type TextEntry = { title: string; slug: string };
export type Category = { name: string; texts: TextEntry[] };
type Props = { indices: Category[] };

// ---------- helpers ----------
const fetchFile = async (cat: string, slug: string): Promise<string> => {
  const res = await fetch(
    `/api/file?cat=${encodeURIComponent(cat)}&slug=${encodeURIComponent(slug)}`
  );
  if (!res.ok) throw new Error("Cannot load file");
  return res.text();
};
const saveFile = async (
  cat: string,
  slug: string,
  body: string
): Promise<void> => {
  const res = await fetch(`/api/save-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cat, slug, body }),
  });
  if (!res.ok) throw new Error("Cannot save file");
};

// ---------- ui ----------
const Indices: React.FC<Props> = ({ indices }) => {
  // ui state ------------------------------------------------
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [selCat, setSelCat] = useState<string | null>(null);
  const [selSlug, setSelSlug] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const txtRef = useRef<HTMLTextAreaElement | null>(null);

  // toggle folder
  const toggle = (name: string) =>
    setOpen((o) => ({ ...o, [name]: !o[name] }));

  // load file when selected --------------------------------
  const load = useCallback(
    async (cat: string, slug: string) => {
      try {
        setStatus("loading");
        const body = await fetchFile(cat, slug);
        setSelCat(cat);
        setSelSlug(slug);
        setContent(body);
        setDirty(false);
        setStatus("idle");
        // focus editor
        setTimeout(() => txtRef.current?.focus(), 50);
      } catch {
        setStatus("error");
      }
    },
    []
  );

  // save handler -------------------------------------------
  const handleSave = useCallback(async () => {
    if (!selCat || !selSlug || !dirty) return;
    try {
      setStatus("saving");
      await saveFile(selCat, selSlug, content);
      setDirty(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    } catch {
      setStatus("error");
    }
  }, [selCat, selSlug, content, dirty]);

  // cmd/ctrl-S shortcut ------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey as any);
    return () => window.removeEventListener("keydown", onKey as any);
  }, [handleSave]);

  // --------------------------------------------------------
  return (
  <>
    <Head>
      <title>Files – BICÉPHALE</title>
    </Head>

    <Header
      categories={indices.map(c => ({ name: c.name, color: "#607d8b" }))}
    />

    {/* ───────── LAYOUT ───────── */}
    <div className="indices-layout">
      {/* ---------- sidebar ---------- */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Files</h2>

        {indices.map(cat => (
          <div key={cat.name}>
            {/* folder row */}
            <button
              onClick={() => toggle(cat.name)}
              className="folder-btn"
            >
              <span className="ellipsis">{cat.name}</span>
              <span className="arrow">{open[cat.name] ? "▼" : "►"}</span>
            </button>

            {/* file list */}
            {open[cat.name] && (
              <ul className="file-list">
                {cat.texts.map(t => {
                  const active = selCat === cat.name && selSlug === t.slug;
                  return (
                    <li key={t.slug}>
                      <button
                        onClick={() => load(cat.name, t.slug)}
                        className={`file-btn${active ? " active" : ""}`}
                      >
                        {t.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </aside>

      {/* ---------- editor pane ---------- */}
      <section className="editor-pane">
        {selCat && selSlug ? (
          <>
            <header className="toolbar">
              <span className="ellipsis">
                {selCat}/{selSlug}.md
              </span>
              <button
                onClick={handleSave}
                disabled={!dirty || status === "saving"}
                className="save-btn"
              >
                {status === "saving" ? "Saving…" : "Save"}
              </button>
            </header>

            <textarea
              ref={txtRef}
              value={content}
              onChange={e => {
                setContent(e.target.value);
                setDirty(true);
              }}
              className="editor"
            />
          </>
        ) : (
          <div className="empty-hint">Select a file to begin.</div>
        )}
      </section>
    </div>

    <style jsx>{`
      /* ---------- layout ---------- */
      .indices-layout {
        display: flex;
        height: calc(100vh - 64px); /* header ≈64 px */
        background: #fff;
      }
      /* ---------- sidebar ---------- */
      .sidebar {
        width: 260px;
        padding: 16px;
        overflow-y: auto;
        background: #f7f7f7;
        border-right: 1px solid #ddd;
      }
      .sidebar-title {
        margin: 0 0 12px;
        font: 600 18px/1 Helvetica, Arial, sans-serif;
      }
      .folder-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 6px 8px;
        margin-bottom: 2px;
        font: 500 14px/1 Helvetica, Arial, sans-serif;
        background: none;
        border: 0;
        border-radius: 4px;
        cursor: pointer;
      }
      .folder-btn:hover { background: #e5e5e5; }
      .file-list { margin: 2px 0 6px 0; padding: 0 0 0 12px; list-style: none; }
      .file-btn {
        width: 100%;
        padding: 4px 8px;
        font: 400 13px/1 Helvetica, Arial, sans-serif;
        background: none;
        border: 0;
        border-radius: 4px;
        text-align: left;
        cursor: pointer;
      }
      .file-btn:hover   { background: #eef2ff; }
      .file-btn.active  { background: #dbe3ff; color: #0030ff; }
      /* ---------- editor ---------- */
      .editor-pane {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        border-bottom: 1px solid #ddd;
        background: #fff;
        font: 500 14px/1 Helvetica, Arial, sans-serif;
      }
      .save-btn {
        padding: 4px 14px;
        font: 500 13px/1 Helvetica, Arial, sans-serif;
        color: #fff;
        background: #0050ff;
        border: 0;
        border-radius: 4px;
        cursor: pointer;
      }
      .save-btn:disabled { opacity: 0.4; cursor: default; }
      .editor {
        flex: 1 1 0;
        width: 100%;
        padding: 16px;
        font: 14px/1.4 "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        border: 0;
        resize: none;
        background: #fafafa;
        outline: none;
      }
      .empty-hint {
        flex: 1 1 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
        font: 14px/1 Helvetica, Arial, sans-serif;
      }
      /* ---------- helpers ---------- */
      .ellipsis       { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .arrow          { flex-shrink: 0; }
      /* nice scrollbar */
      .sidebar::-webkit-scrollbar,
      .editor::-webkit-scrollbar { width: 8px; }
      .sidebar::-webkit-scrollbar-thumb,
      .editor::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,.25);
        border-radius: 4px;
      }
    `}</style>
  </>
);
};

export const getStaticProps: GetStaticProps = async () => {
  const textsDir = path.join(process.cwd(), "texts");
  const categoryFolders = fs
    .readdirSync(textsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const indices: Category[] = categoryFolders.map((cat) => {
    const catPath = path.join(textsDir, cat);
    const files = fs.readdirSync(catPath).filter((f) => f.endsWith(".md"));
    const texts: TextEntry[] = files.map((file) => {
      const filePath = path.join(catPath, file);
      const raw = fs.readFileSync(filePath, "utf8").trim();
      const first = raw.split("\n")[0].trim();
      const slug = file.replace(/\.md$/, "");
      const title = first.startsWith("#")
        ? first.replace(/^#+\s*/, "")
        : slug;
      return { title, slug };
    });
    return { name: cat, texts };
  });

  return { props: { indices } };
};

export default Indices;
