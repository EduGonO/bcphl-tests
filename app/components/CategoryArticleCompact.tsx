// /app/components/CategoryArticleCompact.tsx
import React, { useState } from 'react'
import { Article, Category } from '../../types'

interface CategoryArticleCompactProps {
  articles: Article[]
  categories: Category[]
  titleFont?: string
}

const CategoryArticleCompact: React.FC<CategoryArticleCompactProps> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
}) => {
  const [selected, setSelected] = useState(categories[0]?.name || '')
  const recent = articles.filter(a => a.category === selected).slice(0, 3)

  return (
    <section className="cac">
      <div className="cats">
        {categories.map(c => (
          <button
            key={c.name}
            onClick={() => setSelected(c.name)}
            className={c.name === selected ? 'cat active' : 'cat'}
          >
            {c.name}
          </button>
        ))}
      </div>

      <hr />

      <ul className="articles">
        {recent.map(a => (
          <li key={a.slug}>
            <a href={`/${a.category}/${a.slug}`}>
              <h3 className="title">{a.title}</h3>
              <p className="author">{a.author}</p>
            </a>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .cac {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 16px;
          font-family: ${titleFont}, Georgia, serif;
        }
        .cats {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 1px;
          background: #eaeaea;
          border-radius: 6px;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .cats { grid-template-columns: repeat(3,1fr); }
        }
        .cat {
          background: #fff;
          padding: 16px;
          font-size: 16px;
          text-align: center;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cat:hover {
          background: rgba(0,0,0,0.03);
        }
        .active {
          font-weight: 600;
        }
        hr {
          border: none;
          border-top: 1px solid #eaeaea;
          margin: 16px 0;
        }
        .articles {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .articles li + li {
          margin-top: 12px;
        }
        .title {
          margin: 0;
          font-size: 18px;
          color: #111;
          font-weight: 300;
        }
        .author {
          margin: 4px 0 0;
          font-size: 14px;
          color: #666;
        }
        a {
          text-decoration: none;
          color: inherit;
        }
        a:hover .title {
          text-decoration: underline;
        }
      `}</style>
    </section>
  )
}

export default CategoryArticleCompact
