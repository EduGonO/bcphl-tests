// /pages/categories/banque.tsx
import React, { useEffect, useRef, useState } from 'react';
import { GetStaticProps } from 'next';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap } from '../../config/categoryColors';
import { Article } from '../../types';
import Header, { Category } from '../../app/components/Header-2';
import Footer from '../../app/components/Footer';

interface BanqueDesRevesPageProps {
  articles: Article[];
  categories: Category[];
}

export default function ImageCritiquePage({ articles, categories }: BanqueDesRevesPageProps) {
  const categoryName = 'Banque des rêves';
  const config = categoryConfigMap[categoryName];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState<{[key: string]: boolean}>({});
  const articleRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parallax effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for fade-in effects
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            setIsIntersecting(prev => ({
              ...prev,
              [entry.target.id]: entry.isIntersecting
            }));
          }
        });
      },
      { threshold: 0.2 }
    );

    // Observe articles
    Object.values(articleRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    // Observe header
    if (headerRef.current) observer.observe(headerRef.current);

    return () => observer.disconnect();
  }, [articles]);

  // Header images rotation
  useEffect(() => {
    if (config.media.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex(current => (current + 1) % config.media.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [config.media]);

  if (!config) {
    return <div>Catégorie introuvable.</div>;
  }

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Generate article background
  const getArticleBackground = (article: Article, index: number) => {
    // Assuming we have headerImages defined somewhere as per your code comment
    const headerImages: {[key: string]: string} = {}; // This should be properly defined in your actual code
    const color = config.color;
    
    const imgStyle = headerImages[article.slug] 
      ? { backgroundImage: `url(${headerImages[article.slug]})` } 
      : { backgroundColor: `${color}${Math.min(10 + (index * 5), 30)}` };
    
    return imgStyle;
  };

  return (
    <div className="page-container">
      <Header categories={categories} />
      
      <div 
        ref={headerRef}
        className={`header-banner ${isIntersecting['header'] ? 'visible' : ''}`}
        style={{ 
          backgroundColor: config.color,
        }}
        id="header"
      >
        <div className="header-content">
          <div className="header-text">
            <span className="category-eyebrow">Rubrique</span>
            <h1>{categoryName}</h1>
            <p className="subtitle">À la une</p>
          </div>
          
          {config.media.length > 0 && (
            <div className="header-images">
              {config.media.map((src, i) => (
                <div 
                  key={i} 
                  className={`header-image ${i === activeIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${src})` }}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="header-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L60,80C120,96,240,128,360,128C480,128,600,96,720,80C840,64,960,64,1080,69.3C1200,75,1320,85,1380,90.7L1440,96L1440,320L0,320Z" 
                  fill="#ffffff"/>
          </svg>
        </div>
      </div>

      <main className="image-critique-page">
        <div className="featured-article">
          {articles.length > 0 && (
            <div 
              className={`featured-card ${isIntersecting['featured'] ? 'visible' : ''}`}
              id="featured"
            >
              <div 
                className="featured-image" 
                style={getArticleBackground(articles[0], 0)}
              >
                <div className="featured-overlay">
                  <span className="featured-label">À la une</span>
                </div>
              </div>
              <div className="featured-content">
                <h2>{articles[0].title}</h2>
                <div className="article-meta">
                  <span className="article-date">{formatDate(articles[0].date)}</span>
                  <span className="article-separator">•</span>
                  <span className="article-author">{articles[0].author}</span>
                </div>
                <p className="article-preview">{articles[0].preview}</p>
                <a href={`/${categoryName}/${articles[0].slug}`} className="read-more-button">
                  Lire la suite
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="arrow-icon">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>

        <h2 className="section-title">Tous les articles</h2>
        
        <div className="article-grid">
          {articles.slice(1).map((article, index) => {
            const refKey = `article-${article.slug}`;
            return (
              <div 
                key={article.slug} 
                ref={el => articleRefs.current[refKey] = el}
                id={refKey}
                className={`article-card ${isIntersecting[refKey] ? 'visible' : ''}`}
                style={{
                  transitionDelay: `${index * 0.1}s`
                }}
              >
                <div 
                  className="article-image" 
                  style={getArticleBackground(article, index + 1)}
                >
                  <div className="article-image-overlay"></div>
                </div>
                <div className="article-content">
                  <h3>{article.title}</h3>
                  <div className="article-meta">
                    <span className="article-date">{formatDate(article.date)}</span>
                    <span className="article-separator">•</span>
                    <span className="article-author">{article.author}</span>
                  </div>
                  <p className="article-preview">{article.preview}</p>
                  <a href={`/${categoryName}/${article.slug}`} className="read-more">
                    Lire la suite
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="read-more-icon">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="category-footer">
          <div className="category-description">
            <h3>À propos de cette collection</h3>
            <p>La Banque des rêves est une collection d'articles explorant l'imaginaire visuel et la critique d'images contemporaines.</p>
          </div>
          <div className="category-cta">
            <a href="#" className="contact-button" style={{ backgroundColor: config.color }}>
              Contacter l'équipe
            </a>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .page-container {
          background-color: #fafafa;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        .header-banner {
          position: relative;
          color: white;
          padding: 0;
          height: 80vh;
          max-height: 240px;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          opacity: 0;
        }
        
        .header-banner.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .header-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 8%;
          position: relative;
          z-index: 2;
        }
        
        .header-text {
          flex: 1;
          max-width: 600px;
          position: relative;
          z-index: 3;
        }
        
        .category-eyebrow {
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
          background-color: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
        }
        
        .header-banner h1 {
          font-size: 4rem;
          font-weight: 800;
          margin: 0 0 1rem;
          line-height: 1.1;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .subtitle {
          font-size: 1.5rem;
          font-weight: 400;
          margin: 0;
          opacity: 0.9;
        }
        
        .header-images {
          flex: 1;
          position: relative;
          height: 100%;
          max-width: 50%;
        }
        
        .header-image {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(1.1);
          transition: opacity 1s ease, transform 1.5s ease;
        }
        
        .header-image.active {
          opacity: 1;
          transform: scale(1);
        }
        
        .header-wave {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          z-index: 2;
          line-height: 0;
        }
        
        .header-wave svg {
          width: 100%;
          height: auto;
        }
        
        .image-critique-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 5%;
          position: relative;
          z-index: 3;
        }
        
        .featured-article {
          display: none;
          margin-bottom: 5rem;
        }
        
        .featured-card {
          display: flex;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s ease, transform 1s ease;
        }
        
        .featured-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .featured-image {
          flex: 1;
          min-height: 400px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .featured-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7));
          display: flex;
          align-items: flex-start;
          padding: 2rem;
        }
        
        .featured-label {
          background-color: ${config.color};
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .featured-content {
          flex: 1;
          padding: 3rem;
        }
        
        .featured-content h2 {
          font-size: 2.5rem;
          margin: 0 0 1rem;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .section-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          font-weight: 700;
          position: relative;
          padding-bottom: 1rem;
        }
        
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100px;
          height: 4px;
          background-color: ${config.color};
        }
        
        .article-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2.5rem;
          margin-bottom: 5rem;
        }
        
        .article-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
        }
        
        .article-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .article-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        
        .article-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .article-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.3));
        }
        
        .article-content {
          padding: 1.5rem;
        }
        
        .article-card h3 {
          font-size: 1.4rem;
          margin: 0 0 0.7rem;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .article-meta {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1rem;
        }
        
        .article-separator {
          margin: 0 0.5rem;
        }
        
        .article-preview {
          font-size: 1rem;
          line-height: 1.6;
          color: #444;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .read-more, .read-more-button {
          display: flex;
          align-items: center;
          color: ${config.color};
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .read-more:hover, .read-more-button:hover {
          color: ${config.color}dd;
        }
        
        .read-more-icon, .arrow-icon {
          width: 16px;
          height: 16px;
          margin-left: 0.5rem;
          transition: transform 0.2s ease;
        }
        
        .read-more:hover .read-more-icon, .read-more-button:hover .arrow-icon {
          transform: translateX(5px);
        }
        
        .read-more-button {
          display: inline-flex;
          align-items: center;
          padding: 0.7rem 1.5rem;
          background-color: ${config.color};
          color: white;
          border-radius: 50px;
          margin-top: 1rem;
          transition: background-color 0.2s ease;
        }
        
        .read-more-button:hover {
          background-color: ${config.color}dd;
          color: white;
        }
        
        .category-footer {
          margin-top: 5rem;
          padding: 3rem;
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .category-description {
          flex: 2;
          padding-right: 2rem;
        }
        
        .category-description h3 {
          margin-top: 0;
          font-size: 1.6rem;
          margin-bottom: 1rem;
        }
        
        .category-description p {
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        
        .category-cta {
          flex: 1;
          text-align: right;
        }
        
        .contact-button {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 50px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        
        .contact-button:hover {
          opacity: 0.9;
        }
        
        /* Mobile Styling */
        @media (max-width: 768px) {
          .header-banner {
            height: 60vh;
            min-height: 400px;
          }
          
          .header-content {
            flex-direction: column;
            padding: 10% 5%;
          }
          
          .header-text {
            max-width: 100%;
            text-align: center;
            padding-bottom: 2rem;
          }
          
          .header-banner h1 {
            font-size: 2.5rem;
          }
          
          .subtitle {
            font-size: 1.2rem;
          }
          
          .header-images {
            max-width: 100%;
            height: 50%;
          }
          
          .featured-card {
            flex-direction: column;
          }
          
          .featured-image {
            min-height: 250px;
          }
          
          .featured-content {
            padding: 2rem;
          }
          
          .featured-content h2 {
            font-size: 1.8rem;
          }
          
          .article-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .category-footer {
            flex-direction: column;
            text-align: center;
            padding: 2rem;
          }
          
          .category-description {
            padding-right: 0;
            margin-bottom: 2rem;
          }
          
          .category-cta {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { articles, categories } = getArticleData();
  const filteredArticles = articles.filter(a => a.category === 'Banque des rêves');
  
  return {
    props: { 
      articles: filteredArticles,
      categories 
    },
  };
};