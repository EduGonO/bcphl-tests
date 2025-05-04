// /app/components/CombinedArticleShowcase.tsx
import React from 'react'
import { Article, Category } from '../../types'

interface CombinedArticleShowcaseProps {
  articles: Article[]
  categories: Category[]
  headerImages?: Record<string,string>
  titleFont?: string
}

const CombinedArticleShowcase: React.FC<CombinedArticleShowcaseProps> = ({
  articles,
  categories,
  headerImages = {},
  titleFont = 'GayaRegular',
}) => {
  const leftItems = articles.slice(0, 2)
  const mainItem = articles[2]
  const listItems = articles.slice(3, 7)

  return (
    <section className="cas">
      <div className="col side-col">
        {leftItems.map(a => {
          const cat = categories.find(c => c.name === a.category)
          const color = cat?.color || '#ccc'
          const style = headerImages[a.slug]
            ? { backgroundImage: `url(${headerImages[a.slug]})` }
            : { backgroundColor: `${color}20` }
          return (
            <div key={a.slug} className="small-card">
              <div className="thumb" style={style} />
              <h4 className="title">{a.title}</h4>
              <p className="author">{a.author}</p>
            </div>
          )
        })}
      </div>

      {mainItem && (
        <div className="col main-col">
          {(() => {
            const cat = categories.find(c => c.name === mainItem.category)
            const color = cat?.color || '#ccc'
            return headerImages[mainItem.slug]
              ? <img src={headerImages[mainItem.slug]} alt="" className="main-thumb"/>
              : <div className="main-thumb" style={{backgroundColor:`${color}20`}}/>
          })()}
          <h2 className="main-title">{mainItem.title}</h2>
          <p className="main-preview">{mainItem.preview}</p>
          <p className="main-meta">{mainItem.author} • {mainItem.date}</p>
        </div>
      )}

      <div className="col list-col">
        {listItems.map(a => {
          const cat = categories.find(c => c.name === a.category)
          const color = cat?.color || '#ccc'
          const style = headerImages[a.slug]
            ? { backgroundImage: `url(${headerImages[a.slug]})` }
            : { backgroundColor: `${color}20` }
          return (
            <a key={a.slug} href={`/${a.category}/${a.slug}`} className="list-item">
              <div className="thumb" style={style}/>
              <div className="text">
                <h4 className="title">{a.title}</h4>
                <p className="meta">{a.author} • {a.date}</p>
              </div>
            </a>
          )
        })}
      </div>

      <style jsx>{`
        .cas {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
          font-family: ${titleFont}, Georgia, serif;
        }
        @media(min-width: 768px) {
          .cas { flex-direction: row; }
        }
        .col { flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .side-col .small-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .thumb {
          width: 100%;
          padding-bottom: 56.25%;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }
        .small-card .title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #111;
        }
        .small-card .author {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        .main-col {
          text-align: center;
        }
        .main-thumb {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }
        .main-title {
          margin: 16px 0 8px;
          font-size: 24px;
          font-weight: 300;
        }
        .main-preview {
          margin: 0 0 12px;
          font-size: 16px;
          line-height: 1.4;
          color: #333;
        }
        .main-meta {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        .list-col .list-item {
          display: flex;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eaeaea;
          text-decoration: none;
          color: inherit;
        }
        .list-col .list-item .thumb {
          flex: 0 0 80px;
          height: 56px;
          background: center/cover no-repeat #f5f5f5;
          border-radius: 4px;
        }
        .list-col .text {
          flex: 1;
        }
        .list-col .title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #111;
        }
        .list-col .meta {
          margin: 4px 0 0;
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </section>
  )
}

export default CombinedArticleShowcase
