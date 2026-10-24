import { CATEGORIES, SITE } from "../lib/articles";
import { listPublished } from "../lib/store";

export const revalidate = 3600;

export default async function sitemap() {
  const articles = await listPublished();
  return [
    { url: SITE.url },
    ...Object.keys(CATEGORIES).map((c) => ({ url: `${SITE.url}/${c}` })),
    ...articles.map((a) => ({ url: `${SITE.url}/article/${a.slug}`, lastModified: a.publishedAt })),
  ];
}
