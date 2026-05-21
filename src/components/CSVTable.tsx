/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { ParsedData } from "../types";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";

interface CSVTableProps {
  data: ParsedData;
}

export default function CSVTable({ data }: CSVTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 每頁顯示 8 筆

  const totalPages = Math.ceil(data.rows.length / itemsPerPage);

  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return data.rows.slice(startIdx, startIdx + itemsPerPage);
  }, [data.rows, currentPage]);

  if (!data.headers || data.headers.length === 0) return null;

  return (
    <div id="data-preview-table-container" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400" />
            貼入數據預覽表格
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            系統成功偵測到 <span className="font-semibold text-slate-600">{data.headers.length}</span> 個欄位，及共 <span className="font-semibold text-slate-600">{data.rows.length}</span> 筆記錄
          </p>
        </div>

        {/* 分頁器 */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-xs" id="table-pagination-nav">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 px-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-500">
              第 <span className="font-medium text-slate-700">{currentPage}</span> / {totalPages} 頁
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 px-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 表格容器 */}
      <div className="overflow-x-auto rounded-lg border border-slate-150">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-slate-500 w-12 bg-slate-100">#</th>
              {data.headers.map((header) => {
                const isNumeric = data.numericColumns.includes(header);
                return (
                  <th
                    key={header}
                    className={`px-4 py-2.5 text-left font-semibold text-slate-600 truncate max-w-[200px] ${
                      isNumeric ? "text-right" : ""
                    }`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {paginatedRows.map((row, rIdx) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + rIdx + 1;
              return (
                <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-2 text-slate-400 font-mono bg-slate-50/55">{globalIndex}</td>
                  {data.headers.map((header) => {
                    const isNumeric = data.numericColumns.includes(header);
                    const val = row[header];
                    return (
                      <td
                        key={header}
                        className={`px-4 py-2 text-slate-700 font-normal truncate max-w-[200px] ${
                          isNumeric ? "text-right font-mono text-slate-900" : ""
                        }`}
                      >
                        {val === undefined || val === null ? (
                          <span className="text-slate-300 italic">無</span>
                        ) : typeof val === "number" ? (
                          val.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        ) : (
                          String(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
