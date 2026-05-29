"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DailyReport } from "@/types";
import { today } from "@/lib/utils";

const WORKER_ID = "a0000000-0000-0000-0000-000000000001"; // TODO: real auth

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/welfare/report?workerId=${WORKER_ID}&date=${date}`)
      .then((r) => r.json())
      .then((data) => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 -ml-1"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-gray-900 flex-1">📊 일일 보고서</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-sm">보고서 생성 중...</p>
        </div>
      ) : !report ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-sm">보고서를 불러올 수 없습니다</p>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Title */}
          <div className="bg-blue-600 rounded-xl p-4 text-white">
            <p className="text-xs opacity-80 mb-1">{report.date}</p>
            <h2 className="text-lg font-bold">{report.workerName} 복지사</h2>
            <p className="text-xs opacity-70 mt-1">일일 활동 보고서</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="총 담당 대상자"
              value={`${report.stats.totalClients}명`}
              sub={`응답률 ${report.stats.responseRate}`}
              color="blue"
            />
            <StatCard
              label="오늘 응답"
              value={`${report.stats.responded}명`}
              sub={`미응답 ${report.stats.totalClients - report.stats.responded}명`}
              color={report.stats.responded < report.stats.totalClients * 0.7 ? "red" : "green"}
            />
            <StatCard
              label="위험 탐지"
              value={`${report.stats.riskDetected}건`}
              sub="오늘 신규"
              color={report.stats.riskDetected > 0 ? "amber" : "green"}
            />
            <StatCard
              label="전화/방문"
              value={`${report.stats.callsMade} / ${report.stats.visitsCompleted}`}
              sub="통화 / 방문 완료"
              color="blue"
            />
            <StatCard
              label="보호자 알림"
              value={`${report.stats.guardianNotified}건`}
              sub="오늘 발송"
              color="amber"
            />
          </div>

          {/* Issues */}
          {report.issues.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">⚠️ 특이 사항</h3>
              <ul className="space-y-3">
                {report.issues.map((issue, i) => (
                  <li key={i} className="border-l-2 border-amber-400 pl-3">
                    <p className="text-sm font-medium text-gray-900">{issue.clientName}</p>
                    <p className="text-xs text-gray-600">{issue.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">조치: {issue.actionTaken}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Day Handoff */}
          {report.nextDayHandoff.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">📋 내일 인계 사항</h3>
              <ul className="space-y-1.5">
                {report.nextDayHandoff.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-gray-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            생성: {new Date(report.generatedAt).toLocaleString("ko-KR")}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, sub, color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "red" | "amber";
}) {
  const colorMap = {
    blue:  "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red:   "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl p-3 ${colorMap[color]}`}>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-60">{sub}</p>
    </div>
  );
}
