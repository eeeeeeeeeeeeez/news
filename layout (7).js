import Link from "next/link";
import { SITE } from "../../lib/articles";

export default function SiteLayout({ children }) {
  return (
    <>
      <header className="site-head">
        <div className="wrap head-row">
          <Link href="/" className="logo">{SITE.name}</Link>
          <p className="slogan">台灣與美國，每天一次看完</p>
        </div>
        <nav className="site-nav" aria-label="主選單">
          <div className="wrap">
            <Link href="/">首頁</Link>
            <Link href="/taiwan">台灣新聞</Link>
            <Link href="/us">美國新聞</Link>
            <Link href="/about">關於本站</Link>
          </div>
        </nav>
      </header>
      <main className="wrap">{children}</main>
      <footer className="site-foot">
        <div className="wrap">
          <p>部分文章由 AI 協助蒐集與改寫，並附上原始來源；內容可能有誤，請以原始報導為準。</p>
          <p>© {new Date().getFullYear()} {SITE.name}</p>
        </div>
      </footer>
    </>
  );
}
