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

const btn = { background: '#222', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' };

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
          Abonnez-vous pour recevoir nos meilleures sélections d'articles directement dans votre boîte mail, quelque fois par mois.
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
              <a
                href="https://sibforms.com/serve/MUIFAGMMncdAyI0pK_vTiYnFqzGrGlrYzpHdjKLcy55QF9VlcZH4fBfK-qOmzJcslEcSzqsgO8T9qqWQhDm6Wivm1cKw7Emj1-aN4wdauAKe9aYW9DOrX1kGVOtzrKtN20MiOwOb_wYEKjIkEcCwmGHzk9FpEE_5XeOXDvgGfdMPgbbyoWykOn9ibDVITO5Ku0NZUfiBDZgP1nFF"
                target="_blank"
                rel="noopener"
                style={btn}
                className='subscribe'
              >
                S’abonner
              </a>
        </form>

        {/*sample && (
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
        )*/}
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
          box-sizing: border-box;
          font-family: EnbyGertrude, sans-serif;
        }
        @media(min-width:768px) {
          .ncl { flex-direction: row; min-width:0; }
          .left { flex: 0 0 25%; min-width: 0; }
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
          font-size: 28px;
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
          min-width: 0;
          width: 100%;
          max-width: 100%;
        }
        .email {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: EnbyGertrude, sans-serif;
          outline: none;
          transition: border-color 0.2s;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
        }
        .email:focus {
          border-color: #111;
        }
        .subscribe {
          padding: 12px 16px;
          font-size: 14px;
          background: #333;
          color: #eee;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          box-sizing: border-box;
        }
        .subscribe:hover {
          background: #333;
        }
        .subscribe a {
          text-decoration: none;
        }
        .subscribe.a {
          text-decoration: none;
        }
        .a {
          text-decoration: none;
        }
        a {
          text-decoration: none;
        }
        .small-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
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
          font-weight: 300;
          margin: 0;
          line-height: 1.2;
        }
        .card-author {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.2;
        }
      `}</style>
    </section>
  )
}

export default NewsletterCategoryLayout