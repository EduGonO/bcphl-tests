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

  // Generate abstract pattern based on article slug
  // abstract pattern: just two reliable variants
// one vivid radial gradient that moves per slug
// one radial gradient, hues 20-40° apart → subtle yet distinct
const generateAbstractPattern = (article: Article) => {
  const hash = hashString(article.slug);

  const h1 =  hash % 360;                        // base hue
  const d  = 20 + (hash >> 3) % 21;              // 20‒40° shift
  const h2 = (h1 + (hash & 1 ? d : -d) + 360) % 360;

  const c1 = `hsl(${h1}, 60%, 86%)`;
  const c2 = `hsl(${h2}, 55%, 92%)`;

  const x  = 10 + (hash >> 6) % 80;              // 10‒90 %
  const y  = 10 + (hash >> 10) % 80;

  return {
    backgroundImage: `radial-gradient(circle at ${x}% ${y}%, ${c1} 0%, ${c2} 100%)`,
    backgroundSize:  '100% 100%',
    backgroundRepeat:'no-repeat',
  };
};
  
  // Hash function to get a deterministic number from article slug
  const hashString = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
  
  // Extract hue from hex color
  const getHue = (hexColor: string): number => {
    // Convert hex to rgb
    const r = parseInt(hexColor.slice(1, 3), 16) / 255
    const g = parseInt(hexColor.slice(3, 5), 16) / 255
    const b = parseInt(hexColor.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    
    let h = 0
    
    if (max === min) {
      h = 0 // achromatic
    } else {
      const d = max - min
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h *= 60
    }
    
    return Math.round(h)
  }

  const thumbStyle = (a: Article) => {
    return a.headerImage
      ? { backgroundImage: `url(${a.headerImage})` }
      : generateAbstractPattern(a)
  }
  
  const formatDate = (d: string): string =>
    d !== "Unknown Date"
      ? new Date(d).toLocaleDateString("fr-FR", {
          month: "long",
          day:   "numeric",
          year:  "numeric",
        })
      : "";

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
          <p className="main-meta">{mainItem.author} • {formatDate(mainItem.date)}</p>
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
              <p className="meta">{a.author} • {formatDate(a.date)}</p>
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
        /* unified thumbnail surface */
.small-card .thumb,
.main-thumb,
.list-item .thumb {
  background-position: center;
  background-size:     cover;
  background-repeat:   no-repeat;
  border-radius: 4px;
}
        .small-card .thumb {
          height: 120px;
          background: center/cover no-repeat;
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
          background: center/cover no-repeat;
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
          display: block;
          flex: 0 0 16px;
          aspect-ratio: 1/1;
          background: center/cover no-repeat;
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