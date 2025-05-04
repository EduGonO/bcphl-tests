// /app/components/ArticleGrid.tsx
import React from 'react'
import { Article, Category } from '../../types'

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
    <div className="grid-container">
      {articles.map((article, idx) => {
        const cat = categories.find((c) => c.name === article.category)
        const color = cat?.color || '#ccc'
        const imgStyle = headerImages[article.slug]
          ? { backgroundImage: `url(${headerImages[article.slug]})` }
          : { backgroundColor: `${color}20` }

        return (
          <a
            href={`/${article.category}/${article.slug}`}
            key={article.slug || idx}
            className="card-link"
          >
            <div className="card">
              <div className="card-image" style={imgStyle} />
              <div className="card-content">
                <span
                  className="card-category"
                  style={{
                    borderColor: color,
                    color,
                    backgroundColor: `${color}20`,
                  }}
                >
                  {article.category}
                </span>
                <h3 className="card-title">{article.title}</h3>
                <p className="card-preview">{article.preview}</p>
                <div className="card-meta">
                  {article.author} • {article.date}
                </div>
              </div>
            </div>
          </a>
        )
      })}
    </div>

    <style jsx>{`
      :root {
        --txt: #333;
        --sub: #666;
        --shadow: rgba(0, 0, 0, 0.05);
        --hover-shadow: rgba(0, 0, 0, 0.1);
      }
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
      .card {
        display: flex;
        flex-direction: column;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 4px var(--shadow);
        transition: transform 0.3s, box-shadow 0.3s;
        overflow: hidden;
      }
      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px var(--hover-shadow);
      }
      .card-image {
        width: 100%;
        padding-bottom: 56.25%;
        background: center/cover no-repeat #f5f5f5;
      }
      .card-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .card-category {
        display: inline-block;
        font-size: 11px;
        text-transform: uppercase;
        padding: 4px 8px;
        border: 1px solid;
        border-radius: 3px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .card-title {
        font-family: ${titleFont}, Georgia, serif;
        font-weight: 300;
        font-size: 18px;
        line-height: 1.3;
        color: var(--txt);
        margin: 4px 0 8px;
      }
      .card-preview {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--txt);
        margin: 0 0 12px;
        flex: 1;
      }
      .card-meta {
        font-size: 13px;
        color: var(--sub);
      }
    `}</style>
  </section>
)

export default ArticleGrid