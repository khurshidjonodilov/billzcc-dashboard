const fmt={
  num: v=>Math.round(v).toLocaleString('ru'),
  pct: (v,d=1)=>Number(v).toFixed(d)+'%',
  mln: v=>(v/1_000_000).toFixed(2)+' млн сум',
  sec: v=>v<60?Math.round(v)+'с':Math.floor(v/60)+'м '+Math.round(v%60)+'с',
};
const CHART_GRID='rgba(255,255,255,0.05)';
const CHART_TT={backgroundColor:'#0D1526',borderColor:'rgba(255,255,255,0.1)',borderWidth:1,
  titleColor:'#E2E8F0',bodyColor:'#64748B',padding:10,cornerRadius:7};
const chartBase={responsive:true,maintainAspectRatio:false,
  plugins:{legend:{display:false},tooltip:CHART_TT}};
Chart.defaults.color='#4A5568';
Chart.defaults.font.family="'Inter',system-ui,sans-serif";
Chart.defaults.font.size=10;

const C={blue:'#3B82F6',blue2:'#60A5FA',blueDk:'#1D4ED8',
  green:'#10B981',green2:'#34D399',red:'#EF4444',red2:'#F87171',
  amber:'#F59E0B',amber2:'#FCD34D',purple:'#8B5CF6',purple2:'#C4B5FD'};

