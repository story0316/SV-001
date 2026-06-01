// ─── SUBMIT PAGE ─────────────────────────────────────────────────────────────

let _submitStep = 1;
let _submitMethod = '';
let _submitForm = {
  company: '', jobCat: '', job: '', level: '',
  base: '', stock: '', bonus: '', location: '', years: ''
};
let _jobMenuOpen = false;

function renderSubmitPage() {
  return `
    <div class="submit-page page-enter">
      <div class="submit-card">
        <h2 class="submit-title">연봉 추가하기</h2>
        <p class="submit-subtitle">100만+ 건 제출 완료!</p>
        <div id="submitStepContent">
          ${renderSubmitStep()}
        </div>
      </div>
    </div>
  `;
}

function renderSubmitStep() {
  switch (_submitStep) {
    case 1: return renderMethodStep();
    case 2: return renderDataStep();
    case 3: return renderSuccessStep();
    default: return renderMethodStep();
  }
}

function renderMethodStep() {
  return `
    <div class="method-grid">
      <div class="method-card ${_submitMethod === 'pdf' ? 'selected' : ''}"
        onclick="selectMethod('pdf')">
        <div class="method-card-title">📄 PDF 업로드</div>
        <div class="method-card-sub">✓ 익명 처리</div>
        <div class="method-card-sub">✅ 인증 완료</div>
        <div class="method-card-sub">🔒 암호화 보안</div>
        <div class="method-card-note">오퍼레터 / 연봉확인서 / W2 / 기타</div>
      </div>
      <div class="method-card ${_submitMethod === 'manual' ? 'selected' : ''}"
        onclick="selectMethod('manual')">
        <div class="method-card-title">✏️ 직접 입력</div>
        <div class="method-card-sub">✓ 익명 처리</div>
        <div class="method-card-sub">⏱ 약 50초 소요</div>
      </div>
    </div>
  `;
}

function selectMethod(method) {
  _submitMethod = method;
  _submitStep = 2;
  const content = document.getElementById('submitStepContent');
  if (content) content.innerHTML = renderDataStep();
}

function renderDataStep() {
  const progSteps = ['회사', '직군', '연봉', '완료'];

  const jobDropdownHtml = JOB_CATEGORIES.map(cat => `
    <div class="job-cat-label">${cat.category}</div>
    ${cat.jobs.map(job => `
      <div class="job-option ${_submitForm.job === job ? 'selected' : ''}"
        onclick="selectJob('${cat.category}', '${job}')">
        ${job}
      </div>
    `).join('')}
  `).join('');

  const locations = ['서울', '판교/분당', '강남', '수원', '대전', '부산', '대구', '인천', '해외'];

  return `
    <!-- Progress -->
    <div class="progress-bar">
      ${progSteps.map((s, i) => `
        <div class="progress-step ${i < 2 ? 'done' : ''}"></div>
      `).join('')}
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Company -->
      <div class="form-group">
        <label class="form-label">회사명</label>
        <input class="form-input" type="text" value="${_submitForm.company}"
          placeholder="예: 삼성전자, 카카오, 네이버..."
          oninput="updateSubmitForm('company', this.value)" />
      </div>

      <!-- Job Category -->
      <div class="form-group">
        <label class="form-label">직군 선택</label>
        <div class="job-dropdown-wrap">
          <div class="job-dropdown-trigger ${_submitForm.job ? 'selected' : ''}"
            onclick="toggleJobMenu()">
            <span>${_submitForm.job || '소프트웨어 엔지니어'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="job-dropdown-menu ${_jobMenuOpen ? 'open' : ''}" id="jobDropdownMenu">
            ${jobDropdownHtml}
          </div>
        </div>
      </div>

      <!-- Level -->
      <div class="form-group">
        <label class="form-label">직급</label>
        <div class="level-btns">
          ${LEVELS.map(l => `
            <button class="level-btn ${_submitForm.level === l ? 'selected' : ''}"
              onclick="updateSubmitForm('level', '${l}')">${l}</button>
          `).join('')}
        </div>
      </div>

      <!-- Salary -->
      <div class="form-group">
        <label class="form-label">연봉 구성 (만원)</label>
        <div class="salary-inputs">
          ${[['기본급', 'base'], ['주식(연간)', 'stock'], ['보너스', 'bonus']].map(([label, key]) => `
            <div class="salary-input-wrap">
              <div class="salary-input-label">${label}</div>
              <input class="salary-input" type="number" value="${_submitForm[key]}"
                placeholder="5000"
                oninput="updateSubmitForm('${key}', this.value)" />
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Location & Years -->
      <div class="form-group">
        <div class="row-2">
          <div>
            <label class="form-label">지역</label>
            <select class="form-select" onchange="updateSubmitForm('location', this.value)">
              <option value="">선택</option>
              ${locations.map(l => `<option value="${l}" ${_submitForm.location === l ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">경력 연수</label>
            <input class="form-input" type="number" value="${_submitForm.years}"
              placeholder="5"
              oninput="updateSubmitForm('years', this.value)" />
          </div>
        </div>
      </div>

      <button class="btn-submit" onclick="submitSalary()">제출하기</button>
    </div>
  `;
}

function renderSuccessStep() {
  return `
    <div class="success-wrap">
      <div class="success-emoji">🎉</div>
      <h3 class="success-title">제출 완료!</h3>
      <p class="success-desc">
        연봉 정보가 익명으로 등록되었습니다.<br>
        데이터를 공유해 주셔서 감사합니다.
      </p>
      <button class="btn-home" onclick="goHome()">홈으로 돌아가기</button>
    </div>
  `;
}

function toggleJobMenu() {
  _jobMenuOpen = !_jobMenuOpen;
  const menu = document.getElementById('jobDropdownMenu');
  if (menu) menu.classList.toggle('open', _jobMenuOpen);
}

function selectJob(cat, job) {
  _submitForm.job = job;
  _submitForm.jobCat = cat;
  _jobMenuOpen = false;
  refreshDataStep();
}

function updateSubmitForm(key, value) {
  _submitForm[key] = value;
  if (key === 'level') refreshDataStep();
}

function refreshDataStep() {
  const content = document.getElementById('submitStepContent');
  if (content) content.innerHTML = renderDataStep();
}

function submitSalary() {
  _submitStep = 3;
  const content = document.getElementById('submitStepContent');
  if (content) content.innerHTML = renderSuccessStep();
}

function goHome() {
  _submitStep = 1;
  _submitForm = { company: '', jobCat: '', job: '', level: '', base: '', stock: '', bonus: '', location: '', years: '' };
  _submitMethod = '';
  navigate('home');
}

// Close job menu when clicking outside
document.addEventListener('click', (e) => {
  const wrap = e.target.closest('.job-dropdown-wrap');
  if (!wrap && _jobMenuOpen) {
    _jobMenuOpen = false;
    const menu = document.getElementById('jobDropdownMenu');
    if (menu) menu.classList.remove('open');
  }
});
