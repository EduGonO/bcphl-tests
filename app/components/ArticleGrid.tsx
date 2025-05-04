// /app/components/ArticleGrid.tsx
import React, { useRef, useEffect } from 'react';
import { Article, Category } from '../../types';

interface ArticleGridProps {
  articles: Article[];
  categories: Category[];
  titleFont?: string;
  headerImages?: Record<string, string>; // Optional map of article slugs to image URLs
}

const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
  headerImages = {},
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to handle scroll buttons
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = 350; // Adjust this value based on your card width + gap
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  return (
    <section className="article-grid">
      <div className="grid-container">
        {articles.map((article, index) => {
          const catColor =
            categories.find((c) => c.name === article.category)?.color || '#f0f0f0';

          return (
            <a
              href={`/${article.category}/${article.slug}`}
              key={index}
              className="card-link"
            >
              <div className="card">
                <div 
                  className="card-image"
                  style={{
                    backgroundColor: headerImages[article.slug] ? undefined : catColor + '30',
                  }}
                >
                  {headerImages[article.slug] && (
                    <div className="image-wrapper">
                      <img 
                        src={headerImages[article.slug]} 
                        alt={article.title}
                        className="article-image"
                      />
                    </div>
                  )}
                </div>
                <div className="card-content">
                  <div
                    className="card-category"
                    style={{
                      color: catColor,
                      border: `1px solid ${catColor}`,
                      backgroundColor: catColor + '10',
                    }}
                  >
                    {article.category}
                  </div>
                  <h3 className="card-title">{article.title}</h3>
                  <p className="card-preview">{article.preview}</p>
                  <p className="card-meta">
                    <span className="author">{article.author}</span>
                    <span className="date-separator">•</span>
                    <span className="date">{article.date}</span>
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
      <style jsx>{`
        .article-grid {
          margin: 2rem 0;
          width: 100%;
          position: relative;
        }
        .grid-container {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 24px;
          padding: 10px 0;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .grid-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .card-link {
          flex: 0 0 300px;
          scroll-snap-align: start;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .scroll-controls {
          display: flex;
          justify-content: space-between;
          position: absolute;
          width: 100%;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          padding: 0 10px;
        }
        .scroll-button {
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          pointer-events: auto;
          transition: all 0.2s ease;
          opacity: 0.8;
        }
        .scroll-button:hover {
          opacity: 1;
          transform: scale(1.05);
        }
        .card {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 0;
          overflow: hidden;
          transition: transform 0.2s ease;
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid #e2e2e2;
        }
        .card:hover {
          transform: translateY(-4px);
        }
        .card-image {
          position: relative;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          overflow: hidden;
          background: #f7f7f7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .article-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .card:hover .article-image {
          transform: scale(1.05);
        }
        .category-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 36px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.5);
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.2);
          /* Removed, as we don't want to show this anymore */
          display: none;
        }
        .card-content {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .card-title {
          margin: 12px 0;
          font-size: 20px;
          font-family: ${titleFont}, serif;
          font-weight: 600;
          line-height: 1.3;
          color: #121212;
          letter-spacing: -0.01em;
        }
        .card-preview {
          margin: 0 0 16px;
          font-size: 15px;
          line-height: 1.5;
          color: #444;
          flex-grow: 1;
          font-family: 'Georgia', serif;
        }
        .card-meta {
          margin: 0;
          font-size: 13px;
          color: #666;
          display: flex;
          align-items: center;
        }
        .author {
          font-weight: 500;
        }
        .date-separator {
          margin: 0 6px;
          opacity: 0.6;
        }
        .card-category {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 2px;
          letter-spacing: 0.5px;
          align-self: flex-start;
        }
      `}</style>
    </section>
  );
};

export default ArticleGrid;