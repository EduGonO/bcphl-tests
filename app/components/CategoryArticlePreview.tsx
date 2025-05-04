// /app/components/CategoryArticlePreview.tsx
import React, { useState } from 'react'
import { Article, Category } from '../../types'
import ArticleList from './ArticleList'

interface CategoryArticlePreviewProps {
  articles: Article[]
  categories: Category[]
  headerImages?: Record<string, string>
  titleFont?: string
}

const CategoryArticlePreview: React.FC<CategoryArticlePreviewProps> = ({
  articles,
  categories,
  headerImages = {},
  titleFont = 'GayaRegular',
}) => {
  const [selected, setSelected] = useState(categories[0]?.name || '')
  const recent = articles
    .filter((a) => a.category === selected)
    .slice(0, 3)

  return (
    <section className="cap">
      <h2 className="heading">À lire également</h2>
      <div className="wrapper">
        <div className="cats">
          {categories.map((c) => {
            const isActive = c.name === selected
            return (
              <button
                key={c.name}
                onClick={() => setSelected(c.name)}
                className={isActive ? 'cat active' : 'cat'}
                style={{
                  backgroundColor: `${c.color}20`,
                  color: c.color,
                }}
              >
                {c.name}
              </button>
            )
          })}
        </div>
        <div className="list">
          {/* reset padding/margins of ArticleList */}
          <ArticleList
            articles={recent}
            categories={categories}
            titleFont={titleFont}
          />
          <a href={`/${selected}`} className="see-more">
            see more →
          </a>
        </div>
      </div>
      <style jsx>{`
        .cap {
          padding: 40px 16px;
        }
        .heading {
          font-family: ${titleFont}, Georgia, serif;
          font-weight: 300;
          font-size: 32px;
          margin: 0 0 24px;
          color: #111;
        }
        .wrapper {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .wrapper {
            flex-direction: row;
            align-items: flex-start;
          }
          .cats {
            flex: 0 0 280px;
            margin-right: 16px;
          }
          .list {
            flex: 1;
          }
        }
        .cats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .cat {
          padding: 20px;
          font-size: 18px;
          font-weight: 500;
          text-align: center;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cat:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .cat.active {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        /* override ArticleList padding/margins */
        .list :global(.article-list) {
          max-width: none;
          margin: 0;
          padding: 0;
        }
        .list :global(.row) {
          padding: 16px 0; /* keep item padding */
          border-bottom-color: #eaeaea;
        }
        .see-more {
          display: block;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .see-more:hover {
          opacity: 0.7;
        }
      `}</style>
    </section>
  )
}

export default CategoryArticlePreview