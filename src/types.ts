/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParsedData {
  headers: string[];
  rows: Record<string, string | number>[];
  numericColumns: string[];
  categoricalColumns: string[];
}

export interface SampleCSV {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  chartType: "bar" | "line" | "area" | "scatter";
}
