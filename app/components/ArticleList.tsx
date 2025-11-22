// /app/components/ArticleList.tsx
import React from 'react'
import { Article, Category } from '../../types'
import ReactMarkdown from 'react-markdown';

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
      const categorySegment = article.categorySlug || article.category
      const cat = categories.find(
        (c) =>
          c.slug.toLowerCase() === categorySegment.toLowerCase() ||
          c.name.toLowerCase() === article.category.toLowerCase()
      )
      const color = cat?.color || '#ccc'
      const thumbStyle = article.headerImage
        ? { backgroundImage: `url(${article.headerImage})` }
        : { backgroundColor: `${color}20` }

      
  // Parse date properly
  const formattedDate = article.date !== "Unknown Date" 
  ? new Date(article.date).toLocaleDateString("fr-FR", {
      month: "long", 
      day: "numeric",
      year: "numeric",
    })
  : "";
      return (
        <a
          href={`/${categorySegment}/${article.slug}`}
          key={article.slug || i}
          className="row"
        >
          <div className="thumb" style={thumbStyle} />
          <div className="content">
            
            <h2 className="title">{article.title}</h2>

            <div className="meta">
              {article.author} • {formattedDate}
            </div>

            <p className="preview"><ReactMarkdown>{article.preview}</ReactMarkdown></p>

            <span className="pre">{(article.category || cat?.name || categorySegment).toUpperCase()}</span>
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
      display: none;
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
        margin: 0px 0 4px;
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
        margin: 4px 0 12px;
        font-size: 14px;
        line-height: 1.2;
        color: #333;
        font-family: -apple-system, EnbyGertrude, sans-serif;
      }
      .meta {
        font-size: 14px;
        color: #666;
        font-family: -apple-system, EnbyGertrude, sans-serif;
      }
    `}</style>
  </section>
)

export default ArticleList