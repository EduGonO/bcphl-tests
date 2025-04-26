import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";

// ---------- types ----------
export type TextEntry = { title: string; slug: string };
export type Category = { name: string; texts: TextEntry[] };

type Props = { indices: Category[] };

// ---------- helpers ----------
const fetchFile = async (
  cat: string,
  slug: string,
): Promise<string> => {
  const res = await fetch(`/api/file?cat=${encodeURIComponent(cat)}&slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Cannot load file");
  return res.text();
};

const saveFile = async (
  cat: string,
  slug: string,
  body: string,
): Promise<void> => {
  const res = await fetch("/api/save-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cat, slug, body }),
  });
  if (!res.ok) throw new Error("Cannot save file");
};

// ---------- ui ----------
const Indices: React.FC<Props> = ({ indices }) => {
  // ui state
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [selCat, setSelCat] = useState<string | null>(null);
  const [selSlug, setSelSlug] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");

  // toggle folder
  const toggle = (name: string) => setOpen((o) => ({ ...o, [name]: !o[name] }));

  // load file when selected
  const load = useCallback(async (cat: string, slug: string) => {
    try {
      setStatus("loading");
      const txt = await fetchFile(cat, slug);
      setSelCat(cat);
      setSelSlug(slug);
      setContent(txt);
      setDirty(false);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  // save handler
  const handleSave = useCallback(async () => {
    if (!selCat || !selSlug) return;
    try {
      setStatus("saving");
      await saveFile(selCat, selSlug, content);
      setDirty(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
    }
  }, [selCat, selSlug, content]);

  // ctrl+s shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, handleSave]);

  return (
    <>
      <Head>
        <title>Editor – BICÉPHALE</title>
      </Head>
      <div className="flex h-screen text-sm font-sans bg-gray-50">
        {/* sidebar */}
        <aside className="w-64 border-r border-gray-200 overflow-y-auto bg-white">
          <h1 className="p-4 text-lg font-bold">Files</h1>
          {indices.map((cat) => (
            <div key={cat.name}>
              <button
                onClick={() => toggle(cat.name)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100">
                <span>{cat.name}</span>
                <span>{open[cat.name] ? "▾" : "▸"}</span>
              </button>
              {open[cat.name] && (
                <ul className="pl-6 border-l border-gray-100">
                  {cat.texts.map((t) => (
                    <li key={t.slug}>
                      <button
                        onClick={() => load(cat.name, t.slug)}
                        className={`block w-full text-left px-2 py-1 truncate hover:bg-gray-100 ${
                          selCat === cat.name && selSlug === t.slug ? "bg-gray-200" : ""
                        }`}>
                        {t.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </aside>

        {/* editor */}
        <main className="flex-1 flex flex-col">
          {/* toolbar */}
          <div className="flex items-center justify-between border-b border-gray-200 p-3 bg-white">
            <div className="truncate">
              {selCat && selSlug ? `${selCat}/${selSlug}.md` : "No file selected"}
            </div>
            <button
              onClick={handleSave}
              disabled={!dirty || status === "saving"}
              className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-40">
              {status === "saving" ? "Saving…" : "Save"}
            </button>
          </div>

          {/* text area */}
          <textarea
            className="flex-1 p-4 resize-none outline-none font-mono bg-gray-50"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            spellCheck={false}
          />
        </main>
      </div>
    </>
  );
};

// ---------- data ----------
export const getStaticProps: GetStaticProps = async () => {
  const dir = path.join(process.cwd(), "texts");
  const cats = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const indices: Category[] = cats.map((c) => {
    const files = fs
      .readdirSync(path.join(dir, c))
      .filter((f) => f.endsWith(".md"));
    const texts = files.map((f) => {
      const content = fs.readFileSync(path.join(dir, c, f), "utf-8");
      const line = content.split("\n")[0].replace(/^#+\s*/, "");
      return { title: line || f.replace(/\.md$/, ""), slug: f.replace(/\.md$/, "") };
    });
    return { name: c, texts };
  });

  return { props: { indices } };
};

export default Indices;