"use client";
import { ContactLogItem } from "@/types";

const RESULT_LABEL: Record<string, { label: string; color: string }> = {
  completed:   { label: "통화 완료", color: "text-green-700 bg-green-50" },
  missed:      { label: "부재중",    color: "text-yellow-700 bg-yellow-50" },
  rejected:    { label: "거절",      color: "text-red-700 bg-red-50" },
  unreachable: { label: "연결 불가", color: "text-gray-600 bg-gray-100" },
  note:        { label: "메모",      color: "text-blue-700 bg-blue-50" },
};

const TYPE_LABEL: Record<string, string> = {
  call:  "전화",
  visit: "방문",
  note:  "메모",
  other: "기타",
};

interface Props {
  logs: ContactLogItem[];
}

export function ContactLogList({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 mb-3">연락 기록</h3>
        <p className="text-sm text-gray-400 text-center py-4">연락 기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <h3 className="text-base font-semibold text-gray-900 px-4 pt-4 pb-3">연락 기록</h3>
      <ul className="divide-y divide-gray-50">
        {logs.map((log) => {
          const resultKey = log.result ?? log.type;
          const rs = RESULT_LABEL[resultKey] ?? { label: resultKey, color: "text-gray-600 bg-gray-100" };
          return (
            <li key={log.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rs.color}`}>
                    {rs.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {TYPE_LABEL[log.type] ?? log.type}
                  </span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{log.date}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{log.workerName} 담당</p>
              {log.status && (
                <p className="text-xs text-gray-700">상태: {log.status}</p>
              )}
              {log.actions && log.actions.length > 0 && (
                <p className="text-xs text-gray-600 mt-0.5">조치: {log.actions.join(", ")}</p>
              )}
              {log.note && (
                <p className="text-sm text-gray-800 mt-1.5 bg-gray-50 rounded p-2">{log.note}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
