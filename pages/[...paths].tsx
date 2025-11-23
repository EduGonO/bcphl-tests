// pages/[...paths].tsx
import React, { useMemo, useState } from "react";
import Script from "next/script";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import TopNav from "../app/components/TopNav";
import Footer from "../app/components/Footer";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
import { findArticleRecord, getArticleData } from "../lib/articleService";
import { Article, Category } from "../types";
import { mdToHtml } from "../lib/markdown";
import { slugify } from "../lib/slug";

type ArticleWithBody = Article & {
  body?: string;
  bodyHtml?: string | null;
  publicBasePath?: string;
};

/* ----- getServerSideProps --------------------------------------- */

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const [category, slug] = (params?.paths as string[]) || [];
  if (!category || !slug) {
    return { notFound: true };
  }

  const record = await findArticleRecord(category, slug);
  if (!record) {
    return { notFound: true };
  }

  const contentHtml = record.bodyHtml || mdToHtml(record.body, record.publicBasePath);

  const { articles, categories } = await getArticleData();
  const normalizedCategorySlug = record.article.categorySlug.toLowerCase();
  const gridArticles = articles.filter(
    (article) =>
      (article.categorySlug || article.category).toLowerCase() === normalizedCategorySlug &&
      article.slug !== record.article.slug
  );

  const searchArticles = articles.filter(
    (article) =>
      !(article.slug === record.article.slug &&
        (article.categorySlug || article.category).toLowerCase() === normalizedCategorySlug)
  );

  const hydratedGridArticles = await Promise.all(
    gridArticles.map(async (article) => {
      const detail = await findArticleRecord(
        article.categorySlug || article.category,
        article.slug
      );

      if (detail) {
        return {
          ...article,
          body: detail.body,
          bodyHtml: detail.bodyHtml,
          publicBasePath: detail.publicBasePath,
        } as ArticleWithBody;
      }

      return article as ArticleWithBody;
    })
  );

  return {
    props: {
      title: record.article.title,
      date: record.article.date,
      author: record.article.author,
      headerImage: record.article.headerImage,
      media: record.article.media,
      category: record.article.category,
      categorySlug: record.article.categorySlug,
      content: contentHtml,
      gridArticles: hydratedGridArticles,
      categories,
      searchArticles,
    },
  };
};

/* ── React page ───────────────────────────────────────────────────── */

interface ArtProps {
  title: string;
  date: string;
  author: string;
  headerImage: string;
  media: string[];
  category: string;
  categorySlug: string;
  content: string;
  gridArticles: ArticleWithBody[];
  categories: Category[];
  searchArticles: Article[];
}

