import React, { useState } from 'react';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import { GetStaticProps, GetStaticPaths } from 'next';
import Header, { Category } from '../app/components/Header';
import DebugOverlay from '../app/components/DebugOverlay';
import Footer from '../app/components/Footer';

// Example category array for color references, if needed
const cats: Category[] = [
  { name: 'Love Letters', color: '#f44336' },
  { name: 'Image-Critique', color: '#3f51b5' },
  { name: 'Bascule', color: '#4caf50' },
  { name: 'Sensure', color: '#ff9800' },
  { name: 'Automaton', color: '#9c27b0' },
  { name: 'Bicaméralité', color: '#009688' },
  { name: 'Banque des rêves', color: '#607d8b' },
  { name: 'Cartographie', color: '#607d8b' },
];

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

const ArticlePage: React.FC<{
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
}> = ({ title, date, author, category, content }) => {
  // Layout states for the DebugOverlay
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [bodyFontSize, setBodyFontSize] = useState<number>(16);
  const [bodyFont, setBodyFont] = useState<'InterRegular' | 'AvenirNextCondensed'>('InterRegular');
  const [titleFont, setTitleFont] = useState<'RecoletaMedium' | 'GayaRegular'>('RecoletaMedium');
  const [imagePreview, setImagePreview] = useState<boolean>(false);
  const [showArticleSidebar, setShowArticleSidebar] = useState<boolean>(true);

  // Determine category color from cats array; default to #607d8b
  const catColor =
    cats.find((c) => c.name.toLowerCase() === category.toLowerCase())?.color || '#607d8b';

  // Format the date to "MMM dd, YYYY"
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  // Layout style
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
          backgroundColor: '#fff',
          fontSize: `${bodyFontSize}px`,
          fontFamily: bodyFont,
        }}
      >
        {/* Standard Header with categories */}
        <Header categories={[]} />

        {/* HERO SECTION
           - Category color as background
           - Circle cutout on the left
           - Title, author, date on the right
        */}
        <div
          style={{
            backgroundColor: catColor,
            padding: '40px 20px',
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
            {/* Left side: circular cutout with a background image */}
            <div
              style={{
                flexShrink: 0,
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundImage: 'url("/media/exampleImage.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Right side: text info */}
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: '0 0 10px',
                  textTransform: 'uppercase',
                  fontFamily: titleFont,
                }}
              >
                {category}
              </h2>
              <h1
                style={{
                  margin: '0 0 10px',
                  fontFamily: titleFont,
                  fontSize: '32px',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h1>
              <p style={{ margin: '0', fontStyle: 'italic', fontSize: '16px' }}>
                By {author} &nbsp;•&nbsp; {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Main content section */}
        <main style={mainStyle}>
          <div style={{ display: 'flex', gap: '20px', margin: '0 auto', maxWidth: '1200px' }}>
            {/* Article text */}
            <div style={{ flex: 1 }}>
              {/* Moved all textual content here */}
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

            {/* Sidebar on the right */}
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
                  <span
                    style={{
                      fontSize: '14px',
                      backgroundColor: catColor,
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
                  Ceci est une courte biographie de l'auteur qui est une courte biographie de l'auteur.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <a
                    href="#"
                    style={{
                      textDecoration: 'none',
                      color: '#3f51b5',
                      marginRight: '10px',
                    }}
                  >
                    Portfolio
                  </a>
                  <a
                    href="#"
                    style={{
                      textDecoration: 'none',
                      color: '#3f51b5',
                      marginRight: '10px',
                    }}
                  >
                    Twitter
                  </a>
                  <a
                    href="#"
                    style={{
                      textDecoration: 'none',
                      color: '#3f51b5',
                    }}
                  >
                    LinkedIn
                  </a>
                </div>

                <h4 style={{ marginBottom: '4px' }}>References</h4>
                <ul
                  style={{
                    paddingLeft: '20px',
                    marginTop: '4px',
                    marginBottom: '20px',
                  }}
                >
                  <li>
                    <a
                      href="#"
                      style={{
                        textDecoration: 'none',
                        color: '#3f51b5',
                      }}
                    >
                      Example Reference 1
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      style={{
                        textDecoration: 'none',
                        color: '#3f51b5',
                      }}
                    >
                      Example Reference 2
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      style={{
                        textDecoration: 'none',
                        color: '#3f51b5',
                      }}
                    >
                      Example Reference 3
                    </a>
                  </li>
                </ul>

                <h4>Commentaires</h4>
                <ul
                  style={{
                    paddingLeft: '20px',
                    marginTop: '4px',
                    marginBottom: '20px',
                  }}
                >
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

          {/* Footer */}
          <Footer />
        </main>

        {/* Debug overlay for controlling layout */}
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
