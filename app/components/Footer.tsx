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

  // Refined link & button styles – you can further adjust these as needed.
  const linkStyle: React.CSSProperties = {
    color: '#000',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
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
              <p className="footer-text">Abonnez-vous à la lettre d’information des Bicéphale</p>
              <button style={buttonStyle} onClick={() => setNewsletterOpen(true)}>
                S’abonner
              </button>
              <p className="footer-text">Suivez-nous</p>
              <div className="social-row">
                <a href="#" style={linkStyle}>
                  <img src="/media/social-youtube.png" alt="YouTube" style={{ height: 24 }} />
                </a>
                <a href="#" style={linkStyle}>
                  <img src="/media/social-instagram.png" alt="Instagram" style={{ height: 24 }} />
                </a>
                <a href="#" style={linkStyle}>
                  <img src="/media/social-facebook.png" alt="Facebook" style={{ height: 24 }} />
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4 className="footer-heading">Contribuer</h4>
              <ul className="footer-list">
                <li>
                  <a style={linkStyle}>Contacter la rédaction</a>
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

      {/* Styled JSX */}
      <style jsx>{`
        .footer {
          background: ${bgColor};
          color: #000;
          padding: 40px 20px;
          margin-top: 40px;
          font-family: sans-serif;
        }
        .footer-inner {
          max-width: 1024px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        /* Top section: responsive two-column layout */
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
        .footer-heading {
          font-size: 20px;
          margin-bottom: 12px;
          font-weight: bold;
          color: ${footerColor};
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
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
        }
        .footer-list li {
          margin-bottom: 8px;
        }
        /* Bottom section */
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
          font-size: 14px;
          line-height: 1.4;
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
