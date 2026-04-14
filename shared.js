// ── Shared utilities ────────────────────────────────
const fmt = {
  num: v => Math.round(v).toLocaleString('ru'),
  pct: (v, d=1) => v.toFixed(d) + '%',
  sum: v => Math.round(v).toLocaleString('ru') + ' сум',
  mln: v => (v/1_000_000).toFixed(1) + ' млн сум',
  time: (v, unit='ч') => v.toFixed(1) + ' ' + unit,
};

const grid = 'rgba(255,255,255,0.04)';
const tooltip = {
  backgroundColor:'#1A1714',
  borderColor:'rgba(255,255,255,0.1)',
  borderWidth:1,
  titleColor:'#F2EDE6',
  bodyColor:'#C8C0B4',
  padding:10,
  cornerRadius:4
};
const chartBase = {
  responsive:true,
  maintainAspectRatio:false,
  plugins:{legend:{display:false},tooltip}
};

Chart.defaults.color = '#6B6458';
Chart.defaults.font.family = "'Manrope', sans-serif";
Chart.defaults.font.size = 11;

// Color helpers
const SAGE = '#7EC8A4', SAGE2 = '#4DA87C';
const ROSE = '#E8736D', ROSE2 = '#C85A55';
const GOLD = '#E8B86D', GOLD2 = '#C9963A';
const DIM  = '#3A3530';

function barColor(v, max) {
  const r = v/max;
  if (r > 0.85) return ROSE;
  if (r > 0.55) return GOLD;
  if (r > 0.25) return SAGE;
  return DIM;
}

// KPI card factory
function kpi(label, value, sub, color='gold', flag='') {
  const colors = {gold:GOLD, sage:SAGE, rose:ROSE};
  const c = colors[color] || GOLD;
  return `<div class="kpi">
    <div class="kpi-accent" style="background:linear-gradient(90deg,transparent,${c},transparent)"></div>
    ${flag ? `<div class="kpi-flag" style="color:${c};border-color:${c}22;background:${c}11">${flag}</div>` : ''}
    <div class="kpi-tag">${label}</div>
    <div class="kpi-n" style="color:${c}">${value}</div>
    <div class="kpi-sub">${sub}</div>
  </div>`;
}

// Operator table row
function opRow(op, maxT) {
  const bw = Math.round(op.tickets/maxT*100);
  const rc = op.close_rate >= 99.5 ? 'ok' : op.close_rate >= 97 ? 'warn' : 'bad';
  const tc = op.avg_close <= 15 ? 'f' : op.avg_close <= 30 ? 'm' : 's';
  const hasCost = op.cost !== undefined;
  return `<tr>
    <td class="n-name">${op.name}</td>
    <td class="n-num">${fmt.num(op.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div><span class="bp">${bw}%</span></div></td>
    <td><span class="tv ${tc}">${op.avg_close} ч</span></td>
    <td><span class="b ${rc}">${op.close_rate}%</span></td>
    ${op.rating_pct !== undefined ? `<td><span class="b ok">${op.rating_pct}%</span></td>` : ''}
    ${hasCost ? `<td class="cost-cell">${fmt.mln(op.cost)}</td>` : ''}
  </tr>`;
}

// Label row
function labelRow(lbl, maxT) {
  const bw = Math.round(lbl.tickets/maxT*100);
  const upct = lbl.undesired ? Math.round(lbl.undesired/lbl.tickets*100) : 0;
  return `<tr>
    <td class="lbl-name">${lbl.name}</td>
    <td class="n-num">${fmt.num(lbl.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%;background:linear-gradient(90deg,${GOLD2},${GOLD})"></div></div></div></td>
    <td><span class="b ${upct>60?'bad':upct>40?'warn':'ok'}">${upct}% нежел.</span></td>
    <td class="cost-cell">${fmt.mln(lbl.cost)}</td>
  </tr>`;
}

// Company block with label breakdown
function companyBlock(comp, idx) {
  const upct = comp.undesired ? Math.round(comp.undesired/comp.tickets*100) : 0;
  const labels = comp.top_labels.map(l =>
    `<span class="comp-label">${l.label} <strong>${l.count}</strong></span>`
  ).join('');
  return `<div class="comp-row">
    <div class="comp-rank">${String(idx+1).padStart(2,'0')}</div>
    <div class="comp-main">
      <div class="comp-header">
        <span class="comp-name">${comp.name}</span>
        <span class="comp-tickets">${fmt.num(comp.tickets)} тикетов</span>
        <span class="b ${upct>60?'bad':upct>40?'warn':'ok'}">${upct}% нежел.</span>
        <span class="comp-cost">${fmt.mln(comp.cost)}</span>
      </div>
      <div class="comp-labels">${labels}</div>
    </div>
  </div>`;
}

// Shared chart builders
function buildHourlyChart(id, values, labels) {
  const mx = Math.max(...values);
  new Chart(document.getElementById(id), {
    type:'bar',
    data:{labels, datasets:[{data:values,backgroundColor:values.map(v=>barColor(v,mx)),borderRadius:3}]},
    options:{...chartBase,scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:grid},ticks:{font:{size:10}}}}}
  });
}

function buildStackedBar(id, labels, desired, undesired) {
  new Chart(document.getElementById(id), {
    type:'bar',
    data:{labels,datasets:[
      {label:'Желательные',data:desired,backgroundColor:SAGE2,borderRadius:2,stack:'a'},
      {label:'Нежелательные',data:undesired,backgroundColor:ROSE2,borderRadius:2,stack:'a'}
    ]},
    options:{...chartBase,scales:{x:{grid:{display:false},ticks:{font:{size:10}},stacked:true},y:{grid:{color:grid},stacked:true}}}
  });
}

function buildHorizBar(id, labels, values, colorFn) {
  new Chart(document.getElementById(id), {
    type:'bar',
    data:{labels,datasets:[{data:values,backgroundColor:colorFn ? values.map(colorFn) : GOLD,borderRadius:3}]},
    options:{...chartBase,indexAxis:'y',scales:{x:{grid:{color:grid},ticks:{font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:10}}}}}
  });
}

function buildDoughnut(id, labels, values, colors) {
  new Chart(document.getElementById(id), {
    type:'doughnut',
    data:{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:2,borderColor:'#12100E'}]},
    options:{...chartBase,cutout:'65%'}
  });
}
