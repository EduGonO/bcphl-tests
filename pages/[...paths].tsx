import React, { useState } from 'react';
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

  // Fetch articles and categories from article service
  const { articles, categories } = getArticleData();
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

  // Helper: convert hex to rgba
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

  // We'll remove layout toggles (vertical/horizontal) and rely on a consistent common container style.
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

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

        {/* Backdrop */}
        <div
          style={{
            height: '240px',
            backgroundColor: backdropColor,
          }}
        />

        {/* HERO SECTION – Using common container style */}
        <div className="hero-card common-container" style={{ 
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          padding: '0', // remove extra padding here – common container provides horizontal padding
          backgroundColor: '#fff',
          borderTopLeftRadius: '142px',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
          transform: 'translateY(-140px)',
        }}>
          <div className="hero-text" style={{ flex: 1 }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 'normal', textTransform: 'uppercase', textAlign: 'left' }}>
              {category}
            </p>
            <h1 style={{ margin: '0 0 8px', fontFamily: titleFont, fontSize: '32px', lineHeight: 1.2, textAlign: 'left' }}>
              {title}
            </h1>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: 'normal', fontStyle: 'italic', textAlign: 'left' }}>
              {author} &nbsp;•&nbsp; {formattedDate}
            </p>
          </div>
          <div className="hero-image" style={{
            width: '400px',
            height: '250px',
            backgroundColor: '#ccc',
            flexShrink: 0,
          }} />
        </div>

        {/* MAIN CONTENT – using common container style */}
        <main className="main-content common-container" style={{ padding: '20px 0' }}>
          <div className="content-wrapper" style={{ display: 'flex', gap: '20px' }}>
            <div className="article-text" style={{ flex: 1 }}>
              <div style={{ marginTop: '20px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#333' }}>
                {content}
              </div>
            </div>
            {showArticleSidebar && (
              <aside className="sidebar" style={{
                width: '20%',
                minWidth: '200px',
                borderLeft: '1px solid #ddd',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '24px',
              }}>
                <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span className="sidebar-category" style={{
                    fontSize: '14px',
                    backgroundColor: articleColor,
                    borderRadius: '5px',
                    color: '#fff',
                    padding: '5px 10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}>
                    {category}
                  </span>
                  <span className="sidebar-date" style={{ color: 'gray', fontSize: '14px' }}>
                    {formattedDate}
                  </span>
                </div>
                <div className="sidebar-author" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div className="author-avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'gray' }} />
                  <h4 style={{ margin: 0 }}>{author}</h4>
                </div>
                <p className="sidebar-bio" style={{ fontStyle: 'italic', marginBottom: '10px' }}>
                  Ceci est une courte biographie de l'auteur...
                </p>
                <div className="sidebar-links" style={{ marginBottom: '20px' }}>
                  <a href="#" style={{ textDecoration: 'none', color: '#3f51b5', marginRight: '10px' }}>Portfolio</a>
                  <a href="#" style={{ textDecoration: 'none', color: '#3f51b5', marginRight: '10px' }}>Twitter</a>
                  <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>LinkedIn</a>
                </div>
                <h4 className="sidebar-heading" style={{ marginBottom: '4px' }}>References</h4>
                <ul className="sidebar-list" style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '20px' }}>
                  <li><a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>Example Reference 1</a></li>
                  <li><a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>Example Reference 2</a></li>
                  <li><a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>Example Reference 3</a></li>
                </ul>
                <h4 className="sidebar-heading">Commentaires</h4>
                <ul className="sidebar-list" style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '20px' }}>
                  <li><strong>User1:</strong> Example de commentaire</li>
                  <li><strong>User2:</strong> Un autre exemple de commentaire.</li>
                </ul>
              </aside>
            )}
          </div>
        </main>

        {/* ARTICLE GRID – using common container style */}
        <div className="article-grid-container common-container" style={{ margin: '20px 0' }}>
          <ArticleGrid articles={gridArticles} categories={categories} titleFont="GayaRegular" />
        </div>

        <Footer />

        <DebugOverlay
          layout={layout}
          onToggleLayout={() => setLayout(layout === 'vertical' ? 'horizontal' : 'vertical')}
          bodyFontSize={bodyFontSize}
          onBodyFontSizeChange={setBodyFontSize}
          bodyFont={bodyFont}
          onBodyFontChange={setBodyFont}
          titleFont={titleFont}
          onTitleFontChange={setTitleFont}
          imagePreview={imagePreview}
          onToggleImagePreview={() => setImagePreview(!imagePreview)}
          articleSidebar={showArticleSidebar}
          onToggleArticleSidebar={() => setShowArticleSidebar(!showArticleSidebar)}
        />
      </div>

      <style jsx>{`
        /* Define a common container style to ensure equal widths and horizontal padding */
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
          border-top-left-radius: 142px;
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
          border-bottom-left-radius: 8px;
          transform: translateY(-140px);
        }
        .hero-text p {
          margin: 0 0 8px;
          font-size: 14px;
          text-transform: uppercase;
          text-align: left;
        }
        .hero-text h1 {
          margin: 0 0 8px;
          font-family: ${titleFont};
          font-size: 32px;
          line-height: 1.2;
          text-align: left;
        }
        .hero-text p:last-of-type {
          font-size: 14px;
          font-style: italic;
          text-align: left;
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
        /* Mobile adjustments */
        @media (max-width: 768px) {
          .hero-card {
            flex-direction: column;
            align-items: center;
            padding: 20px; /* mobile: consistent padding on all sides */
            transform: translateY(-80px);
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
        /* ARTICLE GRID container already uses common-container */
      `}</style>
    </>
  );
};

export default ArticlePage;
