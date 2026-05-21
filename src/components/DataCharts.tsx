/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { ParsedData, ChartConfig } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AreaChart as ChartIcon, BarChart3, LineChart as LineIcon, Settings } from "lucide-react";

interface DataChartsProps {
  data: ParsedData;
}

export default function DataCharts({ data }: DataChartsProps) {
  const { headers, rows, numericColumns, categoricalColumns } = data;

  const [cfg, setCfg] = useState<ChartConfig>({
    xAxis: "",
    yAxis: "",
    chartType: "line",
  });

  // 當資料載入/改變時，自動鎖定合適的預設 X、Y 軸
  useEffect(() => {
    if (headers && headers.length > 0) {
      // 預設 X 軸：優選非數值欄位（如"推廣管道"、"產品類目"、"月份" 等類別欄位）
      const defaultX =
        categoricalColumns.length > 0
          ? categoricalColumns[0]
          : headers[0];

      // 預設 Y 軸：優選第一個數值欄位
      const defaultY =
        numericColumns.length > 0
          ? numericColumns[0]
          : headers[headers.length - 1];

      setCfg({
        xAxis: defaultX,
        yAxis: defaultY || "",
        chartType: numericColumns.length > 0 ? "bar" : "line",
      });
    }
  }, [data, headers, numericColumns, categoricalColumns]);

  if (!headers || headers.length === 0 || rows.length === 0) return null;

  // 如果數值型欄位不夠，就先不渲染圖表
  if (numericColumns.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs">
        ⚠️ 偵測到此數據中無顯著的「數值欄位」，暫無法繪製趨勢圖。
      </div>
    );
  }

  const renderChart = () => {
    // 預防 X 軸與 Y 軸未選
    if (!cfg.xAxis || !cfg.yAxis) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
          請在上方控制區選擇 X 軸與 Y 軸欄位以繪製圖表。
        </div>
      );
    }

    const chartData = rows;

    switch (cfg.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={cfg.xAxis} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                labelClassName="font-semibold text-slate-800"
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                name={cfg.yAxis}
                dataKey={cfg.yAxis}
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={cfg.xAxis} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                labelClassName="font-semibold text-slate-800"
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                name={cfg.yAxis}
                type="monotone"
                dataKey={cfg.yAxis}
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorY)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "line":
      default:
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={cfg.xAxis} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                labelClassName="font-semibold text-slate-800"
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                name={cfg.yAxis}
                type="monotone"
                dataKey={cfg.yAxis}
                stroke="#6366f1"
                activeDot={{ r: 6 }}
                strokeWidth={2.5}
                dot={{ strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div id="data-chart-visualization-container" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      {/* 標題與控制面板 */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2">
            <ChartIcon className="w-4 h-4 text-indigo-500" />
            敏捷數據圖表可視化
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            點擊切換維度以自訂檢視本數據集的趨勢分布與比例關聯
          </p>
        </div>

        {/* 軸向選擇器與切換圖表型式 */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-xl text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
            <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="flex items-center gap-1">
              <span>X軸：</span>
              <select
                value={cfg.xAxis}
                onChange={(e) => setCfg({ ...cfg, xAxis: e.target.value })}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none font-semibold text-slate-700 hover:border-slate-300"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <span>Y軸：</span>
              <select
                value={cfg.yAxis}
                onChange={(e) => setCfg({ ...cfg, yAxis: e.target.value })}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none font-semibold text-slate-700 hover:border-slate-300"
              >
                {numericColumns.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCfg({ ...cfg, chartType: "line" })}
              className={`p-1 px-2.5 rounded-md flex items-center gap-1 transition ${
                cfg.chartType === "line"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" />
              <span>折線圖</span>
            </button>
            <button
              onClick={() => setCfg({ ...cfg, chartType: "bar" })}
              className={`p-1 px-2.5 rounded-md flex items-center gap-1 transition ${
                cfg.chartType === "bar"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>直條圖</span>
            </button>
            <button
              onClick={() => setCfg({ ...cfg, chartType: "area" })}
              className={`p-1 px-2.5 rounded-md flex items-center gap-1 transition ${
                cfg.chartType === "area"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
              }`}
            >
              <ChartIcon className="w-3.5 h-3.5" />
              <span>面積圖</span>
            </button>
          </div>
        </div>
      </div>

      {/* 繪圖畫布 */}
      <div className="p-2 pt-4 bg-slate-50/50 rounded-xl" id="visualization-canvas">
        {renderChart()}
      </div>
    </div>
  );
}
