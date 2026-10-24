export const SITE = {
  name: "台北美國新聞網",
  url: "https://taipei.us.ci",
  description: "每天整理台灣與美國的重要新聞，並附上原始來源。",
};

export const CATEGORIES = {
  taiwan: { label: "台灣", title: "台灣新聞", desc: "台灣政治、經濟、社會與科技的最新消息" },
  us: { label: "美國", title: "美國新聞", desc: "美國政治、經濟、科技與國際局勢的最新消息" },
};

export const isPublished = (a) => (a.status ?? "published") === "published";
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

// 台北時間（UTC+8，無日光節約）轉成 <input type="datetime-local"> 的值
export const toTaipeiLocal = (iso) => new Date(Date.parse(iso) + 8 * 3600e3).toISOString().slice(0, 16);
export const fromTaipeiLocal = (v) => new Date(`${v}:00+08:00`).toISOString();
