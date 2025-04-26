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

    <Header categories={indices.map(c => ({ name: c.name, color: "#607d8b" }))} />

    {/* ───────── layout ───────── */}
    <div className="layout">
      {/* === sidebar === */}
      <aside className="nav">
        <h2 className="nav-title">Files</h2>

        {indices.map(cat => (
          <div key={cat.name}>
            <button
              onClick={() => toggle(cat.name)}
              className="row folder"
            >
              <span className="ellip">{cat.name}</span>
              <span className={`arrow ${open[cat.name] ? "open" : ""}`} />
            </button>

            {open[cat.name] && (
              <ul className="file-ul">
                {cat.texts.map(t => {
                  const active = selCat === cat.name && selSlug === t.slug;
                  return (
                    <li key={t.slug}>
                      <button
                        onClick={() => load(cat.name, t.slug)}
                        className={`row file${active ? " act" : ""}`}
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

      {/* === editor === */}
      <section className="stage">
        {selCat && selSlug ? (
          <div className="doc">
            <header className="bar">
              <span className="pill ellip">{selCat}/{selSlug}.md</span>
              <button
                onClick={handleSave}
                disabled={!dirty || status === "saving"}
                className="save"
              >
                {status === "saving" ? "Saving…" : "Save"}
              </button>
            </header>

            <textarea
              ref={txtRef}
              value={content}
              onChange={e => { setContent(e.target.value); setDirty(true); }}
              className="editor"
            />
          </div>
        ) : (
          <div className="hint">Select a file</div>
        )}
      </section>
    </div>

    {/* ───────── styles ───────── */}
    <style jsx>{`
      :root{
        --bg:#f6f7f8;
        --nav-bg:#fafafa;
        --nav-border:#e2e4e8;
        --row-hover:#eef2ff;
        --row-active:#dbe4ff;
        --txt:#2f3437;
        --accent:#0069ff;
      }
      .layout{
        display:flex;
        height:calc(100vh - 64px);
        background:var(--bg);
      }
      /* ---- sidebar ---- */
      .nav{
        width:260px;
        padding:20px 16px 32px;
        overflow-y:auto;
        background:var(--nav-bg);
        border-right:1px solid var(--nav-border);
      }
      .nav-title{
        margin:0 0 16px;
        font:600 18px/1.2 Helvetica,Arial,sans-serif;
        color:var(--txt);
      }
      .row{
        width:100%;
        display:flex;
        justify-content:space-between;
        align-items:center;
        border:0;
        background:transparent;
        padding:6px 10px;
        margin:1px 0;
        font:500 14px/1 Helvetica,Arial,sans-serif;
        color:var(--txt);
        border-radius:6px;
        cursor:pointer;
        transition:background .1s;
      }
      .row:hover{background:var(--row-hover);}
      .folder{font-weight:600;}
      .file{font-weight:400;font-size:13px;padding-left:16px;}
      .file.act{background:var(--row-active);color:var(--accent);}
      .arrow{
        width:0;height:0;border:5px solid transparent;border-left-color:var(--txt);margin-left:8px;transition:transform .15s;
      }
      .arrow.open{transform:rotate(90deg);}
      .file-ul{list-style:none;margin:2px 0 6px 0;padding:0;}
      /* ---- editor ---- */
      .stage{flex:1 1 0;display:flex;align-items:center;justify-content:center;padding:40px 60px;min-width:0;}
      .doc{
        display:flex;flex-direction:column;flex:1;min-height:0;
        background:#fff;border-radius:12px;
        box-shadow:0 1px 3px rgba(0,0,0,.06);
      }
      .bar{
        display:flex;justify-content:space-between;align-items:center;
        padding:12px 20px;border-bottom:1px solid #ececec;border-top-left-radius:12px;border-top-right-radius:12px;
      }
      .pill{
        background:#f0f0f0;padding:4px 14px;border-radius:20px;font:500 13px/1 Helvetica,Arial,sans-serif;
      }
      .save{
        padding:5px 18px;border:0;border-radius:6px;font:500 13px/1 Helvetica,Arial,sans-serif;color:#fff;
        background:var(--accent);cursor:pointer;transition:opacity .1s;
      }
      .save:disabled{opacity:.5;cursor:default;}
      .editor{
        flex:1 1 0;border:0;outline:none;resize:none;width:100%;
        padding:28px 24px;font:14px/1.6 "SFMono-Regular",Consolas,"Liberation Mono",monospace;
        border-bottom-left-radius:12px;border-bottom-right-radius:12px;
        background:#fafafa;
      }
      .hint{color:#888;font:14px/1 Helvetica,Arial,sans-serif;}
      /* ---- helpers ---- */
      .ellip{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      /* scrollbars */
      .nav::-webkit-scrollbar,.editor::-webkit-scrollbar{width:8px;}
      .nav::-webkit-scrollbar-thumb,.editor::-webkit-scrollbar-thumb{
        background:rgba(0,0,0,.2);border-radius:4px;
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
