# AI 數據分析與洞察工具

這是一個功能強大的 AI 數據分析工具。只需貼上 CSV 報表資料，即可在數秒內生成包含統計、趨勢分析與商業洞察的繁體中文報告，支援即時表格解析與 Markdown 渲染一鍵複製。

## 🚀 本地開發與運行

### 系統需求
* [Node.js](https://nodejs.org/) (建議 v18 以上版本)

### 啟動步驟

1. **安裝依賴套件**：
   ```bash
   npm install
   ```

2. **設定環境變數**：
   * 專案根目錄下已為您建立 `.env` 檔案。
   * 請將裡面的 `GEMINI_API_KEY` 替換為您的實際 Gemini API 金鑰。*(您可以前往 [Google AI Studio](https://aistudio.google.com/) 免費申請金鑰)*

3. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   啟動後，使用瀏覽器打開 `http://localhost:3000` 即可開始使用！

## 🛠️ 技術棧說明
* **前端 (Frontend)**: React 19, Vite, Tailwind CSS v4, Motion, Lucide React, Recharts
* **後端 (Backend)**: Express.js, TypeScript, tsx, esbuild
* **AI 整合**: Google Gen AI SDK (`@google/genai` v1.29.0), Gemini 3.5 Flash
