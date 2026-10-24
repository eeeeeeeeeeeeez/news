// 後台登入：密碼放環境變數 ADMIN_PASSWORD，登入後發一個簽章過的 cookie（7 天）。
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const NAME = "admin_session";
const TTL = 7 * 24 * 3600;
const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (v) => crypto.createHmac("sha256", secret()).update(v).digest("hex");
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();

export function checkPassword(input) {
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(pw) && crypto.timingSafeEqual(sha(input), sha(pw));
}

export async function createSession() {
  const exp = String(Math.floor(Date.now() / 1000) + TTL);
  (await cookies()).set(NAME, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL,
  });
}
export async function destroySession() {
  (await cookies()).delete(NAME);
}

export async function isAdmin() {
  if (!secret()) return false;
  const v = (await cookies()).get(NAME)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig) return false;
  const expected = sign(exp);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(exp) > Date.now() / 1000;
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
