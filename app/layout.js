import Link from "next/link";
import "./globals.css";
import Clocks from "../components/Clocks";
import { SITE } from "../lib/articles";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}｜台灣與美國每日新聞`, template: `%s｜${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: "zh_TW", type: "website" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <header className="top">
          <div className="wrap bar">
            <Clocks />
            <nav aria-label="主選單">
              <Link href="/">首頁</Link>
              <Link href="/taiwan" className="tw">台灣</Link>
              <Link href="/us" className="us">美國</Link>
              <Link href="/about">關於</Link>
            </nav>
          </div>
          <div className="wrap mast">
            <Link href="/" className="logo">{SITE.name}</Link>
            <p>台灣與美國，每天一次看完。</p>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="foot">
          <div className="wrap">
            <p>本站文章由 AI 協助蒐集、改寫與整理，並附上原始來源連結；內容可能有誤，請以原始報導為準。</p>
            <p>© {new Date().getFullYear()} {SITE.name}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
