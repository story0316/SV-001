// ─── LEVEL MAPPING PAGE ────────────────────────────────────────────────────────

let _levelsCompany = '삼성전자';
let _levelsRole = '소프트웨어 엔지니어';

function renderLevelMappingPage() {
  const companies = Object.keys(COMPANY_LEVELS);
  const roles = ['소프트웨어 엔지니어', '프로덕트 매니저', '데이터 사이언티스트', '프로덕트 디자이너'];

  const levelColors = {
    Google: '#EEF2FF',
    삼성전자: '#EEF2FF',
    카카오: '#FFFDE7',
    네이버: '#F0FDF4',
  };

  const levels = COMPANY_LEVELS[_levelsCompany] || [];
  const bgColor = levelColors[_levelsCompany] || '#F8FAFF';

  const levelsHtml = levels.map(lvl => `
    <div class="level-box" style="background:${bgColor}">
      <div class="level-box-name">${lvl.name}</div>
      <div class="level-box-sub">${lvl.sub}</div>
    </div>
  `).join('');

  return `
    <div class="levels-page page-enter">
      <div class="card">
        <h2 class="levels-title">직급 체계 매핑</h2>
        <p class="levels-sub">직급 비교는 역할/책임 범위 기준입니다.</p>

        <!-- Role selector -->
        <select class="form-select" style="margin-bottom:16px"
          onchange="updateLevelsRole(this.value)">
          ${roles.map(r => `
            <option value="${r}" ${_levelsRole === r ? 'selected' : ''}>${r}</option>
          `).join('')}
        </select>

        <!-- Company tabs -->
        <div class="company-tabs">
          ${companies.map(c => `
            <button class="company-tab ${_levelsCompany === c ? 'active' : ''}"
              onclick="updateLevelsCompany('${c}')">${c}</button>
          `).join('')}
        </div>

        <!-- Level grid -->
        <div class="level-grid" id="levelGrid">
          ${levelsHtml}
        </div>

        <button class="btn-share">↗ 직급 체계 제출 &amp; 공유</button>
      </div>
    </div>
  `;
}

function updateLevelsCompany(company) {
  _levelsCompany = company;
  // Update active tabs
  document.querySelectorAll('.company-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === company);
  });
  // Update grid
  const grid = document.getElementById('levelGrid');
  if (grid) {
    const levelColors = { Google: '#EEF2FF', 삼성전자: '#EEF2FF', 카카오: '#FFFDE7', 네이버: '#F0FDF4' };
    const bgColor = levelColors[company] || '#F8FAFF';
    const levels = COMPANY_LEVELS[company] || [];
    grid.innerHTML = levels.map(lvl => `
      <div class="level-box" style="background:${bgColor}">
        <div class="level-box-name">${lvl.name}</div>
        <div class="level-box-sub">${lvl.sub}</div>
      </div>
    `).join('');
  }
}

function updateLevelsRole(role) {
  _levelsRole = role;
}
