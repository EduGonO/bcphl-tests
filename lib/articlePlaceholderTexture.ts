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

  const baseShade = clampByte(215 + Math.floor(random() * 18));
  const accentShade = clampByte(baseShade - 10 - Math.floor(random() * 8));
  const baseHex = toHexChannel(baseShade);
  const accentHex = toHexChannel(accentShade);
  const backgroundColor = `#${baseHex}${baseHex}${baseHex}`;
  const accentColor = `#${accentHex}${accentHex}${accentHex}`;

  const filledShapesCount = 1 + Math.floor(random() * 2);
  const filledShapes: string[] = [];
  for (let index = 0; index < filledShapesCount; index += 1) {
    const radius = Math.max(width, height) * (0.28 + random() * 0.38);
    const cx = width * (random() * 1.4 - 0.2);
    const cy = height * (random() * 1.4 - 0.2);
    const opacity = 0.85 + random() * 0.1;
    filledShapes.push(
      `<circle cx="${toFixed(cx)}" cy="${toFixed(cy)}" r="${toFixed(radius)}" fill="#111111" fill-opacity="${toFixed(
        opacity,
      )}" />`,
    );
  }

  const arcCount = 4 + Math.floor(random() * 3);
  const arcs: string[] = [];
  for (let index = 0; index < arcCount; index += 1) {
    const radius = Math.max(width, height) * (0.35 + random() * 1.2);
    const cx = width * (random() * 1.4 - 0.2);
    const cy = height * (random() * 1.4 - 0.2);
    const startAngle = random() * Math.PI * 2;
    const arcLength = Math.PI * (0.35 + random() * 1.1);
    const endAngle = startAngle + arcLength;
    const path = createArcPath(cx, cy, radius, startAngle, endAngle);
    const strokeWidth = 1.2 + random() * 0.9;
    const opacity = 0.78 + random() * 0.18;
    arcs.push(
      `<path d="${path}" fill="none" stroke="#111111" stroke-width="${toFixed(
        strokeWidth,
      )}" stroke-opacity="${toFixed(opacity)}" />`,
    );
  }

  const lineCount = 2 + Math.floor(random() * 2);
  const lines: string[] = [];
  for (let index = 0; index < lineCount; index += 1) {
    const yPosition = height * random();
    const thickness = 0.8 + random() * 0.6;
    lines.push(
      `<line x1="0" y1="${toFixed(yPosition)}" x2="${width}" y2="${toFixed(
        yPosition + random() * 8,
      )}" stroke="${accentColor}" stroke-width="${toFixed(thickness)}" stroke-opacity="0.35" />`,
    );
  }

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <rect width="100%" height="100%" fill="${backgroundColor}"/>\n  ${filledShapes.join("\n  ")}\n  ${arcs.join("\n  ")}\n  ${lines.join("\n  ")}\n</svg>`;

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
