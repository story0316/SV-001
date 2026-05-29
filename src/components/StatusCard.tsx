"use client";

import { ParentStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  status: ParentStatus;
}

export function StatusCard({ status }: StatusCardProps) {
  const isNormal = status.status === "normal";
  const isDanger = status.status === "danger";

  return (
    <div
      className={cn(
        "rounded-2xl p-6 border-2 transition-colors",
        isDanger
          ? "bg-red-50 border-red-200"
          : isNormal
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
      )}
    >
      {/* 이름 + 나이 */}
      <p className="text-gray-500 text-[18px] mb-1">어머니</p>
      <h1 className="text-[28px] font-bold text-gray-900 mb-4">
        {status.name}님 ({status.age}세)
      </h1>

      {/* 오늘 상태 — 가장 크고 중요한 정보 */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">
          {isDanger ? "⚠️" : isNormal ? "✅" : "😐"}
        </span>
        <div>
          <p
            className={cn(
              "text-[24px] font-bold",
              isDanger
                ? "text-red-600"
                : isNormal
                  ? "text-green-600"
                  : "text-amber-600"
            )}
          >
            {isDanger
              ? "확인이 필요해요"
              : isNormal
                ? "오늘 안전해요"
                : "조금 걱정돼요"}
          </p>
          {status.lastResponseAgo && (
            <p className="text-gray-500 text-[18px]">
              {status.todayResponded
                ? `오늘 ${status.lastResponseAgo} 응답하셨어요`
                : `마지막 응답: ${status.lastResponseAgo}`}
            </p>
          )}
        </div>
      </div>

      {/* 위험 시 추가 안내 */}
      {isDanger && (
        <div className="mt-4 p-3 bg-white rounded-xl border border-red-100">
          <p className="text-[18px] text-gray-600">
            담당 복지사도 함께 확인하고 있어요. 걱정되시면 아래에서 연락해
            보세요.
          </p>
        </div>
      )}
    </div>
  );
}
