import { getAllArticles, CATEGORIES, SITE } from "../lib/articles";

export default function sitemap() {
  return [
    { url: SITE.url },
    ...Object.keys(CATEGORIES).map((c) => ({ url: `${SITE.url}/${c}` })),
    ...getAllArticles().map((a) => ({ url: `${SITE.url}/article/${a.slug}`, lastModified: a.publishedAt })),
  ];
}
