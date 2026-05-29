"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RiskEvent } from "@/types";
import { RISK_CONFIG } from "@/lib/utils";

const WORKER_ID = "a0000000-0000-0000-0000-000000000001"; // TODO: real auth

export default function RiskCenterPage() {
  const router = useRouter();
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unaddressed">("unaddressed");

  const load = useCallback(async () => {
    const res = await fetch(`/api/welfare/risk-center?workerId=${WORKER_ID}`);
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markAddressed(eventId: string) {
    await fetch("/api/welfare/risk-center", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, isAddressed: true } : e));
  }

  const filtered = events.filter((e) => filter === "all" || !e.isAddressed);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 -ml-1"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-gray-900 flex-1">🔍 위험 탐지 센터</h1>
          <span className="text-xs text-gray-400">{events.filter((e) => !e.isAddressed).length}건 미처리</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["unaddressed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors
                ${filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200"}
              `}
            >
              {f === "unaddressed" ? "미처리" : "전체"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-12">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-gray-500 text-sm">
              {filter === "unaddressed" ? "모든 위험 이벤트가 처리되었습니다" : "위험 이벤트가 없습니다"}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((event) => {
              const cfg = RISK_CONFIG[event.riskLevel];
              return (
                <li
                  key={event.id}
                  className={`bg-white rounded-xl p-4 border ${event.isAddressed ? "border-gray-100 opacity-60" : cfg.border}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cfg.icon}</span>
                      <div>
                        <button
                          onClick={() => router.push(`/client/${event.clientId}`)}
                          className="text-sm font-bold text-gray-900 hover:underline"
                        >
                          {event.clientName}
                        </button>
                        <p className="text-xs text-gray-500">{event.clientAge}세</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {event.riskScore}점
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(event.detectedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {event.riskFactors.length > 0 && (
                    <ul className="mb-3 space-y-0.5">
                      {event.riskFactors.map((f, i) => (
                        <li key={i} className={`text-xs ${cfg.text} flex items-center gap-1`}>
                          <span>•</span> {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {!event.isAddressed && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => router.push(`/client/${event.clientId}`)}
                        className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                      >
                        상세 보기 / 연락
                      </button>
                      <button
                        onClick={() => markAddressed(event.id)}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600"
                      >
                        처리 완료
                      </button>
                    </div>
                  )}

                  {event.isAddressed && (
                    <p className="text-xs text-green-600 font-medium">✓ 처리 완료</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
