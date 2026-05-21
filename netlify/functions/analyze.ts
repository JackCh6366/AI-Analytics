import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_SYSTEM_INSTRUCTION = `
你是一位專業的資料分析師。
你的任務是接收一段 CSV 或表格結構的原始數據，理解其欄位意義，並提出精確的摘要報告與洞察。

請務必嚴格遵循以下 Markdown 輸出格式：

### 1. 📊 資料概況與欄位理解
簡要說明這份資料的主題是什麼，並列出關鍵欄位的意義。

### 2. ⚠️ 異常與缺值檢查
檢查資料中是否有空白（例如缺少數量或金額）、極端值（例如不合理的高價），並將發現的異常項目條列出來。若無異常，說明「未發現明顯異常」。

### 3. 📈 統計與趨勢洞察
請回答以下問題的總結：
- **總計概況**：銷售數量或總金額的大概加總。
- **分類表現**：哪個業務員或哪項產品表現最好？
- **業務建議**：從數據中給出 1-2 個可以執行的商業建議。

請以 Markdown 格式輸出，所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。
`;

export const handler: Handler = async (event, context) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight call." }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { csvData, customInstruction } = JSON.parse(event.body || "{}");

    if (!csvData || csvData.trim() === "") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "CSV 資料不可為空。" }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isPlaceholderKey = !apiKey || apiKey === "請貼上您的Gemini_API_Key" || apiKey.trim() === "" || apiKey.includes("請");

    if (isPlaceholderKey) {
      // 延遲 1.2 秒模擬 AI 計算，提升使用者體驗
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockResult = `> ⚠️ **環境提醒**：系統偵測到您尚未在專案根目錄的 \`.env\` 檔案中設定實際的 **Gemini API 金鑰**（或仍在使用預設中文佔位符）。為了方便您測試，系統已自動啟用 **模擬分析模式（Mock Mode）** 展示分析效果！
> 
> *要啟用真實 AI 分析，請在 \`.env\` 檔案中設定 \`GEMINI_API_KEY="您的_Gemini_API_Key"\` 並重新啟動伺服器。*

### 1. 📊 資料概況與欄位理解
本份資料是以電子商務平台的商品銷售表現為核心，詳細記錄六個核心大類（智慧3C家電、潮流服飾配件、美妝護膚保養、居家生活家居、運動健身器材、生鮮食品熟食）的季度數據。

*   **商品類目**：產品品類劃分（類別維度）
*   **季度銷售額(台幣)**：該類目在單季創造的營業額累積
*   **銷量(件)**：實際售出商品件數
*   **客單價(元)**：每筆成交平均金額
*   **退貨率(%)**：顧客購買後申請退貨的比例
*   **廣告支出(元)**：該季度於社群與搜尋投放推廣的總預算

---

### 2. ⚠️ 異常與缺值檢查
*   **退貨率極端值**：**潮流服飾配件** 退貨率攀升至 **5.4%**，顯著高於平均水位 (2.9%)，屬極端異常；**運動健身器材** 退貨率為 **4.8%** 亦偏高。
*   **行銷效率邊際效益失靈**：**智慧3C家電** 投入全站最高廣告費 **$120,000**，雖打造最高營收，但回報放大倍數卻低於客單價較低的生鮮品類。
*   **缺值情況**：各欄位數據經檢驗，數值皆完整無空白與漏項。

---

### 3. 📈 統計與趨勢洞察
*   **總計概況**：
    *   全品類單季 **總銷售額** 共累計大約 **$4,150,000 元** (台幣)。
    *   **總銷售件數** 達 **9,900 件**。
*   **分類表現**：
    *   表現最優異的商品為 **智慧3C家電**，以 **$1,200,000 元** 居全站季度營收排行第一。
    *   單量王為 **潮流服飾配件**，出貨量高達 **2,800 件**。
*   **業務建議**：
    1.  **實施服飾尺碼輔助工具**：針對 5.4% 高退貨率品類，應在前端引進 3D 虛擬試衣或精準腰圍推薦，減少物理退回成本。
    2.  **重新分配廣告預算投放**：將一部分 3C 電器的低回報廣告預算，轉移至退貨率最低（0.8%）、複購期短的 **生鮮食品熟食**，以拉高整體利潤率。`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ result: mockResult }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = customInstruction && customInstruction.trim() !== ""
      ? `${DEFAULT_SYSTEM_INSTRUCTION}\n\n額外指定分析重點與限制：\n${customInstruction}`
      : DEFAULT_SYSTEM_INSTRUCTION;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `以下是需要分析的 CSV 數據資料：\n\n\`\`\`csv\n${csvData}\n\`\`\`\n\n請根據 System Instruction 提供深入、美觀且有條理的繁體中文分析與洞察報告。`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.25,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result: response.text }),
    };
  } catch (error: any) {
    console.error("Gemini API Error in Netlify Function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || "AI 分析過程中發生未知錯誤，請重試或檢查您的 API 金鑰設定。",
      }),
    };
  }
};
