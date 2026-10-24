import Link from "next/link";
import StoryList from "../components/StoryList";
import { getAllArticles, byCategory, CATEGORIES } from "../lib/articles";

export default function Home() {
  const all = getAllArticles();
  return (
    <div className="desks">
      {Object.entries(CATEGORIES).map(([key, c]) => (
        <section key={key} className={`desk ${key}`} aria-labelledby={`h-${key}`}>
          <header>
            <h2 id={`h-${key}`}>{c.label}</h2>
            <Link href={`/${key}`}>全部{c.label}新聞</Link>
          </header>
          <StoryList items={byCategory(all, key).slice(0, 6)} />
        </section>
      ))}
    </div>
  );
}
