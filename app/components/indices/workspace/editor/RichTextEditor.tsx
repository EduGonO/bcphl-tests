import React, { useMemo } from "react";
import TurndownService from "turndown";
import { marked } from "marked";
import RichTextEditorQuill from "./RichTextEditor.Quill";
import RichTextEditorTipTap from "./RichTextEditor.TipTap";

export type RichTextEditorMode = "quill" | "tiptap";

type Props = {
  value: string;
  htmlValue?: string;
  onChange: (markdown: string, html: string, json?: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  mode?: RichTextEditorMode;
};

const normalizeMarkdown = (markdown: string): string =>
  markdown.replace(/\r\n?/g, "\n").replace(/\\+n/g, "\n").replace(/\\(?=\n)/g, "");

const markdownToHtml = (markdown: string): string => {
  const normalized = normalizeMarkdown(markdown);
  return normalized.trim() ? ((marked.parse(normalized, { breaks: true }) as string) ?? "") : "";
};

const RichTextEditor: React.FC<Props> = ({ mode = "quill", value, htmlValue, onChange, ...rest }) => {
  const turndown = useMemo(
    () =>
      new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        emDelimiter: "_",
      }),
    []
  );

  if (mode === "tiptap") {
    return (
      <RichTextEditorTipTap
        value={htmlValue || markdownToHtml(value)}
        onChange={(html, json) => {
          const markdown = html.trim() ? normalizeMarkdown(turndown.turndown(html)) : "";
          onChange(markdown, html, json);
        }}
        {...rest}
      />
    );
  }

  return <RichTextEditorQuill value={value} onChange={onChange} {...rest} />;
};

export default RichTextEditor;
