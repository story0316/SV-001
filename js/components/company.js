// ─── COMPANY DETAIL PAGE ─────────────────────────────────────────────────────

let _companyTab    = '개요';
let _salaryInnerTab = 'Data Points';
let _showFilters   = false;

function renderCompanyPage(company) {
  if (!company) {
    return `
      <div class="not-found">
        <div class="not-found-icon">🔍</div>
        <h2>회사를 찾을 수 없습니다</h2>
        <button class="btn-cta" onclick="navigate('home')">홈으로 돌아가기</button>
      </div>
    `;
  }

  const isDark = company.color === '#FEE500' || company.color === '#FFCD00' || company.color === '#FFBC00';
  const tabs = ['개요', '급여', '복리후생', '채용'];

  let content = '';
  switch (_companyTab) {
    case '개요':      content = renderOverviewTab(company); break;
    case '급여':      content = renderSalaryTab(); break;
    case '복리후생':  content = renderBenefitsTab(); break;
    case '채용':      content = renderHiringTab(company); break;
    default:          content = renderOverviewTab(company);
  }

  return `
    <div class="company-page page-enter">
      <div class="company-header-card">
        <div class="company-logo-lg" style="background:${company.color};color:${isDark ? '#1A2B4A' : '#fff'}">${company.abbr}</div>
        <div>
          <h2 class="company-name">${company.name}</h2>
          <p class="company-name-sub">소프트웨어 엔지니어 기준 데이터</p>
        </div>
      </div>

      <div class="company-tabs" id="companyTabs">
        ${tabs.map(t => `
          <button class="company-tab ${_companyTab === t ? 'active' : ''}"
            onclick="setCompanyTab('${t}', '${company.slug}')">${t}</button>
        `).join('')}
      </div>

      <div id="companyTabContent">${content}</div>

      <button class="floating-cta" onclick="navigate('submit')">+ 연봉 추가</button>
    </div>
  `;
}

function setCompanyTab(tab, slug) {
  _companyTab = tab;
  document.querySelectorAll('.company-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === tab);
  });
  const content = document.getElementById('companyTabContent');
  if (!content) return;

  const company = getCompanyBySlug(slug);
  switch (tab) {
    case '개요':     content.innerHTML = renderOverviewTab(company); break;
    case '급여':     content.innerHTML = renderSalaryTab(); break;
    case '복리후생': content.innerHTML = renderBenefitsTab(); break;
    case '채용':     content.innerHTML = renderHiringTab(company); break;
  }
}

