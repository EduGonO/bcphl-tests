// /app/components/Footer.tsx
import React, { useState, useEffect, useRef } from 'react';

interface FooterProps {
  footerColor?: string;
  marginTop?: string;
}

const Footer: React.FC<FooterProps> = ({ marginTop = '40px' }) => {
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

  const textColor = '#fff';
  const backgroundColor = '#000';

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
            {/* 1. Soutien */}
            <div className="footer-col support-col">
              <p className="section-label">Nous soutenir</p>
              <h4 className="footer-heading">Brigade d’Interventions Contributives</h4>
              <p className="footer-text">La revue Bicéphale est propulsée par la Brigade d’Interventions Contributives.</p>
              <a
                className="support-button"
                href="https://www.helloasso.com/associations/brigade-d-interventions-contributives/formulaires/1"
                target="_blank"
                rel="noopener"
              >
                Nous soutenir
              </a>
            </div>

            {/* 2. Rester en lien(s) */}
            <div className="footer-col links-col">
              <h4 className="footer-heading">Rester en lien(s)</h4>
              <div className="footer-subsection">
                <h5 className="footer-subtitle">Newsletter</h5>
                <p className="footer-text">
                  Consentez-vous à vous abonner à notre newsletter pour recevoir nos meilleurs sélections
                  d&apos;articles et nos événements directement dans votre boite mail ?
                </p>
                <a
                  className="pill-link newsletter-link"
                  href="https://sibforms.com/serve/MUIFAGMMncdAyI0pK_vTiYnFqzGrGlrYzpHdjKLcy55QF9VlcZH4fBfK-qOmzJcslEcSzqsgO8T9qqWQhDm6Wivm1cKw7Emj1-aN4wdauAKe9aYW9DOrX1kGVOtzrKtN20MiOwOb_wYEKjIkEcCwmGHzk9FpEE_5XeOXDvgGfdMPgbbyoWykOn9ibDVITO5Ku0NZUfiBDZgP1nFF"
                  target="_blank"
                  rel="noopener"
                >
                  S&apos;inscrire à notre newsletter !
                </a>
              </div>
              <div className="footer-subsection">
                <h5 className="footer-subtitle">Suivez-nous</h5>
                <a className="footer-link" href="https://www.instagram.com/revuebicephale" target="_blank" rel="noopener">
                  @revuebicephale
                </a>
              </div>
              <div className="footer-subsection">
                <h5 className="footer-subtitle">Écrivez-nous</h5>
                <a className="pill-link contact-link" href="mailto:revue@bicephale.org">
                  revue@bicephale.org
                </a>
              </div>
            </div>

            {/* 3. Contribuer */}
            <div className="footer-col contribute-col">
              <h4 className="footer-heading">Contribuer</h4>
              <div className="footer-subsection">
                <h5 className="footer-subtitle">Commenter</h5>
                <a className="footer-link" href="https://web.hypothes.is/" target="_blank" rel="noopener">
                  Avec Hypothesis, commentez nos articles
                </a>
              </div>
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
          background: ${backgroundColor};
          color: ${textColor};
          padding: 30px 15px;
          margin-top: ${marginTop};
        font-family: 'EnbyGertrude', sans-serif;
          font-size: 14px;
          position: relative;
          z-index: 5;
        }
        .footer-inner {
          max-width: 1024px;
          margin: 0 auto;
          align-items: center;
        }
        .footer-sections {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .footer-sections {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: flex-start;
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        .footer-col a {
          color: ${textColor};
          text-decoration: none;
        }
        .section-label {
          color: #a0f2b5;
          font-size: 14px;
          margin: 0 0 6px;
          font-family: 'EnbyGertrude', sans-serif;
        }
        .footer-heading {
          font-size: 20px;
          margin: 0 0 10px;
          font-weight: 300;
          color: ${textColor};
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        .footer-subtitle {
          font-size: 16px;
          margin: 0 0 6px;
          color: ${textColor};
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
          font-weight: 300;
        }
        .footer-text {
          font-size: 14px;
          margin: 0 0 12px;
          line-height: 1.5;
          color: ${textColor};
          font-family: 'EnbyGertrude', sans-serif;
        }
        .footer-subsection {
          margin-bottom: 16px;
        }
        .footer-link {
          color: #a0f2b5;
          text-decoration: none;
          font-size: 14px;
          font-family: 'EnbyGertrude', sans-serif;
        }
        .footer-link:hover {
          text-decoration: underline;
        }
        .pill-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 14px;
          font-family: 'EnbyGertrude', sans-serif;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .pill-link:hover {
          transform: translateY(-1px);
        }
        .newsletter-link {
          background: #a0f2b5;
          color: #000;
        }
        .contact-link {
          background: #000;
          color: #fff;
          border: 1px solid #a0f2b5;
        }
        .support-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          background: #000;
          color: #fff;
          border: 1px solid #a0f2b5;
          border-radius: 999px;
          font-family: 'EnbyGertrude', sans-serif;
          font-size: 14px;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .support-button:hover {
          transform: translateY(-1px);
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
          border-top: 1px solid rgba(255,255,255,0.2);
        }
        .footer-brand img {
          max-height: 40px;
          margin-bottom: 4px;
          padding-right: 6px;
        }
        .footer-brand p {
          margin: 0;
          font-size: 12px;
          color: ${textColor};
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
          background: ${textColor};
          color: ${backgroundColor};
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default Footer;
