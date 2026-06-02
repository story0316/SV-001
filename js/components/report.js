// ─── SALARY REPORT PAGE ──────────────────────────────────────────────────────

function renderSalaryReportPage() {
  const highlights = [
    { icon: '📈', val: '+3.49%', label: '중위 TC 성장',    sub: '전년 대비 국내 소프트웨어 엔지니어' },
    { icon: '🚀', val: '₩2.2억+', label: '최대 협상 성과', sub: '4년간 TC 증가액' },
    { icon: '⚡', val: 'AI/ML',  label: '핵심 엔지니어링', sub: '틈새에서 주류로' },
    { icon: '🌍', val: 'RTO',    label: '근무 형태 변화',   sub: '사무실 출근 +12%' },
  ];

  const highlightsHtml = highlights.map(h => `
    <div class="highlight-card">
      <div class="highlight-icon">${h.icon}</div>
      <div class="highlight-val">${h.val}</div>
      <div class="highlight-label">${h.label}</div>
      <div class="highlight-sub">${h.sub}</div>
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
    const isDark = t.color === '#FEE500' || t.color === '#FFCD00';
    return `
      <div class="top-paying-row">
        <div class="top-rank">${t.rank}</div>
        <div class="top-logo-sm" style="background:${t.color};color:${isDark ? '#1A2B4A' : '#fff'}">${t.abbr}</div>
        <span class="top-company">${t.company}</span>
        <span class="top-tc">${t.tc}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="report-page page-enter">
      <div class="report-hero">
        <div class="report-badge">2025 하이라이트</div>
        <h2 class="report-title">연봉 데이터 리포트</h2>
        <p class="report-sub">불확실한 시장에서 한 해가 어떻게 변했나</p>
      </div>

      <div class="highlights-grid">${highlightsHtml}</div>

      <div class="card">
        <h3 class="card-title">레벨별 중위 총 연봉</h3>
        <p class="card-title-sub">소프트웨어 엔지니어</p>
        <div class="report-table-header">
          <span>레벨</span><span>2024</span><span>2025</span><span>변화율</span>
        </div>
        ${tableRowsHtml}
      </div>

      <div class="card">
        <h3 class="card-title">최고 연봉 기업 Top 5</h3>
        <div class="role-tabs">
          ${['소프트웨어 엔지니어', '프로덕트 매니저', '데이터 사이언티스트'].map((r, i) => `
            <button class="role-tab ${i === 0 ? 'active' : ''}">${r}</button>
          `).join('')}
        </div>
        <div class="top-paying-list">${topPayingHtml}</div>
      </div>
    </div>
  `;
}
