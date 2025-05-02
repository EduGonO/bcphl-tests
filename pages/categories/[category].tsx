// /pages/categories/[category].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { categoryConfigMap } from '../../config/categoryColors';
import { getArticleData } from '../../lib/articleService';
import { Article } from '../../types';

export default function CategoryPage({ category, articles }: { category: string; articles: Article[] }) {
  const config = categoryConfigMap[category];
  if (!config) return <div>Catégorie introuvable.</div>;

  return (
    <div>
      <h1 style={{ color: config.color }}>{category}</h1>
      {config.media.map((src, i) => (
        <img key={i} src={src} alt={`Media ${i}`} />
      ))}
      <ul>
        {articles.map((a) => (
          <li key={a.slug}>{a.title}</li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(categoryConfigMap).map((category) => ({
    params: { category },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = typeof params?.category === 'string' ? params.category : null;

  if (!category || !(category in categoryConfigMap)) {
    return { notFound: true };
  }

  const { articles } = getArticleData();
  const filtered = articles.filter((a) => a.category === category);

  return {
    props: {
      category,
      articles: filtered,
    },
  };
};
