import React, { useMemo } from "react";
import Link from "next/link";
import { Article } from "../../types";
import { getArticleMediaStyle } from "../../lib/articleMedia";
import { mdToHtml } from "../../lib/markdown";

type PreviewVariant = "reflexion" | "creation" | "irl";

interface RedesignArticlePreviewCardProps {
  article: Article;
  variant: PreviewVariant;
  formatDate: (value: string) => string;
  ctaLabel?: string;
  ctaBackground?: string;
}

type ArticleWithBody = Article & {
  body?: string;
  bodyHtml?: string | null;
  publicBasePath?: string;
  bodyMarkdown?: string;
  content?: string;
  public_path?: string;
};

const createMarkdownPreview = (source: string): string => {
  const filteredLines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || /^>+/.test(line) || /^&gt;+/i.test(line)) return false;
      if (/^\s*!\[[^\]]*]\([^)]+\)\s*$/.test(line)) return false;
      if (/^\s*!\[[^\]]*]:/.test(line)) return false;
      if (/^_+/.test(line)) return false;

      const normalized = line.replace(/^[-*_`#>\s]+/, "").trim();
      return Boolean(normalized);
    })
    .slice(0, 4);

  const cleaned = filteredLines
    .map((line) => line.replace(/^#{1,6}\s*/, ""))
    .join("\n")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleaned) {
    return "";
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]/g);
  if (sentences && sentences.length > 0) {
    const preview = sentences
      .slice(0, 2)
      .join(" ")
      .trim()
      .slice(0, 170)
      .trim();

    if (preview) {
      return preview.endsWith(".") || preview.endsWith("!") || preview.endsWith("?")
        ? preview
        : `${preview}…`;
    }
  }

  const fallback = cleaned.slice(0, 150).trim();
  return fallback ? `${fallback}…` : "";
};

const stripHtmlTags = (html: string): string => {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const buildPreviewSnippet = (article: ArticleWithBody): string => {
  const primaryPreview = article.preview?.trim();

  if (primaryPreview) {
    return primaryPreview;
  }

  const markdownSource =
    (article as any).bodyMarkdown || (article as any).body || (article as any).content;

  if (markdownSource && typeof markdownSource === "string") {
    const markdownPreview = createMarkdownPreview(markdownSource);
    if (markdownPreview) {
      return markdownPreview;
    }
  }

  const htmlSource = (article as any).bodyHtml;
  if (htmlSource && typeof htmlSource === "string") {
    const text = stripHtmlTags(htmlSource);
    const htmlPreview = createMarkdownPreview(text);
    if (htmlPreview) {
      return htmlPreview;
    }
  }

  return "";
};

const RedesignArticlePreviewCard: React.FC<RedesignArticlePreviewCardProps> = ({
  article,
  variant,
  formatDate,
  ctaLabel,
  ctaBackground,
}) => {
  const mediaStyle = getArticleMediaStyle(article);
  const formattedDate = formatDate(article.date);
  const categorySegment = article.categorySlug || article.category;
  const linkHref = `/${categorySegment}/${article.slug}`;
  const linkLabel = ctaLabel || (variant === "creation" ? "découvrir" : "Lire");

  const previewHtml = useMemo(() => {
    const snippet = buildPreviewSnippet(article as ArticleWithBody);
    if (!snippet) {
      return "";
    }

    const basePath = (article as any).publicBasePath || (article as any).public_path;

    try {
      return mdToHtml(snippet, basePath);
    } catch (error) {
      return snippet;
    }
  }, [article]);

  return (
    <Link href={linkHref} legacyBehavior passHref>
      <a className={`article-preview ${variant}`} role="article">
        <div className="article-preview-media" style={mediaStyle} aria-hidden="true" />
        <div className="article-preview-body">
          <div className="article-preview-header">
            <h3 className="article-preview-title">{article.title}</h3>
            {article.author && (
              <p className="article-preview-author">{article.author}</p>
            )}
          </div>
          {article.date && (
            <time className="article-preview-date" dateTime={article.date}>
              {formattedDate}
            </time>
          )}
          {previewHtml && (
            <div
              className="article-preview-text"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
          <span
            className={`article-preview-cta ${variant}`}
            style={ctaBackground ? { background: ctaBackground } : undefined}
          >
            {linkLabel}
          </span>
        </div>
        <style jsx>{`
          .article-preview {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 18px 18px 20px;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            transition: background-color 0.14s ease;
            text-decoration: none;
            color: inherit;
            cursor: pointer;
            pointer-events: auto;
            width: 100%;
            box-sizing: border-box;
          }
          .article-preview-media {
            width: 100%;
            height: 200px;
            max-height: 200px;
            background-position: left center;
            background-repeat: no-repeat;
            background-size: auto 100%;
            background-color: transparent;
          }
          .article-preview-body {
            display: flex;
            flex-direction: column;
            font-family: "EnbyGertrude", sans-serif;
            color: #000000;
            position: relative;
            z-index: 1;
          }
          .article-preview-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 6px 0 8px;
          }
          .article-preview-title {
            margin: 0;
            font-family: "GayaRegular", serif;
            font-size: clamp(26px, 5vw, 36px);
            line-height: 1.18;
            color: #000000;
          }
          .article-preview-author {
            margin: 0;
            font-family: "GayaRegular", serif;
            font-size: clamp(18px, 4vw, 24px);
            line-height: 1.22;
            text-align: right;
            color: #000000;
            letter-spacing: normal;
          }
          .article-preview-date {
            font-family: "GayaRegular", serif;
            font-size: clamp(14px, 3vw, 18px);
            color: #000000;
            margin: 0 0 6px;
            letter-spacing: normal;
          }
          .article-preview-text {
            font-size: 15px;
            line-height: 1.5;
            color: #000000;
            margin-bottom: 6px;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .article-preview-text :global(p) {
            margin: 0;
          }
          .article-preview-text :global(p + p) {
            margin-top: 10px;
          }
          .article-preview-cta {
            display: inline-flex;
            align-self: flex-start;
            align-items: center;
            justify-content: center;
            font-family: "EnbyGertrude", sans-serif;
            font-size: 14px;
            letter-spacing: 0.05em;
            padding: 6px 16px;
            border-radius: 999px;
            transition: transform 0.2s ease;
            margin-top: 0;
          }
          .article-preview-cta.reflexion {
            background: #c1c1f4;
            color: #111111;
          }
          .article-preview-cta.creation {
            background: #f4f0a7;
            color: #111111;
          }
          .article-preview-cta.irl {
            background: #b8e0ff;
            color: #111111;
          }
          @media (max-width: 720px) {
            .article-preview {
              padding: 20px 20px 24px;
            }
          }
        `}</style>
        <style jsx global>{`
          a.article-preview:hover,
          a.article-preview:focus-visible {
            background-color: rgba(0, 0, 0, 0.08);
          }
          a.article-preview:hover .article-preview-cta,
          a.article-preview:focus-visible .article-preview-cta {
            transform: translateY(-1px);
          }
        `}</style>
      </a>
    </Link>
  );
};

export default RedesignArticlePreviewCard;
