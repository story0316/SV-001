import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/welfare/report/export?orgId=uuid&year=2026&month=5&format=csv
// B2G 보고서 CSV 내보내기
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");
  const year = parseInt(request.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(request.nextUrl.searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const format = request.nextUrl.searchParams.get("format") ?? "csv";

  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const supabase = createServerClient();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];
  const startTs = `${startDate}T00:00:00`;
  const endTs = `${endDate}T23:59:59`;

  const clientsRes = await supabase
    .from("clients")
    .select(`
      id, name, age, risk_level, risk_score,
      assigned_worker:users!clients_assigned_worker_id_fkey(name)
    `)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("risk_score", { ascending: false });

  const clients = clientsRes.data ?? [];

  if (clients.length === 0) {
    return new NextResponse("No data", { status: 204 });
  }

  const clientIds = clients.map((c) => c.id);

  const [responsesRes, contactsRes, riskEventsRes] = await Promise.all([
    supabase
      .from("daily_responses")
      .select("client_id, response_date, status")
      .in("client_id", clientIds)
      .gte("response_date", startDate)
      .lte("response_date", endDate),

    supabase
      .from("contact_logs")
      .select("client_id, contact_type, result")
      .in("client_id", clientIds)
      .gte("contact_date", startTs)
      .lte("contact_date", endTs),

    supabase
      .from("risk_events")
      .select("client_id, risk_level, is_addressed")
      .in("client_id", clientIds)
      .gte("detected_at", startTs)
      .lte("detected_at", endTs),
  ]);

  const responses = responsesRes.data ?? [];
  const contacts = contactsRes.data ?? [];
  const riskEvents = riskEventsRes.data ?? [];

  const RISK_LABEL_KO: Record<string, string> = {
    critical: "즉시조치",
    high: "오늘연락",
    medium: "이번주확인",
    safe: "정상",
  };

  // 대상자별 집계 행 생성
  const rows = clients.map((c) => {
    const myResponses = responses.filter((r) => r.client_id === c.id);
    const responded = myResponses.filter((r) => r.status === "responded").length;
    const responseRate = myResponses.length > 0
      ? Math.round((responded / myResponses.length) * 100)
      : 0;

    const myContacts = contacts.filter((ct) => ct.client_id === c.id);
    const myCritical = riskEvents.filter((e) => e.client_id === c.id && e.risk_level === "critical").length;

    const workerName = (c.assigned_worker as unknown as { name?: string } | null)?.name ?? "";

    return [
      c.name,
      String(c.age),
      RISK_LABEL_KO[c.risk_level] ?? c.risk_level,
      String(c.risk_score),
      workerName,
      String(myResponses.length),
      String(responded),
      `${responseRate}%`,
      String(myContacts.length),
      String(myCritical),
    ];
  });

  // CSV 생성
  const header = [
    "이름", "나이", "위험도", "위험점수", "담당복지사",
    "발송횟수", "응답횟수", "응답률", "연락횟수", "긴급이벤트수",
  ];

  const csvRows = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const BOM = "﻿"; // Excel UTF-8 BOM
  const csv = BOM + csvRows;

  const filename = `welfare_report_${year}${String(month).padStart(2, "0")}.csv`;

  if (format === "json") {
    return NextResponse.json({ header, rows, filename });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
