import Link from "next/link";
import { CATEGORIES } from "../lib/articles";

export default function Tag({ category }) {
  return <Link href={`/${category}`} className={`tag ${category}`}>{CATEGORIES[category].label}</Link>;
}
