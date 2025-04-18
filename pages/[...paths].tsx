import React, { useState } from 'react';
import Script from 'next/script';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import { GetStaticProps, GetStaticPaths } from 'next';
import Header, { Category } from '../app/components/Header';
import DebugOverlay from '../app/components/DebugOverlay';
import Footer from '../app/components/Footer';
import ArticleGrid from '../app/components/ArticleGrid';
import { getArticleData } from '../lib/articleService';

export const getStaticPaths: GetStaticPaths = async () => {
  const textsDir = path.join(process.cwd(), 'texts');
  const pathsArr: { params: { paths: string[] } }[] = [];

  if (fs.existsSync(textsDir)) {
    fs.readdirSync(textsDir).forEach((cat) => {
      const catPath = path.join(textsDir, cat);
      if (fs.lstatSync(catPath).isDirectory()) {
        fs.readdirSync(catPath).forEach((file) => {
          if (file.endsWith('.md')) {
            pathsArr.push({ params: { paths: [cat, file.replace('.md', '')] } });
          }
        });
      }
    });
  }
  return { paths: pathsArr, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const [category, slug] = (params?.paths as string[]) || [];
  const filePath = path.join(process.cwd(), 'texts', category, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContents.split('\n').map((l: string) => l.trim());

  const title = lines[0]?.startsWith('#') ? lines[0].replace(/^#+\s*/, '') : 'Untitled';
  const date = lines[1] || 'Unknown Date';
  const author = lines[2] || 'Unknown Author';
  const content = lines.slice(3).join('\n').trim();

  // Fetch all articles and categories
  const { articles, categories } = getArticleData();
  // Only show grid articles from the current category (excluding current article)
  const gridArticles = articles.filter(
    (a) =>
      a.category.toLowerCase() === category.toLowerCase() &&
      a.slug !== slug
  );

  return { props: { title, date, author, category, content, gridArticles, categories } };
};

const ArticlePage: React.FC<{
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
  gridArticles: { title: string; slug: string; category: string; date: string; author: string; preview: string }[];
  categories: Category[];
}> = ({ title, date, author, category, content, gridArticles, categories }) => {
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal'); 
  const [bodyFontSize, setBodyFontSize] = useState<number>(16);
  const [bodyFont, setBodyFont] = useState<'InterRegular' | 'AvenirNextCondensed'>('InterRegular');
  const [titleFont, setTitleFont] = useState<'RecoletaMedium' | 'GayaRegular'>('RecoletaMedium');
  const [imagePreview, setImagePreview] = useState<boolean>(true);
  const [showArticleSidebar, setShowArticleSidebar] = useState<boolean>(true);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const articleColor =
    categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.color || '#f0f0f0';
  const backdropColor = hexToRgba(articleColor, 0.5);

  return (
    <>
      <Head>
        <title>{title}</title>
        {/* Hypothesis config (optional) */}
          <script
            type="application/json"
            className="js-hypothesis-config"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({ openSidebar: false }),
              }}
            />
      </Head>
      <Script
        src="https://hypothes.is/embed.js"
        strategy="afterInteractive"
      />
      
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: '#fff',
          fontSize: `${bodyFontSize}px`,
          fontFamily: bodyFont,
        }}
      >
        <Header categories={categories} />

        {/* Backdrop using article's category color at 50% opacity */}
        <div
          style={{
            height: '240px',
            backgroundColor: backdropColor,
          }}
        />

        {/* Common container wraps hero, main content, and article grid for consistent widths */}
        <div className="common-container">
          {/* HERO SECTION */}
          <div className="hero-card">
            <div className="hero-text">
              <p>{category}</p>
              <h1>{title}</h1>
              <p>{author} &nbsp;•&nbsp; {formattedDate}</p>
            </div>
            <div className="hero-image" />
          </div>

          {/* MAIN CONTENT */}
          <main className="main-content">
            <div className="content-wrapper">
              <div className="article-text">
                {content}
              </div>
              {showArticleSidebar && (
                <aside className="sidebar">
                  <div className="sidebar-header">
                    <span className="sidebar-category">{category}</span>
                    <span className="sidebar-date">{formattedDate}</span>
                  </div>
                  <div className="sidebar-author">
                    <div className="author-avatar" />
                    <h4>{author}</h4>
                  </div>
                  <p className="sidebar-bio">
                    Ceci est une courte biographie de l'auteur qui est une courte biographie de l'auteur.
                  </p>
                  <div className="sidebar-links">
                    <a href="#">Portfolio</a>
                    <a href="#">Twitter</a>
                    <a href="#">LinkedIn</a>
                  </div>
                  <h4 className="sidebar-heading">References</h4>
                  <ul className="sidebar-list">
                    <li>
                      <a href="#">Example Reference 1</a>
                    </li>
                    <li>
                      <a href="#">Example Reference 2</a>
                    </li>
                    <li>
                      <a href="#">Example Reference 3</a>
                    </li>
                  </ul>
                  <h4 className="sidebar-heading">Commentaires</h4>
                  <ul className="sidebar-list">
                    <li>
                      <strong>User1:</strong> Example de commentaire
                    </li>
                    <li>
                      <strong>User2:</strong> Un autre exemple de commentaire.
                    </li>
                  </ul>
                </aside>
              )}
            </div>
          </main>

          {/* ARTICLE GRID */}
          <div className="article-grid-container">
            <h1 style={{ fontFamily: 'RecoletaMedium', marginLeft: '20px' }}>
              À lire également
            </h1>
            <ArticleGrid articles={gridArticles} categories={categories} titleFont="GayaRegular" />
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        /* Common container ensures unified width and padding */
        .common-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        /* HERO CARD STYLES */
        .hero-card {
          display: flex;
          gap: 30px;
          align-items: center;
          background-color: #fff;
          padding: 0 0px 0px 60px;
          border-top-left-radius: 142px;
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
          border-bottom-left-radius: 8px;
          transform: translateY(-140px);
        }
        .hero-text {
          flex: 1;
          text-align: left;
        }
        .hero-text p {
          margin: 0 0 8px;
          font-size: 14px;
          text-transform: uppercase;
        }
        .hero-text h1 {
          margin: 0 0 8px;
          font-family: ${titleFont};
          font-size: 32px;
          line-height: 1.2;
        }
        .hero-text p:last-of-type {
          font-size: 14px;
          font-style: italic;
        }
        .hero-image {
          width: 400px;
          height: 250px;
          background-color: #ccc;
          flex-shrink: 0;
        }
        /* MAIN CONTENT STYLES */
        .main-content {
          padding: 20px 0;
        }
        .content-wrapper {
          display: flex;
          gap: 20px;
        }
        /* Sidebar styling */
        .sidebar {
          width: 20%;
          min-width: 200px;
          border-left: 1px solid #ddd;
          padding: 24px;
        }
        /* Mobile adjustments */
        @media (max-width: 768px) {
          .hero-card {
            flex-direction: column;
            align-items: center;
            padding: 20px;
            transform: translateY(-142px);
          }
          .hero-text {
            text-align: center;
            padding-top: 20px;
          }
          .hero-image {
            width: 100%;
            height: auto;
            margin-top: 20px;
          }
          .content-wrapper {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            border-left: none;
            padding: 20px;
            margin-top: 20px;
          }
        }
        /* ARTICLE GRID container uses common-container */
        .article-grid-container {
          margin: 20px 0;
        }
      `}</style>
    </>
  );
};

export default ArticlePage;
