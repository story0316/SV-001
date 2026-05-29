// 위험 수준 (notification_flow.md 기반)
export type RiskLevel = "critical" | "high" | "medium" | "safe";

// 응답 상태 (KakaoTalk 봇 흐름)
export type ResponseStatus =
  | "sent"
  | "delivered"
  | "read"
  | "responded"
  | "timeout";

// 연락 결과 (복지사 기록 팝업)
export type ContactResult =
  | "completed"
  | "missed"
  | "rejected"
  | "unreachable";

// 사용자 역할
export type UserRole = "elder" | "welfare_worker" | "guardian" | "admin";

// 관리 대상자 (고령층)
export interface Client {
  id: string;
  name: string;
  age: number;
  phone?: string;
  address?: string;
  organization_id: string;
  assigned_worker_id?: string;
  risk_score: number;
  risk_level: RiskLevel;
  last_response_date?: string;
  last_response_time?: string;
  created_at: string;
  updated_at: string;
}

// 일일 응답 기록
export interface DailyResponse {
  id: string;
  client_id: string;
  response_date: string;
  sent_at?: string;
  responded_at?: string;
  response_value?: "yes" | "no";
  status: ResponseStatus;
}

// 보호자 정보
export interface Guardian {
  id: string;
  guardian_id: string;
  client_id: string;
  relationship: "son" | "daughter" | "other";
  primary: boolean;
  guardian_user?: {
    name: string;
    phone: string;
    email: string;
  };
}

// 보호자 앱 - 부모 상태 (G01 화면용)
export interface ParentStatus {
  name: string;
  age: number;
  status: "normal" | "warning" | "danger";
  lastResponseTime?: string;
  lastResponseAgo?: string;
  todayResponded: boolean;
  assignedWorker?: {
    name: string;
    phone: string;
  };
}

// 보호자 앱 - 7일 응답 패턴
export interface ResponseHistoryItem {
  date: string; // YYYY-MM-DD
  dayLabel: string; // 월/화/.../오
  responded: boolean;
  responseTime?: string; // HH:mm
  isToday: boolean;
}

// KakaoTalk 봇 응답 페이로드
export interface KakaoButtonPayload {
  userId: string;
  userKey: string;
  content: string; // 버튼 키값
  createdTime: string;
}

// ─────────────────────────────────────────
// Phase 2 타입
// ─────────────────────────────────────────

// 복지사 대시보드 — 대상자 카드
export interface ClientCard {
  id: string;
  name: string;
  age: number;
  district: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskReasons: string[];       // 최대 3개, 한줄 요약
  lastResponseAgo?: string;
  contactAttempts: number;     // 이번 연속 미응답 시도 수
  nextContactScheduled?: string;
}

// 복지사 Today 대시보드 응답
export interface TodayDashboard {
  date: string;
  workerName: string;
  critical: ClientCard[];      // 🔴 즉시 조치
  high: ClientCard[];          // 🟠 오늘 연락
  pendingTasks: PendingTask[];
  completedToday: number;
  totalAssigned: number;
}

// 미완료 태스크
export interface PendingTask {
  id: string;
  clientId: string;
  clientName: string;
  type: "record_missing" | "notify_pending" | "visit_overdue";
  description: string;
  dueDate?: string;
}

// 빠른 기록 입력 폼 (W03 모달)
export interface ContactRecordForm {
  clientId: string;
  result: ContactResult;
  status: "normal" | "warning" | "danger";
  actions: string[];
  note?: string;
  nextContactDays: number; // 1 | 3 | 7
}

// 인지 체크 문제 (K02)
export interface CognitionQuestion {
  id: string;
  type: "day_of_week" | "season" | "simple_math";
  question: string;
  options: string[];
  correctIndex: number;
}

// 인지 체크 응답
export interface CognitionResponse {
  client_id: string;
  question_id: string;
  question_type: string;
  is_correct: boolean;
  response_time_ms: number;
  answered_at: string;
}
