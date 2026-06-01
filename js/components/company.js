// ─── COMPANY PAGE ─────────────────────────────────────────────────────────────

let _companyTab = '개요';

function renderCompanyPage(company) {
  if (!company) {
    return `<div style="padding:40px;text-align:center;color:#64748B">회사를 찾을 수 없습니다.</div>`;
  }

  const isDark = company.color === '#FEE500';
  const textColor = isDark ? '#3D2B00' : '#fff';

  const tabs = ['개요', '급여', '복리후생', '채용'];

  return `
    <div class="page-enter">
      <div class="company-page-header">
        <div class="company-page-title-row">
          <div class="company-page-logo" style="background:${company.color};color:${textColor}">
            ${company.abbr}
          </div>
          <div>
            <div class="company-page-name">${company.name}</div>
            <p class="company-page-sub">여기서 일하시나요? <span>회사 정보 관리하기</span></p>
          </div>
        </div>
        <div class="tabs" id="companyTabs">
          ${tabs.map(t => `
            <button class="tab-btn ${_companyTab === t ? 'active' : ''}"
              onclick="setCompanyTab('${t}', '${company.slug}')">${t}</button>
          `).join('')}
        </div>
      </div>

      <div id="companyTabContent" style="padding:20px">
        ${renderCompanyTabContent(_companyTab, company)}
      </div>

      <!-- Floating CTA -->
      <div class="floating-cta">
        <button class="btn-floating" onclick="navigate('submit')">
          + 연봉 추가 / 협상 →
        </button>
      </div>
    </div>
  `;
}

function setCompanyTab(tab, slug) {
  _companyTab = tab;
  // Update tab buttons
  document.querySelectorAll('#companyTabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === tab);
  });
  // Update content
  const company = getCompanyBySlug(slug);
  const content = document.getElementById('companyTabContent');
  if (content && company) {
    content.innerHTML = renderCompanyTabContent(tab, company);
    initCompanyTabEvents(tab);
  }
}

function renderCompanyTabContent(tab, company) {
  switch (tab) {
    case '개요': return renderOverviewTab(company);
    case '급여': return renderSalaryTab(company);
    case '복리후생': return renderBenefitsTab(company);
    case '채용': return renderHiringTab(company);
    default: return '';
  }
}

