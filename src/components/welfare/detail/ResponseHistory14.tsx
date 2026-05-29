"use client";
import { ResponseHistoryItem } from "@/types";

interface Props {
  history: ResponseHistoryItem[];
}

export function ResponseHistory14({ history }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <h3 className="text-base font-semibold text-gray-900 mb-3">14일 응답 현황</h3>
      <div className="grid grid-cols-7 gap-1">
        {history.map((item) => (
          <div key={item.date} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500">{item.dayLabel}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${item.isToday
                  ? "ring-2 ring-blue-400 ring-offset-1"
                  : ""}
                ${item.responded
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"}
              `}
              title={item.responseTime ? `${item.responseTime} 응답` : "미응답"}
            >
              {item.responded ? "✓" : "✗"}
            </div>
            {item.responseTime && (
              <span className="text-[10px] text-gray-400 leading-none">{item.responseTime}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-100" />
          <span className="text-xs text-gray-500">응답</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-100" />
          <span className="text-xs text-gray-500">미응답</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full ring-2 ring-blue-400" />
          <span className="text-xs text-gray-500">오늘</span>
        </div>
      </div>
    </div>
  );
}
