// /app/components/ArticleGrid.tsx
import React from 'react'
import { Article, Category } from '../../types'
import { mdToHtml } from "../../lib/markdown";
import ReactMarkdown from 'react-markdown';

interface ArticleGridProps {
  articles: Article[]
  categories: Category[]
  titleFont?: string
  headerImages?: Record<string, string>
}

const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
  headerImages = {},
}) => (
  <section className="article-grid">
    <h2 className="heading">À lire également</h2>
    <div className="grid-container">
      {articles.map((article, idx) => {
        const cat = categories.find((c) => c.name === article.category)
        const color = cat?.color || '#ccc'
        const imgStyle = headerImages[article.slug]
          ? { backgroundImage: `url(${headerImages[article.slug]})` }
          : { backgroundColor: `${color}20` }

        
  // Parse date properly
  const formattedDate = article.date !== "Unknown Date" 
  ? new Date(article.date).toLocaleDateString("fr-FR", {
      month: "long", 
      day: "numeric",
      year: "numeric",
    })
  : "";

  const previewHtml = mdToHtml(
    article.preview,
    `/texts/${article.category}/${article.slug}`
  )

        return (
          <a
            key={article.slug || idx}
            href={`/${article.category}/${article.slug}`}
            className="card-link"
          >
            <div className="card">
              <div className="card-image" style={imgStyle} />

              <div className="card-content">
                
                <h3 className="title">{article.title}</h3>

                <p className="preview"><ReactMarkdown>{article.preview}</ReactMarkdown></p>

                <div className="meta">
                  {article.author} • {formattedDate}
                </div>

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
              </div>
            </div>
          </a>
        )
      })}
    </div>

    <style jsx>{`
      .article-grid {
        margin: 2rem 0;
      }
      .grid-container {
        display: flex;
        gap: 24px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding: 8px 0;
        scrollbar-width: none;
      }
      .grid-container::-webkit-scrollbar {
        display: none;
      }
      .card-link {
        flex: 0 0 300px;
        scroll-snap-align: start;
        text-decoration: none;
        color: inherit;
      }
      .card-link:first-of-type {
        margin-left: 16px;
      }
      .card {
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        transition: transform 0.3s, box-shadow 0.3s;
      }
      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .card-image {
        width: 100%;
        padding-bottom: 6.25%;
        background: center/cover no-repeat #f5f5f5;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      .card-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .label {
        display: inline-block;
        font-size: 12px;
        text-transform: uppercase;
        padding: 2px 6px;
        border: 1px solid;
        border-radius: 2px;
        margin-bottom: 4px;
        font-weight: 400;
        font-family: -apple-system, InterRegular, sans-serif;
      }
      .heading {
        font-family: ${titleFont}, Georgia, serif;
        font-size: 32px;
        margin-bottom: 16px;
        font-weight: 300;
        padding-left: 16px
      }
      .title {
        font-family: ${titleFont}, Georgia, serif;
        font-size: 24px;
        line-height: 1.3;
        font-weight: 400;
        margin: 4px 0 6px;
        color: #333;
      }
      .preview {
        margin: 0 0 8px;
        font-size: 14px;
        line-height: 1.2;
        color: #333;
        font-family: -apple-system, InterRegular, sans-serif;
      }
      .meta {
        font-size: 14px;
        margin: 0 0 8px;
        color: #666;
        font-family: -apple-system, InterRegular, sans-serif;
      }
    `}</style>
  </section>
)

export default ArticleGrid