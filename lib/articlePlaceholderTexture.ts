import { CSSProperties } from "react";
import { Article } from "../types";
import hashString from "./hashString";

const createSeededRandom = (seed: number) => {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const clampByte = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

const toFixed = (value: number): string => value.toFixed(2);

const toHexChannel = (value: number): string => clampByte(value).toString(16).padStart(2, "0");

const createArcPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);
  const deltaAngle = Math.abs(endAngle - startAngle);
  const largeArcFlag = deltaAngle > Math.PI ? 1 : 0;
  const sweepFlag = endAngle > startAngle ? 1 : 0;

  return `M ${toFixed(startX)} ${toFixed(startY)} A ${toFixed(radius)} ${toFixed(radius)} 0 ${largeArcFlag} ${sweepFlag} ${toFixed(endX)} ${toFixed(endY)}`;
};

export const generateArticlePlaceholderTexture = (article: Article): CSSProperties => {
  const seed = hashString(article.slug || article.title || "article");
  const random = createSeededRandom(seed);
  const width = 640;
  const height = 426;

  const baseShade = clampByte(228 + Math.floor(random() * 16));
  const accentShade = clampByte(baseShade - 22 - Math.floor(random() * 12));
  const baseHex = toHexChannel(baseShade);
  const accentHex = toHexChannel(accentShade);
  const backgroundColor = `#${baseHex}${baseHex}${baseHex}`;
  const accentColor = `#${accentHex}${accentHex}${accentHex}`;

  const filledShapesCount = random() > 0.55 ? 1 : 0;
  const filledShapes: string[] = [];
  for (let index = 0; index < filledShapesCount; index += 1) {
    const radius = Math.max(width, height) * (0.16 + random() * 0.24);
    const cx = width * (random() * 1.4 - 0.2);
    const cy = height * (random() * 1.4 - 0.2);
    const opacity = 0.18 + random() * 0.12;
    filledShapes.push(
      `<circle cx="${toFixed(cx)}" cy="${toFixed(cy)}" r="${toFixed(radius)}" fill="#111111" fill-opacity="${toFixed(
        opacity,
      )}" />`,
    );
  }

  const ringCount = 3 + Math.floor(random() * 3);
  const rings: string[] = [];
  for (let index = 0; index < ringCount; index += 1) {
    const radius = Math.max(width, height) * (0.22 + random() * 0.55);
    const cx = width * (random() * 1.35 - 0.18);
    const cy = height * (random() * 1.35 - 0.18);
    const strokeWidth = 0.6 + random() * 0.9;
    const opacity = 0.26 + random() * 0.28;
    rings.push(
      `<circle cx="${toFixed(cx)}" cy="${toFixed(cy)}" r="${toFixed(radius)}" fill="none" stroke="#111111" stroke-width="${toFixed(
        strokeWidth,
      )}" stroke-opacity="${toFixed(opacity)}" />`,
    );
  }

  const arcCount = 5 + Math.floor(random() * 4);
  const arcs: string[] = [];
  for (let index = 0; index < arcCount; index += 1) {
    const radius = Math.max(width, height) * (0.28 + random() * 1.05);
    const cx = width * (random() * 1.4 - 0.2);
    const cy = height * (random() * 1.4 - 0.2);
    const startAngle = random() * Math.PI * 2;
    const arcLength = Math.PI * (0.18 + random() * 0.95);
    const endAngle = startAngle + arcLength;
    const path = createArcPath(cx, cy, radius, startAngle, endAngle);
    const strokeWidth = 0.8 + random() * 0.7;
    const opacity = 0.36 + random() * 0.28;
    arcs.push(
      `<path d="${path}" fill="none" stroke="#111111" stroke-width="${toFixed(
        strokeWidth,
      )}" stroke-opacity="${toFixed(opacity)}" stroke-linecap="round" />`,
    );
  }

  const chordCount = 4 + Math.floor(random() * 3);
  const chords: string[] = [];
  for (let index = 0; index < chordCount; index += 1) {
    const radius = Math.max(width, height) * (0.25 + random() * 0.75);
    const cx = width * (random() * 1.2 - 0.1);
    const cy = height * (random() * 1.2 - 0.1);
    const startAngle = random() * Math.PI * 2;
    const endAngle = startAngle + Math.PI * (0.15 + random() * 0.6);
    const innerRadius = radius * (0.65 + random() * 0.15);
    const startX = cx + Math.cos(startAngle) * innerRadius;
    const startY = cy + Math.sin(startAngle) * innerRadius;
    const endX = cx + Math.cos(endAngle) * innerRadius;
    const endY = cy + Math.sin(endAngle) * innerRadius;
    const strokeWidth = 0.6 + random() * 0.5;
    const opacity = 0.28 + random() * 0.3;
    chords.push(
      `<line x1="${toFixed(startX)}" y1="${toFixed(startY)}" x2="${toFixed(endX)}" y2="${toFixed(
        endY,
      )}" stroke="#111111" stroke-width="${toFixed(strokeWidth)}" stroke-opacity="${toFixed(opacity)}" stroke-linecap="round" />`,
    );
  }

  const lineCount = 6 + Math.floor(random() * 6);
  const lines: string[] = [];
  for (let index = 0; index < lineCount; index += 1) {
    const orientation = random();
    const thickness = 0.4 + random() * 0.5;
    const opacity = 0.25 + random() * 0.35;
    if (orientation < 0.33) {
      const yPosition = height * random();
      lines.push(
        `<line x1="0" y1="${toFixed(yPosition)}" x2="${width}" y2="${toFixed(
          yPosition + (random() - 0.5) * 16,
        )}" stroke="${accentColor}" stroke-width="${toFixed(thickness)}" stroke-opacity="${toFixed(opacity)}" stroke-linecap="round" />`,
      );
    } else if (orientation < 0.66) {
      const xPosition = width * random();
      lines.push(
        `<line x1="${toFixed(xPosition)}" y1="0" x2="${toFixed(
          xPosition + (random() - 0.5) * 20,
        )}" y2="${height}" stroke="${accentColor}" stroke-width="${toFixed(thickness)}" stroke-opacity="${toFixed(opacity)}" stroke-linecap="round" />`,
      );
    } else {
      const x1 = width * (random() * 1.2 - 0.1);
      const y1 = height * (random() * 1.2 - 0.1);
      const x2 = x1 + Math.cos(random() * Math.PI * 2) * width * 0.6;
      const y2 = y1 + Math.sin(random() * Math.PI * 2) * height * 0.6;
      lines.push(
        `<line x1="${toFixed(x1)}" y1="${toFixed(y1)}" x2="${toFixed(x2)}" y2="${toFixed(y2)}" stroke="${accentColor}" stroke-width="${toFixed(
          thickness,
        )}" stroke-opacity="${toFixed(opacity)}" stroke-linecap="round" />`,
      );
    }
  }

  const polygonCount = 3 + Math.floor(random() * 3);
  const polygons: string[] = [];
  for (let index = 0; index < polygonCount; index += 1) {
    const centerX = width * (random() * 1.2 - 0.1);
    const centerY = height * (random() * 1.2 - 0.1);
    const pointCount = 3 + Math.floor(random() * 3);
    const radius = Math.max(width, height) * (0.05 + random() * 0.12);
    const rotation = random() * Math.PI * 2;
    const points: string[] = [];
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
      const angle = rotation + (pointIndex / pointCount) * Math.PI * 2;
      const distance = radius * (0.65 + random() * 0.45);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      points.push(`${toFixed(x)},${toFixed(y)}`);
    }
    const opacity = 0.25 + random() * 0.25;
    polygons.push(
      `<polygon points="${points.join(" ")}" fill="none" stroke="#111111" stroke-width="${toFixed(
        0.5 + random() * 0.4,
      )}" stroke-opacity="${toFixed(opacity)}" />`,
    );
  }

  const accentDotCount = 6 + Math.floor(random() * 6);
  const accentDots: string[] = [];
  for (let index = 0; index < accentDotCount; index += 1) {
    const radius = 1.2 + random() * 2.2;
    const cx = width * random();
    const cy = height * random();
    const opacity = 0.4 + random() * 0.4;
    accentDots.push(
      `<circle cx="${toFixed(cx)}" cy="${toFixed(cy)}" r="${toFixed(radius)}" fill="${accentColor}" fill-opacity="${toFixed(
        opacity,
      )}" />`,
    );
  }

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <rect width="100%" height="100%" fill="${backgroundColor}"/>\n  ${filledShapes.join("\n  ")}\n  ${rings.join("\n  ")}\n  ${arcs.join("\n  ")}\n  ${chords.join("\n  ")}\n  ${polygons.join("\n  ")}\n  ${lines.join("\n  ")}\n  ${accentDots.join("\n  ")}\n</svg>`;

  const encodedSvg = encodeURIComponent(svgContent)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return {
    backgroundImage: `url("data:image/svg+xml,${encodedSvg}")`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor,
  };
};

export default generateArticlePlaceholderTexture;
