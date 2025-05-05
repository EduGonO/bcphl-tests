// /app/components/NewsletterCategoryLayout.tsx
import React, { useState } from 'react'
import CategoryArticlePreview from './CategoryArticlePreview'
import { Article, Category } from '../../types'

interface Props {
  articles: Article[]
  filteredArticles: Article[]
  categories: Category[]
  titleFont?: string
}

const NewsletterCategoryLayout: React.FC<Props> = ({
  articles,
  filteredArticles,
  categories,
  titleFont = 'GayaRegular',
}) => {
  const [email, setEmail] = useState('')
  const sample = articles[0]

  return (
    <section className="ncl">
      <div className="col left">
        <h2 className="heading">Newsletter</h2>
        <hr />
        <p className="desc">
          Abonnez-vous pour recevoir nos meilleures sélections d'articles directement dans votre boîte mail.
        </p>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            className="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="subscribe">
            S'inscrire
          </button>
        </form>

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
            <h4 className="card-title">{sample.title}</h4>
            <p className="card-author">{sample.author}</p>
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
          padding: 24px 16px 34px 26px;
          font-family: Inter, sans-serif;
        }
        @media(min-width:768px) {
          .ncl { flex-direction: row; }
          .left { flex: 0 0 25%; }
          .right { flex: 1; min-width: 0; }
        }
        .col {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
          }
        .heading {
          font-family: ${titleFont}, Georgia, serif;
          font-size: 24px;
          margin: 0;
          font-weight: 300;
        }
        hr {
          border: none;
          border-bottom: 1px solid #eaeaea;
          margin: 0;
        }
        .desc {
          font-size: 16px;
          line-height: 1.5;
          color: #333;
          margin: 0;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 0px;
        }
        .email {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: Inter, sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .email:focus {
          border-color: #111;
        }
        .subscribe {
          padding: 12px 16px;
          font-size: 14px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .subscribe:hover {
          background: #333;
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
        .card-title {
          font-family: ${titleFont}, Georgia, serif;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          line-height: 1.4;
        }
        .card-author {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </section>
  )
}

export default NewsletterCategoryLayout