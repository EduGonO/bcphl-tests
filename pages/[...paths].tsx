

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

  // Fetch all articles and categories using your article service helper.
  const { articles, categories } = getArticleData();
  // Filter articles to only keep those from the same category (excluding current one)
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
  // Retain debug overlay controls (layout state remains only for debugging font and such)
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal');
  const [bodyFontSize, setBodyFontSize] = useState<number>(16);
  const [bodyFont, setBodyFont] = useState<'InterRegular' | 'AvenirNextCondensed'>('InterRegular');
  const [titleFont, setTitleFont] = useState<'RecoletaMedium' | 'GayaRegular'>('RecoletaMedium');
  const [imagePreview, setImagePreview] = useState<boolean>(true);
  const [showArticleSidebar, setShowArticleSidebar] = useState<boolean>(true);

  // Format date as "MMM dd, YYYY"
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  // Get the article color from categories, or default to '#f0f0f0'
  const articleColor =
    categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.color ||
    '#f0f0f0';

  // Helper function to convert a hex color to rgba with given opacity
  const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Create a backdrop color (50% opacity version of articleColor)
  const backdropColor = hexToRgba(articleColor, 0.5);

  // Main style remains similar
  const mainStyle: React.CSSProperties =
    layout === 'vertical' ? { marginLeft: '250px', padding: '20px' } : { marginTop: '140px', padding: '20px' };

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
      <Header categories={[]} />

      {/* Backdrop – using the article's category color at 50% opacity */}
      <div
        style={{
          height: '240px',
          backgroundColor: backdropColor,
        }}
      />

      {/* Overlapping white card: starts halfway down the backdrop and extends below */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          padding: '0 0px 0px 60px',
          backgroundColor: '#fff',
          // Only top-left corner has a higher rounding
          borderTopLeftRadius: '142px',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
          transform: 'translateY(-140px)', // Overlap the backdrop
        }}
      >
        {/* Left side: Category, Title, Author/Date */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '14px',
              fontWeight: 'normal',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </p>
          <h1
            style={{
              margin: '0 0 8px',
              fontFamily: titleFont,
              fontSize: '32px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: '0',
              fontSize: '14px',
              fontWeight: 'normal',
              fontStyle: 'italic',
            }}
          >
            {author} &nbsp;•&nbsp; {new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Right side: Gray rectangle */}
        <div
          style={{
            width: '400px',
            height: '250px',
            backgroundColor: '#ccc',
            flexShrink: 0,
          }}
        />
      </div>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px', marginTop: '-20px'}}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Article text */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  marginTop: '20px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: '#333',
                }}
              >
                {content}
              </div>
            </div>

            {/* Sidebar */}
            {showArticleSidebar && (
              <aside
                style={{
                  width: '20%',
                  minWidth: '200px',
                  borderLeft: '1px solid #ddd',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  paddingTop: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  {/* Category label in color */}
                  <span
                    style={{
                      fontSize: '14px',
                      backgroundColor: articleColor,
                      borderRadius: '5px',
                      color: '#fff',
                      padding: '5px 10px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      textTransform: 'uppercase',
                    }}
                  >
                    {category}
                  </span>
                  <span style={{ color: 'gray', fontSize: '14px' }}>{formattedDate}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'gray',
                    }}
                  />
                  <h4 style={{ margin: 0 }}>{author}</h4>
                </div>

                <p style={{ fontStyle: 'italic', marginBottom: '10px' }}>
                  Ceci est une courte biographie de l'auteur...
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <a href="#" style={{ textDecoration: 'none', color: '#3f51b5', marginRight: '10px' }}>
                    Portfolio
                  </a>
                  <a href="#" style={{ textDecoration: 'none', color: '#3f51b5', marginRight: '10px' }}>
                    Twitter
                  </a>
                  <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>
                    LinkedIn
                  </a>
                </div>

                <h4 style={{ marginBottom: '4px' }}>References</h4>
                <ul style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '20px' }}>
                  <li>
                    <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>
                      Example Reference 1
                    </a>
                  </li>
                  <li>
                    <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>
                      Example Reference 2
                    </a>
                  </li>
                  <li>
                    <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>
                      Example Reference 3
                    </a>
                  </li>
                </ul>

                <h4>Commentaires</h4>
                <ul style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '20px' }}>
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

        {/* FOOTER */}
        <Footer />

        {/* DEBUG OVERLAY */}
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
    </>
  );
};

export default ArticlePage;

