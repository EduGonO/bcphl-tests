import * as marked from "marked";

/**
 * Minimal Markdown → HTML helper.
 * `basePath` is the folder that already contains the article’s images,
 *   e.g. "/texts/news/my-post".
 */
export function mdToHtml(md: string, basePath = ""): string {
  // renderer override: fix relative <img> sources
  const renderer = {
    image(token: marked.Tokens.Image): string {
      const { href, title, text } = token;
      if (!href) return "";
      const src = /^https?:\/\//i.test(href) ? href : `${basePath}/${href}`;
      const t = title ? ` title="${title}"` : "";
      return `<img src="${src}" alt="${text ?? ""}"${t} style="max-width:80%;height:auto;display:block;margin:1rem auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.1);" />`;
    },
  };

  marked.setOptions({ breaks: true });
  marked.use({ renderer });

  // parse() returns string | Promise<string>; cast to synchronous string
  return marked.parse(md) as string;
}
