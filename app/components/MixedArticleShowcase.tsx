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
          <div key={a.slug} className="small-card">
            <div className="thumb" style={thumbStyle(a)} />
            <h4 className="title">{a.title}</h4>
            <p className="author">{a.author}</p>
          </div>
        ))}
      </div>

      {mainItem && (
        <a href={`/${mainItem.category}/${mainItem.slug}`} className="col center">
          <div className="main-thumb" style={thumbStyle(mainItem)} />
          <h2 className="main-title">{mainItem.title}</h2>
          <p className="main-preview">{mainItem.preview}</p>
          <p className="main-meta">{mainItem.author} • {mainItem.date}</p>
        </a>
      )}

      <div className="col right">
        {rightItems.map(a => (
          <a key={a.slug} href={`/${a.category}/${a.slug}`} className="list-item">
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
          padding: 24px 16px;
          font-family: Inter, sans-serif;
          box-sizing: border-box;
          /* allow its children to shrink */
          min-width: 0;
        }
        .col {
          display: flex;
          flex-direction: column;
          gap: 16px;
          /* clamp overflow */
          min-width: 0;
        }

        /* mobile ordering */
        .center { order: 0; }
        .left   { order: 1; }
        .right  { order: 2; }

        @media (min-width: 768px) {
          .mas { flex-direction: row; }
          .left, .right {
            flex: 0 0 240px;
            min-width: 240px;
          }
          .center {
            flex: 1 1 auto;
            min-width: 0;
          }
        }

        /* left cards */
        .left .small-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .small-card .thumb {
          height: 120px;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }

        /* main image */
        .main-thumb {
          aspect-ratio: 16 / 9;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
          width: 100%;
          margin-bottom: 16px;
        }

        /* titles */
        .title,
        .main-title {
          font-family: ${titleFont}, Georgia, serif;
          margin: 0;
        }
        .small-card .title,
        .list-item .title {
          font-size: 16px;
          font-weight: 500;
        }
        .main-title {
          font-size: 24px;
          font-weight: 300;
          margin: 8px 0;
        }

        /* text */
        .author,
        .meta,
        .main-meta {
          font-size: 14px;
          color: #666;
          margin: 4px 0 0;
        }
        .main-preview {
          font-size: 16px;
          color: #333;
          margin: 0 0 8px;
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
          aspect-ratio: 1 / 1;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }
        .text {
          min-width: 0;
        }
        .text .meta {
          margin-top: 4px;
        }
        a:hover .title {
          text-decoration: underline;
        }
      `}</style>
    </section>
  )
}

export default MixedArticleShowcase
