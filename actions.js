"use server";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { checkPassword, createSession, destroySession, requireAdmin } from "../../lib/auth";
import { CATEGORIES, fromTaipeiLocal } from "../../lib/articles";
import { getAnyArticle, saveArticle, deleteArticle } from "../../lib/store";

const refresh = () => {
  revalidateTag("articles");
  revalidatePath("/", "layout");
};

export async function loginAction(formData) {
  if (!checkPassword(formData.get("password") || "")) {
    await new Promise((r) => setTimeout(r, 800));
    redirect("/admin/login?error=1");
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

const isUrl = (u) => {
  try { return ["http:", "https:"].includes(new URL(u).protocol); } catch { return false; }
};

export async function saveArticleAction(_prev, formData) {
  await requireAdmin();
  const get = (k) => String(formData.get(k) ?? "").trim();
  const values = Object.fromEntries(["slug", "category", "title", "summary", "body", "sources", "status", "publishedAt"].map((k) => [k, String(formData.get(k) ?? "")]));

  const category = get("category");
  const title = get("title");
  const summary = get("summary");
  const body = get("body").split(/\r?\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!CATEGORIES[category]) return { error: "請選擇分類", values };
  if (!title) return { error: "請填寫標題", values };
  if (!summary) return { error: "請填寫摘要", values };
  if (!body.length) return { error: "請填寫內文", values };

  const sources = [];
  for (const line of get("sources").split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const [a, b] = line.includes("|") ? line.split("|").map((s) => s.trim()) : [null, line];
    const url = b;
    if (!isUrl(url)) return { error: `來源網址格式不正確：${line}`, values };
    sources.push({ name: a || new URL(url).hostname, url });
  }

  const slugIn = get("slug");
  if (slugIn && !/^[a-z0-9-]+$/.test(slugIn)) return { error: "文章代號不正確", values };
  const old = slugIn ? await getAnyArticle(slugIn) : null;
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
  const slug = slugIn || `${date}-${category}-m${Date.now().toString(36)}`;
  const pub = get("publishedAt");

  await saveArticle({
    slug,
    category,
    origin: old?.origin ?? "manual",
    status: get("status") === "draft" ? "draft" : "published",
    title,
    summary,
    body,
    sources,
    publishedAt: pub ? fromTaipeiLocal(pub) : old?.publishedAt ?? new Date().toISOString(),
  });
  refresh();
  redirect("/admin?saved=1");
}

export async function deleteArticleAction(formData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (/^[a-z0-9-]+$/.test(slug)) await deleteArticle(slug);
  refresh();
  redirect("/admin?deleted=1");
}
