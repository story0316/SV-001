// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function renderHomePage() {
  const industries = ["테크", "바이오테크", "반도체", "게임", "금융", "인베스트먼트 뱅킹", "보험", "회계", "매니지먼트 컨설팅", "헬스케어", "제조", "리테일"];

  const companiesHtml = POPULAR_COMPANIES.map(c => {
    const isDark = c.color === '#FEE500';
    const textColor = isDark ? '#3D2B00' : '#fff';
    return `
      <div class="company-card" onclick="navigate('company','${c.slug}')">
        <div class="company-logo" style="background:${c.color};color:${textColor}">${c.abbr}</div>
        <span class="company-name">${c.name}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    `;
  }).join('');

  const submissionsHtml = RECENT_SUBMISSIONS.map(s => {
    const total = s.base + s.stock + s.bonus;
    return `
      <div class="submission-card">
        <div class="submission-header">
          <div>
            <span class="submission-company">${s.company}</span>
            <span class="submission-meta">${s.level} · ${s.title}</span>
            <div class="submission-loc">${s.loc} · ${s.date}</div>
          </div>
          <div>
            <div class="submission-total">₩${total.toLocaleString('ko-KR')}만</div>
            <div class="submission-breakdown">기본 ${s.base}만 | 주식 ${s.stock}만 | 보너스 ${s.bonus}만</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-enter">
      <!-- Hero -->
      <div class="hero">
        <p class="hero-sub">대한민국 No.1 연봉 정보 플랫폼</p>
        <h1 class="hero-title">당신의 연봉,<br>얼마가 적정할까요?</h1>
        <p class="hero-desc">실제 재직자들이 제출한 검증된 연봉 데이터</p>

        <!-- Search -->
        <div class="search-wrap" id="heroSearch">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input class="search-input" id="searchInput"
              placeholder="회사명 검색 (삼성전자, 카카오, 네이버...)"
              oninput="onSearchInput(this.value)" autocomplete="off" />
          </div>
          <div class="search-dropdown" id="searchDropdown"></div>
        </div>

        <!-- Stats -->
        <div class="hero-stats">
          ${[["245,000+", "데이터 포인트"], ["5,000+", "기업"], ["150+", "직종"], ["160+", "국가"]].map(([n, l]) => `
            <div style="text-align:center">
              <div class="hero-stat-val">${n}</div>
              <div class="hero-stat-label">${l}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Popular Companies -->
      <div class="section">
        <h2 class="section-title">🔥 인기 기업</h2>
        <div class="company-grid">${companiesHtml}</div>

        <!-- Industry -->
        <h2 class="section-title sm">🏭 업종별 탐색</h2>
        <div class="industry-grid">
          ${industries.map(ind => `
            <button class="industry-btn">${ind}</button>
          `).join('')}
        </div>

        <!-- CTA -->
        <div class="cta-banner">
          <p>당신의 연봉을 공유해 주세요</p>
          <h3>내 연봉 추가하기</h3>
          <button class="btn-cta" onclick="navigate('submit')">+ 연봉 제출하기</button>
        </div>
      </div>

      <!-- Recent Submissions -->
      <div class="section" style="padding-top:0">
        <h2 class="section-title">📋 최신 연봉 제출</h2>
        <div class="submission-list">${submissionsHtml}</div>
      </div>
    </div>
  `;
}

function onSearchInput(value) {
  const dropdown = document.getElementById('searchDropdown');
  if (!dropdown) return;

  if (!value.trim()) {
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    return;
  }

  const matches = POPULAR_COMPANIES.filter(c =>
    c.name.includes(value) || c.abbr.toLowerCase().includes(value.toLowerCase())
  );

  if (matches.length === 0) {
    dropdown.classList.remove('open');
    return;
  }

  dropdown.innerHTML = matches.map(c => {
    const isDark = c.color === '#FEE500';
    const textColor = isDark ? '#3D2B00' : '#fff';
    return `
      <div class="search-result-item" onclick="selectCompany('${c.slug}')">
        <div style="width:32px;height:32px;border-radius:8px;background:${c.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="color:${textColor};font-size:9px;font-weight:800">${c.abbr}</span>
        </div>
        <span style="font-weight:600;color:#1A2B4A">${c.name}</span>
      </div>
    `;
  }).join('');

  dropdown.classList.add('open');
}

function selectCompany(slug) {
  const dropdown = document.getElementById('searchDropdown');
  const input = document.getElementById('searchInput');
  if (dropdown) { dropdown.classList.remove('open'); dropdown.innerHTML = ''; }
  if (input) input.value = '';
  navigate('company', slug);
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('heroSearch');
  if (wrap && !wrap.contains(e.target)) {
    const dropdown = document.getElementById('searchDropdown');
    if (dropdown) dropdown.classList.remove('open');
  }
});
