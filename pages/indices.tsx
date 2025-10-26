import Head from "next/head";
import type { GetServerSideProps } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import TopNav from "../app/components/TopNav";
import { Article } from "../types";
import { getArticleData } from "../lib/articleService";

/* ---- types ------------------------------------------------------ */
export type Entry = Article;
export type Cat = { name: string; color: string; entries: Entry[] };
interface Props { cats: Cat[] }

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
const Editor: React.FC<Props> = ({ cats }) => {
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
      <main className="page">
        <div className="halo" aria-hidden />
        <div className="layout">

          {/* ---------- sidebar -------------------------------------- */}
          <aside className="nav">
            <div className="user">
              <div className="user-meta">
                <span className="user-label">connecté</span>
                <span className="user-email">{session?.user?.email}</span>
              </div>
              <button onClick={()=>signOut()} className="lo">logout</button>
            </div>
            {cats.map(c=>(
              <section className="section" key={c.name}>
                <header className="cat">
                  <span className="cat-indicator" style={{ background: c.color }} />
                  <span className="cat-label">{c.name}</span>
                </header>
                <ul>
                  {c.entries.map(e=>(
                    <li key={e.slug}>
                      <button
                        className={cat===c.name&&slug===e.slug ? "on":""}
                        onClick={()=>load(c.name,e.slug)}
                      >
                        <span className="entry-title">{e.title}</span>
                        {entryMeta(e) && (
                          <span className="entry-meta">{entryMeta(e)}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </aside>

          {/* ---------- editor --------------------------------------- */}
          <section className="stage">
            <header className="stage-head">
              <div>
                <h1>Indices</h1>
                <p>Une édition apaisée pour orchestrer les textes de Bicéphale.</p>
              </div>
              <div className="badge">éditeur</div>
            </header>

            {cat && slug ? (
              <>
                {/* meta */}
                <div className="meta">
                  {META_FIELDS.map(({ key, label }) => (
                    <label key={key} className="meta-field">
                      <span>{label}</span>
                      <input
                        value={yaml[key]||""}
                        onChange={e=>{ setYaml({...yaml,[key]:e.target.value}); mark(); }}
                      />
                    </label>
                  ))}
                  <label className="meta-field">
                    <span>Image d’en-tête</span>
                    <select
                      value={yaml["header-image"]||""}
                      onChange={e=>{ setYaml({...yaml,"header-image":e.target.value}); mark(); }}
                    >
                      <option value="">– sélectionner –</option>
                      {images.map(p=>(
                        <option key={p} value={p}>{p.split("/").pop()}</option>
                      ))}
                    </select>
                  </label>
                  <div className="meta-upload">
                    <button onClick={()=>fileRef.current?.click()}>Importer une image…</button>
                    <input type="file" ref={fileRef} style={{display:"none"}}
                      accept="image/*"
                      onChange={async e=>{
                        const f = e.target.files?.[0]; if(!f||!cat||!slug)return;
                        const p = await upload(cat,slug,f);
                        setImages(x=>[...x,p]); setYaml({...yaml,"header-image":p}); mark();
                      }}
                    />
                  </div>
                </div>

                {/* thumbnails */}
                {images.length>0 && (
                  <div className="thumbs">
                    {images.map(p=>(
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p} src={p} alt=""
                        title={p.split("/").pop()}
                        className={yaml["header-image"]===p ? "active" : ""}
                        onClick={()=>{ setYaml({...yaml,"header-image":p}); mark(); }}
                      />
                    ))}
                  </div>
                )}

                {/* body */}
                <label className="body-field">
                  <span>Contenu</span>
                  <textarea ref={txtRef} value={body}
                    onChange={e=>{ setBody(e.target.value); mark(); }}
                  />
                </label>

                {/* save */}
                <div className="stage-footer">
                  <button className="save"
                    disabled={status==="saving"}
                    onClick={save}
                  >{status==="saving"?"Saving…":"Save"}</button>
                  {status==="saved" && <span className="ok">✔ enregistré</span>}
                </div>
              </>
            ) : <p className="hint">Choisissez un article pour commencer</p>}
          </section>
        </div>
      </main>

      <style jsx>{`
        .page{position:relative;min-height:calc(100vh - 120px);padding:48px 56px 64px;background:#f6f3ee;overflow:hidden;}
        .halo{position:absolute;inset:0;background:
          radial-gradient(circle at 15% 15%,rgba(255,255,255,0.85),transparent 55%),
          radial-gradient(circle at 90% 10%,rgba(255,218,194,0.65),transparent 60%),
          linear-gradient(180deg,rgba(255,255,255,0.7),rgba(247,241,231,0.95));z-index:0;}
        .layout{position:relative;z-index:1;display:flex;min-height:100%;max-width:1400px;margin:0 auto;border-radius:32px;
          box-shadow:0 32px 80px rgba(61,44,33,0.18);overflow:hidden;background:rgba(255,255,255,0.9);
          backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.6);}
        .nav{width:320px;padding:40px 32px 48px;overflow-y:auto;background:linear-gradient(160deg,rgba(255,255,255,0.92),rgba(250,236,220,0.75));
          border-right:1px solid rgba(201,173,150,0.26);display:flex;flex-direction:column;gap:28px;}
        .user{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-radius:20px;
          background:rgba(255,255,255,0.85);box-shadow:inset 0 1px 0 rgba(255,255,255,0.6),0 12px 28px rgba(40,30,20,0.06);
          backdrop-filter:blur(8px);color:#5a4b3f;font-family:"Inter",sans-serif;}
        .user-meta{display:flex;flex-direction:column;gap:4px;}
        .user-label{text-transform:uppercase;font-size:10px;letter-spacing:0.32em;color:#b89c80;}
        .user-email{font-weight:600;font-size:13px;letter-spacing:0.08em;color:#4a3b2e;}
        .lo{background:transparent;border:none;color:#c05a34;cursor:pointer;font-size:11px;text-transform:uppercase;
          letter-spacing:0.2em;font-weight:600;padding:0;margin:0;transition:opacity 0.2s ease;}
        .lo:hover{opacity:0.65;}
        .section{display:flex;flex-direction:column;gap:16px;}
        .cat{display:flex;align-items:center;gap:12px;font-weight:600;font-family:"Inter",sans-serif;text-transform:uppercase;
          font-size:12px;letter-spacing:0.2em;color:#3c2f26;opacity:0.82;}
        .cat-indicator{display:inline-block;width:12px;height:12px;border-radius:999px;box-shadow:0 0 0 2px rgba(255,255,255,0.8);
          flex-shrink:0;}
        .cat-label{flex:1;}
        ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;}
        li button{display:flex;flex-direction:column;gap:6px;width:100%;padding:16px 20px;text-align:left;border:1px solid transparent;
          background:rgba(255,255,255,0.72);font:14px/1.5 "Inter",sans-serif;cursor:pointer;border-radius:20px;
          transition:all 0.25s ease;box-shadow:0 16px 36px rgba(61,44,33,0.08);color:#2d2018;}
        li button:hover{transform:translateY(-2px);background:rgba(255,255,255,0.92);box-shadow:0 22px 46px rgba(61,44,33,0.14);}
        li button.on{background:linear-gradient(145deg,rgba(255,241,226,0.95),rgba(255,223,195,0.95));
          border-color:rgba(255,181,121,0.48);box-shadow:0 26px 56px rgba(73,47,30,0.18);}
        .entry-title{font-weight:600;font-size:15px;}
        .entry-meta{font-size:11px;color:#7b6a5e;text-transform:uppercase;letter-spacing:0.18em;}
        .stage{flex:1;display:flex;flex-direction:column;gap:28px;padding:48px;background:linear-gradient(180deg,rgba(255,255,255,0.94),
          rgba(248,240,232,0.88));backdrop-filter:blur(10px);}
        .stage-head{display:flex;justify-content:space-between;align-items:flex-start;gap:32px;padding-bottom:20px;border-bottom:1px solid rgba(201,173,150,0.2);
          margin-bottom:4px;}
        .stage-head h1{margin:0;font:600 26px/1.2 "Inter",sans-serif;color:#2b2119;letter-spacing:0.1em;text-transform:uppercase;}
        .stage-head p{margin:6px 0 0;font:400 14px/1.7 "Inter",sans-serif;color:#6f5e52;max-width:420px;}
        .badge{text-transform:uppercase;font:600 11px/1 "Inter",sans-serif;letter-spacing:0.3em;padding:12px 20px;border-radius:999px;
          background:rgba(44,34,26,0.08);color:#4b392e;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5);}
        .meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;padding:22px;border-radius:26px;
          background:rgba(255,255,255,0.78);box-shadow:0 20px 48px rgba(64,48,36,0.09);}
        .meta-field{display:flex;flex-direction:column;gap:10px;font:12px/1.4 "Inter",sans-serif;text-transform:uppercase;letter-spacing:0.14em;color:#8a796d;}
        .meta-field input,.meta-field select{padding:14px 16px;border:1px solid rgba(193,173,156,0.45);border-radius:18px;font:14px/1.5 "Inter",sans-serif;
          background:rgba(255,255,255,0.92);color:#3d2f24;transition:border 0.2s ease,box-shadow 0.2s ease;}
        .meta-field input:focus,.meta-field select:focus{outline:none;border-color:rgba(255,181,121,0.6);box-shadow:0 0 0 3px rgba(255,181,121,0.22);
          background:rgba(255,255,255,0.98);}
        .meta-upload{display:flex;align-items:center;justify-content:flex-start;gap:16px;padding:20px;border-radius:22px;
          background:rgba(255,255,255,0.82);box-shadow:inset 0 1px 0 rgba(255,255,255,0.6),0 12px 28px rgba(60,44,33,0.08);
          font:12px/1.4 "Inter",sans-serif;text-transform:uppercase;letter-spacing:0.14em;color:#927d6d;}
        .meta-upload button{padding:12px 22px;border-radius:999px;border:0;background:linear-gradient(140deg,#c2643a,#d6834f);
          color:#fff;cursor:pointer;font:600 12px/1 "Inter",sans-serif;letter-spacing:0.22em;text-transform:uppercase;box-shadow:0 18px 40px rgba(204,112,63,0.28);
          transition:transform 0.2s ease,box-shadow 0.2s ease;}
        .meta-upload button:hover{transform:translateY(-2px);box-shadow:0 24px 48px rgba(204,112,63,0.36);}
        .thumbs{display:flex;gap:18px;overflow-x:auto;padding:6px 2px 12px;margin:0 -6px;}
        .thumbs img{width:112px;height:84px;object-fit:cover;cursor:pointer;border:2px solid transparent;border-radius:22px;
          box-shadow:0 20px 44px rgba(64,48,36,0.12);transition:border-color 0.2s ease,transform 0.2s ease,box-shadow 0.2s ease;}
        .thumbs img:hover{border-color:rgba(255,181,121,0.6);transform:translateY(-4px);box-shadow:0 26px 56px rgba(64,48,36,0.16);}
        .thumbs img.active{border-color:rgba(255,181,121,0.9);box-shadow:0 30px 60px rgba(64,48,36,0.2);}
        .body-field{display:flex;flex-direction:column;gap:14px;font:12px/1.4 "Inter",sans-serif;text-transform:uppercase;letter-spacing:0.14em;color:#8a796d;}
        textarea{flex:1;border:1px solid rgba(193,173,156,0.35);border-radius:28px;padding:26px 30px;font:14px/1.65 "Source Code Pro",monospace;
          resize:none;background:rgba(255,255,255,0.86);box-shadow:0 28px 68px rgba(55,39,28,0.13);color:#2a1f18;min-height:420px;
          transition:border 0.2s ease,box-shadow 0.2s ease;}
        textarea:focus{outline:none;border-color:rgba(255,181,121,0.55);box-shadow:0 32px 80px rgba(55,39,28,0.18);
          background:rgba(255,255,255,0.97);}
        .stage-footer{display:flex;align-items:center;gap:18px;}
        .save{padding:16px 42px;background:linear-gradient(140deg,#c2643a,#d6834f);color:#fff;border:0;border-radius:999px;cursor:pointer;
          font-family:"Inter",sans-serif;font-size:13px;text-transform:uppercase;letter-spacing:0.28em;font-weight:600;
          box-shadow:0 26px 56px rgba(204,112,63,0.35);transition:transform 0.2s ease,box-shadow 0.2s ease;}
        .save:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 34px 68px rgba(204,112,63,0.45);}
        .save:disabled{opacity:0.55;cursor:default;box-shadow:none;}
        .ok{color:#2f7b32;font-weight:600;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;}
        .hint{margin:auto;color:#6f5e52;font-family:"Inter",sans-serif;letter-spacing:0.16em;text-transform:uppercase;opacity:0.7;}
        @media (max-width:1280px){
          .page{padding:32px;}
          .layout{flex-direction:column;}
          .nav{width:100%;border-right:0;border-bottom:1px solid rgba(201,173,150,0.24);border-radius:32px 32px 0 0;}
        }
        @media (max-width:768px){
          .page{padding:24px 18px;}
          .layout{border-radius:24px;}
          .stage{padding:36px 24px;}
          .stage-head{flex-direction:column;align-items:flex-start;}
          .badge{align-self:flex-start;}
          .meta{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));}
          textarea{min-height:320px;}
        }
      `}</style>
    </>
  );
};

/* ---- server side list ------------------------------------------ */
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { articles, categories } = getArticleData();
  const order = ["creation", "reflexion"];

  const parseDate = (value: string) => {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
    const normalized = value.replace(/(\d{1,2})\s([A-Za-zéûôà]+)\s(\d{4})/, "$3-$2-$1");
    const fallback = Date.parse(normalized);
    return Number.isNaN(fallback) ? 0 : fallback;
  };

  const categoryMap = new Map<string, { name: string; color: string }>();
  categories.forEach((category) => {
    const key = category.name.toLowerCase();
    categoryMap.set(key, { name: category.name, color: category.color });
  });

  const articlesByCategory = new Map<string, Entry[]>();
  articles.forEach((article) => {
    const key = article.category.toLowerCase();
    const list = articlesByCategory.get(key) ?? [];
    list.push(article);
    articlesByCategory.set(key, list);
  });

  const getOrderIndex = (value: string) => {
    const index = order.indexOf(value);
    return index === -1 ? order.length : index;
  };

  const sortedKeys = Array.from(articlesByCategory.keys()).sort((a, b) => {
    const indexA = getOrderIndex(a);
    const indexB = getOrderIndex(b);
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    return a.localeCompare(b);
  });

  const cats: Cat[] = sortedKeys
    .map((key) => {
      const items = articlesByCategory.get(key) ?? [];
      if (items.length === 0) {
        return null;
      }
      const meta = categoryMap.get(key) ?? { name: key, color: "#607d8b" };
      const entries = [...items].sort((a, b) => parseDate(b.date) - parseDate(a.date));
      return {
        name: meta.name,
        color: meta.color,
        entries,
      };
    })
    .filter((cat): cat is Cat => Boolean(cat));

  return { props: { cats } };
};

export default Editor;
