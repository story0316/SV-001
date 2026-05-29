"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClientCard } from "@/components/welfare/ClientCard";
import { RecordModal } from "@/components/welfare/RecordModal";
import { NotifyModal } from "@/components/welfare/NotifyModal";
import { TodayDashboard } from "@/types";
import { useWelfareUser } from "@/lib/auth/WelfareAuthContext";
import { createClient } from "@/lib/supabase/client";

export default function WelfareDashboardPage() {
  const router = useRouter();
  const { id: WORKER_ID, name: WORKER_NAME } = useWelfareUser();
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  // 기록 모달
  const [recordTarget, setRecordTarget] = useState<{ id: string; name: string } | null>(null);
  // 알림 모달 (Phase 2에서 보호자 정보 연동 예정)
  const [notifyTarget, setNotifyTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchDashboard = useCallback(async () => {
    const res = await fetch(`/api/welfare/dashboard?workerId=${WORKER_ID}`);
    if (res.ok) setDashboard(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCall = (clientId: string, name: string) => {
    // tel: 링크로 기기 전화 앱 호출
    // 통화 후 자동으로 기록 모달 팝업 유도
    window.location.href = `tel:010-0000-0000`; // 실제 운영 시 clients.phone 사용
    // 2초 후 기록 모달 오픈 (통화 연결 타이밍)
    setTimeout(() => setRecordTarget({ id: clientId, name }), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-[20px] text-gray-400">대시보드 불러오는 중...</p>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-[20px] text-red-500">데이터를 불러오지 못했어요</p>
      </main>
    );
  }

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    month: "long", day: "numeric", weekday: "short",
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[16px] text-gray-500">{todayLabel}</p>
            <h1 className="text-[22px] font-bold text-gray-900">
              👋 {WORKER_NAME}님
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            로그아웃
          </button>
          {/* 즉시 조치 배지 */}
          <div className="flex gap-2">
            {dashboard.critical.length > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[15px] font-bold">
                🔴 {dashboard.critical.length}
              </span>
            )}
            {dashboard.high.length > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[15px] font-bold">
                🟠 {dashboard.high.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto pb-24">
        {/* 🔴 즉시 조치 섹션 */}
        {dashboard.critical.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-red-600 mb-3 flex items-center gap-2">
              🔴 즉시 조치 필요
              <span className="text-[14px] font-normal text-gray-400">
                ({dashboard.critical.length}명)
              </span>
            </h2>
            <div className="space-y-3">
              {dashboard.critical.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onCall={handleCall}
                  onRecord={(id) => setRecordTarget({ id, name: client.name })}
                />
              ))}
            </div>
          </section>
        )}

        {/* 🟠 오늘 연락 필요 섹션 */}
        {dashboard.high.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-amber-600 mb-3 flex items-center gap-2">
              🟠 오늘 연락 필요
              <span className="text-[14px] font-normal text-gray-400">
                ({dashboard.high.length}명)
              </span>
            </h2>
            <div className="space-y-3">
              {dashboard.high.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onCall={handleCall}
                  onRecord={(id) => setRecordTarget({ id, name: client.name })}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}

        {/* 미완료 태스크 */}
        {dashboard.pendingTasks.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-gray-600 mb-3">
              ⬜ 어제 미완료 ({dashboard.pendingTasks.length}건)
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 divide-y">
              {dashboard.pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between px-4 py-3">
                  <p className="text-[16px] text-gray-700">{task.description}</p>
                  <button
                    onClick={() => setRecordTarget({ id: task.clientId, name: task.clientName })}
                    className="text-[14px] text-blue-600 font-medium"
                  >
                    기록 →
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 오늘 진행 현황 */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex justify-between text-[16px]">
            <span className="text-gray-500">오늘 완료</span>
            <span className="font-bold text-gray-900">
              {dashboard.completedToday}/{dashboard.totalAssigned}명
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{
                width: `${Math.round((dashboard.completedToday / (dashboard.totalAssigned || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 모두 정상 상태 */}
        {dashboard.critical.length === 0 && dashboard.high.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">😊</p>
            <p className="text-[20px] font-bold text-gray-700">오늘은 긴급 대상자가 없어요</p>
            <p className="text-[16px] text-gray-400 mt-1">좋은 하루 보내세요!</p>
          </div>
        )}
      </div>

      {/* 기록 모달 */}
      {recordTarget && (
        <RecordModal
          clientId={recordTarget.id}
          clientName={recordTarget.name}
          workerId={WORKER_ID}
          onClose={() => setRecordTarget(null)}
          onSaved={fetchDashboard}
        />
      )}

      {/* 보호자 알림 모달 */}
      {notifyTarget && (
        <NotifyModal
          clientId={notifyTarget.id}
          clientName={notifyTarget.name}
          guardianId="c0000000-0000-0000-0000-000000000001"
          guardianName="박성민"
          guardianPhone="010-1111-2222"
          onClose={() => setNotifyTarget(null)}
          onSent={fetchDashboard}
        />
      )}

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        <button className="flex-1 py-3 flex flex-col items-center gap-1 text-blue-600">
          <span className="text-xl">🏠</span>
          <span className="text-[12px] font-medium">홈</span>
        </button>
        <button
          onClick={() => router.push("/risk-center")}
          className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <span className="text-xl">🔍</span>
          <span className="text-[12px]">위험 탐지</span>
        </button>
        <button
          onClick={() => router.push("/report")}
          className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
        >
          <span className="text-xl">📊</span>
          <span className="text-[12px]">리포트</span>
        </button>
      </nav>
    </main>
  );
}
