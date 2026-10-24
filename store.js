// 文章與工作狀態的儲存層：部署在 Vercel 時用 Vercel Blob；本機沒有 Blob 金鑰時改用資料夾。
import fs from "node:fs";
import path from "node:path";
import { put, list, del } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { isPublished } from "./articles";

export const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const dir = path.join(process.cwd(), "content", "articles");
const stateDir = path.join(process.cwd(), ".data");
const MAX = 300;

async function listBlobs(prefix) {
  const blobs = [];
  let cursor;
  do {
    const r = await list({ prefix, cursor });
    blobs.push(...r.blobs);
    cursor = r.cursor;
  } while (cursor);
  return blobs;
}
const fetchBlob = (b) =>
  fetch(`${b.url}?v=${Date.parse(b.uploadedAt)}`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
const putJson = (pathname, data) =>
  put(pathname, JSON.stringify(data, null, 2) + "\n", {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
async function findBlob(pathname) {
  const r = await list({ prefix: pathname, limit: 5 });
  return r.blobs.find((b) => b.pathname === pathname) || null;
}

/** 讀出全部文章（含草稿），不經快取。後台使用。 */
export async function readAll() {
  let items = [];
  if (useBlob) {
    const blobs = (await listBlobs("articles/"))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, MAX);
    items = (await Promise.all(blobs.map(fetchBlob))).filter(Boolean);
  } else if (fs.existsSync(dir)) {
    items = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  }
  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

const cachedAll = unstable_cache(readAll, ["articles-v2"], { revalidate: 600, tags: ["articles"] });

/** 前台使用：只含已發布文章，有快取（後台存檔後會清除 "articles" 標籤）。 */
export async function listPublished() {
  return (await (useBlob ? cachedAll() : readAll())).filter(isPublished);
}
export async function getArticle(slug) {
  return (await listPublished()).find((a) => a.slug === slug);
}
export async function getAnyArticle(slug) {
  return (await readAll()).find((a) => a.slug === slug);
}

export async function saveArticle(article) {
  if (useBlob) return void (await putJson(`articles/${article.slug}.json`, article));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${article.slug}.json`), JSON.stringify(article, null, 2) + "\n");
}
export async function deleteArticle(slug) {
  if (useBlob) {
    const b = await findBlob(`articles/${slug}.json`);
    if (b) await del(b.url);
  } else {
    fs.rmSync(path.join(dir, `${slug}.json`), { force: true });
  }
}

// ---- AI 抓新聞的工作狀態（每個分類同時只會有一個）----
export async function readJob(cat) {
  if (useBlob) {
    const b = await findBlob(`state/job-${cat}.json`);
    return b ? fetchBlob(b) : null;
  }
  const f = path.join(stateDir, `job-${cat}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
}
export async function writeJob(cat, job) {
  if (useBlob) return void (await putJson(`state/job-${cat}.json`, job));
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(path.join(stateDir, `job-${cat}.json`), JSON.stringify(job));
}
export async function clearJob(cat) {
  if (useBlob) {
    const b = await findBlob(`state/job-${cat}.json`);
    if (b) await del(b.url);
  } else {
    fs.rmSync(path.join(stateDir, `job-${cat}.json`), { force: true });
  }
}
