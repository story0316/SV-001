"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ORG_ID = "org0000-0000-0000-0000-000000000001"; // TODO: real auth

interface DailyTrendItem { date: string; responseRate: number; totalSent: number; totalResponded: number }
interface WorkerStat { workerId: string; workerName: string; assignedClients: number; contactsMade: number; responseRate: number }
interface MonthlyReport {
  year: number; month: number; period: string; generatedAt: string;
  summary: {
    totalClients: number; totalWorkers: number; overallResponseRate: string;
    totalContacts: number; callsMade: number; visitsCompleted: number; unreachable: number;
    guardianNotifications: number; riskEventsDetected: number; criticalEvents: number;
    highEvents: number; resolutionRate: string;
  };
  riskDistribution: { critical: number; high: number; medium: number; safe: number };
  dailyTrend: DailyTrendItem[];
  workerStats: WorkerStat[];
}

export default function MonthlyReportPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/welfare/report/monthly?orgId=${ORG_ID}&year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((d) => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, month]);

  async function handleExport() {
    setExporting(true);
    const url = `/api/welfare/report/export?orgId=${ORG_ID}&year=${year}&month=${month}&format=csv`;
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `welfare_report_${year}${String(month).padStart(2, "0")}.csv`;
      a.click();
    }
    setExporting(false);
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 -ml-1"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-gray-900 flex-1">📋 월간 B2G 보고서</h1>
          <button
            onClick={handleExport}
            disabled={exporting || !report}
            className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold disabled:opacity-40"
          >
            {exporting ? "내보내는 중..." : "⬇ CSV"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Period Selector */}
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="flex-1 h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:outline-none"
          >
            {[now.getFullYear() - 1, now.getFullYear()].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex-1 h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">보고서 생성 중...</p>
          </div>
        ) : !report ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-sm">데이터를 불러올 수 없습니다</p>
          </div>
        ) : (
          <>
            {/* Report Title Card */}
            <div className="bg-blue-700 text-white rounded-xl p-4">
              <p className="text-xs opacity-70 mb-1">복지 서비스 월간 현황 보고서</p>
              <p className="text-lg font-bold">{year}년 {month}월</p>
              <p className="text-xs opacity-60 mt-1">{report.period}</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="총 대상자" value={`${report.summary.totalClients}명`} sub={`복지사 ${report.summary.totalWorkers}명`} color="blue" />
              <KpiCard label="전체 응답률" value={report.summary.overallResponseRate} sub="월간 평균" color={parseInt(report.summary.overallResponseRate) >= 70 ? "green" : "red"} />
              <KpiCard label="연락 건수" value={`${report.summary.totalContacts}건`} sub={`전화 ${report.summary.callsMade} / 방문 ${report.summary.visitsCompleted}`} color="blue" />
              <KpiCard label="보호자 알림" value={`${report.summary.guardianNotifications}건`} sub="자동 발송" color="amber" />
              <KpiCard label="위험 이벤트" value={`${report.summary.riskEventsDetected}건`} sub={`긴급 ${report.summary.criticalEvents} / 주의 ${report.summary.highEvents}`} color={report.summary.criticalEvents > 0 ? "red" : "amber"} />
              <KpiCard label="조치 완료율" value={report.summary.resolutionRate} sub="위험 이벤트 처리" color={parseInt(report.summary.resolutionRate) >= 80 ? "green" : "amber"} />
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">위험도 분포</h3>
              <div className="space-y-2">
                {(["critical", "high", "medium", "safe"] as const).map((level) => {
                  const labels = { critical: "🔴 즉시조치", high: "🟠 오늘연락", medium: "🟡 이번주확인", safe: "🟢 정상" };
                  const colors = { critical: "bg-red-400", high: "bg-amber-400", medium: "bg-yellow-300", safe: "bg-green-400" };
                  const count = report.riskDistribution[level];
                  const pct = report.summary.totalClients > 0 ? Math.round((count / report.summary.totalClients) * 100) : 0;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-gray-600 shrink-0">{labels[level]}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[level]}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-12 text-xs text-gray-500 text-right shrink-0">{count}명 ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Response Rate Trend */}
            {report.dailyTrend.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">일별 응답률 추이</h3>
                <div className="flex items-end gap-px h-24 overflow-x-auto">
                  {report.dailyTrend.map((d) => {
                    const day = parseInt(d.date.split("-")[2]);
                    const barColor = d.responseRate >= 80 ? "bg-green-400" : d.responseRate >= 60 ? "bg-yellow-400" : "bg-red-400";
                    return (
                      <div key={d.date} className="flex flex-col items-center gap-0.5 min-w-[8px] flex-1" title={`${day}일: ${d.responseRate}%`}>
                        <div
                          className={`w-full rounded-t ${barColor} transition-all`}
                          style={{ height: `${Math.max(2, d.responseRate)}%` }}
                        />
                        {day % 5 === 0 && (
                          <span className="text-[8px] text-gray-400">{day}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-3 mt-2">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-green-400" /><span className="text-[10px] text-gray-400">80%+</span></div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-yellow-400" /><span className="text-[10px] text-gray-400">60-79%</span></div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-400" /><span className="text-[10px] text-gray-400">~59%</span></div>
                </div>
              </div>
            )}

            {/* Worker Performance */}
            {report.workerStats.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-900 px-4 pt-4 pb-3">복지사별 실적</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-t border-gray-50 bg-gray-50">
                      <th className="px-4 py-2 text-left text-gray-500 font-medium">복지사</th>
                      <th className="px-4 py-2 text-right text-gray-500 font-medium">대상자</th>
                      <th className="px-4 py-2 text-right text-gray-500 font-medium">연락</th>
                      <th className="px-4 py-2 text-right text-gray-500 font-medium">응답률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {report.workerStats.map((w) => (
                      <tr key={w.workerId}>
                        <td className="px-4 py-3 font-medium text-gray-900">{w.workerName}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{w.assignedClients}명</td>
                        <td className="px-4 py-3 text-right text-gray-600">{w.contactsMade}건</td>
                        <td className={`px-4 py-3 text-right font-semibold ${w.responseRate >= 70 ? "text-green-700" : w.responseRate >= 50 ? "text-yellow-700" : "text-red-700"}`}>
                          {w.responseRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <p className="text-center text-xs text-gray-400">
              생성: {new Date(report.generatedAt).toLocaleString("ko-KR")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: "blue" | "green" | "red" | "amber" }) {
  const cls = { blue: "bg-blue-50 text-blue-700", green: "bg-green-50 text-green-700", red: "bg-red-50 text-red-700", amber: "bg-amber-50 text-amber-700" };
  return (
    <div className={`rounded-xl p-3 ${cls[color]}`}>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-60">{sub}</p>
    </div>
  );
}
