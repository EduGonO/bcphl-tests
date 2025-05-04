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
  const recent = articles.filter((a) => a.category === selected).slice(0, 3)

  return (
    <section className="cap">
      <h2 className="heading">À lire également</h2>
      <div className="wrapper">
        <div className="cats">
          {categories.map((c, i) => {
            const isActive = c.name === selected
            return (
              <button
                key={c.name}
                onClick={() => setSelected(c.name)}
                className={isActive ? 'cat active' : 'cat'}
                style={{
                  backgroundColor: isActive
                    ? `${c.color}20`
                    : `${c.color}10`,
                  color: c.color,
                }}
              >
                {c.name}
              </button>
            )
          })}
        </div>
        <div className="list">
          <div className="current-cat-name">{selected}</div>
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
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 16px;
        }
        .heading {
          font-family: ${titleFont}, Georgia, serif;
          font-weight: 300;
          font-size: 32px;
          margin-bottom: 24px;
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
        }
        .cat {
          padding: 20px;
          font-size: 18px;
          font-weight: 500;
          text-align: center;
          border: none;
          border-bottom: 1px solid #eaeaea;
          border-right: 1px solid #eaeaea;
          transition: background 0.2s, transform 0.2s;
        }
        .cat:nth-child(2n) {
          border-right: none;
        }
        .cat:nth-last-child(-n + 2) {
          border-bottom: none;
        }
        .cat:hover {
          background: rgba(0, 0, 0, 0.03);
        }
        .list :global(.article-list) {
          max-width: none;
          margin: 0;
          padding: 0;
        }
        .current-cat-name {
          font-family: ${titleFont}, Georgia, serif;
          font-weight: 300;
          font-size: 24px;
          text-align: center;
          margin: 0 0 16px;
          color: #333;
        }
        .see-more {
          display: block;
          text-align: center;
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