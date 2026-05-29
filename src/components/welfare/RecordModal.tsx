"use client";

import { useState } from "react";
import { ContactResult, ContactRecordForm } from "@/types";
import { cn } from "@/lib/utils";

interface RecordModalProps {
  clientId: string;
  clientName: string;
  workerId: string;
  onClose: () => void;
  onSaved: () => void;
}

const CONTACT_RESULTS: { key: ContactResult; label: string; icon: string }[] = [
  { key: "completed", label: "통화완료", icon: "✅" },
  { key: "missed", label: "부재중", icon: "📵" },
  { key: "rejected", label: "수신거부", icon: "❌" },
  { key: "unreachable", label: "연결불가", icon: "📶" },
];

const STATUS_OPTIONS = [
  { key: "normal" as const, label: "정상", icon: "😊" },
  { key: "warning" as const, label: "주의", icon: "⚠️" },
  { key: "danger" as const, label: "위험", icon: "🚨" },
];

const ACTIONS = [
  "안부 확인",
  "건강 상담",
  "방문 약속",
  "기관 연결",
  "보호자 연락",
  "응급 조치",
];

const NEXT_DAYS = [
  { days: 1, label: "내일" },
  { days: 3, label: "3일 후" },
  { days: 7, label: "1주일 후" },
];

// 빠른 기록 입력 모달 (W03)
// 목표: 30초 내 완료 — 최소 필드만
export function RecordModal({ clientId, clientName, workerId, onClose, onSaved }: RecordModalProps) {
  const [result, setResult] = useState<ContactResult | null>(null);
  const [status, setStatus] = useState<"normal" | "warning" | "danger">("normal");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [nextDays, setNextDays] = useState(1);
  const [saving, setSaving] = useState(false);

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);

    const form: ContactRecordForm & { workerId: string } = {
      clientId,
      workerId,
      result,
      status,
      actions: selectedActions,
      note: note || undefined,
      nextContactDays: nextDays,
    };

    try {
      const res = await fetch("/api/welfare/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    // 모달 오버레이
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900">📝 기록 저장</h2>
            <p className="text-[16px] text-gray-500">{clientName}님</p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* STEP 1: 통화 결과 */}
          <section>
            <h3 className="text-[16px] font-semibold text-gray-700 mb-3">
              1. 통화 결과
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CONTACT_RESULTS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setResult(r.key)}
                  className={cn(
                    "h-12 rounded-xl border-2 text-[16px] font-medium transition-colors flex items-center justify-center gap-2",
                    result === r.key
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600"
                  )}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </section>

          {/* STEP 2: 현재 상태 (통화 완료 시만) */}
          {result === "completed" && (
            <section>
              <h3 className="text-[16px] font-semibold text-gray-700 mb-3">
                2. 현재 상태
              </h3>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatus(s.key)}
                    className={cn(
                      "flex-1 h-12 rounded-xl border-2 text-[16px] font-medium transition-colors",
                      status === s.key
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600"
                    )}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* STEP 3: 취한 조치 */}
          {result === "completed" && (
            <section>
              <h3 className="text-[16px] font-semibold text-gray-700 mb-3">
                3. 취한 조치 <span className="font-normal text-gray-400">(복수 선택)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => toggleAction(action)}
                    className={cn(
                      "px-3 h-9 rounded-full border text-[14px] transition-colors",
                      selectedActions.includes(action)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600"
                    )}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 메모 (선택) */}
          <section>
            <h3 className="text-[16px] font-semibold text-gray-700 mb-2">
              메모 <span className="font-normal text-gray-400">(선택)</span>
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="특이 사항을 입력하세요..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl p-3 text-[16px] resize-none focus:outline-none focus:border-blue-400"
            />
          </section>

          {/* 다음 연락 예정 */}
          <section>
            <h3 className="text-[16px] font-semibold text-gray-700 mb-3">
              다음 연락
            </h3>
            <div className="flex gap-2">
              {NEXT_DAYS.map((d) => (
                <button
                  key={d.days}
                  onClick={() => setNextDays(d.days)}
                  className={cn(
                    "flex-1 h-11 rounded-xl border-2 text-[15px] font-medium transition-colors",
                    nextDays === d.days
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 저장 버튼 — 최대 터치 영역 */}
        <div className="p-5 pt-0">
          <button
            onClick={handleSave}
            disabled={!result || saving}
            className={cn(
              "w-full h-14 rounded-xl text-[18px] font-bold transition-colors",
              result && !saving
                ? "bg-blue-600 text-white active:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {saving ? "저장 중..." : "✅ 저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
