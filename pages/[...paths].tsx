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
}> = ({ title, date, author, category, content }) => {
  /************************************************************
   * For color lookup, if you have a categories array:
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

  // We find the matching color or use a default (#f0f0f0).
  const articleColor =
    categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.color || '#f0f0f0';

  /************************************************************
   * DebugOverlay States (no layout toggles)
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
       Wrapping everything in a flex container ensures the footer
       can sit at the bottom (flex:1 in main content).
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
        {/* Standard Header with no category dropdown logic */}
        <Header categories={[]} />

        {/************************************************************
         TOP BACKDROP
         - For demonstration, we use a color OR background image
         - We'll do a 300px-high section to mimic the "colorful texture"
        ************************************************************/}
        <div
          style={{
            height: '300px',
            //backgroundImage: 'url("/media/exampleImage.jpg")', // or 
            backgroundColor: articleColor,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* The backdrop only. The row with category, title, image
              will partially overlap via negative margin. */}
        </div>

        {/************************************************************
         Category/Title/Author + Gray Image
         - starts "in the middle" of the backdrop, going below it.
         - negative margin to overlap the above section.
        ************************************************************/}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            gap: '30px',
            alignItems: 'flex-start',
            padding: '0 20px',
            transform: 'translateY(-150px)', // Overlap the backdrop
            marginBottom: '-150px', // ensure space is recaptured so the rest doesn't jump up
          }}
        >
          {/* Left side: category, title, date/author */}
          <div style={{ flex: 1 }}>
            {/* Category in same font style as author + date */}
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
              {author} &nbsp;•&nbsp; {formattedDate}
            </p>
          </div>

          {/* Right side: a big gray rectangle to represent example image */}
          <div
            style={{
              width: '400px',
              height: '250px',
              backgroundColor: '#ccc',
              flexShrink: 0,
            }}
          />
        </div>

        {/************************************************************
         MAIN CONTENT
         ************************************************************/}
        <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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

        {/************************************************************
         FOOTER
         ************************************************************/}
        <Footer />

        {/************************************************************
         DEBUG OVERLAY (no layout toggles)
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
