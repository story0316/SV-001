"use client";

import { useEffect, useState, useCallback } from "react";
import { StatusCard } from "@/components/StatusCard";
import { ResponseHistory } from "@/components/ResponseHistory";
import { WorkerContact } from "@/components/WorkerContact";
import { supabase } from "@/lib/supabase/client";
import { ParentStatus, ResponseHistoryItem } from "@/types";

// Mock: 실제 운영 시 Supabase Auth로 보호자 인증 후 clientId 획득
// Phase 1에서는 URL 쿼리 파라미터로 대체
function useClientId() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("clientId");
}

export default function GuardianHomePage() {
  const clientId = useClientId();
  const [status, setStatus] = useState<ParentStatus | null>(null);
  const [history, setHistory] = useState<ResponseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clientId) return;

    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch(`/api/guardian/status?clientId=${clientId}`),
        fetch(`/api/guardian/history?clientId=${clientId}&days=7`),
      ]);

      if (!statusRes.ok) throw new Error("상태 조회 실패");

      const statusData: ParentStatus = await statusRes.json();
      const historyData: { history: ResponseHistoryItem[] } =
        await historyRes.json();

      setStatus(statusData);
      setHistory(historyData.history);
    } catch {
      setError("잠시 후 다시 시도해주세요");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Supabase Realtime: 응답 실시간 반영
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`guardian-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_responses",
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          fetchData(); // 응답 수신 시 즉시 새로고침
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clients",
          filter: `id=eq.${clientId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, fetchData]);

  // clientId 없음 → 안내 화면
  if (!clientId) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[20px] text-gray-600">
            URL에 clientId가 필요합니다
          </p>
          <p className="text-[16px] text-gray-400 mt-2">
            예: /?clientId=your-client-uuid
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">😊</div>
          <p className="text-[20px] text-gray-500">확인하는 중이에요...</p>
        </div>
      </main>
    );
  }

  if (error || !status) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[20px] text-red-500">⚠️ {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 h-14 px-8 bg-blue-600 text-white rounded-xl text-[18px]"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-[20px] font-bold text-gray-900">
          실버케어 · 안부 확인
        </h1>
      </header>

      {/* 콘텐츠 — 모바일 최적화: 세로 스택, 패딩 16px */}
      <div className="px-4 py-5 space-y-4 max-w-md mx-auto">
        {/* 1. 오늘 상태 카드 (가장 중요) */}
        <StatusCard status={status} />

        {/* 2. 7일 응답 패턴 */}
        {history.length > 0 && <ResponseHistory history={history} />}

        {/* 3. 담당 복지사 연락처 */}
        {status.assignedWorker && (
          <WorkerContact
            workerName={status.assignedWorker.name}
            workerPhone={status.assignedWorker.phone}
          />
        )}

        {/* 하단 안내: 불안감 완화 */}
        <p className="text-center text-[16px] text-gray-400 pb-6">
          매일 아침 안부를 확인하고 있어요 😊
        </p>
      </div>
    </main>
  );
}
