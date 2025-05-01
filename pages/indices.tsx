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
import { getSession } from "next-auth/react";
export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session || !["editor","admin"].includes(session.user.role)) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};

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
        const match = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/m.exec(body);
if (match) {
  const yaml = match[1];
  const text = match[2];
  const obj: any = {};
  yaml.split("\n").forEach(line => {
    const [k, ...v] = line.split(":");
    if (k && v.length) obj[k.trim()] = v.join(":").trim();
  });
  setMeta({ title: "", author: "", date: "", "header-image": "", ...obj });
  setContent(text.trim());
} else {
  setMeta({ title: "", author: "", date: "", "header-image": "" });
  setContent(body);
}

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

const [meta, setMeta] = useState({ title: "", author: "", date: "", "header-image": "" });

  // save handler -------------------------------------------
  const handleSave = useCallback(async () => {
    if (!selCat || !selSlug || !dirty) return;
    try {
      setStatus("saving");
      const yaml =
  `---\n` +
  Object.entries(meta)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n") +
  `\n---\n\n`;
await saveFile(selCat, selSlug, yaml + content);

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
    <Head><title>Files – BICÉPHALE</title></Head>
    <Header categories={indices.map(c => ({ name: c.name, color: '#607d8b' }))} />

    <div className="layout">
      {/* ── sidebar ───────────────────────────── */}
      <aside className="nav">
        <div className="summary">
          {indices.length} categories • {indices.reduce((n,c)=>n+c.texts.length,0)} articles
        </div>

        {indices.map(cat => {
          const opened = open[cat.name];
          return (
            <div key={cat.name}>
              <button onClick={() => toggle(cat.name)} className={`row folder${opened?' on':''}`}>
                <span className="ellip">{cat.name}</span>
                <span className="meta">
                  <span className="count">{cat.texts.length}</span>
                  <span className={`arrow ${opened?'open':''}`} />
                </span>
              </button>

              {opened && (
                <ul className="file-ul">
                  {cat.texts.map(t =>{
                    const act = selCat===cat.name && selSlug===t.slug;
                    return (
                      <li key={t.slug}>
                        <button
                          onClick={()=>load(cat.name,t.slug)}
                          className={`row file${act?' act':''}`}
                        >
                          {t.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </aside>

      {/* ── editor ────────────────────────────── */}
      <section className="stage">
        {selCat && selSlug ? (
          <div className="doc">
            <header className="bar">
              <span className="path ellip">{selCat}/{selSlug}.md</span>
              <button
                onClick={handleSave}
                disabled={!dirty || status==='saving'}
                className="save"
              >
                {status==='saving' ? 'Saving…' : 'Save'}
              </button>
            </header>

            <div className="fields">
  {["title", "author", "date", "header-image"].map((key) => (
    <input
      key={key}
      className="meta-input"
      placeholder={key}
      value={meta[key as keyof typeof meta] || ""}
onChange={(e) => {
  setMeta({ ...meta, [key as keyof typeof meta]: e.target.value });
  setDirty(true);
}}
    />
  ))}
</div>

<textarea
  ref={txtRef}
  value={content}
  onChange={e => {setContent(e.target.value); setDirty(true);}}
  className="editor"
/>

          </div>
        ) : (
          <div className="hint">Choisir Article</div>
        )}
      </section>
    </div>

    <style jsx>{`
      :root{
        --bg:#f5f6f7; --nav-bg:#fbfbfb; --nav-border:#e1e3e7;
        --row-hov:#f1f4ff; --row-act:#d6e1ff;
        --txt:#202325; --accent:#0069ff; --shadow:0 3px 8px rgba(0,0,0,.09);
      }
      .layout{display:flex;height:calc(100vh - 64px);background:var(--bg);}

      /* ── nav */
      .nav{width:260px;padding:20px 16px 32px;overflow-y:auto;
           background:var(--nav-bg);border-right:1px solid var(--nav-border);}
      .summary{font:500 13px Helvetica,Arial,sans-serif;color:#666;margin-bottom:14px;}
      .row{width:100%;display:flex;justify-content:space-between;align-items:center;
           border:0;background:none;padding:6px 10px;margin:1px 0;border-radius:6px;
           cursor:pointer;transition:background .12s,opacity .12s;opacity:.55;}
      .row:hover{background:var(--row-hov);opacity:1;}
      .folder{font:500 14px Helvetica,Arial,sans-serif;}
      .folder.on{opacity:1;}
      .file{font:400 13px Helvetica,Arial,sans-serif;padding-left:18px;}
      .file.act{opacity:1;background:var(--row-act);}
      .file-ul{list-style:none;margin:2px 0 6px;padding:0;}
      .meta{display:flex;align-items:center;gap:8px;}
      .count{font:400 11px Helvetica,Arial,sans-serif;color:#777;}
      .arrow{width:0;height:0;border:5px solid transparent;border-left-color:#666;
             transition:transform .15s;}
      .arrow.open{transform:rotate(90deg);}

      /* ── stage / editor */
      .stage{flex:1 1 0;display:flex;flex-direction:column;padding:24px 40px 32px;min-width:0;}
      .doc{flex:1 1 0;display:flex;flex-direction:column;min-height:0;
           background:#fff;border-radius:12px;box-shadow:var(--shadow);}
      .bar{display:flex;justify-content:space-between;align-items:center;padding:10px 18px;
           border-bottom:1px solid #e7e7e7;border-top-left-radius:12px;border-top-right-radius:12px;}
      .path{font:500 13px Helvetica,Arial,sans-serif;color:#555;}
      .save{padding:5px 18px;border:0;border-radius:6px;font:500 13px Helvetica,Arial,sans-serif;
            color:#fff;background:var(--accent);cursor:pointer;transition:opacity .12s;}
      .save:disabled{opacity:.46;cursor:default;}
      .editor{flex:1 1 0;width:100%;border:0;outline:none;resize:none;
              padding:26px 22px;font:14px/1.6 "SFMono-Regular",Consolas,"Liberation Mono",monospace;
              border-bottom-left-radius:12px;border-bottom-right-radius:12px;background:#fcfcfc;}
      .hint{margin:auto;color:#888;font:14px Helvetica,Arial,sans-serif;}
.fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 18px;
  border-bottom: 1px solid #e7e7e7;
  background: #fefefe;
}
.meta-input {
  font: 13px Helvetica, Arial, sans-serif;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

      /* scrollbars */
      .nav::-webkit-scrollbar,.editor::-webkit-scrollbar{width:8px;}
      .nav::-webkit-scrollbar-thumb,.editor::-webkit-scrollbar-thumb{
        background:rgba(0,0,0,.22);border-radius:4px;}
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
