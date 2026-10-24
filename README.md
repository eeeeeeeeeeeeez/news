# 台北美國新聞網（taipei.us.ci）

Next.js 靜態新聞站。每天由 GitHub Actions 呼叫 Gemini 託管代理 `antigravity-preview-05-2026`
上網讀 BBC／國際媒體與台灣媒體的新聞，改寫成繁體中文文章存進 `content/articles/`，
推送後 Vercel 自動重新部署。

## 運作流程
GitHub Actions（每天台北 06:00）→ `npm run generate` → 新增 JSON 文章 → git push → Vercel 自動部署

## 部署步驟
1. 把專案推到 GitHub 新 repo。
2. 在 repo 的 Settings → Secrets and variables → Actions 新增 `GEMINI_API_KEY`。
3. 在 Vercel 匯入該 repo（Framework 自動偵測 Next.js）。
4. Vercel 專案 → Domains 加入 `taipei.us.ci`，依畫面指示到 us.ci 的 DNS 設定新增 Vercel 給的記錄。
5. GitHub → Actions → Daily news → Run workflow，手動跑第一次。
6. 成功後刪除 `content/articles/` 裡兩篇【範例】文章。

## 本機測試
```
npm install
cp .env.example .env.local   # 填入 GEMINI_API_KEY
export GEMINI_API_KEY=你的金鑰
npm run generate             # 產生今天的文章
npm run dev
```

## 可調整
- 每類新聞篇數：環境變數 `ARTICLES_PER_CATEGORY`（預設 5）
- 代理名稱：環境變數 `GEMINI_AGENT`
- 抓取的媒體與寫作規則：`scripts/generate.mjs` 裡的 prompt
- 排程時間：`.github/workflows/daily-news.yml` 的 cron（UTC）
