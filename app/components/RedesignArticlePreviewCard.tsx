import React from "react";
import Link from "next/link";
import { Article } from "../../types";
import { getArticleMediaStyle } from "../../lib/articleMedia";

interface RedesignArticlePreviewCardProps {
  article: Article;
  variant: "featured" | "event";
  formatDate: (value: string) => string;
}

const RedesignArticlePreviewCard: React.FC<RedesignArticlePreviewCardProps> = ({
  article,
  variant,
  formatDate,
}) => {
  const mediaStyle = getArticleMediaStyle(article);
  const formattedDate = formatDate(article.date);
  const linkHref = `/${article.category}/${article.slug}`;
  const linkLabel = variant === "featured" ? "en lire" : "+ d'infos";
  const linkClassName = `article-preview-link ${
    variant === "featured" ? "featured" : "event"
  }`;

  return (
    <article className={`article-preview ${variant}`}>
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
          <p className="article-preview-text">{article.preview}</p>
        )}
        <Link href={linkHref} className={linkClassName}>
          {linkLabel}
        </Link>
      </div>
      <style jsx>{`
        .article-preview {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 22px 24px 26px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.68);
          box-shadow: inset 0 0 0 1px rgba(17, 17, 17, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .article-preview.event {
          background: rgba(255, 255, 255, 0.74);
        }
        .article-preview:hover,
        .article-preview:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(17, 17, 17, 0.12);
        }
        .article-preview-media {
          width: 100%;
          aspect-ratio: 3 / 2;
          max-height: 220px;
          border-radius: 16px;
          background-color: rgba(255, 255, 255, 0.28);
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          box-shadow: inset 0 0 0 1px rgba(17, 17, 17, 0.06);
        }
        .article-preview-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: "InterRegular", sans-serif;
          color: #191919;
        }
        .article-preview-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .article-preview-title {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          line-height: 1.2;
          color: #111111;
        }
        .article-preview-author {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: 15px;
          line-height: 1.2;
          text-align: right;
          color: rgba(17, 17, 17, 0.8);
          letter-spacing: 0.02em;
        }
        .article-preview-date {
          font-family: "InterRegular", sans-serif;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(17, 17, 17, 0.72);
        }
        .article-preview-text {
          margin: 0;
          font-size: 15px;
          line-height: 1.66;
          color: rgba(17, 17, 17, 0.9);
        }
        .article-preview-link {
          align-self: flex-start;
          text-decoration: none;
          font-family: "InterRegular", sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
          padding: 10px 20px;
          border-radius: 999px;
          color: #111111;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
          background: #c1c1f0;
        }
        .article-preview-link.event {
          background: #f4f0ae;
        }
        .article-preview-link:hover,
        .article-preview-link:focus-visible {
          transform: translateY(-1px);
          color: #050505;
        }
        @media (max-width: 720px) {
          .article-preview {
            padding: 20px 20px 24px;
          }
          .article-preview-title {
            font-size: 20px;
          }
        }
      `}</style>
    </article>
  );
};

export default RedesignArticlePreviewCard;
