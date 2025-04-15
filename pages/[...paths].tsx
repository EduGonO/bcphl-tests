import React, { useState } from 'react';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import { GetStaticProps, GetStaticPaths } from 'next';

import Header, { Category } from '../app/components/Header';
import DebugOverlay from '../app/components/DebugOverlay';
import Footer from '../app/components/Footer';

/************************************************************
 * getStaticPaths + getStaticProps
 ************************************************************/
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

  return { props: { title, date, author, category, content } };
};

/************************************************************
 * ArticlePage Component
 ************************************************************/
const ArticlePage: React.FC<{
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
  // If you have a categories array available from somewhere else,
  // pass it in as props. For now, we demonstrate "just looking it up" here.
}> = ({ title, date, author, category, content }) => {
  /************************************************************
   * We rely on an external categories array if available,
   * or define it here. The key is to find the color by name,
   * defaulting to #f0f0f0.
   ************************************************************/
   
  const categories: Category[] = [
    { name: 'Love Letters', color: '#f44336' },
    { name: 'Image-Critique', color: '#3f51b5' },
    { name: 'Bascule', color: '#4caf50' },
    { name: 'Sensure', color: '#ff9800' },
    { name: 'Automaton', color: '#9c27b0' },
    { name: 'Bicaméralité', color: '#009688' },
    { name: 'Banque des rêves', color: '#607d8b' },
    { name: 'Cartographie', color: '#607d8b' },
  ];
  
  const articleColor =
    categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.color || '#f0f0f0';

  /************************************************************
   * Basic states for DebugOverlay
   ************************************************************/
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal'); 
  const [bodyFontSize, setBodyFontSize] = useState<number>(16);
  const [bodyFont, setBodyFont] = useState<'InterRegular' | 'AvenirNextCondensed'>('InterRegular');
  const [titleFont, setTitleFont] = useState<'RecoletaMedium' | 'GayaRegular'>('RecoletaMedium');
  const [imagePreview, setImagePreview] = useState<boolean>(false);
  const [showArticleSidebar, setShowArticleSidebar] = useState<boolean>(true);

  // Format date as "MMM dd, YYYY"
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      {/************************************************************
       Wrap entire page in a flex container so the Footer sits
       at the bottom edge. We'll let the main content flex:1
      ************************************************************/}
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

        {/************************************************************
         Hero Section
         - Uses articleColor as background
         - Category + Title + Author/Date on LEFT
         - Example circle image on RIGHT
         ************************************************************/}
        <div
          style={{
            backgroundColor: articleColor,
            padding: '60px 20px',
            color: '#fff',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '40px',
            }}
          >
            {/* LEFT: Category, Title, Author/Date */}
            <div style={{ flex: 1 }}>
              {/* Category in the same font as author/date */}
              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: '14px',
                  fontWeight: 'normal',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </p>
              <h1
                style={{
                  margin: '0 0 10px',
                  fontFamily: titleFont,
                  fontSize: '32px',
                  lineHeight: '1.2',
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
                {author} &nbsp;•&nbsp; {formattedDate}
              </p>
            </div>

            {/* RIGHT: Circular cutout image */}
            <div
              style={{
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src="/media/exampleImage.jpg"
                alt="Hero"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        </div>

        {/************************************************************
         Main Content (flex:1) so Footer sits at bottom
        ************************************************************/}
        <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Article content */}
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
                  {/* Same color as hero */}
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

        {/************************************************************
         Footer at the very bottom, 100% width
        ************************************************************/}
        <Footer />

        {/************************************************************
         DebugOverlay - No references to layout
        ************************************************************/}
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
