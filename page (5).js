import Link from "next/link";
import { notFound } from "next/navigation";
import Tag from "../../../../components/Tag";
import { SITE, fmtDate } from "../../../../lib/articles";
import { getArticle } from "../../../../lib/store";

// 文章是排程或後台新增的，不在 build 時預先產生；第一次被瀏覽時才渲染並快取
export const dynamicParams = true;
export const revalidate = 3600;
export const generateStaticParams = () => [];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = await getArticle(slug);
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
  const a = await getArticle(slug);
  if (!a) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    datePublished: a.publishedAt,
    inLanguage: "zh-Hant-TW",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
  const sources = a.sources || [];
  return (
    <article className="post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Tag category={a.category} />
      <h1>{a.title}</h1>
      <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt, true)}（台北時間）</time>
      <p className="dek">{a.summary}</p>
      <div className="body">{a.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      {sources.length > 0 && (
        <aside className="sources">
          <h2>原始來源</h2>
          <ul>
            {sources.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer nofollow">{s.name}</a></li>
            ))}
          </ul>
          {a.origin === "ai" && <p>本文由 AI 依上述來源改寫整理，完整內容請閱讀原始報導。</p>}
        </aside>
      )}
      <p className="back"><Link href={`/${a.category}`}>← 回到{a.category === "taiwan" ? "台灣" : "美國"}新聞</Link></p>
    </article>
  );
}
