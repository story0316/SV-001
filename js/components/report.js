// ─── SALARY REPORT PAGE ────────────────────────────────────────────────────────

function renderSalaryReportPage() {
  const highlights = [
    { icon: "📈", val: "+3.49%", label: "중위 TC 성장", sub: "전년 대비 국내 소프트웨어 엔지니어" },
    { icon: "🚀", val: "₩2.2억+", label: "최대 협상 성과", sub: "4년간 TC 증가액" },
    { icon: "⚡", val: "AI/ML", label: "핵심 엔지니어링", sub: "틈새에서 주류로" },
    { icon: "🌍", val: "RTO", label: "최고 성장 근무 형태", sub: "사무실 출근 +12%" },
  ];

  const highlightsHtml = highlights.map(s => `
    <div class="highlight-card">
      <div class="highlight-icon">${s.icon}</div>
      <div class="highlight-val">${s.val}</div>
      <div class="highlight-label">${s.label}</div>
      <div class="highlight-sub">${s.sub}</div>
    </div>
  `).join('');

  const tableRowsHtml = REPORT_LEVELS.map(r => `
    <div class="report-row">
      <span class="report-level-badge">${r.lvl}</span>
      <span class="report-year">${r.y24}</span>
      <span class="report-now">${r.y25}</span>
      <span class="chg-badge ${r.pos ? 'chg-pos' : 'chg-neg'}">${r.chg}</span>
    </div>
  `).join('');

  const topPayingHtml = TOP_PAYING.slice(0, 5).map(t => {
    const isDark = t.color === '#FEE500';
    return `
      <div class="top-paying-row">
        <div style="width:24px;height:24px;border-radius:6px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#1A2B4A">${t.rank}</div>
        <div class="top-logo" style="background:${t.color};color:${isDark ? '#3D2B00' : '#fff'}">${t.abbr}</div>
        <span class="top-name">${t.company}</span>
        <span style="font-weight:800;color:#1428A0;font-size:14px">${t.tc}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="report-page page-enter">
      <!-- Report Hero -->
      <div class="report-hero">
        <div class="report-badge">2025 하이라이트</div>
        <h2 class="report-title">연봉 데이터 리포트</h2>
        <p class="report-sub">불확실한 시장에서 한 해가 어떻게 변했나</p>
      </div>

      <!-- Highlights -->
      <div class="highlights-grid">${highlightsHtml}</div>

      <!-- Level Table -->
      <div class="card">
        <h3 class="card-title sm">레벨별 중위 총 연봉</h3>
        <p style="color:#64748B;font-size:12px;margin:-8px 0 14px">소프트웨어 엔지니어</p>
        <div class="report-table-header">
          <span>레벨</span><span>2024</span><span>2025</span><span>변화율</span>
        </div>
        ${tableRowsHtml}
      </div>

      <!-- Top Paying -->
      <div class="card">
        <h3 class="card-title sm">레벨별 최고 연봉 기업</h3>
        <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
          ${['소프트웨어 엔지니어', '프로덕트 매니저', '데이터 사이언티스트'].map((r, i) => `
            <button style="background:${i === 0 ? '#1428A0' : '#F1F5F9'};color:${i === 0 ? '#fff' : '#374151'};border:none;border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;font-weight:600">${r}</button>
          `).join('')}
        </div>
        ${topPayingHtml}
      </div>
    </div>
  `;
}
