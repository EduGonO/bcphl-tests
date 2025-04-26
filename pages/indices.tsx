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

    {/* your existing header */}
    <Header
      categories={indices.map(c => ({ name: c.name, color: '#607d8b' }))}
    />

    {/* two-column flex layout, full height minus header */}
    <div className="h-[calc(100vh-64px)] flex bg-white">
      {/* ─── sidebar ─── */}
      <aside className="w-64 bg-gray-50 border-r overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Files</h2>
        {indices.map(cat => (
          <div key={cat.name} className="mb-3">
            <button
              onClick={() => toggle(cat.name)}
              className="w-full flex items-center justify-between px-2 py-1 text-sm font-medium hover:bg-gray-200 rounded"
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-xs">{open[cat.name] ? '▼' : '►'}</span>
            </button>
            {open[cat.name] && (
              <ul className="mt-1 ml-4 space-y-1">
                {cat.texts.map(t => {
                  const active = selCat === cat.name && selSlug === t.slug;
                  return (
                    <li key={t.slug}>
                      <button
                        onClick={() => load(cat.name, t.slug)}
                        className={`block w-full text-left px-2 py-1 text-sm rounded
                          ${active
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-blue-50 text-gray-700'}`}
                      >
                        {t.title}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </aside>

      {/* ─── editor pane ─── */}
      <main className="flex-1 flex flex-col">
        {selCat && selSlug ? (
          <>
            {/* file toolbar */}
            <header className="flex items-center justify-between border-b bg-white p-4">
              <span className="truncate text-sm font-medium">
                {selCat}/{selSlug}.md
              </span>
              <button
                onClick={handleSave}
                disabled={!dirty || status === 'saving'}
                className="px-3 py-1 text-sm font-medium rounded bg-blue-600 text-white disabled:opacity-50"
              >
                {status === 'saving' ? 'Saving…' : 'Save'}
              </button>
            </header>

            {/* full-height textarea */}
            <textarea
              ref={txtRef}
              value={content}
              onChange={e => {
                setContent(e.target.value)
                setDirty(true)
              }}
              className="flex-1 p-6 font-mono text-sm bg-gray-50 outline-none resize-none"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a file to begin.
          </div>
        )}
      </main>
    </div>

    {/* custom scrollbar */}
    <style jsx global>{`
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.25);
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
