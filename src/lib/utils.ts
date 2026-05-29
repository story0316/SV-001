import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 위험 수준 → 색상/아이콘/텍스트 매핑 (ux_principles.md: 3중 표현)
export const RISK_CONFIG: Record<
  RiskLevel,
  { bg: string; text: string; border: string; icon: string; label: string }
> = {
  critical: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    icon: "🔴",
    label: "즉시 조치",
  },
  high: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    icon: "🟠",
    label: "오늘 연락",
  },
  medium: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
    icon: "🟡",
    label: "이번주 확인",
  },
  safe: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    icon: "🟢",
    label: "정상",
  },
};

// "2시간 전" 형식으로 변환
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

// 날짜 → 요일 레이블
export function getDayLabel(dateString: string): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(dateString);
  return days[date.getDay()];
}

// 오늘 날짜 (YYYY-MM-DD)
export function today(): string {
  return new Date().toISOString().split("T")[0];
}
