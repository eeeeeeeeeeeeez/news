import { notFound } from "next/navigation";
import ArticleForm from "../../../../components/ArticleForm";
import { requireAdmin } from "../../../../lib/auth";
import { toTaipeiLocal } from "../../../../lib/articles";
import { getAnyArticle } from "../../../../lib/store";

export const dynamic = "force-dynamic";

export default async function EditArticle({ params }) {
  await requireAdmin();
  const { slug } = await params;
  const a = await getAnyArticle(slug);
  if (!a) notFound();
  return (
    <>
      <header className="admin-bar"><h1>編輯文章</h1></header>
      <ArticleForm
        initial={{
          slug: a.slug,
          category: a.category,
          status: a.status ?? "published",
          publishedAt: toTaipeiLocal(a.publishedAt),
          title: a.title,
          summary: a.summary,
          body: a.body.join("\n\n"),
          sources: (a.sources || []).map((s) => `${s.name} | ${s.url}`).join("\n"),
        }}
      />
    </>
  );
}
