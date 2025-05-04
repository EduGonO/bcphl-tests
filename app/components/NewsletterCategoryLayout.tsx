// /app/components/NewsletterCategoryLayout.tsx
import React from 'react'
import CategoryArticlePreview from './CategoryArticlePreview'
import { Article, Category } from '../../types'

interface NewsletterCategoryLayoutProps {
  articles: Article[]
  filteredArticles: Article[]
  categories: Category[]
  titleFont?: string
}

const NewsletterCategoryLayout: React.FC<NewsletterCategoryLayoutProps> = ({
  articles,
  filteredArticles,
  categories,
  titleFont = 'GayaRegular',
}) => {
  // pick one sample newsletter article
  const sample = articles[0]
  return (
    <section className="ncl">
      <div className="col left">
        <h2 className="heading">Newsletter</h2>
        <hr />
        <p className="desc">
          Example description Newsletter
          Abonnement description texte example Newsletter
        </p>
        <button className="subscribe">S'inscrire</button>
        {sample && (
          <div className="small-card">
            <div
              className="thumb"
              style={
                sample.headerImage
                  ? { backgroundImage: `url(${sample.headerImage})` }
                  : { backgroundColor: `${
                      categories.find(c => c.name === sample.category)?.color
                    }20` }
              }
            />
            <h4 className="title">{sample.title}</h4>
            <p className="author">{sample.author}</p>
          </div>
        )}
      </div>

      <div className="col right">
        <CategoryArticlePreview
          articles={filteredArticles}
          categories={categories}
          titleFont={titleFont}
        />
      </div>

      <style jsx>{`
        .ncl {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
          font-family: Inter, sans-serif;
        }
        @media(min-width:768px) {
          .ncl {
            flex-direction: row;
          }
          .left { flex: 0 0 30%; }
          .right { flex: 1; }
        }
        .col { display: flex; flex-direction: column; gap: 16px; }
        .heading {
          font-family: ${titleFont}, Georgia, serif;
          font-size: 24px;
          margin: 0;
        }
        hr {
          border: none;
          border-bottom: 1px solid #eaeaea;
          margin: 0;
        }
        .desc {
          font-size: 16px;
          color: #333;
        }
        .subscribe {
          padding: 12px 16px;
          font-size: 16px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .small-card {
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
        .title {
          font-family: ${titleFont}, Georgia, serif;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        }
        .author {
          font-size: 14px;
          color: #666;
          margin: 4px 0 0;
        }
      `}</style>
    </section>
  )
}

export default NewsletterCategoryLayout
