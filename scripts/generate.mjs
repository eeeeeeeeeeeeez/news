// 每日新聞產生器：呼叫 Gemini 託管代理 (Antigravity) 上網讀新聞，
// 並把結果存成 content/articles/*.json，之後由網站 build 時讀取。
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

const AGENT = process.env.GEMINI_AGENT || "antigravity-preview-05-2026";
const PER = Number(process.env.ARTICLES_PER_CATEGORY || 5);
const dir = path.join(process.cwd(), "content", "articles");
fs.mkdirSync(dir, { recursive: true });

if (!process.env.GEMINI_API_KEY) {
  console.error("缺少 GEMINI_API_KEY");
  process.exit(1);
}

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());

// 讀取既有文章，避免重複
const existing = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const seenUrls = new Set(existing.flatMap((a) => a.sources.map((s) => s.url)));
const recentTitles = existing.slice(-40).map((a) => `- ${a.title}`).join("\n") || "（無）";

const prompt = `你是「台北美國新聞網」的編輯。今天是 ${today}（台北時間）。
請上網閱讀「最近 24 小時內」的新聞，挑選最重要的新聞，產出以下數量的文章：
- 台灣新聞 ${PER} 則（category: "taiwan"）：參考中央社、公視、聯合報、自由時報、中國時報、風傳媒、Focus Taiwan 等台灣媒體，也可參考 BBC、Reuters 對台灣的報導。
- 美國新聞 ${PER} 則（category: "us"）：參考 BBC、Reuters、AP、NPR、CNN、NYT、Washington Post 等媒體。

規則：
1. 只能根據你實際讀到的報導撰寫，不可捏造事實、人名、數字或引言；無法確認的內容就省略。
2. 一律用繁體中文（台灣用語）以自己的話改寫，不可逐字複製原文，引用原文不得超過一小句。
3. 每則附上 1～3 個實際讀過的來源（媒體名稱與完整網址）。
4. 不要重複報導以下已發布過的主題：
${recentTitles}
5. 語氣客觀中立，不下評論、不使用誇大標題。

只輸出一個 JSON 陣列，不要有任何其他文字或 Markdown 程式碼框。每個元素格式：
{"category":"taiwan"或"us","title":"標題（30字內）","summary":"一到兩句摘要（80字內）","body":["第一段","第二段","第三段"],"sources":[{"name":"媒體名稱","url":"https://..."}]}
body 為 3～5 段，每段約 80～150 字。`;

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
  if (start < 0 || end < 0) throw new Error("回傳內容中找不到 JSON 陣列");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const isUrl = (u) => { try { return ["http:", "https:"].includes(new URL(u).protocol); } catch { return false; } };

console.log(`呼叫 ${AGENT}…（可能需要數分鐘）`);
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const interaction = await client.interactions.create({ agent: AGENT, input: prompt, environment: "remote" });

const items = parseJson(collectText(interaction));
const counters = { taiwan: 0, us: 0 };
const now = new Date().toISOString();
let saved = 0;

for (const it of items) {
  const ok =
    ["taiwan", "us"].includes(it?.category) &&
    typeof it.title === "string" && it.title.trim() &&
    typeof it.summary === "string" && it.summary.trim() &&
    Array.isArray(it.body) && it.body.length >= 2 && it.body.every((p) => typeof p === "string") &&
    Array.isArray(it.sources) && it.sources.length > 0;
  if (!ok) continue;
  const sources = it.sources.filter((s) => s && typeof s.name === "string" && isUrl(s.url));
  if (!sources.length) continue;
  if (sources.some((s) => seenUrls.has(s.url))) continue; // 同一來源已寫過

  counters[it.category] += 1;
  const slug = `${today}-${it.category}-${counters[it.category]}`;
  const file = path.join(dir, `${slug}.json`);
  if (fs.existsSync(file)) continue;
  fs.writeFileSync(
    file,
    JSON.stringify({ slug, category: it.category, title: it.title.trim(), summary: it.summary.trim(), body: it.body, sources, publishedAt: now }, null, 2) + "\n"
  );
  sources.forEach((s) => seenUrls.add(s.url));
  saved += 1;
}

console.log(`完成：新增 ${saved} 篇（台灣 ${counters.taiwan}、美國 ${counters.us}）`);
if (saved === 0) {
  console.error("沒有產生任何有效文章");
  process.exit(1);
}
