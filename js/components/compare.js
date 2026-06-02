// ─── BENEFITS COMPARE PAGE ───────────────────────────────────────────────────

let _compareSelected = ['삼성전자', '카카오'];

function renderBenefitsComparePage() {
  const companyBtns = POPULAR_COMPANIES.map(c => `
    <button class="compare-company-btn ${_compareSelected.includes(c.name) ? 'selected' : ''}"
      onclick="toggleCompareCompany('${c.name}')">
      ${_compareSelected.includes(c.name) ? '✓ ' : ''}${c.name}
    </button>
  `).join('');

  return `
    <div class="compare-page page-enter">
      <h2 class="compare-title">복리후생 비교</h2>
      <p class="compare-sub">최대 3개 회사를 비교할 수 있습니다.</p>

      <div class="compare-company-btns" id="compareBtns">${companyBtns}</div>

      <div id="compareTable">${renderCompareTable()}</div>
    </div>
  `;
}

function renderCompareTable() {
  if (_compareSelected.length === 0) return '<p class="compare-empty">회사를 선택해 주세요.</p>';

  const gridCols = `160px ${_compareSelected.map(() => '1fr').join(' ')}`;

  const headerHtml = `
    <div class="compare-table-header" style="grid-template-columns:${gridCols}">
      <div class="compare-header-label">복리후생</div>
      ${_compareSelected.map(c => `<div class="compare-header-company">${c}</div>`).join('')}
    </div>
  `;

  const rowsHtml = BENEFITS.slice(0, 3).flatMap(b =>
    b.items.slice(0, 5).map(item => `
      <div class="compare-row" style="grid-template-columns:${gridCols}">
        <div class="compare-row-label">${item}</div>
        ${_compareSelected.map(() => {
          const has = Math.random() > 0.3;
          return `
            <div class="compare-row-cell">
              ${has
                ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `)
  ).join('');

  return `<div class="compare-table">${headerHtml}${rowsHtml}</div>`;
}

function toggleCompareCompany(name) {
  if (_compareSelected.includes(name)) {
    _compareSelected = _compareSelected.filter(c => c !== name);
  } else if (_compareSelected.length < 3) {
    _compareSelected = [..._compareSelected, name];
  }

  const btns = document.getElementById('compareBtns');
  if (btns) {
    btns.innerHTML = POPULAR_COMPANIES.map(c => `
      <button class="compare-company-btn ${_compareSelected.includes(c.name) ? 'selected' : ''}"
        onclick="toggleCompareCompany('${c.name}')">
        ${_compareSelected.includes(c.name) ? '✓ ' : ''}${c.name}
      </button>
    `).join('');
  }

  const table = document.getElementById('compareTable');
  if (table) table.innerHTML = renderCompareTable();
}
