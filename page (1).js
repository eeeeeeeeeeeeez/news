import Link from "next/link";
import AiPanel from "../../components/AiPanel";
import DeleteButton from "../../components/DeleteButton";
import { logoutAction } from "./actions";
import { requireAdmin } from "../../lib/auth";
import { CATEGORIES, fmtDate } from "../../lib/articles";
import { readAll } from "../../lib/store";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }) {
  await requireAdmin();
  const { saved, deleted } = await searchParams;
  const articles = await readAll();
  return (
    <>
      <header className="admin-bar">
        <h1>後台管理</h1>
        <div>
          <Link href="/" target="_blank">查看網站</Link>
          <form action={logoutAction}><button type="submit" className="link">登出</button></form>
        </div>
      </header>

      {saved && <p className="alert ok">已儲存。</p>}
      {deleted && <p className="alert ok">已刪除。</p>}

      <AiPanel />

      <section className="panel">
        <div className="panel-head">
          <h2>所有文章（{articles.length}）</h2>
          <Link href="/admin/new" className="btn primary">新增文章</Link>
        </div>
        {articles.length === 0 ? (
          <p className="empty">還沒有文章。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>標題</th><th>分類</th><th>狀態</th><th>發布時間</th><th>來源</th><th></th></tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.slug}>
                    <td className="t">{a.title}</td>
                    <td>{CATEGORIES[a.category]?.label}</td>
                    <td><span className={`chip ${a.status === "draft" ? "draft" : "pub"}`}>{a.status === "draft" ? "草稿" : "已發布"}</span></td>
                    <td>{fmtDate(a.publishedAt, true)}</td>
                    <td>{a.origin === "ai" ? "AI" : "手動"}</td>
                    <td className="ops">
                      {(a.status ?? "published") === "published" && <Link href={`/article/${a.slug}`} target="_blank">檢視</Link>}
                      <Link href={`/admin/edit/${a.slug}`}>編輯</Link>
                      <DeleteButton slug={a.slug} title={a.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
