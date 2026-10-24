import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, byCategory, CATEGORIES, fmtDate } from "../../lib/articles";

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(CATEGORIES).map((category) => ({ category }));

export async function generateMetadata({ params }) {
  const { category } = await params;
  const c = CATEGORIES[category];
  return c ? { title: `${c.label}新聞`, description: c.desc } : {};
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const c = CATEGORIES[category];
  if (!c) notFound();
  const items = byCategory(getAllArticles(), category);
  return (
    <section className={`desk single ${category}`}>
      <header><h1>{c.label}新聞</h1><p>{c.desc}</p></header>
      {items.length === 0 && <p className="empty">目前還沒有文章。</p>}
      <ul className="archive">
        {items.map((a) => (
          <li key={a.slug}>
            <h2><Link href={`/article/${a.slug}`}>{a.title}</Link></h2>
            <p>{a.summary}</p>
            <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt, true)}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
