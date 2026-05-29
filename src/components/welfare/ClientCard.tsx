"use client";

import { useRouter } from "next/navigation";
import { ClientCard as ClientCardType } from "@/types";
import { RISK_CONFIG, cn } from "@/lib/utils";

interface ClientCardProps {
  client: ClientCardType;
  onCall: (id: string, name: string) => void;
  onRecord: (id: string) => void;
  variant?: "full" | "compact";
}

// 복지사 대상자 카드 (W01 대시보드용)
// 정보 우선순위: 위험도 → 이름/나이 → 위험 이유 → 액션
export function ClientCard({ client, onCall, onRecord, variant = "full" }: ClientCardProps) {
  const router = useRouter();
  const risk = RISK_CONFIG[client.riskLevel];

  return (
    <div
      className={cn(
        "rounded-xl border-l-4 bg-white shadow-sm p-4",
        client.riskLevel === "critical" && "border-l-red-500",
        client.riskLevel === "high" && "border-l-amber-500",
        client.riskLevel === "medium" && "border-l-yellow-400",
        client.riskLevel === "safe" && "border-l-green-500"
      )}
    >
      {/* 위험도 배지 + 이름 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{risk.icon}</span>
          <span className={cn("text-[16px] font-bold", risk.text)}>
            {risk.label}
          </span>
        </div>
        {client.contactAttempts > 0 && (
          <span className="text-[13px] text-gray-400">
            오늘 {client.contactAttempts}회 시도
          </span>
        )}
      </div>

      {/* 이름 + 나이 + 지역 */}
      <button
        onClick={() => router.push(`/client/${client.id}`)}
        className="text-left mb-1"
      >
        <p className="text-[20px] font-bold text-gray-900 hover:underline">
          {client.name}{" "}
          <span className="text-[16px] font-normal text-gray-500">
            ({client.age}세 · {client.district})
          </span>
        </p>
      </button>

      {/* 위험 이유 — 최대 2줄 */}
      {client.riskReasons.length > 0 && (
        <ul className="mb-3 space-y-0.5">
          {client.riskReasons.slice(0, 2).map((reason, i) => (
            <li key={i} className="text-[15px] text-gray-500 flex items-center gap-1">
              <span className="text-gray-300">•</span> {reason}
            </li>
          ))}
        </ul>
      )}

      {/* 마지막 응답 */}
      {client.lastResponseAgo && (
        <p className="text-[14px] text-gray-400 mb-3">
          마지막 응답: {client.lastResponseAgo}
        </p>
      )}

      {/* 액션 버튼 — 최소 44px (ux_principles.md) */}
      <div className="flex gap-2">
        <button
          onClick={() => onCall(client.id, client.name)}
          className="flex-1 h-11 bg-blue-600 text-white rounded-lg text-[15px] font-semibold flex items-center justify-center gap-1 active:bg-blue-700"
        >
          📞 전화하기
        </button>
        <button
          onClick={() => onRecord(client.id)}
          className="flex-1 h-11 bg-gray-100 text-gray-700 rounded-lg text-[15px] font-semibold flex items-center justify-center gap-1 active:bg-gray-200"
        >
          📝 기록
        </button>
      </div>
    </div>
  );
}
