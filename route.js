import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAdmin } from "../../../../lib/auth";
import { checkJob, startJob } from "../../../../lib/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const valid = (c) => ["taiwan", "us"].includes(c);
const refresh = (r) => {
  if (r.saved > 0) {
    revalidateTag("articles");
    revalidatePath("/", "layout");
  }
};

// 查詢進度（完成時順便存檔）
export async function GET(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const category = new URL(request.url).searchParams.get("category");
  if (!valid(category)) return NextResponse.json({ error: "bad category" }, { status: 400 });
  const r = await checkJob(category);
  refresh(r);
  return NextResponse.json(r);
}

// 開始手動抓取
export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { category } = await request.json().catch(() => ({}));
  if (!valid(category)) return NextResponse.json({ error: "bad category" }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ state: "failed", error: "尚未設定 GEMINI_API_KEY" }, { status: 500 });
  }
  const cur = await checkJob(category);
  refresh(cur);
  if (cur.state === "running") return NextResponse.json(cur);
  try {
    const job = await startJob(category);
    return NextResponse.json({ state: "running", startedAt: job.startedAt });
  } catch (err) {
    console.error("start job failed", err);
    return NextResponse.json({ state: "failed", error: String(err?.message || err) }, { status: 500 });
  }
}
