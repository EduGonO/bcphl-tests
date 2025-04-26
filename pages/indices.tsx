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
        categories={indices.map((c) => ({ name: c.name, color: "#607d8b" }))}
      />

      <main className="flex h-[calc(100vh-64px)]"> {/* 64px ≈ Header height */}
        {/* ---------- sidebar ---------- */}
        <aside className="w-64 shrink-0 bg-gray-50 border-r overflow-y-auto">
          <h1 className="px-4 py-3 text-lg font-semibold">Files</h1>
          <nav className="px-2 pb-4 space-y-1 text-sm">
            {indices.map((cat) => (
              <div key={cat.name}>
                <button
                  onClick={() => toggle(cat.name)}
                  className="flex w-full items-center justify-between px-2 py-1 rounded hover:bg-gray-200"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-xs">
                    {open[cat.name] ? "▼" : "►"}
                  </span>
                </button>

                {open[cat.name] && (
                  <ul className="pl-4 mt-0.5 space-y-0.5">
                    {cat.texts.map((t) => {
                      const active =
                        selCat === cat.name && selSlug === t.slug;
                      return (
                        <li key={t.slug}>
                          <button
                            onClick={() => load(cat.name, t.slug)}
                            className={`block w-full text-left px-2 py-0.5 rounded hover:bg-blue-50 ${
                              active ? "bg-blue-100 text-blue-700" : "text-gray-700"
                            }`}
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
          </nav>
        </aside>

        {/* ---------- editor ---------- */}
        <section className="flex flex-col flex-1 min-w-0">
          {selCat && selSlug ? (
            <>
              {/* editor header */}
              <div className="flex items-center justify-between border-b px-4 py-2 bg-white">
                <span className="text-sm font-medium truncate">
                  {selCat}/{selSlug}.md
                </span>
                <button
                  onClick={handleSave}
                  disabled={!dirty || status === "saving"}
                  className="px-3 py-1 text-sm rounded font-medium bg-blue-600 text-white disabled:opacity-50"
                >
                  {status === "saving" ? "Saving…" : "Save"}
                </button>
              </div>

              {/* textarea */}
              <textarea
                ref={txtRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(true);
                }}
                className="flex-1 p-4 font-mono text-sm resize-none outline-none bg-gray-50"
              />
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-400">
              Select a file to begin.
            </div>
          )}
        </section>
      </main>

      {/* subtle scrollbar for textarea */}
      <style jsx>{`
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 100, 0.3);
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
