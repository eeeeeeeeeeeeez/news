"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CATS = [["taiwan", "台灣新聞"], ["us", "美國新聞"]];

export default function AiPanel() {
  const router = useRouter();
  const [st, setSt] = useState({ taiwan: { state: "idle" }, us: { state: "idle" } });
  const [msg, setMsg] = useState({});
  const ref = useRef(st);
  ref.current = st;

  const apply = useCallback((cat, j) => {
    setSt((s) => ({ ...s, [cat]: j }));
    if (j.state === "done") { setMsg((m) => ({ ...m, [cat]: { ok: true, text: j.saved ? `完成，新增 ${j.saved} 篇文章。` : "完成，但沒有新的文章（可能都已經報導過）。" } })); router.refresh(); }
    if (j.state === "failed") setMsg((m) => ({ ...m, [cat]: { ok: false, text: `失敗：${j.error}` } }));
  }, [router]);

  const check = useCallback(async (cat) => {
    try {
      const r = await fetch(`/api/admin/news?category=${cat}`, { cache: "no-store" });
      apply(cat, await r.json());
    } catch { /* 網路暫時失敗，下次輪詢再試 */ }
  }, [apply]);

  useEffect(() => { CATS.forEach(([c]) => check(c)); }, [check]);
  useEffect(() => {
    const id = setInterval(() => CATS.forEach(([c]) => ref.current[c].state === "running" && check(c)), 8000);
    return () => clearInterval(id);
  }, [check]);

  async function start(cat) {
    setMsg((m) => ({ ...m, [cat]: null }));
    setSt((s) => ({ ...s, [cat]: { state: "running" } }));
    try {
      const r = await fetch("/api/admin/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: cat }) });
      apply(cat, await r.json());
    } catch (e) {
      apply(cat, { state: "failed", error: "無法連線" });
    }
  }

  return (
    <section className="panel">
      <h2>AI 自動抓新聞</h2>
      <p className="hint">按下後，AI 會上網讀最新新聞並改寫成文章，大約需要 3～10 分鐘，可以先離開這頁，稍後回來看結果。</p>
      <div className="ai-grid">
        {CATS.map(([cat, label]) => {
          const s = st[cat];
          const running = s.state === "running";
          return (
            <div key={cat} className="ai-item">
              <button className="btn primary" disabled={running} onClick={() => start(cat)}>
                {running ? `${label}抓取中…` : `立即抓取${label}`}
              </button>
              {msg[cat] && <p className={`alert ${msg[cat].ok ? "ok" : "error"}`}>{msg[cat].text}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
