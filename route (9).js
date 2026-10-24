import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { runScheduled } from "../../../../lib/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Hobby 方案上限；Pro 可調高

// Vercel Cron 會帶 Authorization: Bearer <CRON_SECRET>
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const category = new URL(request.url).searchParams.get("category");
  if (!["taiwan", "us"].includes(category)) {
    return NextResponse.json({ error: "category must be taiwan or us" }, { status: 400 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }
  try {
    const result = await runScheduled(category, Date.now() + 260_000);
    if (result.saved > 0) {
      revalidateTag("articles");
      revalidatePath("/", "layout");
    }
    return NextResponse.json({ category, ...result });
  } catch (err) {
    console.error("cron generate failed", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
