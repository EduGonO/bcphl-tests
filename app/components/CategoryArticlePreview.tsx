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
        <div className="cats">
          {categories.map((c) => {
            const active = c.name === sel
            return (
              <button
                key={c.name}
                onClick={() => setSel(c.name)}
                className={`cat${active ? ' active' : ''}`}
                style={{ '--border-color': c.color } as React.CSSProperties}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <hr className="divider" />

      <div className="list">
        <ArticleList
          articles={recent}
          categories={categories}
          titleFont={titleFont}
        />
        <a href={`/categories/${sel}`} className="see-more">
          Explorer rubrique {sel} →
        </a>
      </div>

      <style jsx>{`
        .cap {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1px;
          flex-wrap: nowrap;
          overflow-x: hidden;
          min-width: 0;
          padding-bottom: 0;
        }
        .cats {
          display: flex;
          gap: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          flex: 1 1 auto;
          min-width: 0;
        }
        .cats::-webkit-scrollbar {
          display: none;
        }
        .cat {
          flex: 0 0 auto;
          position: relative;
          padding: 6px 12px;
          margin-boottom: -2px;
          font-family: ${titleFont}, serif;
          font-size: 20px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.42);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .cat.active {
          padding-bottom: 6px;
          color: rgba(0, 0, 0, 0.87);
        }
        .cat.active::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0
          ;
          height: 2px;
          background: var(--border-color);
        }
        .divider {
          border: none;
          border-bottom: 1px solid rgb(199, 199, 199);
          margin: 0;
        }
        .list {
          min-width: 0;
          overflow-x: hidden;
        }
        .see-more {
          display: block;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 400;
          color: #333;
          padding-left: 10px;
          opacity: 0.69;
          text-decoration: none;
          font-family: -apple-system, InterRegular, sans-serif;
          transition: opacity 0.2s;
        }
        .see-more:hover {
          display: block;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 400;
          color: #333;
          padding-left: 10px;
          opacity: 0.9;
          text-decoration: underline;
          font-family: -apple-system, InterRegular, sans-serif;
          transition: opacity 0.2s;
        }
      `}</style>
    </section>
  )
}

export default CategoryArticlePreview