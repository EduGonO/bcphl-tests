import React, { useState } from "react";
import Head from "next/head";
import TopNav from "../app/components/TopNav";
import RichTextEditorTipTap from "../app/components/indices/workspace/editor/RichTextEditor.TipTap";
import { SimpleEditor } from "../app/components/tiptap-templates/simple/simple-editor";
import { SimpleEditorTemplateUi } from "../app/components/tiptap-templates/simple/simple-editor-template-ui";

type Mode = "current" | "simple-template" | "simple-template-ui";

const EditorPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("current");
  const [value, setValue] = useState("<p>Essayez l'éditeur ici…</p>");

  return (
    <div className="editor-page">
      <Head>
        <title>Bicéphale · Editor</title>
      </Head>
      <TopNav />

      <main className="editor-page__content">
        <div className="editor-page__toggle">
          <button type="button" onClick={() => setMode("current")} className={mode === "current" ? "active" : ""}>
            Current editor
          </button>
          <button
            type="button"
            onClick={() => setMode("simple-template")}
            className={mode === "simple-template" ? "active" : ""}
          >
            Tiptap SimpleEditor template
          </button>
          <button
            type="button"
            onClick={() => setMode("simple-template-ui")}
            className={mode === "simple-template-ui" ? "active" : ""}
          >
            Tiptap template toolbar UI
          </button>
        </div>

        {mode === "current" && (
          <RichTextEditorTipTap value={value} onChange={(html) => setValue(html)} imageUploadSlug="editor" />
        )}

        {mode === "simple-template" && <SimpleEditor imageUploadSlug="editor" />}

        {mode === "simple-template-ui" && <SimpleEditorTemplateUi imageUploadSlug="editor" />}
      </main>

      <style jsx>{`
        .editor-page {
          min-height: 100dvh;
          background: #f8fafc;
        }

        .editor-page__content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px;
        }

        .editor-page__toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .editor-page__toggle button {
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          padding: 8px 12px;
        }

        .editor-page__toggle button.active {
          border-color: #9333ea;
          color: #6b21a8;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default EditorPage;
