import { redirect } from "next/navigation";
import { isAdmin } from "../../../lib/auth";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD);
  return (
    <div className="login">
      <h1>後台登入</h1>
      {!configured && <p className="alert error">尚未設定環境變數 ADMIN_PASSWORD，無法登入。</p>}
      {error && <p className="alert error" role="alert">密碼不正確</p>}
      <form action={loginAction} className="form">
        <label>密碼
          <input type="password" name="password" autoComplete="current-password" autoFocus required />
        </label>
        <button type="submit" className="btn primary">登入</button>
      </form>
    </div>
  );
}
