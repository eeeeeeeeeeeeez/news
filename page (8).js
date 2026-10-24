export const metadata = { title: "關於本站" };

export default function About() {
  return (
    <section className="post">
      <h1>關於台北美國新聞網</h1>
      <div className="body">
        <p>台北美國新聞網每天整理台灣與美國的重要新聞，用繁體中文寫成簡短易讀的文章。</p>
        <p>部分文章由 AI 讀取 BBC 等國際媒體與台灣媒體的公開報導後改寫，每篇都附上原始來源連結。AI 可能出錯，重要資訊請以原始報導為準。</p>
        <p>若你是來源媒體並希望移除或修改內容，請來信告知。</p>
      </div>
    </section>
  );
}
