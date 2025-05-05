// /app/components/MixedArticleShowcase.tsx
import React from 'react'
import { Article, Category } from '../../types'

interface MixedArticleShowcaseProps {
  articles: Article[]
  categories: Category[]
  titleFont?: string
}

const MixedArticleShowcase: React.FC<MixedArticleShowcaseProps> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
}) => {
  const leftItems  = articles.slice(0, 2)
  const mainItem   = articles[2]
  const rightItems = articles.slice(3, 7)

  const thumbStyle = (a: Article) => {
    const cat   = categories.find(c => c.name === a.category)
    const color = cat?.color || '#ccc'
    return a.headerImage
      ? { backgroundImage: `url(${a.headerImage})` }
      : { backgroundColor: `${color}20` }
  }

  return (
    <section className="mas">
      <div className="col left">
        {leftItems.map(a => (
          <a
            key={a.slug}
            href={`/${a.category}/${a.slug}`}
            className="small-card"
          >
            <div className="thumb" style={thumbStyle(a)} />
            <h4 className="title">{a.title}</h4>
            <p className="author">{a.author}</p>
          </a>
        ))}
      </div>

      {mainItem && (
        <a
          href={`/${mainItem.category}/${mainItem.slug}`}
          className="col center"
        >
          <div className="main-thumb" style={thumbStyle(mainItem)} />
          <h2 className="main-title">{mainItem.title}</h2>
          <p className="main-preview">{mainItem.preview}</p>
          <p className="main-meta">{mainItem.author} • {mainItem.date}</p>
        </a>
      )}

      <div className="col right">
        {rightItems.map(a => (
          <a
            key={a.slug}
            href={`/${a.category}/${a.slug}`}
            className="list-item"
          >
            <div className="thumb" style={thumbStyle(a)} />
            <div className="text">
              <h4 className="title">{a.title}</h4>
              <p className="meta">{a.author} • {a.date}</p>
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .mas {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px 36px 17px;
          font-family: Inter, sans-serif;
          box-sizing: border-box;
          min-width: 0;
        }
        .col {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        /* mobile: center first */
        .center { order: 0; }
        .left   { order: 1; }
        .right  { order: 2; }

        @media (min-width: 768px) {
          .mas { flex-direction: row; }
          .left  { order: 0; flex: 0 0 240px; min-width: 240px; }
          .center{ order: 1; flex: 1 1 auto; min-width: 0; }
          .right { order: 2; flex: 0 0 240px; min-width: 240px; }
        }

        /* left cards */
        .small-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-decoration: none;
          color: inherit;
        }
        .small-card .thumb {
          height: 120px;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }
        .small-card .title {
          font-family: ${titleFont}, Georgia, serif;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        }
        .small-card .author {
          font-size: 14px;
          color: #666;
          margin: 0 0 0 0px;
          font-family: InterRegular, sans-serif;
        }

        /* main */
        .main-thumb {
          width: 100%;
          aspect-ratio: 16/9;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }
        .main-title {
          font-family: ${titleFont}, Georgia, serif;
          font-size: 24px;
          font-weight: 300;
          margin: 4px 0;
        }
        .main-preview {
          font-size: 16px;
          color: #333;
          margin: 0 0 0px;
        }
        .main-meta {
          font-size: 14px;
          color: #666;
          margin: 4px 0 0;
        }

        /* right list */
        .list-item {
          display: flex;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eaeaea;
          text-decoration: none;
          color: inherit;
          min-width: 0;
        }
        .list-item:last-child {
          border-bottom: none;
        }
        .list-item .thumb {
          flex: 0 0 80px;
          aspect-ratio: 1/1;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }
        .text {
          min-width: 0;
        }
        .text .title {
          font-family: ${titleFont}, Georgia, serif;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        }
        .text .meta {
          font-size: 14px;
          color: #666;
          margin: 4px 0 0;
        }
          a {
          text-decoration: none;
        }
        .mas a {
            color: inherit;
            text-decoration: none;
          }

        /* remove default underline on hover */
        a:hover {
          text-decoration: none;
        }
      `}</style>
    </section>
  )
}

export default MixedArticleShowcase
