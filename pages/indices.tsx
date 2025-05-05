import fs from "fs";
import path from "path";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Header from "../app/components/Header";

/* ---- types ------------------------------------------------------ */
export type Entry = { title: string; slug: string };
export type Cat   = { name: string; entries: Entry[] };
interface Props   { cats: Cat[] }

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
    setStat("idle"); dirty.current = false;
    const raw  = await fetchText(c, s);
    const img  = await fetchMedia(c, s);
    setImages(img);

    const m = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/m.exec(raw);
    if (m) {
      const meta: Record<string,string> = {};
      m[1].split("\n").forEach(l => {
        const [k, ...v] = l.split(":");
        if (k && v.length) meta[k.trim()] = v.join(":").trim();
      });
      setYaml(meta);
      setBody(m[2].trim());
    } else {
      setYaml({});
      setBody(raw);
    }
    setCat(c); setSlug(s);
    setTimeout(()=>txtRef.current?.focus(),50);
  },[]);

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
      <Head><title>Editor</title></Head>
      <Header categories={cats.map(c=>({name:c.name,color:"#607d8b"}))}/>
      <div className="layout">

        {/* ---------- sidebar -------------------------------------- */}
        <aside className="nav">
          <div className="user">
            {session?.user?.email}
            <button onClick={()=>signOut()} className="lo">logout</button>
          </div>
          {cats.map(c=>(
            <div key={c.name}>
              <div className="cat">{c.name}</div>
              <ul>
                {c.entries.map(e=>(
                  <li key={e.slug}>
                    <button
                      className={cat===c.name&&slug===e.slug ? "on":""}
                      onClick={()=>load(c.name,e.slug)}
                    >{e.title}</button>
                  </li>
                ))}
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
        .layout{display:flex;height:calc(100vh - 64px);}
        .nav{width:240px;overflow:auto;background:#fbfbfb;border-right:1px solid #e1e3e7;padding:16px;}
        .user{font:12px;margin-bottom:12px;display:flex;justify-content:space-between;}
        .lo{background:none;border:none;color:#06f;cursor:pointer;font-size:11px;}
        .cat{font-weight:600;margin:8px 0 4px;}
        ul{list-style:none;padding:0;margin:0;}
        li button{display:block;width:100%;padding:4px 6px;text-align:left;border:0;background:none;font:13px sans-serif;cursor:pointer;}
        li button.on{background:#e6edff;font-weight:600;}
        .stage{flex:1;display:flex;flex-direction:column;padding:20px;gap:12px;}
        .meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;}
        .meta input,.meta select{padding:6px;border:1px solid #ccc;border-radius:4px;font:13px sans-serif;}
        .thumbs{display:flex;gap:8px;overflow-x:auto;padding:4px 0;}
        .thumbs img{width:80px;height:60px;object-fit:cover;cursor:pointer;border:2px solid transparent;}
        textarea{flex:1;border:1px solid #ccc;border-radius:6px;padding:12px;font:14px/1.6 monospace;resize:none;}
        .save{align-self:flex-start;padding:8px 22px;background:#06f;color:#fff;border:0;border-radius:6px;cursor:pointer;}
        .ok{margin-left:6px;color:#090;}
        .hint{margin:auto;color:#888;}
      `}</style>
    </>
  );
};

/* ---- server side list ------------------------------------------ */
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const root = path.join(process.cwd(), "texts");
  const cats = fs.readdirSync(root,{withFileTypes:true})
    .filter(d=>d.isDirectory())
    .map(d=>{
      const catDir = path.join(root,d.name);
      const entries = fs.readdirSync(catDir,{withFileTypes:true})
        .filter(f=>f.isDirectory())
        .map(f=>{
          const artDir = path.join(catDir,f.name);
          // pick markdown file
          const md = fs.readdirSync(artDir).find(x=>x.endsWith(".md"))!;
          const first = fs.readFileSync(path.join(artDir,md),"utf8").split("\n")[0];
          const title = first.startsWith("#") ? first.replace(/^#+\s*/,"") : f.name;
          return { title, slug:f.name };
        });
      return { name:d.name, entries };
    });

  return { props:{ cats } };
};

export default Editor;
