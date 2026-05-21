/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedData } from "../types";

/**
 * 簡易而穩健的 CSV 解析器（支援雙引號內含逗號的情況）
 */
export function parseCSV(csvString: string): ParsedData {
  if (!csvString || csvString.trim() === "") {
    return { headers: [], rows: [], numericColumns: [], categoricalColumns: [] };
  }

  const lines = csvString.split(/\r?\n/);
  const rowsRaw: string[][] = [];

  for (const line of lines) {
    if (line.trim() === "") continue;

    const row: string[] = [];
    let insideQuote = false;
    let entry = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        row.push(entry.trim().replace(/^"(.*)"$/, "$1"));
        entry = "";
      } else {
        entry += char;
      }
    }
    row.push(entry.trim().replace(/^"(.*)"$/, "$1"));
    rowsRaw.push(row);
  }

  if (rowsRaw.length === 0) {
    return { headers: [], rows: [], numericColumns: [], categoricalColumns: [] };
  }

  const headers = rowsRaw[0].map((h, i) => h || `欄位_${i + 1}`);
  const dataRows = rowsRaw.slice(1);

  // 轉換為物件結構，並嘗試推斷數值
  const rows: Record<string, string | number>[] = [];
  dataRows.forEach((row) => {
    const rowObj: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      const val = row[index] !== undefined ? row[index] : "";
      // 偵測是否為數字。如果是，就轉換成 number，便於展示與繪圖
      const numVal = Number(val.replace(/[\$,%]/g, "")); // 稍微過濾貨幣或百分比符號
      if (val !== "" && !isNaN(numVal)) {
        rowObj[header] = numVal;
      } else {
        rowObj[header] = val;
      }
    });
    rows.push(rowObj);
  });

  // 推斷列的屬性 (Numeric vs Categorical)
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  headers.forEach((header) => {
    let numericCount = 0;
    let totalCount = 0;

    rows.forEach((row) => {
      const val = row[header];
      if (val !== undefined && val !== null && val !== "") {
        totalCount++;
        if (typeof val === "number") {
          numericCount++;
        }
      }
    });

    // 如果 80% 以上的值是數值，就列為數值欄位
    if (totalCount > 0 && numericCount / totalCount >= 0.8) {
      numericColumns.push(header);
    } else {
      categoricalColumns.push(header);
    }
  });

  return {
    headers,
    rows,
    numericColumns,
    categoricalColumns,
  };
}
