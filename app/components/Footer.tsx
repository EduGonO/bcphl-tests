// /app/components/Footer.tsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface FooterProps {
  footerColor?: string;
}

const Footer: React.FC<FooterProps> = ({ footerColor = '#607d8b' }) => {
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newsletterOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNewsletterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [newsletterOpen]);

  const toRGBA = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const bgColor = toRGBA(footerColor, 0.32);
  const btn = { background: footerColor, color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' };

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
          <div className="footer-sections">
            {/* 1. Rester en lien(s) */}
            <div className="footer-col">
              <h4 className="footer-heading">Rester en lien(s)</h4>
              <p className="footer-text">Abonnez-vous à la lettre d’information des Bicéphale</p>
              <button style={btn} onClick={() => setNewsletterOpen(true)}>S’abonner</button>
              <p className="footer-text" style={{ marginTop: '12px' }}>Suivez-nous</p>
              <div className="social-row">
                {/* SVG icons here */}
              </div>
            </div>

            {/* 2. Contribuer */}
            <div className="footer-col">
              <h4 className="footer-heading">Contribuer</h4>
              <ul className="footer-list">
                <li><a>Contacter la rédaction</a></li>
                <li><a>Nous soutenir</a></li>
                <li><a>Commenter avec Hypothesis</a></li>
                <li><Link href="/indices"><a>Plan du site</a></Link></li>
                <li><a>Mentions légales</a></li>
              </ul>
            </div>

            {/* 3. Brigade d'intervention */}
            <div className="footer-col">
              <h4 className="footer-heading">Brigade d’Interventions Contributives</h4>
              <p className="footer-text">La revue Bicéphale est propulsée par la Brigade d’Interventions Contributives.</p>
              <button style={btn}>Nous soutenir</button>
            </div>

            {/* 4. Logo + droits */}
            <div className="footer-col footer-brand">
              <img src="/media/logo.png" alt="Logo" />
              <p className="copyright">© Bicéphale, 2025. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          background: ${bgColor};
          color: ${footerColor};
          padding: 30px 15px;
          margin-top: 40px;
          font-family: -apple-system, InterRegular, sans-serif;
          font-size: 14px;
        }
        .footer-inner {
          max-width: 1024px;
          margin: 0 auto;
          align-items: center;
        }
        .footer-sections {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
          @media (min-width: 468px) {
  .footer-sections {
    grid-template-columns: repeat(3, 1fr);
  }
  .footer-brand {
    grid-column: 1 / -1;
  }
}

        .footer-col a {
          color: ${footerColor};
          text-decoration: none;
        }
        .footer-heading {
          font-size: 18px;
          margin-bottom: 8px;
          font-weight: 300;
          color: ${footerColor};
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        .footer-text {
          font-size: 14px;
          margin: 0 0 8px;
          line-height: 1.4;
          color: ${footerColor};
          font-family: -apple-system, InterRegular, sans-serif;
        }
        .social-row {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-list li {
          margin-bottom: 6px;
          font-size: 14px;
          font-family: -apple-system, InterRegular, sans-serif;
        }
        /* Logo full width at bottom */
        .footer-brand {
          grid-column: 1 / -1;
          text-align: center;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          padding-top: 16px;
          gap: 10px;
          border-top: 1px solid rgba(0,0,0,0.1);
        }
        .footer-brand img {
          max-height: 40px;
          margin-bottom: 4px;
          padding-right: 6px;
        }
        .footer-brand p {
          margin: 0;
          font-size: 12px;
          color: ${footerColor};
        }
        /* Overlay */
        .overlay {
          position: fixed;
          inset: 0;
          backdrop-filter: blur(4px);
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .popover {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 300px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .popover h3 {
          margin-bottom: 10px;
          font-size: 14px;
          color: #333;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        .popover p,
        .email-input {
          font-size: 12px;
          color: #333;
        }
        .email-input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .subscribe-button {
          width: 100%;
          padding: 8px;
          font-size: 12px;
          cursor: pointer;
          background: ${footerColor};
          color: #fff;
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default Footer;
