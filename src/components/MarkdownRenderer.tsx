/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Clipboard, ClipboardCheck, AlertCircle } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("無法複製文字: ", err);
    }
  };

  if (!content) return null;

  // 解析 Markdown 字串
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let keyCounter = 0;

    let inList = false;
    let listItems: string[] = [];

    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    let inBlockquote = false;
    let blockquoteLines: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${keyCounter++}`} className="list-disc pl-6 py-2 pb-3 space-y-1.5 text-slate-700 leading-relaxed text-sm">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableHeaders.length > 0 || tableRows.length > 0) {
        elements.push(
          <div key={`table-wrapper-${keyCounter++}`} className="overflow-x-auto my-4 border border-slate-200 rounded-lg shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-slate-700 tracking-wider"
                      dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(header) }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-slate-50/50" : ""}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-4 py-2 text-slate-600 font-normal"
                        dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cell) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    const flushBlockquote = () => {
      if (blockquoteLines.length > 0) {
        elements.push(
          <div
            key={`bq-${keyCounter++}`}
            className="pl-4 py-3 pr-2 my-4 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-lg text-slate-700 italic text-sm space-y-1 flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              {blockquoteLines.map((line, idx) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />
              ))}
            </div>
          </div>
        );
        blockquoteLines = [];
        inBlockquote = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 處理 Blockquote (引言、異常警告等)
      if (line.startsWith(">")) {
        flushList();
        flushTable();
        inBlockquote = true;
        const cleanBqLine = line.replace(/^>\s*/, "");
        blockquoteLines.push(cleanBqLine);
        continue;
      } else if (inBlockquote && !line.startsWith(">") && line !== "") {
        // 如果是延續 Blockquote 但沒帶 '>' 的空行以外
        blockquoteLines.push(line);
        continue;
      } else if (inBlockquote && line === "") {
        flushBlockquote();
      }

      // 處理無序列表
      if (line.startsWith("- ") || line.startsWith("* ")) {
        flushTable();
        flushBlockquote();
        inList = true;
        listItems.push(line.substring(2));
        continue;
      } else if (inList && !line.startsWith("- ") && !line.startsWith("* ") && line !== "") {
        // 又是列表的下一行（如果只是空行，就關閉列表）
        listItems[listItems.length - 1] += "<br/>" + line;
        continue;
      } else if (inList && (line === "" || i === lines.length - 1)) {
        flushList();
      }

      // 處理美觀的表格 Markdown
      if (line.startsWith("|")) {
        flushList();
        flushBlockquote();
        const parts = line
          .split("|")
          .map((part) => part.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        // 過濾掉 |---|---| 分隔線
        const isDivider = parts.every((p) => /^:?-+:?$/.test(p));
        if (isDivider) {
          continue;
        }

        if (!inTable) {
          inTable = true;
          tableHeaders = parts;
        } else {
          tableRows.push(parts);
        }
        continue;
      } else {
        if (inTable) {
          flushTable();
        }
      }

      // 處理多級標題
      if (line.startsWith("#")) {
        flushList();
        flushTable();
        flushBlockquote();

        const match = line.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          const textVal = match[2];

          switch (level) {
            case 1:
              elements.push(
                <h1
                  key={`h1-${keyCounter++}`}
                  className="text-2xl font-bold text-slate-800 tracking-tight mt-6 mb-3 pb-2 border-b border-slate-100"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(textVal) }}
                />
              );
              break;
            case 2:
              elements.push(
                <h2
                  key={`h2-${keyCounter++}`}
                  className="text-xl font-bold text-slate-800 tracking-tight mt-5 mb-2.5 flex items-center gap-2"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(textVal) }}
                />
              );
              break;
            case 3:
              elements.push(
                <h3
                  key={`h3-${keyCounter++}`}
                  className="text-lg font-semibold text-slate-800 tracking-tight mt-4 mb-2"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(textVal) }}
                />
              );
              break;
            default:
              elements.push(
                <h4
                  key={`h4-${keyCounter++}`}
                  className="text-md font-semibold text-slate-700 tracking-tight mt-3 mb-1.5"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(textVal) }}
                />
              );
          }
          continue;
        }
      }

      // 處理一般段落
      if (line !== "") {
        flushList();
        flushTable();
        flushBlockquote();
        elements.push(
          <p
            key={`p-${keyCounter++}`}
            className="text-sm text-slate-600 leading-relaxed py-1.5 font-normal"
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }}
          />
        );
      }
    }

    // 最後補漏刷
    flushList();
    flushTable();
    flushBlockquote();

    return elements;
  };

  // 處理行內樣式，如粗體、代碼、標記等
  const parseInlineMarkdown = (text: string) => {
    let html = text;
    // 粗體 **
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-slate-900'>$1</strong>");
    // 程式碼 `
    html = html.replace(/`(.*?)`/g, "<code class='bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs'>$1</code>");
    // 底線 / 刪除線 ~
    html = html.replace(/~~(.*?)~~/g, "<del class='text-slate-400'>$1</del>");
    return html;
  };

  return (
    <div id="ai-insight-report" className="relative bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs">
      {/* 頂部控制面板：標題與複製 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            AI 智慧數據分析報告
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            由 Google Gemini 模型驅動進行深度商業洞察與趨勢歸納
          </p>
        </div>

        <button
          onClick={handleCopy}
          id="copy-report-btn"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
            copied
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 active:scale-95 cursor-pointer"
          }`}
          title="複製完整報告"
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>已複製！</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5 text-slate-400" />
              <span>複製報告</span>
            </>
          )}
        </button>
      </div>

      {/* 報告主體內容 */}
      <div className="prose max-w-none prose-slate space-y-1">
        {renderMarkdown(content)}
      </div>
    </div>
  );
}
