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

  // Using the same article service as index.tsx for categories & articles
  const { articles, categories } = getArticleData();
  // Filter to show only articles from the current category (excluding the current one)
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

  const mainStyle: React.CSSProperties =
    layout === 'vertical'
      ? { marginLeft: '250px', padding: '20px' }
      : { marginTop: '140px', padding: '20px' };

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

        {/* BACKDROP */}
        <div
          style={{
            height: '240px',
            backgroundColor: backdropColor,
          }}
        />

        {/* HERO SECTION: White card overlay */}
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
                {/* Additional sidebar content */}
              </aside>
            )}
          </div>
        </main>

        {/* ARTICLE GRID: Only articles from this category */}
        <div className="article-grid-container">
          <ArticleGrid
            articles={gridArticles}
            categories={categories}
            titleFont="GayaRegular"
          />
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
        /* HERO CARD STYLES */
        .hero-card {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 30px;
          align-items: center;
          padding: 0 0 0 60px;
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
          font-weight: normal;
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
          font-weight: normal;
          font-style: italic;
        }
        .hero-image {
          width: 400px;
          height: 250px;
          background-color: #ccc;
          flex-shrink: 0;
        }
        /* MAIN CONTENT LAYOUT */
        .content-wrapper {
          display: flex;
          gap: 20px;
        }
        /* Responsive adjustments for mobile */
        @media (max-width: 768px) {
          .hero-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 0 20px 20px 20px; /* reduce left padding on mobile */
            transform: translateY(-80px);
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
            margin-top: 20px;
          }
        }
        /* ARTICLE GRID container */
        .article-grid-container {
          margin: 20px auto;
          max-width: 1200px;
          padding: 0 20px;
        }
      `}</style>
    </>
  );
};

export default ArticlePage;
