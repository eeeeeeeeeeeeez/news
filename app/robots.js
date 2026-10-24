import { SITE } from "../lib/articles";
export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE.url}/sitemap.xml` };
}
