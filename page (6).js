import { notFound } from "next/navigation";
import ArticleItem from "../../../components/ArticleItem";
import { byCategory, CATEGORIES } from "../../../lib/articles";
import { listPublished } from "../../../lib/store";

export const revalidate = 600;
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(CATEGORIES).map((category) => ({ category }));

export async function generateMetadata({ params }) {
  const { category } = await params;
  const c = CATEGORIES[category];
  return c ? { title: c.title, description: c.desc } : {};
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const c = CATEGORIES[category];
  if (!c) notFound();
  const items = byCategory(await listPublished(), category);
  return (
    <section className={`block page ${category}`}>
      <header><h1>{c.title}</h1><p>{c.desc}</p></header>
      {items.length === 0 && <p className="empty">目前還沒有文章。</p>}
      {items.map((a) => <ArticleItem key={a.slug} a={a} />)}
    </section>
  );
}