function renderOverviewTab(company) {
  const stats = [
    { label: '설립연도', val: '1969' },
    { label: '직원수', val: '267,800명' },
    { label: '업종', val: '전자/반도체' },
    { label: '본사', val: '수원, 경기' },
  ];

  const statsHtml = stats.map(s => `
    <div class="stat-box">
      <div class="stat-box-val">${s.val}</div>
      <div class="stat-box-label">${s.label}</div>
    </div>
  `).join('');

  const topPayingHtml = TOP_PAYING.slice(0, 7).map(t => {
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
    <div class="tab-content">
      <div class="card">
        <h3 class="card-title">회사 소개</h3>
        <p class="card-body-text">글로벌 반도체·가전 선도 기업. 메모리 반도체, 시스템 반도체, 디스플레이, 스마트폰 등 다양한 사업 영역에서 세계 최고 수준의 제품을 개발·생산합니다. DX부문과 DS부문으로 구성되며, 소프트웨어 인력 채용을 지속 확대 중입니다.</p>
      </div>
      <div class="stats-grid">${statsHtml}</div>
      <div class="card">
        <h3 class="card-title">최고 연봉 기업 순위</h3>
        <p class="card-title-sub">소프트웨어 엔지니어 기준 중위 총연봉</p>
        <div class="top-paying-list">${topPayingHtml}</div>
      </div>
    </div>
  `;
}

function renderSalaryTab() {
  return `
    <div class="tab-content">
      <div class="card">
        <h3 class="card-title">경력별 연봉 궤적</h3>
        <p class="card-title-sub">기본급 / 주식(RSU) / 보너스 구성</p>
        ${renderCareerTrajectoryChart(CAREER_DATA)}
      </div>
      <div class="card">
        <h3 class="card-title">레벨별 연봉 범위</h3>
        ${renderSalaryRangeChart(SCATTER_DATA)}
      </div>
      <div class="card">
        <h3 class="card-title">벤치마킹</h3>
        ${renderBenchmarkingSection()}
      </div>
    </div>
  `;
}

function renderBenchmarkingSection() {
  const filterChips = `
    <div class="filter-chips">
      <div class="chip chip-active">소프트웨어 엔지니어 <span onclick="void(0)">×</span></div>
      <div class="chip chip-active">12개월 <span>×</span></div>
      <div class="chip chip-active">Tier 1 <span>×</span></div>
      <button class="chip chip-add" onclick="toggleFilters()">+ 필터</button>
    </div>
  `;

  const filterPanel = _showFilters ? `
    <div class="filter-panel">
      ${SALARY_FILTERS.map(f => `
        <div class="filter-item">
          <span>${f.label}</span>
          <button class="filter-add">+</button>
        </div>
      `).join('')}
    </div>
  ` : '';

  const innerTabs = ['Trends', 'Data Points', 'Location Diff'].map(t => `
    <button class="inner-tab ${_salaryInnerTab === t ? 'active' : ''}"
      onclick="setSalaryInnerTab('${t}')">${t}</button>
  `).join('');

  const tabContent = renderSalaryInnerTab(_salaryInnerTab);

  return `
    ${filterChips}
    ${filterPanel}
    <div class="inner-tabs">${innerTabs}</div>
    <div id="salaryInnerContent">${tabContent}</div>
  `;
}

function renderSalaryInnerTab(tab) {
  if (tab === 'Data Points') return renderDataPointsTab();

  return `
    <div class="premium-wrap">
      <div class="premium-blur-content">
        <div style="height:120px;background:#F1F5F9;border-radius:8px;margin-bottom:8px"></div>
        <div style="height:80px;background:#F1F5F9;border-radius:8px"></div>
      </div>
      <div class="premium-overlay">
        <div class="premium-lock">🔒</div>
        <div class="premium-title">Premium 전용 기능</div>
        <div class="premium-sub">${tab} 데이터는 Premium 구독자에게 제공됩니다</div>
        <button class="btn-premium">구독 시작하기 — ₩19,900/월</button>
      </div>
    </div>
  `;
}

function renderDataPointsTab() {
  const rows = RECENT_SUBMISSIONS.map((s, i) => {
    const tc = totalComp(s);
    return `
      <div class="salary-row ${i >= 2 ? 'salary-row-blurred' : ''}">
        <div class="salary-row-left">
          <div class="salary-row-company">${s.company} · ${s.loc}</div>
          <div class="salary-row-date">${s.date}</div>
        </div>
        <div class="salary-row-level">${s.level}</div>
        <div class="salary-row-tc">${formatMan(tc)}</div>
      </div>
    `;
  }).join('');

  return `<div class="salary-table">${rows}</div>`;
}

function renderBenefitsTab() {
  const total = '₩13,200,433';
  const catsHtml = BENEFITS.map(b => `
    <div class="benefits-cat">
      <h4 class="benefits-cat-title">${b.cat}</h4>
      <div class="benefits-items">
        ${b.items.map(item => `
          <div class="benefit-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="tab-content">
      <div class="benefits-total-banner">
        <div class="benefits-total-label">추정 복리후생 연간 총 가치</div>
        <div class="benefits-total-val">${total}</div>
      </div>
      <div class="benefits-list">${catsHtml}</div>
    </div>
  `;
}

function renderHiringTab(company) {
  return `
    <div class="tab-content">
      <div class="card hiring-card">
        <h3 class="card-title">${company.name} 공개 채용</h3>
        <p class="card-body-text">현재 채용 중인 포지션을 확인하고 지원하세요.</p>
        <button class="btn-hiring">모든 채용 보기 →</button>
      </div>
    </div>
  `;
}

function toggleFilters() {
  _showFilters = !_showFilters;
  const benchSection = document.querySelector('.card:last-of-type');
  if (benchSection) {
    const section = benchSection.querySelector('.filter-panel');
    if (section) {
      section.remove();
      _showFilters = false;
    } else {
      const panel = document.createElement('div');
      panel.className = 'filter-panel';
      panel.innerHTML = SALARY_FILTERS.map(f => `
        <div class="filter-item"><span>${f.label}</span><button class="filter-add">+</button></div>
      `).join('');
      benchSection.querySelector('.filter-chips').after(panel);
    }
  }
}

function setSalaryInnerTab(tab) {
  _salaryInnerTab = tab;
  document.querySelectorAll('.inner-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === tab);
  });
  const content = document.getElementById('salaryInnerContent');
  if (content) content.innerHTML = renderSalaryInnerTab(tab);
}
