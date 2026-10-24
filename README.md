# 台北美國新聞網（taipei.us.ci）

Next.js 新聞站：程式放在 GitHub，由 Vercel 自動部署。

- 前台：首頁、台灣新聞、美國新聞、文章頁，全站使用微軟正黑體。
- 後台 `/admin`：密碼登入、新增／編輯／刪除文章（可存草稿）、手動按鈕讓 AI 抓新聞。
- 自動排程：每天台北 06:00 由 Vercel Cron 觸發，Gemini 託管代理 `antigravity-preview-05-2026` 上網讀新聞並改寫成文章。
- 文章存放在 Vercel Blob（不是存在 GitHub），所以新增文章不會觸發重新部署，也不需要 GitHub Actions。

## 部署步驟

1. 把專案推到 GitHub（建立一個新的 repo，建議設為 Private）：
   ```
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/你的帳號/taipei-us-news.git
   git push -u origin main
   ```
2. 到 Vercel → Add New → Project → 選剛剛的 GitHub repo → Deploy（Framework 會自動偵測為 Next.js）。
3. 建立儲存空間：Vercel 專案 → Storage → Create → Blob，連結到這個專案
   （會自動加入 `BLOB_READ_WRITE_TOKEN`）。
4. 設定環境變數（Settings → Environment Variables）：
   - `GEMINI_API_KEY`：Gemini API 金鑰
   - `ADMIN_PASSWORD`：後台登入密碼（請設長一點）
   - `CRON_SECRET`：隨機長字串（排程驗證用）
5. 設好環境變數與 Blob 後，到 Deployments 對最新一次部署按 Redeploy。
6. 網域：專案 → Settings → Domains 加入 `taipei.us.ci`，再到 us.ci 的 DNS 管理新增 Vercel 指示的記錄。
7. 開 `https://taipei.us.ci/admin` 登入，按「立即抓取台灣新聞／美國新聞」測試。

之後每次修改程式，`git push` 到 main，Vercel 就會自動重新部署。

## 本機測試

```
npm install
ADMIN_PASSWORD=test GEMINI_API_KEY=你的金鑰 npm run dev
```

本機沒有 `BLOB_READ_WRITE_TOKEN` 時，文章會存在 `content/articles/`（內含兩篇【範例】文章，只在本機看得到）。

## 注意

- 每日排程在 Hobby 方案可用（每個排程每天一次）。每個分類排了 3 個時間點（UTC 22:00 起，約 15～35 分鐘內），
  第一次負責開始，後面負責收結果，已抓過就自動略過。
- 代理一次要跑數分鐘，所以後台按鈕是「背景執行＋定時查進度」，按下後可以離開頁面。
- `antigravity-preview-05-2026` 是 preview 版本，名稱可用環境變數 `GEMINI_AGENT` 更換。
- 每類新聞篇數：`ARTICLES_PER_CATEGORY`（預設 5）；抓取的媒體與寫作規則在 `lib/generator.js` 的 prompt。
- 手動抓取與排程都會把文章直接發布；不想直接公開的話，可到後台改成草稿或刪除。
- 請不要把 `.env` 檔或金鑰提交到 GitHub（`.gitignore` 已排除）。
