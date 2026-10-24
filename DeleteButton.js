"use client";
import { deleteArticleAction } from "../app/admin/actions";

export default function DeleteButton({ slug, title }) {
  return (
    <form action={deleteArticleAction} onSubmit={(e) => { if (!confirm(`確定要刪除「${title}」嗎？此動作無法復原。`)) e.preventDefault(); }}>
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="link danger">刪除</button>
    </form>
  );
}