function sparkSVG(vals,color,fill){
  if(!vals||!vals.length)return'';
  const w=120,h=34,p=2;
  const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;
  const pts=vals.map((v,i)=>{
    const x=p+(i/(vals.length-1||1))*(w-p*2);
    const y=h-p-(v-mn)/rng*(h-p*2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const close=pts+` ${w-p},${h} ${p},${h}`;
  return `<svg viewBox="0 0 ${w} ${h}" class="kpi-spark" preserveAspectRatio="none">
    <polyline points="${close}" fill="${fill}" stroke="none"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`;
}

function kpiCfg(c){
  return({
    blue:  {ac:`linear-gradient(90deg,${C.blueDk},${C.blue2})`, num:C.blue2,  fb:'rgba(59,130,246,.10)',fc:'rgba(96,165,250,.25)',ft:C.blue2, chip:'b'},
    green: {ac:`linear-gradient(90deg,${C.green},${C.green2})`, num:C.green2, fb:'rgba(16,185,129,.10)',fc:'rgba(52,211,153,.25)',ft:C.green2,chip:'g'},
    red:   {ac:`linear-gradient(90deg,#991B1B,${C.red2})`,      num:C.red2,   fb:'rgba(239,68,68,.10)', fc:'rgba(248,113,113,.25)',ft:C.red2, chip:'r'},
    amber: {ac:`linear-gradient(90deg,#78350F,${C.amber2})`,    num:C.amber2, fb:'rgba(245,158,11,.10)',fc:'rgba(252,211,77,.25)', ft:C.amber2,chip:'a'},
    purple:{ac:`linear-gradient(90deg,#4C1D95,${C.purple2})`,   num:C.purple2,fb:'rgba(139,92,246,.10)',fc:'rgba(196,181,253,.25)',ft:C.purple2,chip:'p'},
    sage:  {ac:`linear-gradient(90deg,${C.green},${C.green2})`, num:C.green2, fb:'rgba(16,185,129,.10)',fc:'rgba(52,211,153,.25)',ft:C.green2,chip:'g'},
    rose:  {ac:`linear-gradient(90deg,#991B1B,${C.red2})`,      num:C.red2,   fb:'rgba(239,68,68,.10)', fc:'rgba(248,113,113,.25)',ft:C.red2, chip:'r'},
    amber2:{ac:`linear-gradient(90deg,#78350F,${C.amber2})`,    num:C.amber2, fb:'rgba(245,158,11,.10)',fc:'rgba(252,211,77,.25)', ft:C.amber2,chip:'a'},
    gold:  {ac:`linear-gradient(90deg,#78350F,${C.amber2})`,    num:C.amber2, fb:'rgba(245,158,11,.10)',fc:'rgba(252,211,77,.25)', ft:C.amber2,chip:'a'},
    dark:  {ac:`linear-gradient(90deg,#1E293B,#475569)`,        num:'#94A3B8', fb:'rgba(71,85,105,.1)', fc:'rgba(148,163,184,.2)', ft:'#94A3B8',chip:'b'},
  }[c])||{ac:`linear-gradient(90deg,${C.blueDk},${C.blue2})`,num:C.blue2,fb:'rgba(59,130,246,.10)',fc:'rgba(96,165,250,.25)',ft:C.blue2,chip:'b'};
}

function kpi(label,value,sub,color,flag,sparkVals,chips){
  color=color||'blue';flag=flag||'';sparkVals=sparkVals||[];chips=chips||[];
  const cfg=kpiCfg(color);
  const flagHtml=flag?`<div class="kpi-flag" style="background:${cfg.fb};border-color:${cfg.fc};color:${cfg.ft}">${flag}</div>`:'';
  const spark=sparkVals.length?sparkSVG(sparkVals,cfg.num,cfg.fb):'';
  const chipsHtml=chips.length?`<div class="kpi-chips">${chips.map(c=>`<span class="kpi-chip ${cfg.chip}">${c}</span>`).join('')}</div>`:'';
  return `<div class="kpi"><div class="kpi-accent" style="background:${cfg.ac}"></div>${flagHtml}<div class="kpi-tag">${label}</div><div class="kpi-n" style="color:${cfg.num}">${value}</div><div class="kpi-sub">${sub}</div>${spark}${chipsHtml}</div>`;
}

function opRow(op,maxT){
  const bw=Math.round(op.tickets/maxT*100);
  const rc=op.close_rate>=99.5?'ok':op.close_rate>=97?'warn':'bad';
  const tc=op.avg_close<=15?'f':op.avg_close<=30?'m':'s';
  const sc=(op.sla_pct||0)>=80?'ok':(op.sla_pct||0)>=65?'warn':'bad';
  return `<tr><td class="n-name">${op.name}</td><td class="n-num">${fmt.num(op.tickets)}</td><td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div><span class="bp">${bw}%</span></div></td><td><span class="tv ${tc}">${op.avg_close} ч</span></td><td><span class="b ${rc}">${op.close_rate}%</span></td><td><span class="b ${sc}">${op.sla_pct||0}%</span></td>${op.rating_pct!==undefined&&op.rated>0?`<td><span class="b ok">${op.rating_pct}%</span></td>`:''}${op.cost!==undefined?`<td class="cost-cell">${fmt.mln(op.cost)}</td>`:''}</tr>`;
}

function labelRow(lbl,maxT){
  const bw=Math.round(lbl.tickets/maxT*100);
  const upct=lbl.undesired?Math.round(lbl.undesired/lbl.tickets*100):0;
  return `<tr><td class="lbl-name">${lbl.name}</td><td class="n-num">${fmt.num(lbl.tickets)}</td><td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div></div></td><td><span class="b ${upct>60?'bad':upct>40?'warn':'ok'}">${upct}% нежел.</span></td><td class="cost-cell">${fmt.mln(lbl.cost)}</td></tr>`;
}

function companyBlock(comp,idx){
  const upct=comp.undesired?Math.round(comp.undesired/comp.tickets*100):0;
  const labels=(comp.top_labels||[]).map(l=>`<span class="comp-label">${l.label} <strong>${l.count}</strong></span>`).join('');
  return `<div class="comp-row"><div class="comp-rank">${String(idx+1).padStart(2,'0')}</div><div class="comp-main"><div class="comp-header"><span class="comp-name">${comp.name}</span><span class="comp-tickets">${fmt.num(comp.tickets)} тик.</span><span class="b ${upct>60?'bad':upct>40?'warn':'ok'}">${upct}% нежел.</span><span class="comp-cost">${fmt.mln(comp.cost)}</span></div><div class="comp-labels">${labels}</div></div></div>`;
}

function buildStackedBar(id,labels,desired,undesired){
  return new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:[
    {label:'Желательные',data:desired,backgroundColor:C.green,borderRadius:3,stack:'a'},
    {label:'Нежелательные',data:undesired,backgroundColor:C.red2,borderRadius:3,stack:'a'},
  ]},options:{...chartBase,scales:{x:{grid:{display:false},ticks:{font:{size:10}},stacked:true},y:{grid:{color:CHART_GRID},stacked:true,ticks:{font:{size:10}}}}}});
}

