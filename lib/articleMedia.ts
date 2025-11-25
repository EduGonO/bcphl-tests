import { CSSProperties } from "react";
import { Article } from "../types";
import hashString from "./hashString";
import generateArticlePlaceholderTexture from "./articlePlaceholderTexture";

export const generateGradientPattern = (article: Article): CSSProperties => {
  const seed = hashString(article.slug || article.title || "article");
  const baseHue = seed % 360;
  const hueShift = 20 + ((seed >> 3) % 21);
  const secondaryHue = (baseHue + ((seed & 1) === 1 ? hueShift : -hueShift) + 360) % 360;
  const focalX = 10 + ((seed >> 6) % 80);
  const focalY = 10 + ((seed >> 10) % 80);

  return {
    backgroundImage: `radial-gradient(circle at ${focalX}% ${focalY}%, hsl(${baseHue}, 60%, 86%) 0%, hsl(${secondaryHue}, 55%, 92%) 100%)`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };
};

export const getArticleMediaStyle = (article: Article): CSSProperties => {
  const directImage =
    article.headerImage || (article.media && article.media.length > 0 ? article.media[0] : "");

  if (directImage) {
    return {
      backgroundImage: `url(${directImage})`,
      backgroundSize: "auto 100%",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
    };
  }

  return generateArticlePlaceholderTexture(article);
};

export default getArticleMediaStyle;
