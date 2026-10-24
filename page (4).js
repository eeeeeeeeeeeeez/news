import Link from "next/link";
import ArticleItem from "../../components/ArticleItem";
import Tag from "../../components/Tag";
import { byCategory, CATEGORIES, fmtDate } from "../../lib/articles";
import { listPublished } from "../../lib/store";

export const revalidate = 600;

export default async function Home() {
  const all = await listPublished();
  const [feature, ...rest] = all;
  return (
    <>
      {feature ? (
        <section className="hero">
          <article className="feature">
            <Tag category={feature.category} />
            <h1><Link href={`/article/${feature.slug}`}>{feature.title}</Link></h1>
            <p>{feature.summary}</p>
            <time dateTime={feature.publishedAt}>{fmtDate(feature.publishedAt, true)}</time>
          </article>
          <aside className="latest">
            <h2>最新消息</h2>
            <ol>
              {rest.slice(0, 8).map((a) => (
                <li key={a.slug}>
                  <Link href={`/article/${a.slug}`}>{a.title}</Link>
                  <span><b className={a.category}>{CATEGORIES[a.category].label}</b> {fmtDate(a.publishedAt)}</span>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      ) : (
        <p className="empty">目前還沒有文章。</p>
      )}

      <div className="cols">
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <section key={key} className={`block ${key}`}>
            <header>
              <h2>{c.title}</h2>
              <Link href={`/${key}`}>更多</Link>
            </header>
            {byCategory(all, key).slice(0, 6).map((a) => <ArticleItem key={a.slug} a={a} />)}
          </section>
        ))}
      </div>
    </>
  );
}
