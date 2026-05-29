"use client";

import { useEffect, useState } from "react";

interface NotifyModalProps {
  clientId: string;
  clientName: string;
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  onClose: () => void;
  onSent: () => void;
}

// 보호자 알림 발송 모달 (W04)
// AI 초안 자동 생성 → 복지사 검토/수정 → 발송
export function NotifyModal({
  clientId,
  clientName,
  guardianName,
  guardianPhone,
  guardianId,
  onClose,
  onSent,
}: NotifyModalProps) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // 초안 자동 생성
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch("/api/notify/guardian", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, guardianId, isDraft: true }),
        });
        const data = await res.json();
        setDraft(data.draft ?? "");
      } finally {
        setLoading(false);
      }
    }
    loadDraft();
  }, [clientId, guardianId]);

  const handleSend = async () => {
    setSending(true);
    try {
      await fetch("/api/notify/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, guardianId, message: draft }),
      });
      onSent();
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900">📤 보호자 알림</h2>
            <p className="text-[16px] text-gray-500">{clientName}님</p>
          </div>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center text-gray-400 rounded-lg">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 수신자 */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-[16px] font-semibold text-gray-900">{guardianName}</p>
              <p className="text-[14px] text-gray-500">{guardianPhone}</p>
            </div>
          </div>

          {/* AI 초안 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[14px] text-blue-600 font-medium">✨ AI 초안 자동 생성</span>
              <span className="text-[13px] text-gray-400">(수정 가능)</span>
            </div>
            {loading ? (
              <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={6}
                className="w-full border border-gray-200 rounded-xl p-3 text-[16px] resize-none focus:outline-none focus:border-blue-400"
              />
            )}
          </div>

          <p className="text-[14px] text-gray-400 text-center">
            ⚠️ 수정하지 않으면 위 내용 그대로 발송됩니다
          </p>
        </div>

        {/* 버튼 */}
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 h-14 border border-gray-200 rounded-xl text-[16px] font-medium text-gray-600">
            취소
          </button>
          <button
            onClick={handleSend}
            disabled={sending || loading || !draft}
            className="flex-1 h-14 bg-blue-600 text-white rounded-xl text-[18px] font-bold active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {sending ? "발송 중..." : "지금 발송하기 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
