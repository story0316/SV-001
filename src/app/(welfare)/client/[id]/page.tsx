"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientDetail } from "@/types";
import { RISK_CONFIG } from "@/lib/utils";
import { RiskScoreBar } from "@/components/welfare/detail/RiskScoreBar";
import { ResponseHistory14 } from "@/components/welfare/detail/ResponseHistory14";
import { ContactLogList } from "@/components/welfare/detail/ContactLogList";
import { RecordModal } from "@/components/welfare/RecordModal";
import { NotifyModal } from "@/components/welfare/NotifyModal";
import { useWelfareUser } from "@/lib/auth/WelfareAuthContext";

interface AnomalyData {
  anomaly: { score: number; factors: string[]; timeShift: { detected: boolean; shiftHours: number } };
  responseRate: string;
  avgResponseTime?: string;
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { id: WORKER_ID } = useWelfareUser();
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecord, setShowRecord] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    const [detailRes, anomalyRes] = await Promise.all([
      fetch(`/api/welfare/client?id=${id}`),
      fetch(`/api/welfare/anomaly?clientId=${id}`),
    ]);
    if (detailRes.ok) setDetail(await detailRes.json());
    if (anomalyRes.ok) setAnomaly(await anomalyRes.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await fetch("/api/welfare/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, workerId: WORKER_ID, note: noteText }),
    });
    setNoteText("");
    setSavingNote(false);
    load();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">대상자를 찾을 수 없습니다</p>
      </div>
    );
  }

  const cfg = RISK_CONFIG[detail.riskLevel];

  return (
    <>
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
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {cfg.icon} {detail.name}
              </h1>
              <p className="text-xs text-gray-500">{detail.age}세</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Risk Score */}
          <RiskScoreBar
            score={detail.riskScore}
            level={detail.riskLevel}
            factors={detail.riskFactors}
          />

          {/* AI 이상징후 분석 (Phase 4) */}
          {anomaly && (anomaly.anomaly.score > 0 || anomaly.anomaly.factors.length > 0) && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-purple-800">🤖 AI 이상징후 분석</h3>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  +{anomaly.anomaly.score}점 기여
                </span>
              </div>
              {anomaly.anomaly.factors.length > 0 ? (
                <ul className="space-y-0.5">
                  {anomaly.anomaly.factors.map((f, i) => (
                    <li key={i} className="text-xs text-purple-700 flex items-center gap-1.5">
                      <span>•</span>{f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-purple-600">이상징후 없음</p>
              )}
              <div className="flex gap-4 mt-2 pt-2 border-t border-purple-100 text-xs text-purple-600">
                {anomaly.responseRate && <span>응답률 {anomaly.responseRate}</span>}
                {anomaly.avgResponseTime && <span>평균 응답시각 {anomaly.avgResponseTime}</span>}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-3">기본 정보</h3>
            <dl className="space-y-2">
              {detail.phone && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">전화번호</dt>
                  <dd className="text-sm font-medium text-gray-900">{detail.phone}</dd>
                </div>
              )}
              {detail.address && (
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-gray-500 shrink-0">주소</dt>
                  <dd className="text-sm text-gray-900 text-right">{detail.address}</dd>
                </div>
              )}
              {detail.assignedWorker && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">담당 복지사</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {detail.assignedWorker.name}
                  </dd>
                </div>
              )}
              {detail.guardian && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">보호자</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {detail.guardian.name} ({detail.guardian.relationship})
                  </dd>
                </div>
              )}
              {detail.nextContactScheduled && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">다음 연락 예정</dt>
                  <dd className="text-sm font-medium text-blue-600">{detail.nextContactScheduled}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Response History 14 days */}
          <ResponseHistory14 history={detail.responseHistory} />

          {/* Notes */}
          {detail.notes.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">최근 메모</h3>
              <ul className="space-y-2">
                {detail.notes.map((n) => (
                  <li key={n.id} className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800">{n.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{n.workerName} · {n.createdAt}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add Note */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-3">메모 추가</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="메모를 입력하세요..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={addNote}
              disabled={!noteText.trim() || savingNote}
              className="mt-2 w-full h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-40"
            >
              {savingNote ? "저장 중..." : "메모 저장"}
            </button>
          </div>

          {/* Contact Log */}
          <ContactLogList logs={detail.contactLog} />
        </div>

        {/* Bottom Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            <button
              onClick={() => setShowNotify(true)}
              className="flex-1 h-12 rounded-xl border-2 border-amber-400 text-amber-700 font-semibold text-sm"
            >
              📣 보호자 알림
            </button>
            <button
              onClick={() => setShowRecord(true)}
              className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-semibold text-sm"
            >
              📋 연락 기록
            </button>
          </div>
        </div>
      </div>

      {showRecord && (
        <RecordModal
          clientId={detail.id}
          clientName={detail.name}
          workerId={WORKER_ID}
          onClose={() => setShowRecord(false)}
          onSaved={() => { setShowRecord(false); load(); }}
        />
      )}

      {showNotify && detail.guardian && (
        <NotifyModal
          clientId={detail.id}
          clientName={detail.name}
          guardianId={detail.guardian.phone}
          guardianName={detail.guardian.name}
          guardianPhone={detail.guardian.phone}
          onClose={() => setShowNotify(false)}
          onSent={() => setShowNotify(false)}
        />
      )}
    </>
  );
}
