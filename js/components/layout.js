// ─── LAYOUT COMPONENTS ───────────────────────────────────────────────────────

function renderHeader(currentPage, company) {
  const isCompany = currentPage === 'company' && company;

  return `
    <header class="app-header">
      <div class="header-inner">
        <div class="header-left">
          ${isCompany
            ? `<button class="header-back" onclick="navigate('home')">← 목록</button>`
            : `<div class="header-logo" onclick="navigate('home')">
                <div class="logo-icon">₩</div>
                <span class="logo-text">연봉인사이트</span>
               </div>`
          }
        </div>
        ${isCompany
          ? `<div class="header-company-name">${company.name}</div>`
          : ''
        }
        <button class="header-menu-btn" onclick="toggleMenu()" aria-label="메뉴 열기">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `;
}

function renderMegaMenu() {
  const links = [
    { label: '연봉 검색', page: 'home' },
    { label: '연봉 리포트', page: 'report' },
    { label: '복리후생 비교', page: 'compare' },
    { label: '직급 매핑', page: 'levels' },
    { label: '연봉 제출', page: 'submit' },
  ];

  return `
    <div class="mega-menu" id="megaMenu">
      <nav class="mega-nav">
        ${links.map(l => `
          <a class="mega-link" onclick="navigate('${l.page}'); toggleMenu()">${l.label}</a>
        `).join('')}
      </nav>
      <div class="mega-auth">
        <button class="btn-auth btn-login">로그인</button>
        <button class="btn-auth btn-signup">회원가입</button>
      </div>
    </div>
  `;
}

function renderBottomNav(currentPage) {
  const tabs = [
    { page: 'home',    icon: '🏠', label: '홈' },
    { page: 'report',  icon: '📊', label: '리포트' },
    { page: 'compare', icon: '⚖️',  label: '비교' },
    { page: 'levels',  icon: '🗂️',  label: '직급' },
    { page: 'submit',  icon: '+',   label: '제출', isSubmit: true },
  ];

  return `
    <nav class="bottom-nav">
      ${tabs.map(t => `
        <button
          class="bottom-tab ${currentPage === t.page ? 'active' : ''} ${t.isSubmit ? 'submit-tab' : ''}"
          onclick="navigate('${t.page}')">
          <span class="tab-icon">${t.icon}</span>
          <span class="tab-label">${t.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function toggleMenu() {
  const menu = document.getElementById('megaMenu');
  if (menu) menu.classList.toggle('open');
}
