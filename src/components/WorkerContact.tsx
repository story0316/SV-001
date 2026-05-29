"use client";

interface WorkerContactProps {
  workerName: string;
  workerPhone: string;
}

// 담당 복지사 연락처 카드
// 보호자 앱 G01 하단에 항상 표시 (신뢰감 제공)
export function WorkerContact({ workerName, workerPhone }: WorkerContactProps) {
  return (
    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
      <p className="text-[16px] text-blue-600 font-medium mb-1">담당 복지사</p>
      <p className="text-[20px] font-bold text-gray-900 mb-3">{workerName}</p>

      {/* 전화 버튼: 최소 56px (ux_principles.md 고령층 터치 영역) */}
      <a
        href={`tel:${workerPhone}`}
        className="flex items-center justify-center gap-2 w-full h-14 bg-blue-600 text-white rounded-xl text-[18px] font-semibold active:bg-blue-700 transition-colors"
      >
        📞 {workerPhone}에 전화하기
      </a>
    </div>
  );
}
