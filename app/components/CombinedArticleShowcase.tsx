// /app/components/CombinedArticleShowcase.tsx
import React from 'react'
import { Article, Category } from '../../types'

interface Props {
  articles: Article[]
  categories: Category[]
  titleFont?: string
}

const CombinedArticleShowcase: React.FC<Props> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
}) => {
  const left = articles.slice(0, 2)
  const main = articles[2]
  const list = articles.slice(3, 7)

  const thumbStyle = (a: Article) => {
    const cat = categories.find(c => c.name === a.category)
    const color = cat?.color || '#ccc'
    return a.headerImage
      ? { backgroundImage: `url(${a.headerImage})` }
      : { backgroundColor: `${color}20` }
  }

  return (
    <section className="cas">
      <div className="col side-col">
        {left.map(a => (
          <div key={a.slug} className="small-card">
            <div className="thumb" style={thumbStyle(a)} />
            <h4 className="title">{a.title}</h4>
            <p className="author">{a.author}</p>
          </div>
        ))}
      </div>

      {main && (
        <div className="col main-col">
          <div className="main-thumb" style={thumbStyle(main)} />
          <h2 className="main-title">{main.title}</h2>
          <p className="main-preview">{main.preview}</p>
          <p className="main-meta">{main.author} • {main.date}</p>
        </div>
      )}

      <div className="col list-col">
        {list.map(a => (
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
        .cas {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
          font-family: ${titleFont}, Georgia, serif;
        }
        @media(min-width:768px){ .cas{flex-direction:row;} }
        .col{flex:1;display:flex;flex-direction:column;gap:16px;}
        .thumb{width:100%;padding-bottom:56.25%;background:center/cover no-repeat #f5f5f5;border-radius:4px;}
        .small-card .title{margin:8px 0 0;font-size:16px;font-weight:500;color:#111;}
        .small-card .author{margin:4px 0 0;font-size:14px;color:#666;}
        .main-col{text-align:center;}
        .main-thumb{width:100%;max-height:300px;background:center/cover no-repeat #f5f5f5;border-radius:4px;}
        .main-title{margin:16px 0 8px;font-size:24px;font-weight:300;}
        .main-preview{margin:0 0 12px;font-size:16px;line-height:1.4;color:#333;}
        .main-meta{margin:0;font-size:14px;color:#666;}
        .list-item{display:flex;gap:12px;padding-bottom:12px;border-bottom:1px solid #eaeaea;text-decoration:none;color:inherit;}
        .list-item .thumb{flex:0 0 80px;height:56px;border-radius:4px;}
        .text .title{margin:0;font-size:16px;font-weight:500;color:#111;}
        .text .meta{margin:4px 0 0;font-size:14px;color:#666;}
        a:hover .title{text-decoration:underline;}
      `}</style>
    </section>
  )
}

export default CombinedArticleShowcase