function buildHorizBar(id,labels,values,colorFn){
  return new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:[{
    data:values,backgroundColor:colorFn?values.map((v,i)=>colorFn(v,i)):C.blue,borderRadius:4,
  }]},options:{...chartBase,indexAxis:'y',scales:{x:{grid:{color:CHART_GRID},ticks:{font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:10}}}}}});
}

function buildDoughnut(id,labels,values,colors){
  return new Chart(document.getElementById(id),{type:'doughnut',
    data:{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:2,borderColor:'#06090F'}]},
    options:{...chartBase,cutout:'65%'}});
}

function buildChannelChart(id,labels,callsData,chatsData){
  return new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:[
    {label:'Звонки %',data:callsData,backgroundColor:'rgba(59,130,246,0.75)',borderRadius:3,stack:'a'},
    {label:'Чаты %',data:chatsData,backgroundColor:'rgba(139,92,246,0.75)',borderRadius:3,stack:'a'},
  ]},options:{...chartBase,scales:{
    x:{grid:{display:false},ticks:{font:{size:10}},stacked:true},
    y:{grid:{color:CHART_GRID},stacked:true,max:100,ticks:{font:{size:10},callback:v=>v+'%'}},
  },plugins:{...chartBase.plugins,legend:{display:true,labels:{color:'#4A5568',font:{size:10}}}}}});
}

/* ── SHARED INIT ── */
document.addEventListener('DOMContentLoaded',function(){
  const saved=localStorage.getItem('billz_theme');
  if(saved==='light')document.body.classList.add('light');

  const btn=document.getElementById('themeBtn');
  if(btn){
    const isLight=document.body.classList.contains('light');
    btn.querySelector('.toggle-icon').textContent=isLight?'🌙':'☀️';
    const lbl=btn.querySelector('#themeLabel');
    if(lbl)lbl.textContent=isLight?'Тёмная':'Светлая';
  }

  document.querySelectorAll('.nav-link').forEach(link=>{
    link.addEventListener('click',function(e){
      const href=this.getAttribute('href');
      if(!href||href.startsWith('#'))return;
      const cur=window.location.pathname.split('/').pop()||'index.html';
      if(href===cur)return;
      e.preventDefault();
      const wrap=document.querySelector('.wrap');
      if(wrap){wrap.style.animation='pageOut .16s ease forwards';setTimeout(()=>{window.location.href=href;},150);}
      else window.location.href=href;
    });
  });
});

function toggleTheme(){
  const isLight=document.body.classList.toggle('light');
  localStorage.setItem('billz_theme',isLight?'light':'dark');
  const btn=document.getElementById('themeBtn');
  if(btn){
    btn.querySelector('.toggle-icon').textContent=isLight?'🌙':'☀️';
    const lbl=btn.querySelector('#themeLabel');
    if(lbl)lbl.textContent=isLight?'Тёмная':'Светлая';
  }
  if(typeof render==='function'){try{render();}catch(e){}}
}

function checkAndExport(){
  const pwd=prompt('🔒 Введите пароль для скачивания:');
  if(pwd===null)return;
  if(pwd==='khbillz2023'){exportCSExcel();}
  else alert('❌ Неверный пароль.');
}
// ===== PREMIUM CHART GLOW =====

Chart.defaults.elements.line = {
  borderWidth: 2,
  tension: 0.4
};

Chart.register({
  id: 'glow',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(59,130,246,0.5)';
    ctx.shadowBlur = 12;
    ctx.restore();
  }
});
