// /pages/categories/[category].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { categoryConfigMap } from '../../config/categoryColors';
import { getArticleData } from '../../lib/articleService';
import { Article } from '../../types';
import { ParsedUrlQuery } from 'querystring';

type Props = {
  category: string;
  articles: Article[];
};

interface Params extends ParsedUrlQuery {
  category: string;
}

export default function CategoryPage({ category, articles }: Props) {
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

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const paths = Object.keys(categoryConfigMap).map((category) => ({
    params: { category },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
  if (!params || !params.category || !(params.category in categoryConfigMap)) {
    return { notFound: true };
  }

  const { articles } = getArticleData();
  const category = params.category;
  const filtered = articles.filter((a) => a.category === category);

  return {
    props: { category, articles: filtered },
  };
};
