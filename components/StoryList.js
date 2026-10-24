import Link from "next/link";
import { fmtDate } from "../lib/articles";

export default function StoryList({ items }) {
  if (!items.length) return <p className="empty">今天的新聞還在整理中，稍後再來看看。</p>;
  const [lead, ...rest] = items;
  return (
    <div className="stories">
      <article className="lead">
        <h3><Link href={`/article/${lead.slug}`}>{lead.title}</Link></h3>
        <p>{lead.summary}</p>
        <time dateTime={lead.publishedAt}>{fmtDate(lead.publishedAt, true)}</time>
      </article>
      <ul>
        {rest.map((a) => (
          <li key={a.slug}>
            <Link href={`/article/${a.slug}`}>{a.title}</Link>
            <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt)}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
