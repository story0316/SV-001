// ─── CHART COMPONENTS ────────────────────────────────────────────────────────

function renderCareerTrajectoryChart(data) {
  const maxTotal = Math.max(...data.map(d => d.base + d.stock + d.bonus));

  const bars = data.map(d => {
    const total = d.base + d.stock + d.bonus;
    const baseH  = (d.base  / maxTotal * 100).toFixed(1);
    const stockH = (d.stock / maxTotal * 100).toFixed(1);
    const bonusH = (d.bonus / maxTotal * 100).toFixed(1);

    return `
      <div class="chart-bar-group">
        <div class="chart-bar-stack">
          <div class="bar-bonus"  style="height:${bonusH}%" title="보너스 ${formatMan(d.bonus)}"></div>
          <div class="bar-stock"  style="height:${stockH}%" title="주식 ${formatMan(d.stock)}"></div>
          <div class="bar-base"   style="height:${baseH}%"  title="기본급 ${formatMan(d.base)}"></div>
        </div>
        <div class="chart-bar-label">${d.level}</div>
        <div class="chart-bar-total">${formatMan(total)}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="chart-wrap">
      <div class="chart-legend">
        <span class="legend-dot dot-base"></span>기본급
        <span class="legend-dot dot-stock"></span>주식
        <span class="legend-dot dot-bonus"></span>보너스
      </div>
      <div class="chart-bars">${bars}</div>
    </div>
  `;
}

function renderSalaryRangeChart(data) {
  const allVals = Object.values(data).flat();
  const minVal = Math.min(...allVals) - 500;
  const maxVal = Math.max(...allVals) + 500;
  const range  = maxVal - minVal;

  const rows = Object.entries(data).map(([level, vals]) => {
    const dots = vals.map(v => {
      const pct = clamp(((v - minVal) / range) * 100, 0, 98);
      return `<div class="range-dot" style="left:${pct}%" title="${formatMan(v)}"></div>`;
    }).join('');

    const minPct = clamp(((Math.min(...vals) - minVal) / range) * 100, 0, 98);
    const maxPct = clamp(((Math.max(...vals) - minVal) / range) * 100, 0, 98);

    return `
      <div class="range-row">
        <div class="range-label">${level}</div>
        <div class="range-track">
          <div class="range-line" style="left:${minPct}%;width:${maxPct - minPct}%"></div>
          ${dots}
        </div>
        <div class="range-val">${formatMan(Math.round((Math.min(...vals) + Math.max(...vals)) / 2))}</div>
      </div>
    `;
  }).join('');

  return `<div class="range-chart">${rows}</div>`;
}
