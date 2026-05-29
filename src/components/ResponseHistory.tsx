"use client";

import { ResponseHistoryItem } from "@/types";
import { cn } from "@/lib/utils";

interface ResponseHistoryProps {
  history: ResponseHistoryItem[];
}

export function ResponseHistory({ history }: ResponseHistoryProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-[18px] font-semibold text-gray-700 mb-4">
        최근 {history.length}일 응답 현황
      </h2>

      <div className="flex justify-between items-end gap-1">
        {history.map((item) => (
          <div key={item.date} className="flex flex-col items-center gap-2">
            {/* 응답 상태 도트 — 색상+아이콘+텍스트 3중 표현 (ux_principles.md) */}
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-lg",
                item.responded
                  ? "bg-green-100"
                  : item.isToday
                    ? "bg-gray-100 border-2 border-dashed border-gray-300"
                    : "bg-red-50"
              )}
              title={
                item.responded
                  ? `응답 ${item.responseTime ?? ""}`
                  : item.isToday
                    ? "오늘 (미응답)"
                    : "무응답"
              }
            >
              {item.responded ? "✅" : item.isToday ? "⏳" : "❌"}
            </div>

            {/* 요일 레이블 */}
            <span
              className={cn(
                "text-[14px]",
                item.isToday ? "font-bold text-gray-900" : "text-gray-400"
              )}
            >
              {item.dayLabel}
            </span>
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
        <span className="text-[14px] text-gray-500 flex items-center gap-1">
          ✅ 응답
        </span>
        <span className="text-[14px] text-gray-500 flex items-center gap-1">
          ❌ 무응답
        </span>
        <span className="text-[14px] text-gray-500 flex items-center gap-1">
          ⏳ 오늘
        </span>
      </div>
    </div>
  );
}
