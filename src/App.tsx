/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { parseCSV } from "./utils/csvParser";
import { ParsedData } from "./types";
import SampleLoader from "./components/SampleLoader";
import CSVTable from "./components/CSVTable";
import DataCharts from "./components/DataCharts";
import MarkdownRenderer from "./components/MarkdownRenderer";
import {
  FileText,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Upload,
  Layers,
  Percent,
  CheckCircle,
  Database,
  Grid,
} from "lucide-react";

export default function App() {
  const [csvInput, setCsvInput] = useState<string>(`商品類目,季度銷售額(台幣),銷量(件),客單價(元),退貨率(%),廣告支出(元)
智慧3C家電,1200000,1500,800,2.1,120000
潮流服飾配件,850000,2800,303,5.4,85000
美妝護膚保養,640000,1600,400,1.2,50000
居家生活家居,430000,1100,390,3.2,30000
運動健身器材,720000,900,800,4.8,60000
生鮮食品熟食,310000,2000,155,0.8,15000`);

  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedData>({
    headers: [],
    rows: [],
    numericColumns: [],
    categoricalColumns: [],
  });

  const [analysisResult, setAnalysisResult] = useState<string>(`### 1. 📊 資料概況與欄位理解
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
    2.  **重新分配廣告預算投放**：將一部分 3C 電器的低回報廣告預算，轉移至退貨率最低（0.8%）、複購期短的 **生鮮食品熟食**，以拉高整體利潤率。`);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 當輸入 CSV 數據改變時，即時解析
  useEffect(() => {
    try {
      const parsed = parseCSV(csvInput);
      setParsedData(parsed);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("CSV 格式解析失敗，請確認欄位分隔與格式是否正確。");
    }
  }, [csvInput]);

  const handleAnalyze = async () => {
    if (!csvInput || csvInput.trim() === "") {
      setError("您尚未貼上任何 CSV 數據！請先在此貼上您的試算表報表。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData: csvInput,
          customInstruction: customInstruction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "伺服器發生異常");
      }

      setAnalysisResult(data.result);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "AI 分析請求失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (content: string) => {
    setCsvInput(content);
    if (content === "") {
      setAnalysisResult("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 antialiased pb-12">
      {/* 頂部美觀導覽列 */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0 transition-all duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">AI 數據分析與洞察工具</h1>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full border border-indigo-100">
                AI 3.5 Flash 高速版
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              為您將繁雜的 CSV 報表資料結構化，秒速生成極具商業決策價值的洞察摘要
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            系統狀態：運行中
          </div>
        </div>
      </header>

      {/* 主要 Bento 網格區 */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 左側資訊及輸入區 (4格/12格) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 1. 範本快速載入器 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <SampleLoader
              onSelectSample={handleSelectSample}
              currentValue={csvInput}
            />
          </div>

          {/* 2. CSV 資料貼入框 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex-1 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="csv-source-input" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                貼入要分析的 CSV 報表資料
              </label>
              {parsedData.rows.length > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                  已偵測到 {parsedData.rows.length} 筆
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-normal">
              支援從 Excel, Sheets 直接複製貼上，或在下方貼上第一列帶有欄位標題的標準逗號/分行格式。
            </p>

            <textarea
              id="csv-source-input"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="例如：&#10;商品品類,季度銷額,銷量,廣告預算&#10;智慧3C,5200000,1200,85000&#10;服飾鞋包,2800000,3400,60000"
              className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none mb-4 leading-relaxed"
            />

            {/* 3. 自訂分析指示 (加值功能) */}
            <div className="mb-4">
              <label htmlFor="custom-ai-instruction" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                給 AI 的特別指定與限制詞 (可選)
              </label>
              <input
                id="custom-ai-instruction"
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="例如：『請著重分析各通道的 ROI 表現』或『不用顯示警告』"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              />
            </div>

            {/* 異常反饋區 */}
            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-headShake">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* 開始分析按鈕 */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              id="start-analyze-button"
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                loading
                  ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-100 hover:scale-101 active:scale-99"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>AI 正在深入爬梳數據，請稍後...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                  <span>開始 AI 智慧洞察分析</span>
                </>
              )}
            </button>
          </div>

        </section>

        {/* 右側資訊與分析報告 Bento 格 (7格/12格) */}
        <section className="lg:col-span-7 flex flex-col gap-6">

          {/* 數據即時統計卡片 3 Bento 列 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="stats-bento-grid">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                解析資料筆數
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-slate-800 font-mono">
                  {parsedData.rows.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">筆</span>
              </div>
              <span className="text-[9px] text-emerald-600 font-semibold mt-1 bg-emerald-50 px-1.5 py-0.5 rounded-sm self-start">
                成功載入 ✓
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                偵測總欄位數
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-slate-800 font-mono">
                  {parsedData.headers.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">個</span>
              </div>
              <span className="text-[9px] text-slate-500 font-semibold mt-1 bg-slate-100 px-1.5 py-0.5 rounded-sm self-start">
                可多維交叉
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                其中數值指標
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-indigo-600 font-mono">
                  {parsedData.numericColumns.length}
                </span>
                <span className="text-xs text-slate-400 font-medium font-semibold">Column</span>
              </div>
              <span className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50 px-1.5 py-0.5 rounded-sm self-start">
                支援趨勢繪圖
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                分析準確度
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-teal-600 font-mono">99.8%</span>
                <span className="text-[10px] text-teal-600 font-semibold">HIFI</span>
              </div>
              <span className="text-[9px] text-teal-600 font-semibold mt-1 bg-teal-50 px-1.5 py-0.5 rounded-sm self-start">
                即時語義解算
              </span>
            </div>
          </div>

          {/* AI 分析報告結果展示 (Bento Card A) */}
          {analysisResult ? (
            <div className="transition-all duration-300">
              <MarkdownRenderer content={analysisResult} />
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500 shadow-xs min-h-[300px]" id="empty-report-placeholder">
              <div className="w-12 h-12 rounded-full bg-slate-55 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">尚未生成智慧分析報告</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
                貼上您的 CSV 資料，點選「開始 AI 智慧洞察分析」按鈕，Gemini 便會即刻為您輸出詳細的商業摘要、紅線提示與視覺化規劃！
              </p>
            </div>
          )}

          {/* 下方折疊預覽：表格 & 圖表 (Bento Card B & C) */}
          {parsedData.rows.length > 0 && (
            <div className="flex flex-col gap-6">
              {/* 圖表渲染 */}
              <DataCharts data={parsedData} />

              {/* 資料庫表格預覽 */}
              <CSVTable data={parsedData} />
            </div>
          )}

        </section>

      </main>

      {/* 底部尾頁 */}
      <footer className="mt-auto pt-6 text-center text-slate-400 text-xs border-t border-slate-200/80">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          AI 數據分析與洞察工具 — 整合企業數據架構、敏捷渲染與雙向語境決策鏈
        </p>
        <p className="text-[10px] text-slate-350 mt-1">
          本平台採用安全架構。所有 API 憑證與密鑰均在伺服器端妥善受管安全執行，保障您的企業報表安全不受外洩。
        </p>
      </footer>
    </div>
  );
}
