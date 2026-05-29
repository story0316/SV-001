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
