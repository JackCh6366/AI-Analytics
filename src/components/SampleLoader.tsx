/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SampleCSV } from "../types";
import { ShoppingBag, Globe, HeartHandshake } from "lucide-react";

interface SampleLoaderProps {
  onSelectSample: (content: string) => void;
  currentValue: string;
}

const SAMPLE_TEMPLATES: SampleCSV[] = [
  {
    id: "ecommerce",
    name: "電商商品銷售表現",
    description: "分析各別商品類目的銷量、訂單總額及季度的退貨率表現。",
    icon: "ShoppingBag",
    content: `商品類目,季度銷售額(台幣),銷量(件),客單價(元),退貨率(%),廣告支出(元)
智慧3C家電,1200000,1500,800,2.1,120000
潮流服飾配件,850000,2800,303,5.4,85000
美妝護膚保養,640000,1600,400,1.2,50000
居家生活家居,430000,1100,390,3.2,30000
運動健身器材,720000,900,800,4.8,60000
生鮮食品熟食,310000,2000,155,0.8,15000`,
  },
  {
    id: "marketing",
    name: "行銷廣告投放轉化",
    description: "評估各個社群與搜尋管道的點擊、註冊率、ROI 及獲客成本。",
    icon: "Globe",
    content: `推廣管道,展示曝光次數,點擊次數,網頁註冊量,廣告花費(元),成交訂單數,投資回報率(ROI)
Google搜尋廣告,450000,18000,920,50000,450,2.8
Facebook粉專推廣,680000,32000,1400,80000,610,2.4
Instagram網紅開箱,380000,22000,1100,60000,520,3.5
LINE官方帳號推送,150000,12000,850,20000,380,4.2
Email電子報行銷,80000,4000,180,3000,95,6.5
YouTube影音置入,520000,15000,650,70000,290,1.9`,
  },
  {
    id: "cs",
    name: "客戶滿意度與服務指標",
    description: "監控各部門、各班別的客服案件處理時效與滿意星等指標。",
    icon: "HeartHandshake",
    content: `客服管道,處理案件數(件),平均處理時長(分),滿意度評分(5星),解答率(%),回頭客諮詢比
線上常規LiveChat,1580,4.2,4.6,94.5,12.4
官方語音專線,840,12.5,4.1,88.2,18.6
電子郵件Ticket,430,45.0,4.3,91.0,8.3
AI聊天機器人,3200,0.5,3.8,72.1,3.5
FB/IG私訊客服,950,8.4,4.4,92.0,14.2`,
  },
];

export default function SampleLoader({ onSelectSample, currentValue }: SampleLoaderProps) {
  // 將 Icon 字串映射至組件
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "ShoppingBag":
        return <ShoppingBag className="w-4 h-4 text-sky-600" />;
      case "Globe":
        return <Globe className="w-4 h-4 text-emerald-600" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <div id="sample-data-section" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          快速體驗 - 📊 選擇分析資料範本
        </h4>
        {currentValue && (
          <button
            onClick={() => onSelectSample("")}
            id="clear-data-btn"
            className="text-xs text-rose-600 hover:text-rose-700 font-medium transition cursor-pointer"
          >
            清除當前貼上的數據
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onSelectSample(tmpl.content)}
            id={`sample-btn-${tmpl.id}`}
            className="flex flex-col items-start text-left p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-98 transition duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 px-1.5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                {renderIcon(tmpl.icon)}
              </span>
              <span className="font-semibold text-sm text-slate-800">{tmpl.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">{tmpl.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
