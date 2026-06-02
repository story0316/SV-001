// ─── SUBMIT PAGE ─────────────────────────────────────────────────────────────

let _submitStep   = 1;
let _submitMethod = '';
let _jobMenuOpen  = false;
let _submitForm   = { company: '', jobCat: '', job: '', level: '', base: '', stock: '', bonus: '', location: '', years: '' };

function renderSubmitPage() {
  switch (_submitStep) {
    case 1:  return renderMethodStep();
    case 2:  return renderDataStep();
    case 3:  return renderSuccessStep();
    default: return renderMethodStep();
  }
}

function renderMethodStep() {
  return `
    <div class="submit-page page-enter">
      <h2 class="submit-title">연봉 제출 방법 선택</h2>
      <p class="submit-sub">모든 데이터는 익명으로 처리됩니다</p>

      <div class="method-cards">
        <div class="method-card" onclick="selectMethod('pdf')">
          <div class="method-icon">📄</div>
          <h3 class="method-title">PDF 업로드</h3>
          <p class="method-desc">급여명세서 PDF를 업로드하면 자동으로 데이터를 추출합니다</p>
          <div class="method-badges">
            <span class="badge badge-green">✅ 익명 처리</span>
            <span class="badge badge-green">✅ 인증 완료</span>
            <span class="badge badge-blue">🔒 암호화</span>
          </div>
          <div class="method-docs">
            <div class="doc-item">• 근로소득 원천징수영수증</div>
            <div class="doc-item">• 급여명세서</div>
            <div class="doc-item">• 연봉계약서</div>
          </div>
        </div>

        <div class="method-card" onclick="selectMethod('manual')">
          <div class="method-icon">✏️</div>
          <h3 class="method-title">직접 입력</h3>
          <p class="method-desc">연봉 항목을 직접 입력하여 제출합니다</p>
          <div class="method-badges">
            <span class="badge badge-green">✅ 익명 처리</span>
            <span class="badge badge-gray">⏱ 약 50초 소요</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDataStep() {
  const progressSteps = ['회사', '직군', '연봉', '완료'];
  const progressHtml = progressSteps.map((s, i) => `
    <div class="progress-step ${i <= 1 ? 'done' : ''}">
      <div class="progress-dot"></div>
      <div class="progress-label">${s}</div>
    </div>
  `).join('');

  const levelBtns = LEVELS.map(l => `
    <button class="level-btn ${_submitForm.level === l ? 'selected' : ''}"
      onclick="selectLevel('${l}')">${l}</button>
  `).join('');

  const locations = ['서울', '성남/판교', '수원', '인천', '부산', '대구', '대전', '광주', '기타'];
  const locationOptions = locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');

  const jobMenuHtml = _jobMenuOpen ? `
    <div class="job-dropdown open" id="jobDropdown">
      ${JOB_CATEGORIES.map(cat => `
        <div class="job-cat-header">${cat.category}</div>
        ${cat.jobs.map(j => `
          <div class="job-item" onclick="selectJob('${cat.category}', '${j}')">${j}</div>
        `).join('')}
      `).join('')}
    </div>
  ` : '';

  return `
    <div class="submit-page page-enter">
      <div class="progress-bar">
        ${progressHtml}
      </div>

      <div class="card submit-card">
        <h2 class="submit-title">연봉 정보 입력</h2>

        <div class="form-group">
          <label class="form-label">회사명</label>
          <input class="form-input" type="text" placeholder="예: 삼성전자"
            value="${_submitForm.company}"
            oninput="updateForm('company', this.value)" />
        </div>

        <div class="form-group">
          <label class="form-label">직군 선택</label>
          <div class="job-select-wrap">
            <button class="form-input job-select-btn" onclick="toggleJobMenu()">
              ${_submitForm.job || '직군을 선택하세요'} ▾
            </button>
            ${jobMenuHtml}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">레벨</label>
          <div class="level-btns">${levelBtns}</div>
        </div>

        <div class="form-group">
          <label class="form-label">기본급 (만원/년)</label>
          <input class="form-input" type="number" placeholder="예: 6000"
            value="${_submitForm.base}"
            oninput="updateForm('base', this.value)" />
        </div>

        <div class="form-group">
          <label class="form-label">주식·RSU (만원/년)</label>
          <input class="form-input" type="number" placeholder="예: 2000"
            value="${_submitForm.stock}"
            oninput="updateForm('stock', this.value)" />
        </div>

        <div class="form-group">
          <label class="form-label">보너스 (만원/년)</label>
          <input class="form-input" type="number" placeholder="예: 1000"
            value="${_submitForm.bonus}"
            oninput="updateForm('bonus', this.value)" />
        </div>

        <div class="form-group">
          <label class="form-label">근무지</label>
          <select class="form-input form-select" onchange="updateForm('location', this.value)">
            <option value="">선택하세요</option>
            ${locationOptions}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">총 경력 (년)</label>
          <input class="form-input" type="number" placeholder="예: 5"
            value="${_submitForm.years}"
            oninput="updateForm('years', this.value)" />
        </div>

        <button class="btn-submit-main" onclick="submitSalary()">제출하기 →</button>
      </div>
    </div>
  `;
}

function renderSuccessStep() {
  return `
    <div class="submit-page page-enter success-page">
      <div class="success-icon">🎉</div>
      <h2 class="success-title">제출 완료!</h2>
      <p class="success-desc">소중한 연봉 데이터를 공유해 주셔서 감사합니다.<br>검토 후 데이터베이스에 반영됩니다.</p>
      <div class="success-reward">
        <div class="reward-icon">🔓</div>
        <div class="reward-text">이제 전체 개별 데이터를 열람할 수 있습니다!</div>
      </div>
      <button class="btn-cta" onclick="goHome()">홈으로 돌아가기</button>
    </div>
  `;
}

function selectMethod(method) {
  _submitMethod = method;
  _submitStep = 2;
  renderApp();
}

function selectLevel(level) {
  _submitForm.level = level;
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim() === level);
  });
}

function toggleJobMenu() {
  _jobMenuOpen = !_jobMenuOpen;
  const wrap = document.querySelector('.job-select-wrap');
  if (!wrap) return;

  const existing = wrap.querySelector('.job-dropdown');
  if (existing) {
    existing.remove();
    _jobMenuOpen = false;
  } else {
    const menu = document.createElement('div');
    menu.className = 'job-dropdown open';
    menu.id = 'jobDropdown';
    menu.innerHTML = JOB_CATEGORIES.map(cat => `
      <div class="job-cat-header">${cat.category}</div>
      ${cat.jobs.map(j => `
        <div class="job-item" onclick="selectJob('${cat.category}', '${j}')">${j}</div>
      `).join('')}
    `).join('');
    wrap.appendChild(menu);
  }
}

function selectJob(cat, job) {
  _submitForm.jobCat = cat;
  _submitForm.job = job;
  _jobMenuOpen = false;
  const btn = document.querySelector('.job-select-btn');
  if (btn) btn.textContent = `${job} ▾`;
  const dropdown = document.getElementById('jobDropdown');
  if (dropdown) dropdown.remove();
}

function updateForm(field, value) {
  _submitForm[field] = value;
}

function submitSalary() {
  _submitStep = 3;
  renderApp();
}

function goHome() {
  _submitStep = 1;
  _submitMethod = '';
  _jobMenuOpen = false;
  _submitForm = { company: '', jobCat: '', job: '', level: '', base: '', stock: '', bonus: '', location: '', years: '' };
  navigate('home');
}
