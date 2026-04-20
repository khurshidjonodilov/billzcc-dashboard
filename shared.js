const fmt = {
  num:  v => Math.round(v).toLocaleString('ru'),
  pct:  (v, d=1) => Number(v).toFixed(d) + '%',
  mln:  v => (v/1_000_000).toFixed(1) + ' млн сум',
  time: (v, u='ч') => Number(v).toFixed(1) + ' ' + u,
};

const CHART_GRID = 'rgba(255,255,255,0.06)';
const CHART_TT = {
  backgroundColor:'#0D1526', borderColor:'rgba(255,255,255,0.1)', borderWidth:1,
  titleColor:'#F1F5FF', bodyColor:'#7E92BC', padding:10, cornerRadius:6,
};
const chartBase = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{display:false}, tooltip:CHART_TT },
};

Chart.defaults.color = '#7E92BC';
Chart.defaults.font.family = "'Outfit', sans-serif";
Chart.defaults.font.size = 11;

const C = {
  blue:'#3B82F6', blue2:'#60A5FA', blueDk:'#1D4ED8',
  green:'#10B981', green2:'#34D399',
  red:'#EF4444', red2:'#F87171',
  amber:'#F59E0B', amber2:'#FCD34D',
  gray:'#475569', gray2:'#64748B',
};

function kpi(label, value, sub, color='blue', flag='') {
  const cfg = {
    blue:  {ac:`linear-gradient(90deg,${C.blueDk},${C.blue2})`, num:C.blue2,  fb:'rgba(59,130,246,.15)', fc:'rgba(96,165,250,.35)', ft:C.blue2},
    green: {ac:`linear-gradient(90deg,${C.green},${C.green2})`, num:C.green2, fb:'rgba(16,185,129,.12)', fc:'rgba(52,211,153,.25)', ft:C.green2},
    red:   {ac:`linear-gradient(90deg,${C.red},${C.red2})`,     num:C.red2,   fb:'rgba(239,68,68,.12)',  fc:'rgba(248,113,113,.25)',ft:C.red2},
    amber: {ac:`linear-gradient(90deg,${C.amber},${C.amber2})`, num:C.amber2, fb:'rgba(245,158,11,.12)', fc:'rgba(252,211,77,.25)', ft:C.amber2},
    dark:  {ac:`linear-gradient(90deg,#334155,#64748B)`,        num:'#94A3B8', fb:'rgba(100,116,139,.1)',fc:'rgba(148,163,184,.2)', ft:'#94A3B8'},
    gold:  {ac:`linear-gradient(90deg,${C.amber},${C.amber2})`, num:C.amber2, fb:'rgba(245,158,11,.12)', fc:'rgba(252,211,77,.25)', ft:C.amber2},
    sage:  {ac:`linear-gradient(90deg,${C.green},${C.green2})`, num:C.green2, fb:'rgba(16,185,129,.12)', fc:'rgba(52,211,153,.25)', ft:C.green2},
    rose:  {ac:`linear-gradient(90deg,${C.red},${C.red2})`,     num:C.red2,   fb:'rgba(239,68,68,.12)',  fc:'rgba(248,113,113,.25)',ft:C.red2},
  }[color]||{ac:`linear-gradient(90deg,${C.blueDk},${C.blue2})`,num:C.blue2,fb:'rgba(59,130,246,.15)',fc:'rgba(96,165,250,.35)',ft:C.blue2};

  const flagHtml = flag
    ? `<div class="kpi-flag" style="background:${cfg.fb};border-color:${cfg.fc};color:${cfg.ft}">${flag}</div>`
    : '';
  return `<div class="kpi">
    <div class="kpi-accent" style="background:${cfg.ac}"></div>
    ${flagHtml}
    <div class="kpi-tag">${label}</div>
    <div class="kpi-n" style="color:${cfg.num}">${value}</div>
    <div class="kpi-sub">${sub}</div>
  </div>`;
}

function opRow(op, maxT) {
  const bw = Math.round(op.tickets/maxT*100);
  const rc = op.close_rate>=99.5?'ok':op.close_rate>=97?'warn':'bad';
  const tc = op.avg_close<=15?'f':op.avg_close<=30?'m':'s';
  const sc = (op.sla_pct||0)>=98?'ok':(op.sla_pct||0)>=95?'warn':'bad';
  return `<tr>
    <td class="n-name">${op.name}</td>
    <td class="n-num">${fmt.num(op.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div><span class="bp">${bw}%</span></div></td>
    <td><span class="tv ${tc}">${op.avg_close} ч</span></td>
    <td><span class="b ${rc}">${op.close_rate}%</span></td>
    <td><span class="b ${sc}">${op.sla_pct||0}%</span></td>
    ${op.rating_pct!==undefined&&op.rated>0?`<td><span class="b ok">${op.rating_pct}%</span></td>`:''}
    ${op.cost!==undefined?`<td class="cost-cell">${fmt.mln(op.cost)}</td>`:''}
  </tr>`;
}

function labelRow(lbl, maxT) {
  const bw = Math.round(lbl.tickets/maxT*100);
  const upct = lbl.undesired ? Math.round(lbl.undesired/lbl.tickets*100) : 0;
  return `<tr>
    <td class="lbl-name">${lbl.name}</td>
    <td class="n-num">${fmt.num(lbl.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div></div></td>
    <td><span class="b ${upct>60?'bad':upct>40?'warn':'ok'}">${upct}% нежел.</span></td>
    <td class="cost-cell">${fmt.mln(lbl.cost)}</td>
  </tr>`;
}

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
        <span class="comp-tickets">${fmt.num(comp.tickets)} тик.</span>
        <span class="b ${upct>60?'bad':upct>40?'warn':'ok'}">${upct}% нежел.</span>
        <span class="comp-cost">${fmt.mln(comp.cost)}</span>
      </div>
      <div class="comp-labels">${labels}</div>
    </div>
  </div>`;
}

function buildStackedBar(id, labels, desired, undesired) {
  return new Chart(document.getElementById(id), {
    type:'bar',
    data:{labels,datasets:[
      {label:'Желательные',   data:desired,   backgroundColor:C.blue,  borderRadius:3, stack:'a'},
      {label:'Нежелательные', data:undesired, backgroundColor:C.red2,  borderRadius:3, stack:'a'},
    ]},
    options:{...chartBase,scales:{
      x:{grid:{display:false},ticks:{font:{size:10}},stacked:true},
      y:{grid:{color:CHART_GRID},stacked:true,ticks:{font:{size:10}}},
    }},
  });
}

function buildHorizBar(id, labels, values, colorFn) {
  return new Chart(document.getElementById(id), {
    type:'bar',
    data:{labels,datasets:[{
      data:values,
      backgroundColor: colorFn ? values.map((v,i)=>colorFn(v,i)) : C.blue,
      borderRadius:4,
    }]},
    options:{...chartBase,indexAxis:'y',scales:{
      x:{grid:{color:CHART_GRID},ticks:{font:{size:10}}},
      y:{grid:{display:false},ticks:{font:{size:10}}},
    }},
  });
}

function buildDoughnut(id, labels, values, colors) {
  return new Chart(document.getElementById(id), {
    type:'doughnut',
    data:{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:2,borderColor:'#152038'}]},
    options:{...chartBase,cutout:'65%'},
  });
}
