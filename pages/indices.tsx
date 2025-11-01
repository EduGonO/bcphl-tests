import Head from "next/head";
import type { GetServerSideProps } from "next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
      <main className="page">
        <div className="layout">

          {/* ---------- sidebar -------------------------------------- */}
          <aside className="nav">
            <div className="panel user">
              <div className="user-meta">
                <span className="user-label">Session</span>
                <span className="user-email">{session?.user?.email}</span>
              </div>
              <button onClick={()=>signOut()} className="lo">Déconnexion</button>
            </div>

            {activeEntry && (
              <section className="panel digest">
                <header className="digest-head">
                  <span className="digest-label">Fiche article</span>
                  <span className={`digest-status ${digestState.tone}`}>
                    {digestState.label}
                  </span>
                </header>
                <div className="digest-title">{yaml.title || activeEntry.title}</div>
                <div className="digest-sub">
                  {[yaml.author || activeEntry.author, yaml.date || activeEntry.date]
                    .filter(Boolean)
                    .join(" · ") || "métadonnées à compléter"}
                </div>
                <dl className="digest-stats">
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
                </dl>
                <dl className="digest-meta">
                  <div>
                    <dt>Image une</dt>
                    <dd>{headerImageName}</dd>
                  </div>
                  <div>
                    <dt>Catégorie</dt>
                    <dd>{cat}</dd>
                  </div>
                  <div>
                    <dt>Slug</dt>
                    <dd>{slug}</dd>
                  </div>
                </dl>
              </section>
            )}

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
                        {e.preview && (
                          <span className="entry-preview">{e.preview}</span>
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
              <h1>Indices</h1>
              {cat && slug ? (
                <span className="stage-sub">{cat} / {slug}</span>
              ) : (
                <span className="stage-sub">Sélectionnez un article</span>
              )}
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
                  >{status==="saving"?"saving…":"enregistrer"}</button>
                  {status==="saved" && <span className="ok">Enregistré</span>}
                </div>
              </>
            ) : <p className="hint">Choisissez un article pour commencer</p>}
          </section>
        </div>
      </main>

      <style jsx>{`
        .page{min-height:calc(100vh - 120px);padding:48px;background:#f4f1ec;display:flex;justify-content:center;}
        .layout{display:flex;gap:32px;width:100%;max-width:1320px;}
        .nav{width:340px;display:flex;flex-direction:column;gap:28px;}
        .panel{padding:20px 22px;border-radius:20px;background:#ffffff;border:1px solid rgba(25,25,25,0.05);
          box-shadow:0 18px 40px rgba(17,17,17,0.04);font-family:"Helvetica Neue",sans-serif;color:#303030;}
        .user{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
        .user-meta{display:flex;flex-direction:column;gap:4px;max-width:200px;}
        .user-label{font-size:11px;text-transform:uppercase;letter-spacing:0.24em;color:#969696;}
        .user-email{font-size:14px;font-weight:500;line-height:1.4;color:#2d2d2d;word-break:break-word;}
        .lo{background:none;border:none;padding:0;font-size:11px;text-transform:uppercase;letter-spacing:0.24em;color:#9c3d28;cursor:pointer;}
        .digest{display:flex;flex-direction:column;gap:18px;}
        .digest-head{display:flex;justify-content:space-between;align-items:center;font-size:11px;text-transform:uppercase;letter-spacing:0.24em;color:#9a9a9a;}
        .digest-label{font-weight:600;}
        .digest-status{font-size:10px;letter-spacing:0.18em;border-radius:999px;padding:4px 12px;border:1px solid rgba(0,0,0,0.08);text-transform:uppercase;color:#7b7b7b;}
        .digest-status.saving{color:#926f1f;border-color:rgba(146,111,31,0.3);background:rgba(146,111,31,0.12);}
        .digest-status.dirty{color:#8d3a2f;border-color:rgba(141,58,47,0.25);background:rgba(141,58,47,0.08);}
        .digest-status.saved{color:#2f7a4a;border-color:rgba(47,122,74,0.28);background:rgba(47,122,74,0.1);}
        .digest-title{font-size:18px;font-weight:600;line-height:1.4;color:#1f1f1f;}
        .digest-sub{font-size:13px;line-height:1.5;color:#6b6b6b;}
        .digest-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}
        .digest-stats div{display:flex;flex-direction:column;gap:4px;}
        .digest-stats dt{font-size:10px;text-transform:uppercase;letter-spacing:0.24em;color:#a0a0a0;}
        .digest-stats dd{margin:0;font-size:15px;font-weight:500;color:#2b2b2b;}
        .digest-meta{display:grid;gap:10px;font-size:11px;color:#6b6b6b;}
        .digest-meta div{display:flex;flex-direction:column;gap:4px;}
        .digest-meta dt{font-size:10px;text-transform:uppercase;letter-spacing:0.26em;color:#a0a0a0;}
        .digest-meta dd{margin:0;font-size:13px;color:#3a3a3a;word-break:break-all;}
        .section{display:flex;flex-direction:column;gap:12px;}
        .cat{display:flex;align-items:center;gap:12px;font-family:"Helvetica Neue",sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:#7d7d7d;padding:0 4px;}
        .cat-indicator{width:10px;height:10px;border-radius:999px;flex-shrink:0;}
        ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;}
        li button{width:100%;border-radius:16px;border:1px solid rgba(0,0,0,0.04);background:#ffffff;padding:16px;text-align:left;
          font-family:"Helvetica Neue",sans-serif;font-size:14px;line-height:1.4;color:#2d2d2d;cursor:pointer;
          transition:background 0.2s ease,border 0.2s ease,transform 0.2s ease;box-shadow:0 12px 24px rgba(15,15,15,0.03);}
        li button:hover{background:#f7f5f2;border-color:rgba(0,0,0,0.1);transform:translateY(-1px);}
        li button.on{border-color:rgba(0,0,0,0.18);background:#f0eeea;}
        .entry-meta{display:block;margin-top:6px;font-size:11px;color:#898989;letter-spacing:0.12em;text-transform:uppercase;}
        .entry-preview{display:block;margin-top:8px;font-size:12px;line-height:1.55;color:#6a6a6a;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
        .stage{flex:1;display:flex;flex-direction:column;gap:24px;padding:36px;border-radius:26px;background:#ffffff;
          border:1px solid rgba(25,25,25,0.05);box-shadow:0 28px 48px rgba(17,17,17,0.05);font-family:"Helvetica Neue",sans-serif;}
        .stage-head{display:flex;flex-direction:column;gap:8px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:16px;}
        .stage-head h1{margin:0;font-weight:500;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;color:#1f1f1f;}
        .stage-sub{font-size:12px;text-transform:uppercase;letter-spacing:0.24em;color:#9b9b9b;}
        .meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
        .meta-field{display:flex;flex-direction:column;gap:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#8b8b8b;}
        .meta-field input,.meta-field select{padding:12px 14px;border-radius:12px;border:1px solid rgba(0,0,0,0.08);font-size:14px;color:#2d2d2d;
          background:#f8f7f5;transition:border 0.2s ease,background 0.2s ease;}
        .meta-field input:focus,.meta-field select:focus{outline:none;border-color:rgba(0,0,0,0.18);background:#ffffff;}
        .meta-upload{display:flex;align-items:center;gap:12px;padding:12px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#8b8b8b;}
        .meta-upload button{padding:10px 18px;border-radius:999px;border:1px solid rgba(0,0,0,0.12);background:#fff;font-size:11px;
          letter-spacing:0.2em;text-transform:uppercase;color:#2d2d2d;cursor:pointer;transition:background 0.2s ease,border 0.2s ease;}
        .meta-upload button:hover{background:#f3f2f0;border-color:rgba(0,0,0,0.18);}
        .thumbs{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;}
        .thumbs img{width:100px;height:72px;object-fit:cover;border-radius:12px;border:1px solid transparent;cursor:pointer;transition:border 0.2s ease,opacity 0.2s ease;}
        .thumbs img:hover{opacity:0.8;}
        .thumbs img.active{border-color:#2d2d2d;}
        .body-field{display:flex;flex-direction:column;gap:10px;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#8b8b8b;}
        textarea{min-height:420px;border-radius:16px;border:1px solid rgba(0,0,0,0.08);padding:20px;font-family:"SF Mono","Source Code Pro",monospace;font-size:14px;line-height:1.6;
          background:#f8f7f5;color:#1f1f1f;transition:border 0.2s ease,background 0.2s ease;}
        textarea:focus{outline:none;border-color:rgba(0,0,0,0.18);background:#ffffff;}
        .stage-footer{display:flex;align-items:center;gap:16px;}
        .save{padding:12px 32px;border-radius:999px;border:1px solid rgba(0,0,0,0.12);background:#111;color:#fff;font-size:11px;
          letter-spacing:0.24em;text-transform:uppercase;cursor:pointer;}
        .save:disabled{opacity:0.4;cursor:default;}
        .ok{font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#4a4a4a;}
        .hint{margin:auto;font-family:"Helvetica Neue",sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9b9b9b;}
        @media (max-width:1200px){
          .page{padding:32px;}
          .layout{flex-direction:column;}
          .nav{width:100%;flex-direction:row;gap:24px;overflow-x:auto;padding-bottom:8px;}
          .panel{min-width:280px;}
          .section{min-width:220px;}
        }
        @media (max-width:720px){
          .page{padding:24px;}
          .layout{gap:24px;}
          .nav{flex-direction:column;}
          .panel{width:100%;}
          .stage{padding:24px;}
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
