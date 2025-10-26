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

  /* UI ------------------------------------------------------------ */
  return (
    <>
      <Head>
        <title>Bicéphale · Indices</title>
      </Head>
      <TopNav />
      <div className="layout">

        {/* ---------- sidebar -------------------------------------- */}
        <aside className="nav">
          <div className="user">
            {session?.user?.email}
            <button onClick={()=>signOut()} className="lo">logout</button>
          </div>
          {cats.map(c=>(
            <div key={c.name}>
              <div className="cat">
                <span className="cat-indicator" style={{ background: c.color }} />
                <span className="cat-label">{c.name}</span>
              </div>
              <ul>
                {c.entries.map(e=>{
                  const metaParts = [e.author, e.date]
                    .filter(Boolean)
                    .filter(value => !/^unknown\s/i.test(value));
                  return (
                    <li key={e.slug}>
                      <button
                        className={cat===c.name&&slug===e.slug ? "on":""}
                        onClick={()=>load(c.name,e.slug)}
                      >
                        <span className="entry-title">{e.title}</span>
                        {metaParts.length>0 && (
                          <span className="entry-meta">{metaParts.join(" · ")}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* ---------- editor --------------------------------------- */}
        <section className="stage">
          {cat && slug ? (
            <>
              {/* meta */}
              <div className="meta">
                {["title","author","date"].map(k=>(
                  <input key={k} placeholder={k}
                    value={yaml[k]||""}
                    onChange={e=>{ setYaml({...yaml,[k]:e.target.value}); mark(); }}
                  />
                ))}
                {/* header-image selector */}
                <select
                  value={yaml["header-image"]||""}
                  onChange={e=>{ setYaml({...yaml,"header-image":e.target.value}); mark(); }}
                >
                  <option value="">– header image –</option>
                  {images.map(p=>(
                    <option key={p} value={p}>{p.split("/").pop()}</option>
                  ))}
                </select>
                <button onClick={()=>fileRef.current?.click()}>Upload</button>
                <input type="file" ref={fileRef} style={{display:"none"}}
                  accept="image/*"
                  onChange={async e=>{
                    const f = e.target.files?.[0]; if(!f||!cat||!slug)return;
                    const p = await upload(cat,slug,f);
                    setImages(x=>[...x,p]); setYaml({...yaml,"header-image":p}); mark();
                  }}
                />
              </div>

              {/* thumbnails */}
              <div className="thumbs">
                {images.map(p=>(
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p} src={p} alt="" title={p.split("/").pop()}
                    onClick={()=>{ setYaml({...yaml,"header-image":p}); mark(); }}
                  />
                ))}
              </div>

              {/* body */}
              <textarea ref={txtRef} value={body}
                onChange={e=>{ setBody(e.target.value); mark(); }}
              />

              {/* save */}
              <button className="save"
                disabled={status==="saving"}
                onClick={save}
              >{status==="saving"?"Saving…":"Save"}</button>
              {status==="saved" && <span className="ok">✔</span>}
            </>
          ) : <p className="hint">Choose an article</p>}
        </section>
      </div>

      <style jsx>{`
        .layout{display:flex;min-height:calc(100vh - 140px);background:#f8f5f1;}
        .nav{width:280px;overflow:auto;background:#fff7ef;border-right:1px solid #d9cfc0;padding:20px;box-shadow:inset -1px 0 0 rgba(0,0,0,0.04);}
        .user{font:12px/1.4 "Inter",sans-serif;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;color:#6b5242;}
        .lo{background:none;border:none;color:#c24b2a;cursor:pointer;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;}
        .cat{display:flex;align-items:center;gap:10px;font-weight:600;margin:16px 0 8px;font-family:"Inter",sans-serif;text-transform:uppercase;font-size:13px;color:#402d23;}
        .cat-indicator{display:inline-block;width:10px;height:10px;border-radius:50%;flex-shrink:0;}
        .cat-label{flex:1;}
        ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;}
        li button{display:flex;flex-direction:column;gap:2px;width:100%;padding:10px 12px;text-align:left;border:1px solid transparent;background:rgba(255,255,255,0.7);font:13px/1.4 "Inter",sans-serif;cursor:pointer;border-radius:8px;transition:background 0.2s ease,border-color 0.2s ease,transform 0.2s ease;}
        li button:hover{background:#fff;transform:translateX(2px);}
        li button.on{background:#fff3e0;border-color:#f0c28c;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
        .entry-title{font-weight:600;color:#32211b;}
        .entry-meta{font-size:11px;color:#6f5a50;text-transform:uppercase;letter-spacing:0.06em;}
        .stage{flex:1;display:flex;flex-direction:column;padding:28px;gap:16px;}
        .meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;}
        .meta input,.meta select{padding:8px 10px;border:1px solid #d9cfc0;border-radius:6px;font:13px/1.4 "Inter",sans-serif;background:#fff;}
        .thumbs{display:flex;gap:10px;overflow-x:auto;padding:4px 0;}
        .thumbs img{width:88px;height:66px;object-fit:cover;cursor:pointer;border:2px solid transparent;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.08);}
        .thumbs img:hover{border-color:#f0c28c;}
        textarea{flex:1;border:1px solid #d9cfc0;border-radius:8px;padding:14px;font:14px/1.6 "Source Code Pro",monospace;resize:none;background:#fffdfa;box-shadow:inset 0 1px 3px rgba(0,0,0,0.05);}
        .save{align-self:flex-start;padding:10px 26px;background:#c24b2a;color:#fff;border:0;border-radius:999px;cursor:pointer;font-family:"Inter",sans-serif;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;}
        .save:disabled{opacity:0.6;cursor:default;}
        .ok{margin-left:8px;color:#2f7b32;font-weight:600;}
        .hint{margin:auto;color:#7a6759;font-family:"Inter",sans-serif;letter-spacing:0.06em;text-transform:uppercase;}
        @media (max-width:1024px){
          .layout{flex-direction:column;}
          .nav{width:100%;display:flex;flex-direction:column;gap:12px;}
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
