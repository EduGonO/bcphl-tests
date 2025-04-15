import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Header from '../app/components/Header';

type TextEntry = {
  title: string;
  slug: string;
};

type CategoryIndex = {
  name: string;
  texts: TextEntry[];
};

type IndicesProps = {
  indices: CategoryIndex[];
};

// Define your category color map
const categoryColorMap: { [key: string]: string } = {
  'Love Letters': '#f44336',
  'Image-Critique': '#3f51b5',
  'Bascule': '#4caf50',
  'Sensure': '#ff9800',
  'Automaton': '#9c27b0',
  'Bicaméralité': '#009688',
  'Banque des rêves': '#607d8b',
  'Cartographie': '#607d8b',
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Indices: React.FC<IndicesProps> = ({ indices }) => {
  const totalCategories = indices.length;
  const totalArticles = indices.reduce((acc, cat) => acc + cat.texts.length, 0);

  return (
    <>
      <Head>
        <title>Indices – BICÉPHALE</title>
        <meta name="description" content="Index of all categories and texts" />
      </Head>
      <Header
        // Pass categories to Header using the color mapping;
        // if a category isn't in the map, default to '#607d8b'
        categories={indices.map((cat) => ({
          name: cat.name,
          color: categoryColorMap[cat.name] || '#607d8b',
        }))}
      />
      <div
        style={{
          maxWidth: '800px',
          margin: '80px auto',
          padding: '20px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          color: '#333',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            marginBottom: '10px',
            textAlign: 'center',
          }}
        >
          Indices!!
        </h1>
        <p
          style={{
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          {totalCategories} categories, {totalArticles} articles
        </p>
        {indices.map((cat) => (
          <section key={cat.name} style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>
              <Link href={`/?category=${encodeURIComponent(cat.name)}`}>
                <a style={{ color: '#333', textDecoration: 'none' }}>
                  {cat.name}
                </a>
              </Link>
            </h2>
            <ul style={{ listStyleType: 'disc', margin: 0, paddingLeft: '20px' }}>
              {cat.texts.map((text) => (
                <li key={text.slug} style={{ marginBottom: '5px', fontSize: '12px' }}>
                  <Link href={`/${encodeURIComponent(cat.name)}/${text.slug}`}>
                    <a style={{ color: '#333', textDecoration: 'none' }}>
                      {text.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Add a line break */}
        <hr style={{ margin: '40px 0' }} />

        {/* Grid view of categories */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {indices.map((cat) => {
            // Get the color for the category, then create a 50% opacity version
            const catColor = categoryColorMap[cat.name] || '#607d8b';
            const gridBg = hexToRgba(catColor, 0.5);
            return (
              <div
                key={cat.name}
                style={{
                  padding: '20px',
                  backgroundColor: gridBg,
                  textAlign: 'center',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                <Link href={`/?category=${encodeURIComponent(cat.name)}`}>
                  <a style={{ textDecoration: 'none', color: '#333' }}>
                    {cat.name}
                  </a>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global style override to ensure no <a> elements have underlines */}
      <style jsx global>{`
        a {
          text-decoration: none !important;
        }
      `}</style>
    </>
  );
};

export async function getStaticProps() {
  const textsDir = path.join(process.cwd(), 'texts');
  const categoryFolders = fs
    .readdirSync(textsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const indices: CategoryIndex[] = categoryFolders.map((category) => {
    const categoryPath = path.join(textsDir, category);
    const files = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.md'));
    const texts: TextEntry[] = files.map((file) => {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      const lines = content.split('\n').map((line) => line.trim());
      const slug = file.replace('.md', '');
      const title = lines[0].startsWith('#') ? lines[0].replace(/^#+\s*/, '') : slug;
      return { title, slug };
    });
    return { name: category, texts };
  });

  return { props: { indices } };
}

export default Indices;
