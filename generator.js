// 呼叫 Gemini 託管代理 (Antigravity) 上網讀新聞並產出文章。
// 代理要跑好幾分鐘，所以用「背景執行 + 輪詢」：startJob 只負責開始，checkJob 檢查並在完成時存檔。
import { GoogleGenAI } from "@google/genai";
import { readAll, saveArticle, readJob, writeJob, clearJob } from "./store";

const AGENT = process.env.GEMINI_AGENT || "antigravity-preview-05-2026";
const PER = Number(process.env.ARTICLES_PER_CATEGORY || 5);
const STALE_MS = 2 * 3600e3;
const RUNNING = ["in_progress", "queued", "requires_action"];
const OK = ["completed", "idle"];

const SCOPE = {
  taiwan: `台灣新聞 ${PER} 則：參考中央社、公視、聯合報、自由時報、中國時報、風傳媒、Focus Taiwan 等台灣媒體，也可參考 BBC、Reuters 對台灣的報導。`,
  us: `美國新聞 ${PER} 則：參考 BBC、Reuters、AP、NPR、CNN、NYT、Washington Post 等媒體。`,
};

const taipeiToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
const client = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildPrompt(category, today, recentTitles) {
  return `你是「台北美國新聞網」的編輯。今天是 ${today}（台北時間）。
請上網閱讀「最近 24 小時內」的新聞，挑選最重要的新聞，產出：${SCOPE[category]}

規則：
1. 只能根據你實際讀到的報導撰寫，不可捏造事實、人名、數字或引言；無法確認的內容就省略。
2. 一律用繁體中文（台灣用語）以自己的話改寫，不可逐字複製原文，引用原文不得超過一小句。
3. 每則附上 1～3 個實際讀過的來源（媒體名稱與完整網址）。
4. 不要重複報導以下已發布過的主題：
${recentTitles || "（無）"}
5. 語氣客觀中立，不下評論、不使用誇大標題。

只輸出一個 JSON 陣列，不要有任何其他文字或 Markdown 程式碼框。每個元素格式：
{"title":"標題（30字內）","summary":"一到兩句摘要（80字內）","body":["第一段","第二段","第三段"],"sources":[{"name":"媒體名稱","url":"https://..."}]}
body 為 3～5 段，每段約 80～150 字。`;
}

function collectText(interaction) {
  if (typeof interaction?.output_text === "string" && interaction.output_text.trim()) return interaction.output_text;
  const parts = [];
  const walk = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (typeof n === "object") {
      if (typeof n.text === "string") parts.push(n.text);
      Object.values(n).forEach((v) => typeof v === "object" && walk(v));
    }
  };
  walk(interaction?.outputs ?? interaction?.output ?? []);
  return parts.join("\n");
}

function parseJson(text) {
  const cleaned = text.replace(/```json|```/g, "");
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end < 0) throw new Error("代理的回覆中找不到文章資料");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const isUrl = (u) => {
  try { return ["http:", "https:"].includes(new URL(u).protocol); } catch { return false; }
};

/** 開始一個背景工作（不等結果）。 */
export async function startJob(category) {
  const existing = await readAll();
  const recent = existing.filter((a) => a.category === category).slice(0, 40).map((a) => `- ${a.title}`).join("\n");
  const it = await client().interactions.create({
    agent: AGENT,
    input: buildPrompt(category, taipeiToday(), recent),
    environment: "remote",
    background: true,
  });
  const job = { id: it.id, category, startedAt: Date.now() };
  await writeJob(category, job);
  return job;
}

async function finalize(category, interaction) {
  const today = taipeiToday();
  const existing = await readAll();
  const seen = new Set(existing.flatMap((a) => (a.sources || []).map((s) => s.url)));
  const taken = new Set(existing.map((a) => a.slug));
  const now = new Date().toISOString();
  let n = 0;
  let saved = 0;
  for (const it of parseJson(collectText(interaction))) {
    const ok =
      typeof it?.title === "string" && it.title.trim() &&
      typeof it.summary === "string" && it.summary.trim() &&
      Array.isArray(it.body) && it.body.length >= 2 && it.body.every((p) => typeof p === "string") &&
      Array.isArray(it.sources);
    if (!ok) continue;
    const sources = it.sources.filter((s) => s && typeof s.name === "string" && isUrl(s.url));
    if (!sources.length || sources.some((s) => seen.has(s.url))) continue;
    sources.forEach((s) => seen.add(s.url));
    let slug;
    do { n += 1; slug = `${today}-${category}-${n}`; } while (taken.has(slug));
    await saveArticle({
      slug, category, origin: "ai", status: "published",
      title: it.title.trim(), summary: it.summary.trim(), body: it.body, sources, publishedAt: now,
    });
    saved += 1;
  }
  return saved;
}

/** 檢查工作進度；完成時存檔並清除工作。回傳 {state: idle|running|done|failed, ...} */
export async function checkJob(category) {
  const job = await readJob(category);
  if (!job) return { state: "idle" };
  if (Date.now() - job.startedAt > STALE_MS) {
    await clearJob(category);
    return { state: "failed", error: "等待超過 2 小時，已取消，請重新抓取。" };
  }
  try {
    const it = await client().interactions.get(job.id);
    const status = String(it.status || "").toLowerCase();
    if (RUNNING.includes(status)) return { state: "running", startedAt: job.startedAt };
    if (!OK.includes(status)) {
      await clearJob(category);
      return { state: "failed", error: `代理執行失敗（${status || "未知狀態"}）` };
    }
    const saved = await finalize(category, it);
    await clearJob(category);
    return { state: "done", saved };
  } catch (err) {
    await clearJob(category);
    return { state: "failed", error: String(err?.message || err) };
  }
}

/** 排程用：今天還沒抓過就開始，並在時限內等結果；沒等到下次排程會接手。 */
export async function runScheduled(category, deadline) {
  let state = await checkJob(category);
  if (state.state === "done" || state.state === "failed") return state;
  if (state.state === "idle") {
    const today = taipeiToday();
    const existing = await readAll();
    if (existing.some((a) => a.origin === "ai" && a.category === category && a.slug.startsWith(today))) {
      return { state: "skipped", reason: "今天已經抓過" };
    }
    await startJob(category);
  }
  while (Date.now() < deadline) {
    await sleep(12000);
    state = await checkJob(category);
    if (state.state !== "running") return state;
  }
  return { state: "running" };
}
