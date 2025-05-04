// /app/components/ArticleList.tsx
import React from 'react';
import { Article, Category } from '../../types';

interface ArticleListProps {
  articles: Article[];
  categories: Category[];
  titleFont?: string;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
}) => (
  <section className="article-list">
    {articles.map((article, i) => {
      const color =
        categories.find((c) => c.name === article.category)?.color ||
        '#ccc';
      const imgStyle = article.imageUrl
        ? { backgroundImage: `url(${article.imageUrl})` }
        : undefined;

      return (
        <a
          href={`/${article.category}/${article.slug}`}
          key={article.slug || i}
          className="row"
        >
          <div className="thumb" style={imgStyle} />
          <div className="content">
            <span className="pre">{article.category.toUpperCase()}</span>
            <h2 className="title">{article.title}</h2>
            <span
              className="label"
              style={{
                borderColor: color,
                color,
                backgroundColor: `${color}20`,
              }}
            >
              {article.category}
            </span>
            <p className="preview">{article.preview}</p>
            <div className="meta">
              {article.date} • {article.author}
            </div>
          </div>
        </a>
      );
    })}

    <style jsx>{`
      :root {
        --txt: #333;
        --sub: #666;
        --hover-bg: rgba(0, 0, 0, 0.03);
      }
      .article-list {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 16px;
      }
      .row {
        display: flex;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid #eaeaea;
        text-decoration: none;
        color: var(--txt);
        transition: background 0.2s;
      }
      .row:hover {
        background: var(--hover-bg);
      }
      .thumb {
        flex: 0 0 120px;
        height: 80px;
        background: #f5f5f5 center/cover no-repeat;
        border-radius: 4px;
      }
      .content {
        flex: 1;
      }
      .pre {
        display: block;
        font: 12px/1 sans-serif;
        letter-spacing: 0.1em;
        color: var(--sub);
        margin-bottom: 4px;
      }
      .title {
        font-family: ${titleFont}, Georgia, serif;
        font-size: 20px;
        line-height: 1.3;
        margin: 4px 0 8px;
      }
      .label {
        display: inline-block;
        font-size: 11px;
        text-transform: uppercase;
        padding: 2px 6px;
        border: 1px solid;
        border-radius: 2px;
        margin-bottom: 8px;
      }
      .preview {
        margin: 0 0 12px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--txt);
      }
      .meta {
        font-size: 13px;
        color: var(--sub);
      }
    `}</style>
  </section>
);

export default ArticleList;