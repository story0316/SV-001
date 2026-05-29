"use client";

import { useEffect, useState, useCallback } from "react";
import { StatusCard } from "@/components/StatusCard";
import { ResponseHistory } from "@/components/ResponseHistory";
import { WorkerContact } from "@/components/WorkerContact";
import { createClient } from "@/lib/supabase/client";
import { ParentStatus, ResponseHistoryItem } from "@/types";
import { useGuardianUser } from "@/lib/auth/GuardianAuthContext";
import { useRouter } from "next/navigation";

export default function GuardianHomePage() {
  const router = useRouter();
  const { clientId, clientName } = useGuardianUser();
  const [status, setStatus] = useState<ParentStatus | null>(null);
  const [history, setHistory] = useState<ResponseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch(`/api/guardian/status?clientId=${clientId}`),
        fetch(`/api/guardian/history?clientId=${clientId}&days=7`),
      ]);

      if (!statusRes.ok) throw new Error("상태 조회 실패");

      const statusData: ParentStatus = await statusRes.json();
      const historyData: { history: ResponseHistoryItem[] } = await historyRes.json();

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
    const supabase = createClient();
    const channel = supabase
      .channel(`guardian-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_responses", filter: `client_id=eq.${clientId}` }, () => fetchData())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "clients", filter: `id=eq.${clientId}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clientId, fetchData]);

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
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
          <button onClick={fetchData} className="mt-4 h-14 px-8 bg-blue-600 text-white rounded-xl text-[18px]">
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-gray-900">
          실버케어 · {clientName} 안부
        </h1>
        <button onClick={handleLogout} className="text-xs text-gray-400">로그아웃</button>
      </header>

      <div className="px-4 py-5 space-y-4 max-w-md mx-auto">
        <StatusCard status={status} />
        {history.length > 0 && <ResponseHistory history={history} />}
        {status.assignedWorker && (
          <WorkerContact workerName={status.assignedWorker.name} workerPhone={status.assignedWorker.phone} />
        )}
        <p className="text-center text-[16px] text-gray-400 pb-6">
          매일 아침 안부를 확인하고 있어요 😊
        </p>
      </div>
    </main>
  );
}
