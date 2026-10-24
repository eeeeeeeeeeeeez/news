"use client";
import { useEffect, useState } from "react";

const fmt = (tz) =>
  new Intl.DateTimeFormat("zh-TW", {
    timeZone: tz,
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

export default function Clocks() {
  const [t, setT] = useState(null);
  useEffect(() => {
    const u = () => setT({ tw: fmt("Asia/Taipei"), ny: fmt("America/New_York") });
    u();
    const id = setInterval(u, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="clocks" aria-label="目前時間">
      <span><b>台北</b> {t ? t.tw : "--"}</span>
      <span><b>紐約</b> {t ? t.ny : "--"}</span>
    </div>
  );
}
