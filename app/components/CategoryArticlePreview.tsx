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
    .slice(0, 4)

  return (
    <section className="cap">
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
        <ArticleList
          articles={recent}
          categories={categories}
          titleFont={titleFont}
        />
      </div>
      <style jsx>{`
        .cap {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .cap {
            flex-direction: row;
          }
          .cats {
            flex: 0 0 200px;
          }
          .list {
            flex: 1;
          }
        }
        .cats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .cat {
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: filter 0.2s, box-shadow 0.2s;
        }
        .cat:hover {
          filter: brightness(1.1);
        }
        .cat.active {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </section>
  )
}

export default CategoryArticlePreview