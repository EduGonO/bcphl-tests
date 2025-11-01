import Head from "next/head";
import type { GetServerSideProps } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import TopNav from "../app/components/TopNav";
import { Article } from "../types";
import { getArticleRecords } from "../lib/articleService";
import {
  categoryConfigMap,
  defaultCategoryColor,
} from "../config/categoryColors";

/* ---- types ------------------------------------------------------ */
export type Entry = Article;
export type Cat = { id: string; name: string; color: string; entries: Entry[] };
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
  const [catId, setCatId] = useState<string | null>(null);
  const [catLabel, setCatLabel] = useState<string | null>(null);
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
  const load = useCallback(async (c: Cat, s: string) => {
    setStat("idle");
    dirty.current = false;

    const raw = await fetchText(c.id, s);
    const mediaList = await fetchMedia(c.id, s);

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

    setCatId(c.id);
    setCatLabel(c.name);
    setSlug(s);
    setTimeout(() => txtRef.current?.focus(), 50);
  }, []);

  /* save ---------------------------------------------------------- */
  const save = useCallback(async () => {
    if (!catId || !slug || !dirty.current) return;
    setStat("saving");
    const front =
      "---\n" +
      Object.entries(yaml).map(([k,v])=>`${k}: ${v}`).join("\n") +
      "\n---\n\n";
    await saveText(catId, slug, front + body);
    dirty.current = false;
    setStat("saved"); setTimeout(()=>setStat("idle"),1200);
  },[catId,slug,yaml,body]);

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
            <div className="nav-surface">
              <header className="nav-header">
                <div className="nav-ident">
                  <span className="nav-title">Bibliothèque</span>
                  <span className="nav-subtitle">Textes éditoriaux</span>
                </div>
                <div className="nav-user">
                  <span className="nav-email">{session?.user?.email}</span>
                  <button onClick={()=>signOut()} className="nav-signout">Se déconnecter</button>
                </div>
              </header>

              <div className="nav-groups">
                {cats.map(c=>(
                  <section className="section" key={c.id}>
                    <header className="cat">
                      <span className="cat-indicator" style={{ background: c.color }} />
                      <div className="cat-meta">
                        <span className="cat-label">{c.name}</span>
                        <span className="cat-count">{c.entries.length} fichier{c.entries.length>1?"s":""}</span>
                      </div>
                    </header>
                    <ul>
                      {c.entries.map(e=>(
                        <li key={e.slug}>
                          <button
                            className={catId===c.id&&slug===e.slug ? "on":""}
                            onClick={()=>load(c,e.slug)}
                            aria-current={catId===c.id&&slug===e.slug ? "page":undefined}
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
              </div>
            </div>
          </aside>

          {/* ---------- editor --------------------------------------- */}
          <section className="stage">
            <header className="stage-head">
              <h1>Indices</h1>
              {catLabel && slug ? (
                <span className="stage-sub">{catLabel} / {slug}</span>
              ) : (
                <span className="stage-sub">Sélectionnez un article</span>
              )}
            </header>

            {catId && slug ? (
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
                        const f = e.target.files?.[0]; if(!f||!catId||!slug)return;
                        const p = await upload(catId,slug,f);
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
        .layout{display:flex;gap:32px;width:100%;max-width:1280px;}
        .nav{width:320px;display:flex;}
        .nav-surface{background:#ffffff;border:1px solid rgba(25,25,25,0.04);border-radius:24px;padding:28px 26px;
          box-shadow:0 22px 60px rgba(17,17,17,0.06);display:flex;flex-direction:column;gap:32px;width:100%;}
        .nav-header{display:flex;flex-direction:column;gap:18px;padding-bottom:18px;border-bottom:1px solid rgba(0,0,0,0.06);}
        .nav-ident{display:flex;flex-direction:column;gap:4px;font-family:"Helvetica Neue",sans-serif;}
        .nav-title{font-size:17px;font-weight:500;letter-spacing:0.32em;text-transform:uppercase;color:#1f1f1f;}
        .nav-subtitle{font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#9b9b9b;}
        .nav-user{display:flex;flex-direction:column;gap:6px;font-family:"Helvetica Neue",sans-serif;}
        .nav-email{font-size:13px;color:#4a4a4a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .nav-signout{align-self:flex-start;padding:8px 16px;border-radius:999px;border:1px solid rgba(0,0,0,0.08);background:#f9f7f4;
          font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a5042;cursor:pointer;transition:all 0.2s ease;}
        .nav-signout:hover{background:#efeae3;border-color:rgba(0,0,0,0.16);}
        .nav-groups{display:flex;flex-direction:column;gap:28px;}
        .section{display:flex;flex-direction:column;gap:14px;}
        .cat{display:flex;gap:14px;align-items:center;}
        .cat-indicator{width:10px;height:10px;border-radius:999px;flex-shrink:0;}
        .cat-meta{display:flex;flex-direction:column;gap:4px;font-family:"Helvetica Neue",sans-serif;}
        .cat-label{font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#2d2d2d;}
        .cat-count{font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a3a3a3;}
        ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;}
        li button{width:100%;border-radius:16px;padding:14px 18px;text-align:left;font-family:"Helvetica Neue",sans-serif;font-size:14px;
          line-height:1.45;color:#2d2d2d;cursor:pointer;position:relative;border:none;background:rgba(255,255,255,0.6);
          transition:background 0.2s ease,transform 0.2s ease,box-shadow 0.2s ease;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.05);}
        li button:hover{background:#f3f2f0;transform:translateX(2px);}
        li button.on{background:#ece7df;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.12);}
        li button.on::before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:4px;border-radius:999px;background:#1f1f1f;}
        .entry-meta{display:block;margin-top:6px;font-size:12px;color:#7a7a7a;letter-spacing:0.08em;text-transform:uppercase;}
        .stage{flex:1;display:flex;flex-direction:column;gap:24px;padding:32px;border-radius:20px;background:#ffffff;
          border:1px solid rgba(25,25,25,0.05);box-shadow:0 18px 40px rgba(17,17,17,0.04);font-family:"Helvetica Neue",sans-serif;}
        .stage-head{display:flex;flex-direction:column;gap:8px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:16px;}
        .stage-head h1{margin:0;font-weight:500;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;color:#1f1f1f;}
        .stage-sub{font-size:12px;text-transform:uppercase;letter-spacing:0.24em;color:#9b9b9b;}
        .meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;}
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
          .nav{width:100%;}
        }
        @media (max-width:720px){
          .page{padding:24px;}
          .layout{gap:24px;}
          .stage{padding:24px;}
          textarea{min-height:320px;}
        }
      `}</style>
    </>
  );
};

/* ---- server side list ------------------------------------------ */
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const records = getArticleRecords().filter(
    (record) => record.sourceType === "flat"
  );
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

  const displayMap: Record<string, { name: string; color: string }> = {
    creation: {
      name: "Création",
      color: categoryConfigMap["Creation"]?.color ?? defaultCategoryColor,
    },
    reflexion: {
      name: "Réflexion",
      color: categoryConfigMap["Reflexion"]?.color ?? defaultCategoryColor,
    },
  };

  const articlesByCategory = new Map<string, Entry[]>();
  records.forEach((record) => {
    const article = record.article;
    const key = article.category.toLowerCase();
    if (!order.includes(key)) {
      return;
    }
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
      const meta = displayMap[key] ?? { name: key, color: defaultCategoryColor };
      const entries = [...items].sort((a, b) => parseDate(b.date) - parseDate(a.date));
      return {
        id: key,
        name: meta.name,
        color: meta.color,
        entries,
      };
    })
    .filter((cat): cat is Cat => Boolean(cat));

  return { props: { cats } };
};

export default Editor;
