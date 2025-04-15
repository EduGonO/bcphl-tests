// /app/components/Footer.tsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface FooterProps {
  /**
   * The category color is used to style the footer.
   * It is applied at 50% opacity in the background and 100% opacity for the titles.
   * Provide a hex value (e.g. "#607d8b"). Default is "#607d8b".
   */
  footerColor?: string;
}

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
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [newsletterOpen]);

  // Helper to convert a hex code to an rgba color string
  const toRGBA = (hex: string, alpha: number): string => {
    const cleanedHex = hex.replace('#', '');
    const r = parseInt(cleanedHex.substring(0, 2), 16);
    const g = parseInt(cleanedHex.substring(2, 4), 16);
    const b = parseInt(cleanedHex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Background color with 50% opacity
  const bgColor = toRGBA(footerColor, 0.5);

  // Update button styles to use the footer color (full opacity)
  const buttonStyle: React.CSSProperties = {
    background: footerColor, // use footerColor instead of black
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  };

  return (
    <>
      {/* Newsletter Modal */}
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

      {/* Footer Layout */}
      <footer className="footer">
        <div className="footer-inner">
          {/* Top Section: Two Columns */}
          <div className="footer-top">
            <div className="footer-col">
              <h4 className="footer-heading">Rester en lien(s)</h4>
              <p className="footer-text">
                Abonnez-vous à la lettre d’information des Bicéphale
              </p>
              <button style={buttonStyle} onClick={() => setNewsletterOpen(true)}>
                S’abonner
              </button>
              <p className="footer-text">Suivez-nous</p>
              <div className="social-row">
                <a href="#" style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                  {/* YouTube SVG Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a2.961 2.961 0 0 0-2.083-2.083C19.799 3.5 12 3.5 12 3.5s-7.798 0-9.415.603A2.961 2.961 0 0 0 .502 6.186 30.477 30.477 0 0 0 0 12a30.477 30.477 0 0 0 .502 5.814 2.961 2.961 0 0 0 2.083 2.083C4.202 20.5 12 20.5 12 20.5s7.798 0 9.415-.603a2.961 2.961 0 0 0 2.083-2.083A30.477 30.477 0 0 0 24 12a30.477 30.477 0 0 0-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a href="#" style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                  {/* Instagram SVG Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.206.056 1.97.247 2.429.415a4.92 4.92 0 0 1 1.675.975 4.92 4.92 0 0 1 .975 1.675c.168.459.359 1.223.415 2.429.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.056 1.206-.247 1.97-.415 2.429a4.92 4.92 0 0 1-.975 1.675 4.92 4.92 0 0 1-1.675.975c-.459.168-1.223.359-2.429.415-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.206-.056-1.97-.247-2.429-.415a4.92 4.92 0 0 1-1.675-.975 4.92 4.92 0 0 1-.975-1.675c-.168-.459-.359-1.223-.415-2.429C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.056-1.206.247-1.97.415-2.429A4.92 4.92 0 0 1 3.623 2.97a4.92 4.92 0 0 1 1.675-.975c.459-.168 1.223-.359 2.429-.415C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.775.127 4.66.308 3.758.631a7.07 7.07 0 0 0-2.548 1.641A7.07 7.07 0 0 0 .631 4.758C.308 5.66.127 6.775.07 8.052.012 9.332 0 9.741 0 12s.012 2.668.07 3.948c.057 1.277.238 2.392.561 3.294a7.07 7.07 0 0 0 1.641 2.548 7.07 7.07 0 0 0 2.548 1.641c.902.323 2.017.504 3.294.561C9.332 23.988 9.741 24 12 24s2.668-.012 3.948-.07c1.277-.057 2.392-.238 3.294-.561a7.07 7.07 0 0 0 2.548-1.641 7.07 7.07 0 0 0 1.641-2.548c.323-.902.504-2.017.561-3.294.058-1.28.07-1.689.07-3.948s-.012-2.668-.07-3.948c-.057-1.277-.238-2.392-.561-3.294a7.07 7.07 0 0 0-1.641-2.548A7.07 7.07 0 0 0 20.242.631C19.34.308 18.225.127 16.948.07 15.668.012 15.259 0 12 0z" />
                    <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998z" />
                    <circle cx="18.406" cy="5.594" r="1.44" />
                  </svg>
                </a>
                <a href="#" style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                  {/* Facebook SVG Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35C.602 0 0 .6 0 1.337v21.326C0 23.4.602 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.797.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.723 0 1.325-.6 1.325-1.337V1.337C24 .6 23.398 0 22.675 0z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4 className="footer-heading">Contribuer</h4>
              <ul className="footer-list">
                <li>
                  <a style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                    Contacter la rédaction
                  </a>
                </li>
                <li>
                  <a href="#" style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                    Nous soutenir
                  </a>
                </li>
                <li>
                  <a href="#" style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                    Commenter avec Hypothesis
                  </a>
                </li>
                <li>
                  <Link href="/indices">
                    <a style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                      Plan du site
                    </a>
                  </Link>
                </li>
                <li>
                  <a href="#" style={{ color: '#000', textDecoration: 'none', cursor: 'pointer' }}>
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div className="powered-by">
              <p>
                La revue Bicéphale est propulsée par
                <br />
                <strong>Brigade d’Interventions Contributives</strong>
              </p>
              <button style={buttonStyle}>Nous soutenir</button>
            </div>
            <div className="footer-brand">
              <img src="/media/logo.png" alt="Logo" style={{ height: '60px', marginBottom: '8px' }} />
              <p className="copyright">
                © Bicéphale, 2025. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          background: ${bgColor};
          color: #000;
          padding: 30px 15px;
          margin-top: 40px;
          font-family: sans-serif;
          font-size: 12px; /* Unified smaller text size */
        }
        .footer-inner {
          max-width: 1024px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        /* Top Section */
        .footer-top {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
        /* Increase title size for the two key headings */
        .footer-heading {
          font-size: 18px;
          margin-bottom: 10px;
          font-weight: bold;
          color: ${footerColor};
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        .footer-text {
          margin: 0 0 8px;
          font-size: 12px;
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
        }
        .footer-list li {
          margin-bottom: 8px;
        }
        /* Bottom Section */
        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
          }
        }
        .powered-by p {
          margin: 0 0 8px;
          font-size: 12px;
          line-height: 1.2;
          /*text-align: center;*/
        }
        .footer-brand {
          text-align: center;
        }
        .footer-brand img {
          display: block;
          margin: 0 auto;
        }
        .copyright {
          margin: 0;
          font-size: 12px;
        }
        /* Newsletter Overlay */
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
          text-align: center;
        }
        .popover h3 {
          margin: 0 0 10px;
          font-size: 12px;
          color: #333;
        }
        .popover p {
          margin: 0 0 10px;
          font-size: 12px;
          color: #666;
        }
        .email-input {
          width: 100%;
          padding: 8px;
          font-size: 12px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .subscribe-button {
          width: 100%;
          padding: 8px;
          font-size: 12px;
          cursor: pointer;
          background: ${footerColor}; /* Use the footer's full opacity color */
          color: #fff;
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default Footer;