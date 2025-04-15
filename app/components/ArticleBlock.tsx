// /app/components/ArticleBlock.tsx
import React, { useState } from 'react';
import { Article, Category } from '../../types';

interface ArticleBlockProps {
  articles: Article[];
  categories: Category[];
  titleFont?: string;
}

const ArticleBlock: React.FC<ArticleBlockProps> = ({
  articles,
  categories,
  titleFont = 'RecoletaMedium',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex];
  const catColor =
    categories.find((c) => c.name === currentArticle.category)?.color ||
    '#f0f0f0';

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, articles.length - 1));
  };

  return (
    <div className="article-block-container">
      <div className="navigation">
        <button onClick={handlePrev} disabled={currentIndex === 0}>
          ◀
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === articles.length - 1}
        >
          ▶
        </button>
      </div>
      <a
        href={`/${currentArticle.category}/${currentArticle.slug}`}
        className="article-block"
      >
        <div
          className="image-placeholder"
          style={{ backgroundColor: catColor + '80' /* 50% opacity */ }}
        />
        <div className="content">
          <h2 className="title" style={{ fontFamily: titleFont }}>
            {currentArticle.title}
          </h2>
          <p className="preview">{currentArticle.preview}</p>
        </div>
      </a>

      <style jsx>{`
        .article-block-container {
          margin: 20px auto;
          width: 100%;
          position: relative;
        }

        .navigation {
          text-align: center;
          margin-bottom: 10px;
        }
        .navigation button {
          margin: 0 10px;
          padding: 5px 10px;
          font-size: 18px;
          background: none;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .navigation button:hover:not(:disabled) {
          background-color: #eee;
        }
        .navigation button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .article-block {
          display: block;
          position: relative;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          border: 1px solid #ddd;
          border-radius: 6px;
          transition: box-shadow 0.3s ease;
        }
        .article-block:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .image-placeholder {
          width: 100%;
          height: 250px;
          background-size: cover;
          background-position: center;
        }

        .content {
          position: absolute;
          left: 20px;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          padding: 12px;
          border-radius: 4px;
        }

        .title {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 1.2;
        }
        .preview {
          margin: 0;
          font-size: 16px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ArticleBlock;
