import ArticleForm from "../../../components/ArticleForm";
import { requireAdmin } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function NewArticle() {
  await requireAdmin();
  return (
    <>
      <header className="admin-bar"><h1>新增文章</h1></header>
      <ArticleForm initial={{ slug: "", category: "taiwan", status: "published", publishedAt: "", title: "", summary: "", body: "", sources: "" }} />
    </>
  );
}
