import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticle, CATEGORIES, SITE, fmtDate } from "../../../lib/articles";

export const dynamicParams = false;
export const generateStaticParams = () => getAllArticles().map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.summary,
    alternates: { canonical: `/article/${a.slug}` },
    openGraph: { title: a.title, description: a.summary, type: "article", publishedTime: a.publishedAt },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const c = CATEGORIES[a.category];
  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    datePublished: a.publishedAt,
    inLanguage: "zh-Hant-TW",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
  return (
    <article className={`post ${a.category}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="crumb"><Link href={`/${a.category}`}>{c.label}</Link></p>
      <h1>{a.title}</h1>
      <p className="dek">{a.summary}</p>
      <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt, true)}（台北時間）</time>
      <div className="body">{a.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      <aside className="sources">
        <h2>原始來源</h2>
        <ul>
          {a.sources.map((s) => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer nofollow">{s.name}</a></li>
          ))}
        </ul>
        <p>本文由 AI 依上述來源改寫整理，完整內容請閱讀原始報導。</p>
      </aside>
    </article>
  );
}
