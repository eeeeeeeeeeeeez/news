import "./globals.css";
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
      <body>{children}</body>
    </html>
  );
}