function initCompanyTabEvents(tab) {
  if (tab === '급여') {
    initSalaryTabEvents();
  }
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

function renderOverviewTab(company) {
  const topPayingHtml = TOP_PAYING.map(t => {
    const isDark = t.color === '#FEE500';
    return `
      <div class="top-paying-row">
        <span class="top-rank">${t.rank}</span>
        <div class="top-logo" style="background:${t.color};color:${isDark ? '#3D2B00' : '#fff'}">${t.abbr}</div>
        <span class="top-name">${t.company}</span>
        <span class="top-tc">${t.tc}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="card">
      <h3 class="card-title sm">회사 소개</h3>
      <p style="font-size:14px;color:#374151;line-height:1.6">
        ${company.name}은 대한민국을 대표하는 기업으로, 혁신적인 기술과 서비스를 제공합니다.
        전 세계 시장에서 경쟁하며 최고의 인재를 채용합니다.
      </p>
      <div class="stats-grid">
        ${[["설립연도", "2000"], ["직원수", "40,000+"], ["업종", "테크/IT"], ["본사", "서울/경기"]].map(([k, v]) => `
          <div class="stat-box">
            <div class="stat-label">${k}</div>
            <div class="stat-value">${v}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <h3 class="card-title sm">최고 연봉 기업 순위</h3>
      <div class="top-paying-list">${topPayingHtml}</div>
    </div>
  `;
}

// ─── SALARY TAB ──────────────────────────────────────────────────────────────

let _salaryInnerTab = 'Data Points';
let _showFilters = false;

function renderSalaryTab(company) {
  return `
    ${renderCareerTrajectoryChart(CAREER_DATA)}
    ${renderSalaryRangeChart(SCATTER_DATA)}
    ${renderBenchmarkingSection()}
  `;
}

function renderBenchmarkingSection() {
  const filterChips = ['소프트웨어 엔지니어', '12개월', 'Tier 1'];

  const filtersHtml = SALARY_FILTERS.map(f => `
    <div class="filter-row">
      <span>${f.label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </div>
  `).join('');

  return `
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid #E8EDF2">
        <h3 class="card-title" style="margin-bottom:8px">실시간 연봉 벤치마킹</h3>
        <div class="filter-chips">
          ${filterChips.map(f => `<span class="chip">${f} ×</span>`).join('')}
          <button class="chip-add" onclick="toggleFilters()">+ 필터</button>
        </div>
      </div>

      <div class="filter-panel ${_showFilters ? 'open' : ''}" id="filterPanel">
        <div class="filter-panel-header">
          <span class="filter-panel-title">전체 필터</span>
          <button class="btn-apply">필터 적용</button>
        </div>
        ${filtersHtml}
      </div>

      <div style="padding:16px 20px">
        <div class="inner-tabs">
          ${['Trends', 'Data Points', 'Location Diff'].map(t => `
            <button class="inner-tab ${_salaryInnerTab === t ? 'active' : ''}"
              onclick="setSalaryInnerTab('${t}')">${t}</button>
          `).join('')}
        </div>
        <div id="salaryInnerContent">
          ${renderSalaryInnerTab(_salaryInnerTab)}
        </div>
      </div>
    </div>
  `;
}

function renderSalaryInnerTab(tab) {
  if (tab === 'Data Points') {
    return renderDataPointsTab();
  }
  // Trends & Location Diff → Premium blur
  return `
    <div style="padding:20px 0;text-align:center">
      <div style="background:#F1F5F9;border-radius:10px;padding:16px;position:relative;overflow:hidden">
        <div style="filter:blur(4px);opacity:0.3;pointer-events:none;height:120px;background:linear-gradient(135deg,#3B82F6,#8B5CF6);border-radius:8px"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
          <div class="premium-overlay">
            <div class="premium-overlay-sub">Premium Tier</div>
            <div class="premium-overlay-title">업그레이드하여 보기 ✨</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDataPointsTab() {
  const rows = RECENT_SUBMISSIONS.map((s, i) => {
    const total = s.base + s.stock + s.bonus;
    const blurred = i >= 2 ? 'salary-row-blurred' : '';
    return `
      <div class="salary-row ${blurred}">
        <div>
          <div class="salary-row-company">${s.company}</div>
          <div class="salary-row-meta">${s.loc} | ${s.date}</div>
        </div>
        <div>
          <div class="salary-row-level">${s.level}</div>
          <div class="salary-row-job">${s.title}</div>
        </div>
        <div>
          <div class="salary-row-total">₩${total.toLocaleString()}만</div>
          <div class="salary-row-breakdown">${s.base}|${s.stock}|${s.bonus}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="salary-table">
      <div class="salary-table-header">
        <span>회사 / 지역 / 날짜</span>
        <span>레벨</span>
        <span>총 연봉</span>
      </div>
      ${rows}
    </div>
    <div class="premium-lock">
      <span>Premium Tier — </span>
      <span style="font-weight:700">업그레이드하면 더 보기 ✨</span>
    </div>
  `;
}

function setSalaryInnerTab(tab) {
  _salaryInnerTab = tab;
  document.querySelectorAll('.inner-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === tab);
  });
  const content = document.getElementById('salaryInnerContent');
  if (content) content.innerHTML = renderSalaryInnerTab(tab);
}

function toggleFilters() {
  _showFilters = !_showFilters;
  const panel = document.getElementById('filterPanel');
  if (panel) panel.classList.toggle('open', _showFilters);
}

function initSalaryTabEvents() {
  // Events are inline, but we can re-init if needed
}

// ─── BENEFITS TAB ────────────────────────────────────────────────────────────

function renderBenefitsTab(company) {
  const categoriesHtml = BENEFITS.map(b => `
    <div>
      <div class="benefits-cat-title">
        <span>${b.icon}</span> ${b.cat}
      </div>
      <div class="benefits-items">
        ${b.items.map(item => `
          <div class="benefit-item">
            <span class="benefit-check">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            ${item}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="card">
      <div class="benefits-total">
        <span style="font-size:20px">🎁</span>
        <div>
          <span style="color:#64748B;font-size:13px">추정 총 가치:</span>
          <span style="color:#1428A0;font-weight:800;font-size:16px;margin-left:6px">₩13,200,433</span>
        </div>
      </div>
      ${categoriesHtml}
    </div>
  `;
}

// ─── HIRING TAB ──────────────────────────────────────────────────────────────

function renderHiringTab(company) {
  return `
    <div class="card">
      <h3 class="card-title">${company.name} 공개 채용</h3>
      <p style="color:#64748B;font-size:14px;margin-bottom:16px">경력을 한 단계 올릴 준비가 되셨나요?</p>
      <button style="width:100%;background:#1428A0;color:#fff;border:none;border-radius:10px;padding:14px;font-weight:700;font-size:15px;cursor:pointer">
        모든 채용 보기 →
      </button>
    </div>
  `;
}
