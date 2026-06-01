// ─── LAYOUT COMPONENTS ───────────────────────────────────────────────────────

function renderHeader(currentPage, company) {
  const showBack = currentPage === 'company' && company;

  return `
    <header class="header">
      <a class="header-logo" onclick="navigate('home')">
        <div class="header-logo-icon">₩</div>
        <span class="header-logo-text">연봉인사이트</span>
      </a>
      ${showBack ? `<button class="header-back" onclick="navigate('home')">← 목록</button>` : '<div></div>'}
      <button class="header-menu-btn" onclick="toggleMenu()" aria-label="메뉴">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </header>
  `;
}

function renderMegaMenu() {
  const items = [
    ["연봉 데이터", "home"],
    ["회사 검색", "home"],
    ["직군별 연봉", "home"],
    ["복리후생 비교", "compare"],
    ["2025 급여 리포트", "report"],
    ["최고 급여 기업", "report"],
    ["레벨 매핑", "levels"],
    ["연봉 제출하기", "submit"],
  ];

  return `
    <div class="mega-menu" id="megaMenu">
      <div class="mega-menu-list">
        ${items.map(([label, page]) => `
          <div class="mega-menu-item" onclick="navigate('${page}'); toggleMenu()">
            ${label}
          </div>
        `).join('')}
      </div>
      <div class="mega-menu-footer">
        <button class="btn-login">로그인</button>
        <button class="btn-signup">회원가입</button>
      </div>
    </div>
  `;
}

function renderBottomNav(currentPage) {
  const items = [
    { key: "home", label: "홈", icon: "🏠" },
    { key: "report", label: "리포트", icon: "📊" },
    { key: "compare", label: "비교", icon: "⚖️" },
    { key: "levels", label: "직급", icon: "🗂️" },
    { key: "submit", label: "제출", icon: "+" },
  ];

  return `
    <nav class="bottom-nav">
      ${items.map(n => `
        <button class="bottom-nav-item ${currentPage === n.key ? 'active' : ''}" onclick="navigate('${n.key}')">
          ${n.key === 'submit'
            ? `<span class="bottom-nav-icon submit-icon">+</span>`
            : `<span class="bottom-nav-icon">${n.icon}</span>`}
          <span class="bottom-nav-label">${n.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function toggleMenu() {
  const menu = document.getElementById('megaMenu');
  if (menu) menu.classList.toggle('open');
}
