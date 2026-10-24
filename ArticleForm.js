"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { saveArticleAction } from "../app/admin/actions";

export default function ArticleForm({ initial }) {
  const [state, formAction, pending] = useActionState(saveArticleAction, { error: null });
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  return (
    <form action={formAction} className="form">
      {state?.error && <p className="alert error" role="alert">{state.error}</p>}
      <input type="hidden" name="slug" value={v.slug} />

      <div className="row">
        <label>分類
          <select name="category" value={v.category} onChange={set("category")}>
            <option value="taiwan">台灣新聞</option>
            <option value="us">美國新聞</option>
          </select>
        </label>
        <label>狀態
          <select name="status" value={v.status} onChange={set("status")}>
            <option value="published">發布</option>
            <option value="draft">草稿（不公開）</option>
          </select>
        </label>
        <label>發布時間（台北時間，留空為現在）
          <input type="datetime-local" name="publishedAt" value={v.publishedAt} onChange={set("publishedAt")} />
        </label>
      </div>

      <label>標題
        <input type="text" name="title" value={v.title} onChange={set("title")} maxLength={120} required />
      </label>
      <label>摘要（顯示在列表與搜尋結果）
        <textarea name="summary" rows={2} value={v.summary} onChange={set("summary")} maxLength={300} required />
      </label>
      <label>內文（段落之間空一行）
        <textarea name="body" rows={14} value={v.body} onChange={set("body")} required />
      </label>
      <label>來源（每行一個，格式：媒體名稱 | 網址；自己撰寫的文章可留空）
        <textarea name="sources" rows={3} value={v.sources} onChange={set("sources")} placeholder={"BBC | https://www.bbc.com/news/...\n中央社 | https://www.cna.com.tw/..."} />
      </label>

      <div className="actions">
        <button type="submit" className="btn primary" disabled={pending}>{pending ? "儲存中…" : "儲存"}</button>
        <Link href="/admin" className="btn">取消</Link>
      </div>
    </form>
  );
}
