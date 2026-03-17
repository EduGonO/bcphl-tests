import React, { useMemo } from "react";
import TurndownService from "turndown";
import { marked } from "marked";
import RichTextEditorTipTap from "./RichTextEditor.TipTap";

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
  return normalized.trim() ? ((marked.parse(normalized, { breaks: true }) as string) ?? "") : "";
};

const RichTextEditor: React.FC<Props> = ({ value, htmlValue, onChange, placeholder, readOnly, imageUploadSlug }) => {
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
    <RichTextEditorTipTap
      value={htmlValue || markdownToHtml(value)}
      onChange={(html, json) => {
        const markdown = html.trim() ? normalizeMarkdown(turndown.turndown(html)) : "";
        onChange(markdown, html, json);
      }}
      placeholder={placeholder}
      readOnly={readOnly}
      imageUploadSlug={imageUploadSlug}
    />
  );
};

export default RichTextEditor;
