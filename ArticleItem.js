import Link from "next/link";
import Tag from "./Tag";
import { fmtDate } from "../lib/articles";

export default function ArticleItem({ a, showTag = false }) {
  return (
    <article className="item">
      <h3><Link href={`/article/${a.slug}`}>{a.title}</Link></h3>
      <p>{a.summary}</p>
      <div className="meta">
        {showTag && <Tag category={a.category} />}
        <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt, true)}</time>
      </div>
    </article>
  );
}
