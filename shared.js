// ── Shared utilities ────────────────────────────────
const fmt = {
  num:  v => Math.round(v).toLocaleString('ru'),
  pct:  (v, d=1) => v.toFixed(d) + '%',
  sum:  v => Math.round(v).toLocaleString('ru') + ' сум',
  mln:  v => (v/1_000_000).toFixed(1) + ' млн сум',
  time: (v, unit='ч') => v.toFixed(1) + ' ' + unit,
};

const CHART_GRID  = 'rgba(0,0,0,0.05)';
const CHART_TT = {
  backgroundColor: '#0F172A',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#F8FAFC',
  bodyColor: '#94A3B8',
  padding: 10,
  cornerRadius: 6,
};
const chartBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: CHART_TT },
};

Chart.defaults.color = '#94A3B8';
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.font.size = 11;

// Chart colors
const C_BLUE   = '#2563EB';
const C_BLUE2  = '#60A5FA';
const C_GREEN  = '#059669';
const C_GREEN2 = '#34D399';
const C_RED    = '#DC2626';
const C_RED2   = '#F87171';
const C_AMBER  = '#D97706';
const C_GRAY   = '#94A3B8';
const C_DARK   = '#334155';

// KPI card builder
function kpi(label, value, sub, color='blue', flag='') {
  const configs = {
    blue:  { accent: `linear-gradient(90deg,${C_BLUE},${C_BLUE2})`,   num: C_BLUE,   flagBg: '#EFF4FF', flagBr: '#BFCFFF', flagTxt: C_BLUE },
    green: { accent: `linear-gradient(90deg,${C_GREEN},${C_GREEN2})`, num: C_GREEN,  flagBg: '#ECFDF5', flagBr: '#A7F3D0', flagTxt: C_GREEN },
    red:   { accent: `linear-gradient(90deg,${C_RED},${C_RED2})`,     num: C_RED,    flagBg: '#FEF2F2', flagBr: '#FECACA', flagTxt: C_RED },
    amber: { accent: `linear-gradient(90deg,${C_AMBER},#FCD34D)`,     num: C_AMBER,  flagBg: '#FFFBEB', flagBr: '#FDE68A', flagTxt: C_AMBER },
    dark:  { accent: `linear-gradient(90deg,${C_DARK},${C_GRAY})`,    num: C_DARK,   flagBg: '#F1F5F9', flagBr: '#E2E8F0', flagTxt: C_DARK },
  };
  const cfg = configs[color] || configs.blue;
  const flagHtml = flag ? `<div class="kpi-flag" style="background:${cfg.flagBg};border-color:${cfg.flagBr};color:${cfg.flagTxt}">${flag}</div>` : '';
  return `<div class="kpi">
    <div class="kpi-accent" style="background:${cfg.accent}"></div>
    ${flagHtml}
    <div class="kpi-tag">${label}</div>
    <div class="kpi-n" style="color:${cfg.num}">${value}</div>
    <div class="kpi-sub">${sub}</div>
  </div>`;
}

// Operator table row
function opRow(op, maxT) {
  const bw = Math.round(op.tickets / maxT * 100);
  const rc = op.close_rate >= 99.5 ? 'ok' : op.close_rate >= 97 ? 'warn' : 'bad';
  const tc = op.avg_close <= 15 ? 'f' : op.avg_close <= 30 ? 'm' : 's';
  const sc = (op.sla_pct || 0) >= 98 ? 'ok' : (op.sla_pct || 0) >= 95 ? 'warn' : 'bad';
  const hasCost = op.cost !== undefined;
  const hasRating = op.rating_pct !== undefined && op.rated > 0;
  return `<tr>
    <td class="n-name">${op.name}</td>
    <td class="n-num">${fmt.num(op.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div><span class="bp">${bw}%</span></div></td>
    <td><span class="tv ${tc}">${op.avg_close} ч</span></td>
    <td><span class="b ${rc}">${op.close_rate}%</span></td>
    <td><span class="b ${sc}">${op.sla_pct || 0}%</span></td>
    ${hasRating ? `<td><span class="b ok">${op.rating_pct}%</span></td>` : ''}
    ${hasCost ? `<td class="cost-cell">${fmt.mln(op.cost)}</td>` : ''}
  </tr>`;
}

// Label row
function labelRow(lbl, maxT) {
  const bw = Math.round(lbl.tickets / maxT * 100);
  const upct = lbl.undesired ? Math.round(lbl.undesired / lbl.tickets * 100) : 0;
  return `<tr>
    <td class="lbl-name">${lbl.name}</td>
    <td class="n-num">${fmt.num(lbl.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div></div></td>
    <td><span class="b ${upct > 60 ? 'bad' : upct > 40 ? 'warn' : 'ok'}">${upct}% нежел.</span></td>
    <td class="cost-cell">${fmt.mln(lbl.cost)}</td>
  </tr>`;
}

// Company block
function companyBlock(comp, idx) {
  const upct = comp.undesired ? Math.round(comp.undesired / comp.tickets * 100) : 0;
  const labels = comp.top_labels.map(l =>
    `<span class="comp-label">${l.label} <strong>${l.count}</strong></span>`
  ).join('');
  return `<div class="comp-row">
    <div class="comp-rank">${String(idx + 1).padStart(2, '0')}</div>
    <div class="comp-main">
      <div class="comp-header">
        <span class="comp-name">${comp.name}</span>
        <span class="comp-tickets">${fmt.num(comp.tickets)} тик.</span>
        <span class="b ${upct > 60 ? 'bad' : upct > 40 ? 'warn' : 'ok'}">${upct}% нежел.</span>
        <span class="comp-cost">${fmt.mln(comp.cost)}</span>
      </div>
      <div class="comp-labels">${labels}</div>
    </div>
  </div>`;
}

// Chart builders — return chart instance for destroy
function buildStackedBar(id, labels, desired, undesired) {
  return new Chart(document.getElementById(id), {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Желательные',   data: desired,   backgroundColor: C_BLUE,  borderRadius: 3, stack: 'a' },
      { label: 'Нежелательные', data: undesired, backgroundColor: C_RED2,  borderRadius: 3, stack: 'a' },
    ]},
    options: { ...chartBase, scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } }, stacked: true },
      y: { grid: { color: CHART_GRID }, stacked: true, ticks: { font: { size: 10 } } },
    }},
  });
}

function buildHorizBar(id, labels, values, colorFn) {
  return new Chart(document.getElementById(id), {
    type: 'bar',
    data: { labels, datasets: [{
      data: values,
      backgroundColor: colorFn ? values.map((v, i) => colorFn(v, i)) : C_BLUE,
      borderRadius: 4,
    }]},
    options: { ...chartBase, indexAxis: 'y', scales: {
      x: { grid: { color: CHART_GRID }, ticks: { font: { size: 10 } } },
      y: { grid: { display: false },    ticks: { font: { size: 10 } } },
    }},
  });
}

function buildDoughnut(id, labels, values, colors) {
  return new Chart(document.getElementById(id), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
    options: { ...chartBase, cutout: '65%' },
  });
}
