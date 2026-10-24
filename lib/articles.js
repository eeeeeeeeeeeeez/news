import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "articles");

export const SITE = {
  name: "台北美國新聞網",
  url: "https://taipei.us.ci",
  description: "每天整理台灣與美國的重要新聞，由 AI 協助彙整並標示來源。",
};

export const CATEGORIES = {
  taiwan: { label: "台灣", desc: "台灣政治、經濟、社會與科技的最新消息" },
  us: { label: "美國", desc: "美國政治、經濟、科技與國際局勢的最新消息" },
};

export function getAllArticles() {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const getArticle = (slug) => getAllArticles().find((a) => a.slug === slug);
export const byCategory = (list, cat) => list.filter((a) => a.category === cat);

export function fmtDate(iso, withTime = false) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(new Date(iso));
}
