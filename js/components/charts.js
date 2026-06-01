// ─── CHART COMPONENTS ────────────────────────────────────────────────────────

function renderCareerTrajectoryChart(data) {
  const maxTotal = Math.max(...data.map(d => d.base + d.stock + d.bonus));

  const bars = data.map(d => {
    const total = d.base + d.stock + d.bonus;
    const pct = (total / maxTotal) * 100;
    const basePct = (d.base / total) * 100;
    const stockPct = (d.stock / total) * 100;
    const bonusPct = (d.bonus / total) * 100;

    return `
      <div class="bar-group">
        <div class="bar-stack" style="height:${pct * 1.6}px">
          <div class="bar-segment bar-bonus" style="height:${bonusPct}%"></div>
          <div class="bar-segment bar-stock" style="height:${stockPct}%"></div>
          <div class="bar-segment bar-base" style="height:${basePct}%"></div>
        </div>
        <div class="bar-label">${d.level}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="card">
      <h3 class="card-title">경력 궤적 차트</h3>
      <div class="chart-container">
        <div class="bar-chart">
          ${bars}
        </div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#22C55E"></div>기본급</div>
          <div class="legend-item"><div class="legend-dot" style="background:#3B82F6"></div>주식</div>
          <div class="legend-item"><div class="legend-dot" style="background:#F59E0B"></div>보너스</div>
        </div>
      </div>
    </div>
  `;
}

function renderSalaryRangeChart(data) {
  const MIN_VAL = 3000;
  const RANGE = 32000; // max scatter value ~35000

  function pct(val) {
    return clamp(((val - MIN_VAL) / RANGE) * 100, 0, 98);
  }

  const rows = Object.entries(data).map(([level, points]) => {
    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const leftPct = pct(minVal);
    const rightPct = 100 - pct(maxVal);

    const dots = points.map(p =>
      `<div class="range-dot" style="left:${pct(p)}%"></div>`
    ).join('');

    return `
      <div class="range-row">
        <span class="range-level-label">${level}</span>
        <div class="range-bar-wrap">
          <div class="range-line" style="left:${leftPct}%;right:${rightPct}%"></div>
          ${dots}
        </div>
        <span class="range-max">${maxVal.toLocaleString()}만</span>
      </div>
    `;
  }).join('');

  return `
    <div class="card">
      <h3 class="card-title">급여 범위 차트</h3>
      <div class="range-chart">
        ${rows}
      </div>
      <div class="range-x-axis" style="margin-top:8px">
        ${['₩0', '₩1천만', '₩2천만', '₩3천만', '최대'].map(l =>
          `<span class="range-x-label">${l}</span>`
        ).join('')}
      </div>
    </div>
  `;
}
