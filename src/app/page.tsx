import { redirect } from "next/navigation";

// 루트 접근 시 보호자 홈으로 이동
// Phase 3에서 역할별 분기 추가 예정
export default function RootPage() {
  redirect("/");
}
