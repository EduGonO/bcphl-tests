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
  titleFont = 'GayaRegular',
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
        <button
          className="nav-button left"
          onClick={(e) => {
            e.preventDefault();
            handlePrev();
          }}
          disabled={currentIndex === 0}
          type="button"
        >
          ◀
        </button>
        <button
          className="nav-button right"
          onClick={(e) => {
            e.preventDefault();
            handleNext();
          }}
          disabled={currentIndex === articles.length - 1}
          type="button"
        >
          ▶
        </button>
      </a>
      <style jsx>{`
        .article-block-container {
          margin-bottom: 20px;
          width: 100%;
          position: relative;
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
          height: 280px; /* Taller image placeholder */
          background-size: cover;
          background-position: center;
        }

        .content {
          position: absolute;
          left: 20px;
          bottom: 20px;
          right: 20px;
          /* Removed background and padding for a cleaner look */
          padding: 0;
        }

        .title {
          margin: 0 0 4px;
          font-size: 18px;
          line-height: 1.2;
        }
        .preview {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none; /* No background for a minimal look */
          border: none;
          padding: 4px;
          font-size: 24px;
          color: #fff;
          cursor: pointer;
          z-index: 2;
          transition: background-color 0.2s ease;
        }
        .nav-button:hover:not(:disabled) {
          opacity: 0.8;
        }
        .nav-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .nav-button.left {
          left: 10px;
        }
        .nav-button.right {
          right: 10px;
        }
      `}</style>
    </div>
  );
};

export default ArticleBlock;