const ArticlePage: React.FC<ArtProps> = ({
  title,
  date,
  author,
  headerImage,
  media,
  category,
  categorySlug,
  content,
  gridArticles,
  categories,
  searchArticles,
}) => {
  const [query, setQuery] = useState("");

  const formattedDate = useMemo(() => {
    if (!date || date === "Unknown Date") {
      return "";
    }

    const parsed = Date.parse(date);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString("fr-FR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return date;
  }, [date]);

  const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0;
    let g = 0;
    let b = 0;

    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const normalizedSlug = categorySlug.toLowerCase();
  const articleColor =
    categories.find(
      (current) =>
        current.slug.toLowerCase() === normalizedSlug ||
        current.name.toLowerCase() === category.toLowerCase()
    )?.color || "#d4d4d4";

  const accentColor = hexToRgba(articleColor, 0.8);

  const heroImage = headerImage || (media && media.length > 0 ? media[0] : "");
  const hasHeroImage = Boolean(heroImage);
  const authorSlug = slugify(author);

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
      (article as any).bodyMarkdown ||
      (article as any).body ||
      (article as any).content;

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

  return (
    <>
      <Head>
        <title>{title}</title>
        <script
          type="application/json"
          className="js-hypothesis-config"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ openSidebar: false }),
          }}
        />
      </Head>
      <Script src="https://hypothes.is/embed.js" strategy="afterInteractive" />

      <div className="page-wrapper">
        <TopNav />

        <main className="content">
          <RedesignSearchSidebar
            query={query}
            onQueryChange={setQuery}
            searchLabel="Rechercher dans la revue"
            placeholder="Titre, auteur, mot-clé…"
            articles={searchArticles}
          />

          <div className="article-layout">
            <article className="article">
              <header className="article-hero">
                <div className={`article-hero-inner${hasHeroImage ? "" : " no-media"}`}>
                  <div className="article-hero-content">
                    <div className="article-hero-header">
                      <h1 className="article-title">{title}</h1>
                      {author && authorSlug ? (
                        <p className="article-author">
                          <Link href={`/auteurs/${authorSlug}`} className="article-author-link">
                            {author}
                          </Link>
                        </p>
                      ) : (
                        author && <p className="article-author">{author}</p>
                      )}
                      {formattedDate && (
                        <time className="article-date" dateTime={date}>
                          {formattedDate}
                        </time>
                      )}
                    </div>
                  </div>
                  {hasHeroImage ? (
                    <div className="article-hero-media" aria-hidden="true">
                      <img src={heroImage} alt="" loading="lazy" />
                    </div>
                  ) : (
                    <>
                      {/** Placeholder hero media intentionally commented out for future reuse.
                       * <div
                       *   className="article-hero-media"
                       *   style={{
                       *     backgroundImage: `linear-gradient(135deg, ${hexToRgba(
                       *       articleColor,
                       *       0.55
                       *     )} 0%, ${hexToRgba(articleColor, 0.25)} 100%)`,
                       *   }}
                       *   aria-hidden="true"
                       * />
                       */}
                    </>
                  )}
                </div>
              </header>

              <section className="article-body-wrapper">
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </section>
            </article>

            {gridArticles.length > 0 && (
              <aside className="related-sidebar">
                <div className="related-articles-inner">
                  <div className="related-section">
                    <h3 className="related-subheading">À lire également</h3>
                    <ul className="related-list">
                      {gridArticles.map((article) => {
                        const categorySegment = (article.categorySlug || article.category).toLowerCase();
                        const formattedRelatedDate =
                          article.date && article.date !== "Unknown Date"
                            ? new Date(article.date).toLocaleDateString("fr-FR", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "";

                        const previewSnippet = buildPreviewSnippet(article);
                        const previewHtml = previewSnippet
                          ? mdToHtml(
                              previewSnippet,
                              (article as any).publicBasePath || (article as any).public_path
                            )
                          : "";

                        return (
                          <li className="related-item" key={`${categorySegment}-${article.slug}`}>
                            <Link
                              href={`/${categorySegment}/${article.slug}`}
                              className="related-link"
                            >
                              <span className="related-title">{article.title}</span>
                              {article.author && (
                                <span className="related-author">{article.author}</span>
                              )}
                              {formattedRelatedDate && (
                                <span className="related-date">{formattedRelatedDate}</span>
                              )}
                              {previewHtml && (
                                <span
                                  className="related-preview"
                                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                                />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </main>

        <Footer footerColor="#0c0c0c" marginTop="0" />
      </div>

      <style jsx>{`
        :global(body) {
          background: #ffffff;
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .content {
          flex: 1;
          display: flex;
          gap: 0;
          background: #fcfcfc;
        }

        .article-layout {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          align-items: start;
          gap: 0;
          background: #fcfcfc;
        }

        .article {
          --article-max-width: 760px;
          --article-horizontal-padding: clamp(28px, 7vw, 120px);
          --article-hero-vertical-padding: clamp(14px, 3.2vw, 36px);
          --article-body-padding-top: clamp(34px, 6vw, 72px);
          --article-body-padding-bottom: clamp(26px, 5vw, 66px);
          display: flex;
          flex-direction: column;
          gap: 0;
          background: #fcfcfc;
        }

        .article-hero {
          padding: var(--article-hero-vertical-padding) 0;
          background: #fcfcfc;
        }

        .article-hero-inner {
          display: grid;
          width: min(1140px, 100%);
          box-sizing: border-box;
          gap: clamp(16px, 3vw, 32px);
          padding: 0 clamp(22px, 5vw, 60px);
          margin: 0 auto;
        }

        .article-hero-inner.no-media {
          gap: clamp(16px, 3vw, 24px);
          justify-content: center;
        }

        .article-hero-content {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: clamp(12px, 3vw, 20px);
          color: #0d0d0d;
          max-width: min(var(--article-max-width), 700px);
          width: 100%;
          margin: 0 auto;
        }

        .article-hero-inner.no-media .article-hero-content {
          margin: 0 auto;
        }

        .article-hero-header {
          display: flex;
          flex-direction: column;
          gap: clamp(8px, 2vw, 14px);
          align-items: flex-start;
        }

        .article-title {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: clamp(42px, 7vw, 66px);
          line-height: 1.04;
          font-weight: 400;
          color: #000000;
          text-align: left;
          width: 100%;
        }

        .article-author {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: clamp(26px, 5vw, 42px);
          letter-spacing: normal;
          text-align: right;
          color: #000000;
          width: 100%;
          align-self: flex-end;
        }

        .article-author-link {
          color: #111111;
          text-decoration: none;
        }

        .article-author-link:visited {
          color: #111111;
          text-decoration: none;
        }

        .article-author-link:hover,
        .article-author-link:focus-visible {
          color: #000000;
          text-decoration: none;
          outline: none;
        }

        .article-author-link:focus-visible {
          outline: 2px solid #000000;
          outline-offset: 2px;
          text-decoration: none;
        }

        .article-date {
          font-family: "GayaRegular", serif;
          font-size: clamp(20px, 3.6vw, 30px);
          letter-spacing: normal;
          text-transform: none;
          color: #000000;
          text-align: left;
          width: 100%;
          display: block;
        }

        .article-hero-media {
          border-radius: 2px;
          background-color: transparent;
          box-shadow: none;
          max-width: min(100%, 520px);
          justify-self: center;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
        }

        .article-hero-media img {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: min(60vh, 520px);
          border-radius: inherit;
        }

        @media (min-width: 840px) {
          .article-author {
            align-self: flex-end;
          }
        }

        @media (min-width: 720px) {
          .article-layout {
            grid-template-columns: minmax(0, 2.3fr) minmax(260px, 1fr);
          }

          .article-hero-media {
            max-width: min(100%, 400px);
          }
        }

        @media (min-width: 1024px) {
          .article-layout {
            grid-template-columns: minmax(0, 2.6fr) minmax(280px, 1fr);
          }

          .related-sidebar {
            position: sticky;
            top: clamp(72px, 12vh, 132px);
          }
        }

        @media (min-width: 960px) {
          .article-hero-inner {
            grid-template-columns: minmax(0, 3fr) minmax(280px, 2fr);
            align-items: stretch;
            gap: clamp(24px, 4vw, 56px);
          }

          .article-hero-inner.no-media {
            grid-template-columns: minmax(0, 1fr);
          }

          .article-hero-content {
            justify-content: center;
            margin: 0;
          }

          .article-hero-inner.no-media .article-hero-content {
            margin: 0 auto;
          }

          .article-hero-media {
            max-width: 360px;
            justify-self: end;
          }
        }

        .article-body-wrapper {
          padding: var(--article-body-padding-top) var(--article-horizontal-padding)
            var(--article-body-padding-bottom);
          background: #fcfcfc;
        }

        .article-body {
          max-width: 720px;
          margin: 0 auto;
          font-family: "EnbyGertrude", sans-serif;
          font-size: 18px;
          line-height: 1.68;
          color: #111111;
        }

        .article-body :global(p) {
          margin: 0 0 1.8em;
        }

        .article-body :global(h2) {
          margin: 2.4em 0 1.2em;
          font-family: "GayaRegular", serif;
          font-size: 30px;
          font-weight: 400;
          color: #111111;
          line-height: 1.2;
        }

        .article-body :global(h3) {
          margin: 2em 0 1em;
          font-family: "GayaRegular", serif;
          font-size: 24px;
          font-weight: 400;
          color: #111111;
        }

        .article-body :global(a) {
          color: ${accentColor};
          text-decoration: none;
          border-bottom: 1px solid rgba(17, 17, 17, 0.18);
          transition: border-color 0.2s ease;
        }

        .article-body :global(a:hover),
        .article-body :global(a:focus-visible) {
          border-color: ${accentColor};
        }

        .article-body :global(blockquote) {
          margin: 2.4em 0;
          padding: 0 0 0 18px;
          border-left: 3px solid ${accentColor};
          font-style: italic;
          color: #111111;
        }

        .article-body :global(blockquote + blockquote) {
          margin-top: -2.4em;
        }

        .article-body :global(blockquote p) {
          margin: 0;
          font-size: 20px;
          line-height: 1.6;
        }

        .article-body :global(blockquote p + p) {
          margin-top: 0.5em;
        }

        .article-body :global(img) {
          display: block;
          max-width: min(100%, 520px);
          margin: 2.4em auto;
          border-radius: 4px;
          box-shadow: 0 14px 30px rgba(17, 17, 17, 0.12);
        }

        .related-sidebar {
          width: 100%;
          background: transparent;
          padding: clamp(12px, 2vw, 16px) 28px clamp(12px, 2vw, 16px) 0;
          box-sizing: border-box;
        }

        .related-articles-inner {
          width: 100%;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .related-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .related-subheading {
          margin: 0;
          align-self: flex-start;
          font-family: "EnbyGertrude", sans-serif;
          font-size: 24px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.01em;
          padding: 6px 12px;
          background: ${accentColor};
          text-decoration: underline;
          display: inline-flex;
          border-radius: 2px;
        }

        .related-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .related-link {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-decoration: none;
          color: inherit;
        }

        .related-title {
          display: block;
          font-family: "GayaRegular", serif;
          font-size: 28px;
          line-height: 1.25;
          font-weight: 400;
          color: #000000;
          text-align: left;
        }

        .related-author {
          display: block;
          font-family: "GayaRegular", serif;
          font-size: 18.67px;
          font-weight: 400;
          color: #000000;
          text-align: right;
        }

        .related-date {
          display: block;
          font-family: "GayaRegular", serif;
          font-size: 13.33px;
          font-weight: 400;
          color: #000000;
          text-align: left;
        }

        .related-preview {
          display: block;
          font-family: "EnbyGertrude", serif;
          font-size: 14px;
          font-weight: 400;
          color: #000000;
          text-align: left;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }

        .related-link:hover .related-title,
        .related-link:focus-visible .related-title {
          color: #000000;
          text-decoration: underline;
        }

        @media (max-width: 959px) {
          .article-hero-content {
            margin: 0 auto;
          }

          .article-hero-media {
            order: -1;
            width: 100%;
          }

          .article-hero-media img {
            max-height: min(72vw, 560px);
            width: auto;
          }
        }

        @media (min-width: 720px) and (max-width: 959px) {
          .article-hero-media img {
            max-height: min(46vh, 360px);
          }
        }

        @media (max-width: 720px) {
          .content {
            flex-direction: column;
          }

          .article {
            --article-horizontal-padding: clamp(20px, 8vw, 48px);
            --article-body-padding-top: clamp(30px, 9vw, 58px);
            --article-body-padding-bottom: clamp(20px, 7vw, 42px);
          }

          .article-layout {
            background: #fcfcfc;
          }

          .article-body {
            font-size: 17px;
          }

          .related-sidebar {
            padding: clamp(16px, 8vw, 28px) 28px clamp(16px, 8vw, 28px) 28px;
          }
        }

        @media (max-width: 520px) {
          .article {
            --article-hero-vertical-padding: clamp(28px, 12vw, 52px);
          }

          .article-title {
            font-size: clamp(30px, 9vw, 40px);
          }

          .article-author {
            font-size: clamp(15px, 5vw, 18px);
          }
        }

        @media (min-width: 960px) {
          .article-hero-media img {
            max-height: min(38vh, 320px);
          }
        }
      `}</style>
    </>
  );
};

export default ArticlePage;
