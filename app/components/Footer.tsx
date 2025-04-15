import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface FooterProps {
  /**
   * Category color (or default) to be used for styling.
   * This color is used at full opacity for titles and at 50% opacity for the background.
   * Example: "#607d8b"
   */
  footerColor?: string;
}

/**
 * Converts a hex color (e.g. "#607d8b") to an rgba() string with the given alpha.
 */
const hexToRGBA = (hex: string, alpha: number): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) { // Expected "#RRGGBB"
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Footer: React.FC<FooterProps> = ({ footerColor = '#607d8b' }) => {
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        newsletterOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setNewsletterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [newsletterOpen]);

  const linkStyle: React.CSSProperties = {
    color: '#000',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  return (
    <>
      {newsletterOpen && (
        <div className="overlay">
          <div className="popover" ref={popoverRef}>
            <h3>Lettre d’information</h3>
            <p>Abonnez-vous à la lettre d’information de Bicéphale :</p>
            <input type="email" placeholder="Votre email" className="email-input" />
            <button className="subscribe-button">S’abonner</button>
          </div>
        </div>
      )}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-col">
              <h4 className="footer-title">Rester en lien(s)</h4>
              <p className="footer-text">
                Abonnez-vous à la lettre d’information des Bicéphale
              </p>
              <button className="action-button" onClick={() => setNewsletterOpen(true)}>
                S’abonner
              </button>
              <p className="footer-text">Suivez-nous</p>
              <div className="social-row">
                <a href="#" style={linkStyle}>
                  <img src="/media/social-youtube.png" alt="YouTube" style={{ height: '24px' }} />
                </a>
                <a href="#" style={linkStyle}>
                  <img src="/media/social-instagram.png" alt="Instagram" style={{ height: '24px' }} />
                </a>
                <a href="#" style={linkStyle}>
                  <img src="/media/social-facebook.png" alt="Facebook" style={{ height: '24px' }} />
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4 className="footer-title">Contribuer</h4>
              <ul className="footer-list">
                <li>
                    <a style={linkStyle}>Contacter la rédaction</a>
                  </Link>
                </li>
                <li>
                  <a href="#" style={linkStyle}>Nous soutenir</a>
                </li>
                <li>
                  <a href="#" style={linkStyle}>Commenter avec Hypothesis</a>
                </li>
                <li>
                  <Link href="/indices">
                    <a href="#" style={linkStyle}>Plan du site</a>
                  </Link> 
                </li>
                <li>
                  <a href="#" style={linkStyle}>Mentions légales</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="powered-by">
              <p>
                La revue Bicéphale est propulsée par
                <br />
                <strong>Brigade d’Interventions Contributives</strong>
              </p>
              <button className="action-button">Nous soutenir</button>
            </div>
            <div className="footer-brand">
              <img
                src="/media/logo.png"
                alt="Logo"
                style={{ height: '60px', marginBottom: '8px' }}
              />
              <p className="copyright">
                © Bicéphale, 2025. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <style jsx>{`
        .footer {
          background: ${hexToRGBA(footerColor, 0.5)};
          color: #000;
          padding: 40px 20px 20px;
          margin-top: 40px;
        }
        .footer-inner {
          max-width: 1024px;
          margin: 0 auto;
        }
        .footer-top {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }
        @media (min-width: 768px) {
          .footer-top {
            flex-direction: row;
            justify-content: space-between;
          }
        }
        .footer-col {
          flex: 1;
        }
        .footer-title {
          font-size: 20px;
          margin-bottom: 12px;
          font-weight: bold;
          font-family: 'RecoletaMedium', 'GayaRegular', sans-serif;
          color: ${footerColor}; /* Full opacity for titles */
        }
        .footer-text {
          margin: 0 0 10px;
          font-size: 14px;
        }
        .social-row {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 14px;
        }
        .footer-list li {
          margin-bottom: 8px;
        }
        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          border-top: 1px solid #ccc;
          padding-top: 20px;
        }
        @media (min-width: 1024px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        .powered-by p {
          margin: 0 0 8px;
          font-size: 14px;
          line-height: 1.4;
        }
        .footer-brand {
          text-align: center;
        }
        .footer-brand img {
          display: block;
          margin: 0 auto 8px;
        }
        .copyright {
          margin: 0;
          font-size: 12px;
        }
        .action-button {
          background: #000;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          margin-top: 8px;
        }
        /* Newsletter overlay styles */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          backdrop-filter: blur(4px);
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .popover {
          background: #fff;
          color: #000;
          padding: 20px;
          border-radius: 8px;
          width: 300px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .popover h3 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #333;
        }
        .popover p {
          margin: 0 0 10px;
          font-size: 14px;
          color: #666;
        }
        .email-input {
          width: 100%;
          padding: 8px;
          font-size: 14px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .subscribe-button {
          width: 100%;
          padding: 8px;
          font-size: 14px;
          cursor: pointer;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default Footer;
