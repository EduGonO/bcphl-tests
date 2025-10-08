import Head from "next/head";
import React, { CSSProperties, useMemo, useState } from "react";

interface PolaroidSide {
  title: string;
  subtitle: string;
  note: string;
  fill: string;
  accent: string;
}

interface PolaroidPair {
  id: string;
  variant:
    | "drift"
    | "flip"
    | "slide"
    | "tilt"
    | "rise"
    | "fan"
    | "peek"
    | "float"
    | "wave"
    | "bounce"
    | "fold"
    | "cascade";
  front: PolaroidSide;
  back: PolaroidSide;
}

const polaroidPairs: PolaroidPair[] = [
  {
    id: "atelier-01",
    variant: "drift",
    front: {
      title: "Rosa Marotte",
      subtitle: "Archiviste éphémère",
      note: "Collectionne les souvenirs fragiles.",
      fill: "linear-gradient(135deg, #ffd9ec 0%, #ffc1fd 100%)",
      accent: "#f27ca6",
    },
    back: {
      title: "Découpe les rêves",
      subtitle: "Les assemble sur des fils invisibles.",
      note: "Atelier nocturne, lampe violette.",
      fill: "linear-gradient(135deg, #c5b5ff 0%, #f6d5ff 100%)",
      accent: "#7158d3",
    },
  },
  {
    id: "atelier-02",
    variant: "flip",
    front: {
      title: "Yanis Dupré",
      subtitle: "Cartographe sonore",
      note: "Enregistre les pas du matin.",
      fill: "linear-gradient(145deg, #d7f6ff 0%, #b0d8ff 100%)",
      accent: "#4f90ff",
    },
    back: {
      title: "Réveille les échos",
      subtitle: "Compose les constellations urbaines.",
      note: "Collection de microphones vintage.",
      fill: "linear-gradient(145deg, #9ad5ff 0%, #c7f3ff 100%)",
      accent: "#1e76ff",
    },
  },
  {
    id: "atelier-03",
    variant: "slide",
    front: {
      title: "Nahla S.",
      subtitle: "Poétesse cartonne",
      note: "Tisse des slogans pliables.",
      fill: "linear-gradient(140deg, #ffe9b7 0%, #ffd698 100%)",
      accent: "#ff9f24",
    },
    back: {
      title: "Danse avec les marges",
      subtitle: "Projette des mots sur les façades.",
      note: "Toujours une craie fluo dans la poche.",
      fill: "linear-gradient(140deg, #ffe1a1 0%, #ffcbb4 100%)",
      accent: "#ff7d4f",
    },
  },
  {
    id: "atelier-04",
    variant: "tilt",
    front: {
      title: "Luca Perret",
      subtitle: "Ingénieur luminescent",
      note: "Fait respirer les ampoules.",
      fill: "linear-gradient(135deg, #ffe1f0 0%, #ffe7c7 100%)",
      accent: "#ffb366",
    },
    back: {
      title: "Regarde l'aube",
      subtitle: "Écrit des plans avec des halos.",
      note: "Inventeur du neon-accordéon.",
      fill: "linear-gradient(135deg, #f9f1ff 0%, #ffd4e5 100%)",
      accent: "#ff7da0",
    },
  },
  {
    id: "atelier-05",
    variant: "rise",
    front: {
      title: "Louna Diallo",
      subtitle: "Pépiniériste textuelle",
      note: "Fait germer les manifestes.",
      fill: "linear-gradient(150deg, #dafbe7 0%, #bff0d6 100%)",
      accent: "#4fb080",
    },
    back: {
      title: "Chante les récoltes",
      subtitle: "Publie des herbiers de voix.",
      note: "Parfums d'agrumes et de menthe.",
      fill: "linear-gradient(150deg, #c8f7dd 0%, #e0ffef 100%)",
      accent: "#3e9d6d",
    },
  },
  {
    id: "atelier-06",
    variant: "fan",
    front: {
      title: "Malo Écru",
      subtitle: "Relieur de météores",
      note: "Coud les poussières d'étoiles.",
      fill: "linear-gradient(120deg, #d0dcff 0%, #98b5ff 100%)",
      accent: "#5b6eff",
    },
    back: {
      title: "Scelle les orages",
      subtitle: "Relit les ciels en marge.",
      note: "Chercheur en reliures cosmiques.",
      fill: "linear-gradient(120deg, #a9bbff 0%, #dce5ff 100%)",
      accent: "#4a5bff",
    },
  },
  {
    id: "atelier-07",
    variant: "peek",
    front: {
      title: "Élise Bêta",
      subtitle: "Sculptrice de brumes",
      note: "Fige les silhouettes passantes.",
      fill: "linear-gradient(155deg, #ffe5ef 0%, #fdd6ff 100%)",
      accent: "#d766b4",
    },
    back: {
      title: "Dissout les angles",
      subtitle: "Cueille les contours oubliés.",
      note: "Atelier ouvert les soirs de brouillard.",
      fill: "linear-gradient(155deg, #f5d3ff 0%, #ffeaf5 100%)",
      accent: "#bd4d99",
    },
  },
  {
    id: "atelier-08",
    variant: "float",
    front: {
      title: "Gaspard Lou",
      subtitle: "Horloger marée",
      note: "Répare les minutes salées.",
      fill: "linear-gradient(135deg, #d3f4ff 0%, #9cdeff 100%)",
      accent: "#3f9bda",
    },
    back: {
      title: "Prévoit les flux",
      subtitle: "Sculpte des cadrans liquides.",
      note: "Possède une collection de coquilles.",
      fill: "linear-gradient(135deg, #a5e4ff 0%, #d7f5ff 100%)",
      accent: "#2a7dc1",
    },
  },
  {
    id: "atelier-09",
    variant: "wave",
    front: {
      title: "Inès Rimba",
      subtitle: "Chorégraphe algorithmique",
      note: "Bouge les pixels au tempo.",
      fill: "linear-gradient(145deg, #ffe5d0 0%, #ffd8e8 100%)",
      accent: "#ff8ab3",
    },
    back: {
      title: "Boucles infinies",
      subtitle: "Compose des partitions mouvantes.",
      note: "Laptop couvert d'autocollants.",
      fill: "linear-gradient(145deg, #ffd0e8 0%, #ffeede 100%)",
      accent: "#ff6f9e",
    },
  },
  {
    id: "atelier-10",
    variant: "bounce",
    front: {
      title: "Omar Clair",
      subtitle: "Peintre gravité",
      note: "Suspend les pigments.",
      fill: "linear-gradient(130deg, #dff5ff 0%, #bbf0f9 100%)",
      accent: "#4fb7d4",
    },
    back: {
      title: "Tend les filets",
      subtitle: "Capture les éclats en apesanteur.",
      note: "Echelles pliables et fils d'acier.",
      fill: "linear-gradient(130deg, #c8efff 0%, #e1fbff 100%)",
      accent: "#3da0b8",
    },
  },
  {
    id: "atelier-11",
    variant: "fold",
    front: {
      title: "Mira Tisse",
      subtitle: "Scénographe origami",
      note: "Plie les perspectives.",
      fill: "linear-gradient(135deg, #fff0c8 0%, #ffd8c1 100%)",
      accent: "#f79a52",
    },
    back: {
      title: "Compose des labyrinthes",
      subtitle: "Guide les spectateurs à voix basse.",
      note: "Tapis de papier recyclé.",
      fill: "linear-gradient(135deg, #ffe3c5 0%, #fff3dc 100%)",
      accent: "#e87b34",
    },
  },
  {
    id: "atelier-12",
    variant: "cascade",
    front: {
      title: "Noé Vagues",
      subtitle: "Cinéaste goutte",
      note: "Filme les pluies intérieures.",
      fill: "linear-gradient(145deg, #d9f7ff 0%, #c3ebff 100%)",
      accent: "#53a7d2",
    },
    back: {
      title: "Monte des rivières",
      subtitle: "Projette des orages miniatures.",
      note: "Bottes vernies et bobines aquatiques.",
      fill: "linear-gradient(145deg, #c3ebff 0%, #e5fbff 100%)",
      accent: "#3a93bd",
    },
  },
];

const BiosPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [framesEnabled, setFramesEnabled] = useState(true);
  const [gridGap, setGridGap] = useState(3);
  const [gridMinWidth, setGridMinWidth] = useState(220);
  const [captionAlign, setCaptionAlign] = useState<"center" | "left">(
    "center"
  );
  const [debugOpen, setDebugOpen] = useState(false);

  const pageStyle = useMemo(
    () =>
      ({
        "--grid-gap": gridGap.toString(),
        "--grid-min": `${gridMinWidth}px`,
        "--caption-align": captionAlign,
        "--caption-align-flex":
          captionAlign === "center" ? "center" : "flex-start",
        "--note-marker-left": captionAlign === "center" ? "50%" : "0%",
        "--note-marker-translate":
          captionAlign === "center" ? "-50%" : "0%",
        "--intro-margin": captionAlign === "center" ? "auto" : "0",
      }) as CSSProperties,
    [captionAlign, gridGap, gridMinWidth]
  );

  const activate = (index: number) => setActiveIndex(index);
  const deactivate = () => setActiveIndex(null);
  const toggle = (index: number) =>
    setActiveIndex((current) => (current === index ? null : index));

  return (
    <>
      <Head>
        <title>Bicéphale · Bios</title>
        <meta
          name="description"
          content="Rencontrez les esprits derrière Bicéphale avec une galerie de Polaroids animés."
        />
      </Head>
      <div
        className={`bios-page ${framesEnabled ? "frames-on" : "frames-off"}`}
        style={pageStyle}
      >
        <div className="debug-launcher">
          <button
            type="button"
            onClick={() => setDebugOpen((open) => !open)}
            aria-expanded={debugOpen}
            aria-controls="bios-debug-panel"
          >
            {debugOpen ? "Fermer" : "Ouvrir"} debug
          </button>
          {debugOpen && (
            <div className="debug-overlay" id="bios-debug-panel" role="dialog">
              <fieldset>
                <legend>Cadre Polaroid</legend>
                <label className="debug-row">
                  <input
                    type="checkbox"
                    checked={framesEnabled}
                    onChange={(event) => setFramesEnabled(event.target.checked)}
                  />
                  Afficher le cadre papier
                </label>
              </fieldset>
              <fieldset>
                <legend>Grille</legend>
                <label className="debug-row">
                  Densité
                  <input
                    type="range"
                    min={180}
                    max={320}
                    step={10}
                    value={gridMinWidth}
                    onChange={(event) =>
                      setGridMinWidth(Number(event.target.value))
                    }
                  />
                  <span>{gridMinWidth}px</span>
                </label>
                <label className="debug-row">
                  Espacement
                  <input
                    type="range"
                    min={1.5}
                    max={4}
                    step={0.1}
                    value={gridGap}
                    onChange={(event) => setGridGap(Number(event.target.value))}
                  />
                  <span>{gridGap.toFixed(1)}rem</span>
                </label>
              </fieldset>
              <fieldset>
                <legend>Texte</legend>
                <label className="debug-row">
                  Alignement
                  <select
                    value={captionAlign}
                    onChange={(event) =>
                      setCaptionAlign(event.target.value as "center" | "left")
                    }
                  >
                    <option value="center">Centre</option>
                    <option value="left">Gauche</option>
                  </select>
                </label>
              </fieldset>
            </div>
          )}
        </div>
        <header className="intro">
          <p className="eyebrow">Bicéphale · studio fantasmé</p>
          <h1>Biographies instantanées</h1>
          <p>
            Touchez ou survolez les Polaroids pour voir les binômes que nous
            imaginons en coulisses. Chaque photo dévoile une jumelle cachée,
            prête à s&apos;animer.
          </p>
        </header>
        <div className="polaroid-grid">
          {polaroidPairs.map((pair, index) => {
            const isActive = activeIndex === index;
            const ariaLabel = `${pair.front.title}, ${pair.front.subtitle}`;
            return (
              <div
                key={pair.id}
                className={`pair variant-${pair.variant} ${
                  isActive ? "active" : ""
                }`}
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`Voir la seconde Polaroid de ${ariaLabel}`}
                  onClick={() => toggle(index)}
                  onMouseEnter={() => activate(index)}
                  onMouseLeave={deactivate}
                  onFocus={() => activate(index)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      deactivate();
                    }
                  }}
                  style={{
                    "--accent-front": pair.front.accent,
                    "--accent-back": pair.back.accent,
                  } as CSSProperties}
                >
                  <PolaroidSideCard side={pair.front} className="top" />
                  <PolaroidSideCard side={pair.back} className="bottom" />
                  <span className="sr-only">
                    {isActive
                      ? `${pair.back.title}. ${pair.back.subtitle}`
                      : `${pair.front.title}. ${pair.front.subtitle}`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .bios-page {
          min-height: 100vh;
          background: radial-gradient(circle at 15% 20%, rgba(255, 222, 235, 0.9), transparent 55%),
            radial-gradient(circle at 85% 15%, rgba(206, 233, 255, 0.9), transparent 45%),
            radial-gradient(circle at 50% 90%, rgba(221, 255, 233, 0.8), transparent 60%),
            #f9f6f2;
          color: #211a1a;
          padding: 6.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif;
        }

        .debug-launcher {
          position: fixed;
          top: 1.25rem;
          right: 1.25rem;
          z-index: 2100;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .debug-launcher > button {
          background: rgba(33, 26, 26, 0.75);
          color: #fff;
          border: none;
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .debug-launcher > button:hover,
        .debug-launcher > button:focus-visible {
          background: rgba(33, 26, 26, 0.9);
          outline: none;
        }

        .debug-overlay {
          width: min(280px, 90vw);
          background: rgba(33, 26, 26, 0.88);
          color: #fffaf0;
          padding: 1rem 1.2rem;
          border-radius: 14px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(8px);
          display: grid;
          gap: 0.9rem;
        }

        .debug-overlay fieldset {
          border: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.65rem;
        }

        .debug-overlay legend {
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 245, 230, 0.72);
          font-family: "GayaRegular", serif;
        }

        .debug-row {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.82rem;
        }

        .debug-row input[type="range"] {
          accent-color: #ff9f24;
        }

        .debug-row input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          accent-color: #f27ca6;
        }

        .debug-row select {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: inherit;
          border-radius: 8px;
          padding: 0.25rem 0.35rem;
        }

        .debug-row span {
          font-variant-numeric: tabular-nums;
        }

        .intro {
          max-width: 760px;
          margin: 0 auto;
          text-align: var(--caption-align, center);
          display: grid;
          gap: 1.2rem;
        }

        .intro h1 {
          font-size: clamp(2.4rem, 4vw, 3.4rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          font-family: "GayaRegular", serif;
        }

        .intro p {
          font-size: clamp(1rem, 2.1vw, 1.2rem);
          line-height: 1.6;
          margin: 0 var(--intro-margin, auto);
          max-width: 52ch;
        }

        .intro .eyebrow {
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.28em;
          color: rgba(40, 33, 31, 0.62);
        }

        .polaroid-grid {
          width: min(1200px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(var(--grid-min, 220px), 1fr)
          );
          gap: calc(var(--grid-gap, 3) * 1rem)
            calc(var(--grid-gap, 3) * 0.8rem);
        }

        .pair {
          position: relative;
          perspective: 1500px;
        }

        .pair button {
          position: relative;
          width: 100%;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          height: 0;
          padding-bottom: 130%;
          display: block;
          border-radius: 18px;
          outline: none;
        }

        .pair button:focus-visible {
          box-shadow: 0 0 0 4px rgba(33, 26, 26, 0.16);
        }

        .polaroid {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.1rem 1.1rem 2.3rem;
          border-radius: 14px 14px 18px 18px;
          background: linear-gradient(180deg, #fffefc 0%, #fff6ec 100%);
          box-shadow: 0 18px 32px rgba(31, 21, 17, 0.18);
          transform-origin: center;
          will-change: transform, opacity;
          transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.55s ease,
            box-shadow 0.35s ease;
        }

        .frames-off .polaroid {
          padding: 0.85rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.9);
        }

        .polaroid::before,
        .polaroid::after {
          content: "";
          position: absolute;
          width: 78px;
          height: 22px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0.35)
          );
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
          border-radius: 3px;
          opacity: 0.95;
          z-index: 3;
          mix-blend-mode: screen;
        }

        .polaroid::before {
          top: -10px;
          left: 22px;
          transform: rotate(-4deg);
        }

        .polaroid::after {
          top: -12px;
          right: 28px;
          transform: rotate(6deg);
        }

        .polaroid .photo {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: 1.4rem;
        }

        .polaroid-frame {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 12px 12px 18px 18px;
          padding: 0.65rem 0.65rem 1.6rem;
          background: linear-gradient(200deg, #ffffff 0%, #f2ece3 100%);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: padding 0.45s ease, box-shadow 0.45s ease,
            background 0.45s ease;
        }

        .frames-off .polaroid-frame {
          padding: 0;
          background: transparent;
          box-shadow: none;
        }

        .polaroid-photo {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 12px 24px rgba(22, 15, 12, 0.12);
        }

        .frames-off .polaroid-photo {
          border-radius: 12px;
          box-shadow: 0 12px 24px rgba(22, 15, 12, 0.08);
        }

        .polaroid-photo-fill {
          position: absolute;
          inset: 0;
          background: var(--photo-fill);
        }

        .polaroid-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
              170deg,
              rgba(255, 255, 255, 0.22) 0%,
              rgba(255, 255, 255, 0.08) 45%,
              rgba(0, 0, 0, 0.1) 100%
            ),
            repeating-linear-gradient(
              120deg,
              rgba(255, 255, 255, 0.08) 0px,
              rgba(255, 255, 255, 0.08) 6px,
              rgba(255, 255, 255, 0.02) 6px,
              rgba(255, 255, 255, 0.02) 12px
            );
          mix-blend-mode: screen;
          opacity: 0.8;
        }

        .polaroid-photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.02) 60%,
            rgba(0, 0, 0, 0.12) 100%
          );
          mix-blend-mode: soft-light;
          pointer-events: none;
        }

        .caption {
          margin-top: 1.1rem;
          display: grid;
          gap: 0.45rem;
          text-align: var(--caption-align, center);
          align-items: var(--caption-align-flex, center);
        }

        .caption h3 {
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          font-family: "GayaRegular", serif;
        }

        .caption span {
          font-size: 0.85rem;
          color: rgba(41, 32, 29, 0.72);
        }

        .note {
          margin-top: auto;
          font-size: 0.78rem;
          line-height: 1.5;
          color: rgba(36, 28, 26, 0.7);
          text-align: var(--caption-align, center);
          position: relative;
          padding-top: 0.6rem;
        }

        .note::before {
          content: "";
          position: absolute;
          top: 0;
          left: var(--note-marker-left, 50%);
          width: 60px;
          height: 3px;
          border-radius: 999px;
          background: var(--accent-front, #dd9aa0);
          transform: translateX(var(--note-marker-translate, -50%));
          opacity: 0.75;
        }

        .pair .bottom .note::before {
          background: var(--accent-back, #9ab7dd);
        }

        .pair .bottom {
          opacity: 0;
          transform: translate3d(0, 12%, 0) scale(0.94);
          box-shadow: 0 12px 28px rgba(31, 21, 17, 0.12);
        }

        .pair.active .bottom {
          opacity: 1;
        }

        .pair.active .polaroid {
          box-shadow: 0 24px 45px rgba(31, 21, 17, 0.2);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        /* Variant behaviours */
        .variant-drift .top {
          transform: rotate(-2deg);
        }
        .variant-drift .bottom {
          transform: translate3d(-6%, 12%, 0) rotate(4deg) scale(0.9);
        }
        .variant-drift.active .top {
          transform: translate3d(28%, -22%, 60px) rotate(12deg) scale(1.04);
        }
        .variant-drift.active .bottom {
          transform: translate3d(-4%, 6%, 0) rotate(-3deg) scale(1);
        }

        .variant-flip .pair button,
        .variant-flip button {
          transform-style: preserve-3d;
        }
        .variant-flip .top {
          transform-origin: center right;
        }
        .variant-flip .bottom {
          transform-origin: center left;
          transform: rotateY(-180deg) scale(0.94);
        }
        .variant-flip.active .top {
          transform: rotateY(180deg) translateX(-6%) scale(0.94);
        }
        .variant-flip.active .bottom {
          transform: rotateY(0deg) translateX(-8%);
        }

        .variant-slide .top {
          transform: translate3d(0, 0, 0);
        }
        .variant-slide .bottom {
          transform: translate3d(-18%, 14%, 0) rotate(-6deg) scale(0.9);
        }
        .variant-slide.active .top {
          transform: translate3d(-45%, -14%, 40px) rotate(-9deg) scale(0.96);
        }
        .variant-slide.active .bottom {
          transform: translate3d(-3%, 3%, 0) rotate(4deg) scale(1.02);
        }

        .variant-tilt .top {
          transform: rotateX(0deg) rotateZ(1deg);
        }
        .variant-tilt .bottom {
          transform: rotateX(18deg) translate3d(0, 22%, -80px) scale(0.86);
        }
        .variant-tilt.active .top {
          transform: rotateX(28deg) translate3d(10%, -30%, 80px) rotateZ(-4deg);
        }
        .variant-tilt.active .bottom {
          transform: rotateX(0deg) translate3d(-2%, 6%, 0) scale(1);
        }

        .variant-rise .top {
          transform: translate3d(0, 0, 0) rotate(-1deg);
        }
        .variant-rise .bottom {
          transform: translate3d(-12%, 18%, 0) scale(0.88) rotate(5deg);
        }
        .variant-rise.active .top {
          transform: translate3d(0, -38%, 80px) scale(0.98) rotate(-4deg);
        }
        .variant-rise.active .bottom {
          transform: translate3d(-2%, 6%, 0) scale(1);
        }

        .variant-fan .top {
          transform: rotate(-8deg) translate3d(4%, -2%, 20px);
        }
        .variant-fan .bottom {
          transform: rotate(10deg) translate3d(-16%, 18%, -30px) scale(0.86);
        }
        .variant-fan.active .top {
          transform: rotate(20deg) translate3d(32%, -32%, 80px) scale(1.05);
        }
        .variant-fan.active .bottom {
          transform: rotate(-6deg) translate3d(-4%, 8%, 0) scale(1.02);
        }

        .variant-peek .top {
          transform: translate3d(0, 0, 0) rotate(1deg);
        }
        .variant-peek .bottom {
          transform: translate3d(0, 40%, -40px) scale(0.85);
        }
        .variant-peek.active .top {
          transform: translate3d(0, 46%, 40px) rotate(4deg) scale(0.94);
        }
        .variant-peek.active .bottom {
          transform: translate3d(0, 6%, 0) scale(1);
        }

        .variant-float .top {
          animation: idle-float 6s ease-in-out infinite;
        }
        .variant-float.active .top {
          animation: none;
          transform: translate3d(12%, -32%, 60px) rotate(-6deg) scale(1.04);
        }
        .variant-float .bottom {
          transform: translate3d(-16%, 16%, -30px) scale(0.88);
        }
        .variant-float.active .bottom {
          transform: translate3d(-4%, 6%, 0) scale(1.02);
        }

        .variant-wave .top {
          transform: rotate(-3deg);
        }
        .variant-wave .bottom {
          transform: rotate(6deg) translate3d(-22%, 18%, -50px) scale(0.84);
        }
        .variant-wave.active .top {
          transform: rotate(-12deg) translate3d(-30%, -18%, 40px) scale(0.95);
        }
        .variant-wave.active .bottom {
          transform: rotate(2deg) translate3d(-4%, 6%, 0) scale(1.03);
        }

        .variant-bounce .top {
          transform: translate3d(0, 0, 0);
        }
        .variant-bounce .bottom {
          transform: translate3d(-18%, 18%, -50px) scale(0.86);
        }
        .variant-bounce.active .top {
          animation: bounce-away 0.85s forwards;
        }
        .variant-bounce.active .bottom {
          transform: translate3d(-2%, 6%, 0) scale(1.03);
        }

        .variant-fold .top {
          transform-origin: top;
        }
        .variant-fold .bottom {
          transform: rotateX(-100deg) translate3d(0, 30%, -120px);
        }
        .variant-fold.active .top {
          transform: rotateX(-92deg) translate3d(0, -20%, 80px);
        }
        .variant-fold.active .bottom {
          transform: rotateX(0deg);
        }

        .variant-cascade .top {
          transform: rotate(2deg);
        }
        .variant-cascade .bottom {
          transform: translate3d(-20%, 22%, -40px) rotate(-6deg) scale(0.88);
        }
        .variant-cascade.active .top {
          transform: translate3d(28%, -26%, 60px) rotate(14deg) scale(1.05);
        }
        .variant-cascade.active .bottom {
          transform: translate3d(-4%, 6%, 0) rotate(-2deg) scale(1.02);
        }

        @keyframes idle-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(-1deg);
          }
          50% {
            transform: translate3d(0, -8px, 12px) rotate(1.5deg);
          }
        }

        @keyframes bounce-away {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          45% {
            transform: translate3d(0, -24%, 40px) rotate(-6deg) scale(1.04);
          }
          100% {
            transform: translate3d(30%, -30%, 60px) rotate(12deg) scale(1.03);
          }
        }

        @media (hover: none) {
          .pair button {
            cursor: default;
          }
        }

        @media (max-width: 720px) {
          .bios-page {
            padding: 5rem 1.1rem 4rem;
          }
          .polaroid-grid {
            gap: calc(var(--grid-gap, 3) * 0.9rem)
              calc(var(--grid-gap, 3) * 0.7rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .polaroid,
          .pair.active .polaroid,
          .variant-float .top {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

const PolaroidSideCard: React.FC<{
  side: PolaroidSide;
  className: string;
}> = ({ side, className }) => {
  return (
    <div
      className={`polaroid ${className}`}
      style={{ "--photo-fill": side.fill } as CSSProperties}
    >
      <div className="photo" aria-hidden>
        <div className="polaroid-frame">
          <div className="polaroid-photo">
            <div className="polaroid-photo-fill" />
            <div className="polaroid-photo-overlay" />
          </div>
        </div>
      </div>
      <div className="caption">
        <h3>{side.title}</h3>
        <span>{side.subtitle}</span>
      </div>
      <p className="note">{side.note}</p>
    </div>
  );
};

export default BiosPage;
