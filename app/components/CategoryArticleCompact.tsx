// /app/components/CategoryArticleGrid.tsx
import React from 'react'
import { Article, Category } from '../../types'

interface Props {
  articles: Article[]
  categories: Category[]
  titleFont?: string
}

const CategoryArticleGrid: React.FC<Props> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
}) => (
  <section className="cag">
    <div className="grid">
      {categories.map((c) => {
        const list = articles
          .filter((a) => a.category === c.name)
          .slice(0, 3)
        return (
          <div key={c.name} className="block">
            <h3 className="cat">{c.name}</h3>
            <hr />
            <ul>
              {list.map((a) => (
                <li key={a.slug}>
                  <a href={`/${a.category}/${a.slug}`}>
                    <span className="title">{a.title}</span>
                    <span className="author">{a.author}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>

    <style jsx>{`
      .cag {
        max-width: 1000px;
        margin: 0 auto;
        padding: 24px 16px;
        font-family: ${titleFont}, Georgia, serif;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2,1fr);
        gap: 32px;
      }
      @media (min-width: 768px) {
        .grid {
          grid-template-columns: repeat(3,1fr);
        }
      }
      .cat {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 400;
      }
      hr {
        border: none;
        border-bottom: 1px solid #eaeaea;
        margin: 0 0 12px;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      li + li {
        margin-top: 8px;
      }
      a {
        text-decoration: none;
        color: inherit;
        display: block;
      }
      .title {
        display: block;
        font-size: 16px;
        line-height: 1.3;
        color: #333;
        font-family: GayaRegular, sans-serif;
      }
      .author {
        display: block;
        font-size: 12px;
        color: #666;
        margin-top: 2px;
        font-weight: 500;
        font-family: InterRegular, sans-serif;
      }
      a:hover .title {
        text-decoration: underline;
      }
    `}</style>
  </section>
)

export default CategoryArticleGrid