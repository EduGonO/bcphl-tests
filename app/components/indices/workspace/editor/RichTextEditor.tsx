import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import TurndownService from "turndown";
import { marked } from "marked";

// Dynamic import to avoid SSR issues with Tiptap (Pages Router compatible)
// Path: app/components/indices/workspace/editor/RichTextEditor.tsx
//    -> app/components/tiptap-templates/simple/SimpleEditor.tsx
// Relative: ../../../tiptap-templates/simple/SimpleEditor
const SimpleEditorClient = dynamic(
  () =>
    import("../../../tiptap-templates/simple/SimpleEditor").then(
      (m) => m.SimpleEditor
    ),
  { ssr: false }
);

export type RichTextEditorMode = "tiptap";

type Props = {
  value: string;
  htmlValue?: string;
  onChange: (markdown: string, html: string, json?: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  mode?: RichTextEditorMode;
  imageUploadSlug?: string;
};

const normalizeMarkdown = (markdown: string): string =>
  markdown.replace(/\r\n?/g, "\n").replace(/\\+n/g, "\n").replace(/\\(?=\n)/g, "");

const markdownToHtml = (markdown: string): string => {
  const normalized = normalizeMarkdown(markdown);
  return normalized.trim()
    ? ((marked.parse(normalized, { breaks: true }) as string) ?? "")
    : "";
};

const RichTextEditor: React.FC<Props> = ({
  value,
  htmlValue,
  onChange,
  placeholder,
  readOnly,
  imageUploadSlug,
}) => {
  const turndown = useMemo(
    () =>
      new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        emDelimiter: "_",
      }),
    []
  );

  return (
    <SimpleEditorClient
      value={htmlValue || markdownToHtml(value)}
      onChange={(html: string, json: any) => {
        const markdown = html.trim()
          ? normalizeMarkdown(turndown.turndown(html))
          : "";
        onChange(markdown, html, json);
      }}
      placeholder={placeholder}
      readOnly={readOnly}
      imageUploadSlug={imageUploadSlug}
    />
  );
};

export default RichTextEditor;
