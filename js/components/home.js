// ─── HOME PAGE ───────────────────────────────────────────────────────────────

function renderHomePage() {
  const companyGrid = POPULAR_COMPANIES.map(c => {
    const isDark = c.color === '#FEE500' || c.color === '#FFCD00' || c.color === '#FFBC00';
    return `
      <button class="company-card" onclick="navigate('company', '${c.slug}')">
        <div class="company-logo" style="background:${c.color};color:${isDark ? '#1A2B4A' : '#fff'}">${c.abbr}</div>
        <div class="company-card-info">
          <div class="company-card-name">${c.name}</div>
          <div class="company-card-sub">연봉 데이터 보기 →</div>
        </div>
      </button>
    `;
  }).join('');

  const industries = ['테크', '바이오테크', '반도체', '게임', '금융', '투자은행', '보험', '회계', '컨설팅', '헬스케어', '제조', '리테일'];
  const industryGrid = industries.map(i => `
    <button class="industry-btn">${i}</button>
  `).join('');

  const recentHtml = RECENT_SUBMISSIONS.map((s, idx) => {
    const tc = totalComp(s);
    return `
      <div class="submission-card ${idx >= 3 ? 'submission-blurred' : ''}">
        <div class="submission-left">
          <div class="submission-company">${s.company} · ${s.level}</div>
          <div class="submission-title">${s.title}</div>
          <div class="submission-meta">${s.loc} · ${s.date}</div>
        </div>
        <div class="submission-right">
          <div class="submission-tc">${formatMan(tc)}</div>
          <div class="submission-breakdown">
            기본 ${formatMan(s.base)} | 주식 ${formatMan(s.stock)} | 보너스 ${formatMan(s.bonus)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="home-page">
      <!-- Hero -->
      <section class="hero">
        <p class="hero-sub">대한민국 No.1 연봉 정보 플랫폼</p>
        <h1 class="hero-title">당신의 연봉,<br>얼마가 적정할까요?</h1>

        <div class="search-wrap">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              class="search-input"
              type="text"
              placeholder="회사명을 검색하세요"
              oninput="onSearchInput(this.value)"
              onfocus="onSearchInput(this.value)"
              autocomplete="off"
            />
          </div>
          <div class="search-dropdown" id="searchDropdown"></div>
        </div>

        <div class="hero-stats">
          <div class="stat-item"><strong>245,000+</strong><span>데이터 포인트</span></div>
          <div class="stat-item"><strong>5,000+</strong><span>기업</span></div>
          <div class="stat-item"><strong>150+</strong><span>직종</span></div>
        </div>
      </section>

      <!-- Popular Companies -->
      <section class="section">
        <h2 class="section-title">인기 기업</h2>
        <div class="company-grid">${companyGrid}</div>
      </section>

      <!-- Industries -->
      <section class="section">
        <h2 class="section-title">업종별 탐색</h2>
        <div class="industry-grid">${industryGrid}</div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <h3 class="cta-title">내 연봉 데이터 공유하기</h3>
        <p class="cta-sub">익명으로 제출 · 검증된 데이터만 표시 · 30초 완료</p>
        <button class="btn-cta" onclick="navigate('submit')">연봉 제출하기 →</button>
      </section>

      <!-- Recent Submissions -->
      <section class="section">
        <h2 class="section-title">최근 연봉 제출</h2>
        <div class="submissions-list">${recentHtml}</div>
      </section>
    </div>
  `;
}

function onSearchInput(value) {
  const dropdown = document.getElementById('searchDropdown');
  if (!dropdown) return;

  const q = value.trim().toLowerCase();
  if (!q) { dropdown.innerHTML = ''; dropdown.classList.remove('open'); return; }

  const matches = POPULAR_COMPANIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.slug.includes(q)
  );

  if (matches.length === 0) { dropdown.innerHTML = ''; dropdown.classList.remove('open'); return; }

  dropdown.innerHTML = matches.map(c => {
    const isDark = c.color === '#FEE500' || c.color === '#FFCD00' || c.color === '#FFBC00';
    return `
      <div class="search-item" onclick="selectCompany('${c.slug}')">
        <div class="search-item-logo" style="background:${c.color};color:${isDark ? '#1A2B4A' : '#fff'}">${c.abbr}</div>
        <span>${c.name}</span>
      </div>
    `;
  }).join('');
  dropdown.classList.add('open');
}

function selectCompany(slug) {
  const input = document.querySelector('.search-input');
  if (input) input.value = '';
  const dropdown = document.getElementById('searchDropdown');
  if (dropdown) { dropdown.innerHTML = ''; dropdown.classList.remove('open'); }
  navigate('company', slug);
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) {
    const dropdown = document.getElementById('searchDropdown');
    if (dropdown) { dropdown.innerHTML = ''; dropdown.classList.remove('open'); }
  }
});
