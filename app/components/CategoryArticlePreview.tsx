// /app/components/CategoryArticlePreview.tsx
import React, { useState } from 'react'
import { Article, Category } from '../../types'
import ArticleList from './ArticleList'

interface Props {
  articles: Article[]
  categories: Category[]
  headerImages?: Record<string, string>
  titleFont?: string
}

const CategoryArticlePreview: React.FC<Props> = ({
  articles,
  categories,
  headerImages = {},
  titleFont = 'GayaRegular',
}) => {
  const [sel, setSel] = useState(categories[0]?.name || '')
  const recent = articles.filter((a) => a.category === sel).slice(0, 3)

  return (
    <section className="cap">
      <div className="header">
        <h2 className="heading">À lire également</h2>
        <div className="cats">
          {categories.map((c) => {
            const active = c.name === sel
            return (
              <button
                key={c.name}
                onClick={() => setSel(c.name)}
                className="cat"
                style={{
                  color: c.color,
                  backgroundColor: active ? `${c.color}20` : 'transparent',
                  borderRadius: '9999px',
                }}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <hr className="divider" />

      <div className="list">
        <div className="current">{sel}</div>
        <ArticleList
          articles={recent}
          categories={categories}
          titleFont={titleFont}
        />
        <a href={`/${sel}`} className="see-more">
          see more →
        </a>
      </div>

      <style jsx>{`
        .cap {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 16px;
        }
        .header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        @media (min-width: 768px) {
          .header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        .heading {
          font-family: ${titleFont}, serif;
          font-size: 28px;
          margin: 0;
        }
        .cats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cat {
          padding: 6px 12px;
          font-family: ${titleFont}, serif;
          font-size: 16px;
          font-weight: 400;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .divider {
          border: none;
          border-bottom: 1px solid #eaeaea;
          margin: 16px 0;
        }
        .list .current {
          font-family: ${titleFont}, serif;
          font-size: 24px;
          font-weight: 300;
          margin-bottom: 16px;
          color: #333;
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
