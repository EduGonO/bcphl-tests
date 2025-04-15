// /app/components/ArticleList.tsx
import React from 'react';
import { Article, Category } from '../../types';

interface ArticleListProps {
  articles: Article[];
  categories: Category[];
  titleFont?: string;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, categories, titleFont = 'RecoletaMedium' }) => {
  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      {articles.map((article, index) => {
        const catColor = categories.find((c) => c.name === article.category)?.color || '#f0f0f0';
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
            <div
              style={{
                width: '42px',
                height: '60px',
                backgroundColor: '#e0e0e0',
                marginRight: '15px',
                borderRadius: '4px',
              }}
            />
            <div style={{ flex: 1 }}>
              <a
                href={`/${article.category}/${article.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h3
                  style={{
                    margin: '0 0 5px',
                    fontSize: '18px',
                    fontFamily: titleFont,
                    color: '#000',
                  }}
                >
                  {article.title}
                </h3>
              </a>
              <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#666' }}>
                {article.date} • {article.author}
              </p>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '3px 8px',
                  color: catColor,
                  border: `1px solid ${catColor}`,
                  backgroundColor: catColor + '20',
                  borderRadius: '4px',
                  marginBottom: '10px',
                }}
              >
                {article.category}
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#444' }}>
                {article.preview}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArticleList;
