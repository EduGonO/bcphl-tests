import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Article } from "../../types";
import { getArticleMediaStyle } from "../../lib/articleMedia";

type PreviewVariant = "reflexion" | "creation" | "irl";

interface RedesignArticlePreviewCardProps {
  article: Article;
  variant: PreviewVariant;
  formatDate: (value: string) => string;
}

const RedesignArticlePreviewCard: React.FC<RedesignArticlePreviewCardProps> = ({
  article,
  variant,
  formatDate,
}) => {
  const mediaStyle = getArticleMediaStyle(article);
  const formattedDate = formatDate(article.date);
  const categorySegment = article.categorySlug || article.category;
  const linkHref = `/${categorySegment}/${article.slug}`;
  const linkLabel = variant === "creation" ? "découvrir" : "Lire";

  return (
    <Link href={linkHref} className={`article-preview ${variant}`} role="article">
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
        {article.preview && (
          <div className="article-preview-text">
            <ReactMarkdown>{article.preview}</ReactMarkdown>
          </div>
        )}
        <span className={`article-preview-cta ${variant}`}>{linkLabel}</span>
      </div>
      <style jsx>{`
        .article-preview {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 22px 24px 26px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.68);
          box-shadow: inset 0 0 0 1px rgba(17, 17, 17, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .article-preview.creation {
          background: rgba(255, 255, 255, 0.74);
        }
        .article-preview.irl {
          background: rgba(255, 255, 255, 0.7);
        }
        .article-preview:hover,
        .article-preview:focus-visible {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(17, 17, 17, 0.12);
          background: rgba(255, 255, 255, 0.86);
        }
        .article-preview-media {
          width: 100%;
          height: 200px;
          max-height: 200px;
          border-radius: 3px;
          background-position: left center;
          background-repeat: no-repeat;
          background-size: auto 100%;
          background-color: transparent;
        }
        .article-preview-body {
          display: flex;
          flex-direction: column;
          font-family: "InterRegular", sans-serif;
          color: #000000;
        }
        .article-preview-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 10px 0 12px;
        }
        .article-preview-title {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: 44px;
          line-height: 1.2;
          color: #000000;
        }
        .article-preview-author {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: 28px;
          line-height: 1.2;
          text-align: right;
          color: #000000;
          letter-spacing: normal;
        }
        .article-preview-date {
          font-family: "GayaRegular", serif;
          font-size: 20px;
          color: #000000;
          margin: 0 0 6px;
          letter-spacing: normal;
        }
        .article-preview-text {
          font-size: 15px;
          line-height: 1.5;
          color: #000000;
          margin-bottom: 8px;
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
          font-family: "InterRegular", sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
          padding: 6px 16px;
          border-radius: 999px;
          transition: transform 0.2s ease;
          margin-top: 0;
        }
        .article-preview-cta.reflexion {
          background: #c1c1f0;
          color: #111111;
        }
        .article-preview-cta.creation {
          background: #f4f0ae;
          color: #111111;
        }
        .article-preview-cta.irl {
          background: #b8e0ff;
          color: #111111;
        }
        .article-preview:hover .article-preview-cta,
        .article-preview:focus-visible .article-preview-cta {
          transform: translateY(-1px);
        }
        @media (max-width: 720px) {
          .article-preview {
            padding: 20px 20px 24px;
          }
        }
      `}</style>
    </Link>
  );
};

export default RedesignArticlePreviewCard;
