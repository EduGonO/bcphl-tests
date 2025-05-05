// /app/components/ArticleList.tsx
import React from 'react'
import { Article, Category } from '../../types'

interface ArticleListProps {
  articles: Article[]
  categories: Category[]
  titleFont?: string
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
}) => (
  <section className="article-list">
    {articles.map((article, i) => {
      const cat = categories.find((c) => c.name === article.category)
      const color = cat?.color || '#ccc'
      const thumbStyle = article.headerImage
        ? { backgroundImage: `url(${article.headerImage})` }
        : { backgroundColor: `${color}20` }

      return (
        <a
          href={`/${article.category}/${article.slug}`}
          key={article.slug || i}
          className="row"
        >
          <div className="thumb" style={thumbStyle} />
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
      )
    })}

    <style jsx>{`
      .article-list {
        margin: 0 0;
        padding: 0 0px;
      }
      .row {
        display: flex;
        gap: 16px;
        padding: 16px 10px;
        border-bottom: 1px solid #eaeaea;
        text-decoration: none;
        color: #333;
        transition: background 0.2s;
      }
      .row:hover {
        background: rgba(0, 0, 0, 0.03);
      }
      .thumb {
        flex: 0 0 120px;
        height: 80px;
        background: center/cover no-repeat #f5f5f5;
        border-radius: 4px;
      }
      .content {
        flex: 1;
      }
      .pre {
        display: block;
        font: 12px/1 sans-serif;
        letter-spacing: 0.1em;
        color: #666;
        margin-bottom: 4px;
      }
      .title {
        font-family: ${titleFont}, Georgia, serif;
        font-size: 20px;
        line-height: 1.3;
        margin: 4px 0 8px;
        font-weight: 300;
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
        color: #333;
      }
      .meta {
        font-size: 13px;
        color: #666;
      }
    `}</style>
  </section>
)

export default ArticleList