/* ══════════════════════════════════════════════════════════════════════════
   BILLZ_MONTH_SWITCHER — выбор месяца сохраняется в localStorage
   и применяется ко всем страницам сайта
   ══════════════════════════════════════════════════════════════════════════ */
(function() {
  if (typeof BILLZ_DATA === 'undefined' || !BILLZ_DATA.months) return;
  
  // Read selected month from localStorage (default = 'apr')
  const KEY = 'billz_selected_month';
  let selected = localStorage.getItem(KEY) || BILLZ_DATA.current_month || 'apr';
  if (!BILLZ_DATA.months[selected]) selected = BILLZ_DATA.current_month || 'apr';
  
  const monthData = BILLZ_DATA.months[selected];
  
  // Override main data structures with selected month's data
  if (monthData.monthly) BILLZ_DATA.monthly = monthData.monthly;
  if (monthData.weekly) BILLZ_DATA.weekly = monthData.weekly;
  if (monthData.daily) BILLZ_DATA.daily = monthData.daily;
  if (monthData.cs) BILLZ_DATA.cs = monthData.cs;
  
  // Make selection available globally
  BILLZ_DATA._selectedMonth = selected;
  BILLZ_DATA._monthLabel = monthData.label;
  BILLZ_DATA._monthHasData = monthData.has_data;
  
  // Quarterly: keep all months (no override) — it shows all 3 cumulatively
})();

/* ── Build month dropdown into navbar ───────────────────────────────────── */
function buildMonthSwitcher() {
  if (typeof BILLZ_DATA === 'undefined' || !BILLZ_DATA.months) return;
  const nav = document.querySelector('.top-nav') || document.querySelector('.nav') || document.querySelector('nav');
  if (!nav) return;
  if (document.getElementById('monthSwitcher')) return; // already built
  
  const current = BILLZ_DATA._selectedMonth || 'apr';
  const monthLabels = {
    'mar': 'Март 2026',
    'apr': 'Апрель 2026',
    'may': 'Май 2026',
    'jun': 'Июнь 2026'
  };
  
  // Build container
  const wrap = document.createElement('div');
  wrap.id = 'monthSwitcher';
  wrap.style.cssText = 'position:relative;display:inline-block;margin-right:14px';
  
  // Trigger button (looks like other nav buttons)
  const btn = document.createElement('button');
  btn.id = 'monthSwitcherBtn';
  btn.type = 'button';
  btn.style.cssText = `
    padding:8px 14px;border-radius:9px;
    border:1px solid rgba(59,130,246,0.35);
    background:linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.12));
    color:#60A5FA;font-family:inherit;font-size:12px;font-weight:700;
    cursor:pointer;transition:all .2s;
    display:inline-flex;align-items:center;gap:8px;white-space:nowrap;
  `;
  btn.innerHTML = `
    <span style="font-size:14px">📅</span>
    <span>${monthLabels[current] || 'Месяц'}</span>
    <span id="msArrow" style="font-size:10px;transition:transform .2s">▼</span>
  `;
  
  // Dropdown menu
  const menu = document.createElement('div');
  menu.id = 'monthSwitcherMenu';
  menu.style.cssText = `
    position:absolute;top:calc(100% + 6px);left:0;
    min-width:180px;display:none;
    background:#0D1117;
    border:1px solid rgba(59,130,246,0.25);
    border-radius:10px;padding:6px;
    box-shadow:0 12px 40px rgba(0,0,0,0.5);
    z-index:1000;
  `;
  
  const months = [
    {key:'mar', label:'Март 2026', has_data: BILLZ_DATA.months.mar?.has_data},
    {key:'apr', label:'Апрель 2026', has_data: BILLZ_DATA.months.apr?.has_data},
    {key:'may', label:'Май 2026', has_data: BILLZ_DATA.months.may?.has_data},
    {key:'jun', label:'Июнь 2026', has_data: BILLZ_DATA.months.jun?.has_data},
    {key:'jul', label:'Июль 2026', has_data: BILLZ_DATA.months.jul?.has_data},
  ];
  
  months.forEach(m => {
    const item = document.createElement('button');
    item.type = 'button';
    const isActive = m.key === current;
    const hasD = m.has_data;
    item.style.cssText = `
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      width:100%;padding:9px 12px;border-radius:7px;
      border:1px solid ${isActive ? 'rgba(59,130,246,0.4)' : 'transparent'};
      background:${isActive ? 'rgba(59,130,246,0.15)' : 'transparent'};
      color:${isActive ? '#60A5FA' : (hasD ? '#E5E7EB' : '#64748B')};
      font-family:inherit;font-size:12px;font-weight:${isActive ? '700' : '600'};
      cursor:pointer;text-align:left;transition:all .15s;
    `;
    item.onmouseover = () => { if (!isActive) { item.style.background = 'rgba(255,255,255,0.05)'; item.style.color = '#F9FAFB'; }};
    item.onmouseout = () => { if (!isActive) { item.style.background = 'transparent'; item.style.color = hasD ? '#E5E7EB' : '#64748B'; }};
    
    const tag = isActive 
      ? '<span style="font-size:9px;padding:2px 6px;background:rgba(59,130,246,0.25);color:#60A5FA;border-radius:4px;font-weight:700">текущий</span>'
      : (hasD ? '' : '<span style="font-size:9px;padding:2px 6px;background:rgba(100,116,139,0.2);color:#94A3B8;border-radius:4px;font-weight:600">нет данных</span>');
    
    item.innerHTML = `<span>${m.label}</span>${tag}`;
    item.onclick = (e) => {
      e.stopPropagation();
      localStorage.setItem('billz_selected_month', m.key);
      window.location.reload();
    };
    menu.appendChild(item);
  });
  
  wrap.appendChild(btn);
  wrap.appendChild(menu);
  
  // Insert at the very BEGINNING of nav (before any other links)
  const brand = nav.querySelector('.nav-brand');
  if (brand) {
    brand.insertAdjacentElement('afterend', wrap);
  } else {
    nav.insertBefore(wrap, nav.firstChild);
  }
  
  // Toggle menu
  let menuOpen = false;
  btn.onclick = (e) => {
    e.stopPropagation();
    menuOpen = !menuOpen;
    menu.style.display = menuOpen ? 'block' : 'none';
    document.getElementById('msArrow').style.transform = menuOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  };
  document.addEventListener('click', (e) => {
    if (menuOpen && !wrap.contains(e.target)) {
      menuOpen = false;
      menu.style.display = 'none';
      const arr = document.getElementById('msArrow');
      if (arr) arr.style.transform = 'rotate(0deg)';
    }
  });
  
  // If selected month has no data — show banner at top of page content
  if (!BILLZ_DATA._monthHasData) {
    const wrap2 = document.querySelector('.wrap') || document.querySelector('main') || document.body;
    if (wrap2 && !document.getElementById('noDataBanner')) {
      const banner = document.createElement('div');
      banner.id = 'noDataBanner';
      banner.style.cssText = `
        margin:14px 0;padding:14px 18px;
        background:linear-gradient(90deg,rgba(245,158,11,0.10),rgba(245,158,11,0.04));
        border:1px solid rgba(245,158,11,0.3);border-left:3px solid #F59E0B;
        border-radius:10px;color:#FCD34D;font-size:12px;font-weight:600;
        display:flex;align-items:center;gap:12px;
      `;
      banner.innerHTML = `
        <span style="font-size:20px">⏳</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:#FBBF24;margin-bottom:3px">
            Данные за ${BILLZ_DATA._monthLabel || 'этот месяц'} ещё не загружены
          </div>
          <div style="font-size:11px;color:#FCD34D;font-weight:500">
            Все показатели отображаются как 0. Данные появятся после загрузки CSV-выгрузки за месяц.
          </div>
        </div>
      `;
      // Insert as first child of wrap (or right after navbar)
      const navEl = document.querySelector('.top-nav, .nav, nav');
      if (navEl && navEl.parentElement) {
        navEl.insertAdjacentElement('afterend', banner);
      } else if (wrap2.firstChild) {
        wrap2.insertBefore(banner, wrap2.firstChild);
      }
    }
  }
}


/* ── Update page headers/labels based on selected month ─────────────────── */
function updatePageHeaders() {
  if (typeof BILLZ_DATA === 'undefined') return;
  const selected = BILLZ_DATA._selectedMonth || 'apr';
  const label = BILLZ_DATA._monthLabel || 'Апрель 2026';
  const hasData = BILLZ_DATA._monthHasData !== false;
  
  const monthNames = {
    'mar': {ru: 'Март', short:'Март 2026', period: '01–31 марта 2026', genitive:'марта', prepositional:'марте', upper:'МАРТ', low:'март'},
    'apr': {ru: 'Апрель', short:'Апрель 2026', period: '01–30 апреля 2026', genitive:'апреля', prepositional:'апреле', upper:'АПРЕЛЬ', low:'апрель'},
    'may': {ru: 'Май', short:'Май 2026', period: '01–31 мая 2026', genitive:'мая', prepositional:'мае', upper:'МАЙ', low:'май'},
    'jun': {ru: 'Июнь', short:'Июнь 2026', period: '01–21 июня 2026', genitive:'июня', prepositional:'июне', upper:'ИЮНЬ', low:'июнь'},
  };
  const mn = monthNames[selected] || monthNames['apr'];
  
  // 1) Main page title (#phTitle) — always update
  const phTitle = document.getElementById('phTitle');
  if (phTitle) {
    // Preserve format like "Апрель <em>2026</em>" or "Операторы <em>· Апрель 2026</em>"
    phTitle.innerHTML = phTitle.innerHTML
      .replace(/Апрель/g, mn.ru)
      .replace(/Март/g, mn.ru)
      .replace(/Май/g, mn.ru);
  }

  // 2) All [data-month-label] spans — direct text replacement
  document.querySelectorAll('[data-month-label]').forEach(el => {
    el.textContent = mn.short;
  });

  // 3) [data-cs-period] spans for CS page
  document.querySelectorAll('[data-cs-period]').forEach(el => {
    el.textContent = mn.short;
  });
  
  // 3b) Special-form month label spans (genitive/prepositional/upper/low)
  document.querySelectorAll('[data-month-label-genitive]').forEach(el => {
    el.textContent = mn.genitive;
  });
  document.querySelectorAll('[data-month-label-prepos]').forEach(el => {
    el.textContent = mn.prepositional;
  });
  document.querySelectorAll('[data-month-label-upper]').forEach(el => {
    el.textContent = mn.upper;
  });
  document.querySelectorAll('[data-month-label-low]').forEach(el => {
    el.textContent = mn.low;
  });

  // 4) #phSub
  const phSub = document.getElementById('phSub');
  if (phSub) phSub.textContent = mn.period;

  // 5) Live indicator at top right
  const live = document.querySelector('.live');
  if (live) {
    live.innerHTML = `<span class="live-dot"></span>период: ${mn.period}`;
  }

  // 6) Walk through static section titles and update April → current month
  document.querySelectorAll('.sec-title, .ct, .card-title, .phdr-eyebrow, .team-alert-title, .export-bar-title, .export-bar-sub, .cost-ey, .cost-d, .phdr-sub, .card-note').forEach(el => {
    if (!el.textContent) return;
    const orig = el.textContent;
    let updated = orig
      .replace(/АПРЕЛЬ 2026/g, `${mn.ru.toUpperCase()} 2026`)
      .replace(/АПРЕЛЯ 2026/g, `${mn.ru.toUpperCase()}А 2026`)
      .replace(/АПРЕЛЬ/g, mn.ru.toUpperCase())
      .replace(/Апрель 2026/g, mn.short)
      .replace(/Апреля 2026/g, mn.ru + 'я 2026')
      .replace(/апрель 2026/gi, mn.short)
      .replace(/АПРЕЛЯ/g, mn.ru.toUpperCase()+'А')
      .replace(/Апреля/g, mn.ru + 'я')
      .replace(/апреля/g, mn.genitive)
      .replace(/апрель/g, mn.ru.toLowerCase())
      .replace(/Итоги апреля/g, `Итоги ${mn.genitive}`)
      .replace(/Январь–Апрель 2026/g, `Январь–${mn.ru} 2026`);
    if (updated !== orig) el.textContent = updated;
  });
  
  // 7) Walk through any text node with hardcoded "апрель" patterns
  // (covers free-floating text in headers like "Операторы — апрель 2026")
  document.querySelectorAll('h1, h2, h3, h4, div, span, p').forEach(el => {
    // Skip script tags, already-bound elements, and elements with children
    if (el.children.length > 0) return;
    if (!el.textContent || el.textContent.length > 200) return;
    const orig = el.textContent;
    if (!/[Аа]прел[ьея]/.test(orig)) return;
    let updated = orig
      .replace(/Апрель 2026/g, mn.short)
      .replace(/апрель 2026/g, mn.short.toLowerCase())
      .replace(/Апреля 2026/g, mn.ru + 'я 2026')
      .replace(/апреля 2026/g, mn.genitive + ' 2026')
      .replace(/АПРЕЛЬ 2026/g, `${mn.ru.toUpperCase()} 2026`)
      .replace(/АПРЕЛЯ 2026/g, `${mn.ru.toUpperCase()}А 2026`)
      .replace(/Апреля/g, mn.ru + 'я')
      .replace(/апреля/g, mn.genitive)
      .replace(/Апрель(?=[^а-я])/g, mn.ru)
      .replace(/апрель(?=[^а-я])/g, mn.ru.toLowerCase())
      .replace(/АПРЕЛЬ(?=[^А-Я])/g, mn.ru.toUpperCase());
    if (updated !== orig) el.textContent = updated;
  });

  // 7) Replace hardcoded "Апрель" in plain text nodes (last resort) for elements we missed
  document.querySelectorAll('.tabs-list span, .tabs span, button').forEach(el => {
    if (!el.textContent) return;
    if (el.textContent.includes('Апрель 2026') || el.textContent.includes('· Апрель')) {
      el.textContent = el.textContent
        .replace(/Апрель 2026/g, mn.short)
        .replace(/· Апрель/g, '· ' + mn.ru);
    }
  });
}

/* ── Show "no data" placeholder for empty pages ─────────────────────────── */
function showNoDataPlaceholder() {
  if (typeof BILLZ_DATA === 'undefined') return;
  const selected = BILLZ_DATA._selectedMonth || 'apr';
  if (selected === 'apr') return; // April has full data
  
  // Check if current page is week/cs and the data is missing/empty
  const path = window.location.pathname;
  const monthData = BILLZ_DATA.months[selected];
  if (!monthData) return;
  
  // For weekly page - check if weekly has any data
  if (path.includes('weekly')) {
    const wk = monthData.weekly || {};
    const hasWeeks = Object.keys(wk).some(k => wk[k].tickets > 0);
    if (!hasWeeks) injectNoDataBanner('еженедельная статистика', selected);
  }
  
  // For cs page - check cs data
  if (path.includes('cs.html')) {
    const cs = monthData.cs || {};
    if (!cs.total_train_tickets || cs.total_train_tickets === 0) {
      injectNoDataBanner('CS-аналитика', selected);
    }
  }
}

function injectNoDataBanner(sectionName, month) {
  const monthLabels = {'mar':'Март','apr':'Апрель','may':'Май','jun':'Июнь'};
  const wrap = document.querySelector('.wrap') || document.querySelector('main') || document.body;
  if (!wrap || document.getElementById('noDataPageBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'noDataPageBanner';
  banner.style.cssText = `margin:14px 0;padding:18px 22px;
    background:linear-gradient(90deg,rgba(245,158,11,0.10),rgba(245,158,11,0.04));
    border:1px solid rgba(245,158,11,0.3);border-left:3px solid #F59E0B;
    border-radius:10px;color:#FCD34D;font-size:12px;font-weight:600;`;
  banner.innerHTML = `<div style="display:flex;align-items:center;gap:14px">
    <span style="font-size:24px">⏳</span>
    <div>
      <div style="font-size:14px;font-weight:700;color:#FBBF24;margin-bottom:4px">
        ${sectionName} за ${monthLabels[month]} 2026 пока недоступна
      </div>
      <div style="font-size:11px;color:#FCD34D;font-weight:500;line-height:1.55">
        ${month==='may' ? 'Данные за май пока за 1–4 мая (частично). Полная еженедельная и CS-аналитика появится по итогам месяца.' : 'Загрузите CSV-выгрузку или CS-отчёт за этот период, и я обновлю эту страницу.'}
      </div>
    </div>
  </div>`;
  // Insert after first visible header
  const firstHeader = wrap.querySelector('.phdr, .sec, h1');
  if (firstHeader && firstHeader.parentElement === wrap) {
    firstHeader.insertAdjacentElement('afterend', banner);
  } else {
    wrap.insertBefore(banner, wrap.firstChild);
  }
}

// Run after switcher is built
const _origBuildSwitcher = buildMonthSwitcher;
buildMonthSwitcher = function() {
  _origBuildSwitcher();
  updatePageHeaders();
  showNoDataPlaceholder();
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildMonthSwitcher);
} else {
  buildMonthSwitcher();
}

// ── Inject global "last updated" banner right under top-nav ──────────────
function injectUpdatedBanner() {
  try {
    if (typeof BILLZ_DATA === 'undefined') return;
    const dateStr = (BILLZ_DATA.data_last_refreshed)
      || (BILLZ_DATA.last_updated && (BILLZ_DATA.last_updated.daily || BILLZ_DATA.last_updated.weekly || BILLZ_DATA.last_updated.monthly))
      || '24.05.2026';
    const nav = document.querySelector('nav.top-nav');
    if (!nav) return;
    // Avoid duplicate banners
    if (document.getElementById('updatedBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'updatedBanner';
    banner.setAttribute('style',
      'display:flex;align-items:center;justify-content:center;gap:10px;' +
      'padding:6px 16px;background:rgba(15,23,42,0.5);border-bottom:1px solid rgba(96,165,250,0.15);' +
      'font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#94A3B8;letter-spacing:.04em');
    banner.innerHTML =
      '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 6px rgba(16,185,129,0.6)"></span>' +
      '<span>Данные актуальны на</span>' +
      '<span style="color:#34D399;font-weight:700">' + dateStr + '</span>' +
      '<span style="color:var(--text4,#64748B)">·</span>' +
      '<span>источник: Omnidesk CRM + АТС OnlinePBX</span>';
    nav.insertAdjacentElement('afterend', banner);
  } catch(e) { /* silent */ }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUpdatedBanner);
} else {
  injectUpdatedBanner();
}

const fmt = {
  num:  v => Math.round(v).toLocaleString('ru'),
  pct:  (v, d=1) => Number(v).toFixed(d) + '%',
  mln:  v => (v/1_000_000).toFixed(2) + ' млн сум',
  mlnS: v => (v/1_000_000).toFixed(1) + ' млн',
  sec:  v => v < 60 ? Math.round(v) + 'с' : Math.floor(v/60) + 'м ' + Math.round(v%60) + 'с',
};

/* ── Chart engine — neon/glow style ────────────────────────────────────── */
/* CHART_GRID computed dynamically */
function getChartGrid() {
  return document.body.classList.contains('light') ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)';
}
const CHART_GRID = 'rgba(255,255,255,0.06)'; // default, updated per-chart

const CHART_TT = {
  backgroundColor: '#0D1117',
  borderColor: 'rgba(59,130,246,0.3)',
  borderWidth: 1,
  titleColor: '#F9FAFB',
  bodyColor: '#94A3B8',
  padding: 12, cornerRadius: 10,
  displayColors: true,
  boxPadding: 4,
};
const chartBase = {
  responsive: true, maintainAspectRatio: false,
  animation: { duration: 800, easing: 'easeInOutQuart' },
  plugins: { legend: { display: false }, tooltip: CHART_TT },
};
Chart.defaults.color = '#4B5563';
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size = 10;

/* Neon color palette */
const C = {
  blue:   '#3B82F6', blue2:  '#60A5FA', blueDk: '#1D4ED8',
  green:  '#10B981', green2: '#34D399',
  red:    '#EF4444', red2:   '#F87171',
  amber:  '#F59E0B', amber2: '#FCD34D',
  purple: '#8B5CF6', purple2:'#C4B5FD',
  cyan:   '#06B6D4', cyan2:  '#67E8F9',
  pink:   '#EC4899', pink2:  '#F9A8D4',
};

/* Neon colors list for multi-series */

// Helper: convert #RRGGBB to {r,g,b}
function hexRGB(hex) {
  const h = String(hex).replace('#','').padStart(6,'0');
  return {
    r: parseInt(h.slice(0,2), 16),
    g: parseInt(h.slice(2,4), 16),
    b: parseInt(h.slice(4,6), 16),
  };
}

const NEON_COLORS = [
  '#3B82F6','#10B981','#8B5CF6','#F59E0B',
  '#EF4444','#06B6D4','#EC4899','#34D399',
  '#60A5FA','#FCD34D','#F87171','#C4B5FD',
];

/* Create canvas gradient fill for area charts */
function neonGradient(ctx, color, alpha1=0.28, alpha2=0.01) {
  try {
    // Chart.js 4.x passes ScriptableContext; extract real canvas context
    const realCtx = ctx && ctx.chart ? ctx.chart.ctx : ctx;
    const h = (ctx && ctx.chart) ? ctx.chart.height : (ctx.canvas?.offsetHeight || ctx.canvas?.height || 300);
    const g = realCtx.createLinearGradient(0, 0, 0, h);
    const hex = color.replace('#','');
    const r = parseInt(hex.slice(0,2),16);
    const gr = parseInt(hex.slice(2,4),16);
    const b2 = parseInt(hex.slice(4,6),16);
    g.addColorStop(0,   `rgba(${r},${gr},${b2},${alpha1})`);
    g.addColorStop(0.6, `rgba(${r},${gr},${b2},${alpha1*0.3})`);
    g.addColorStop(1,   `rgba(${r},${gr},${b2},${alpha2})`);
    return g;
  } catch(e) {
    const hex = color.replace('#','');
    const r=parseInt(hex.slice(0,2),16),gr=parseInt(hex.slice(2,4),16),b2=parseInt(hex.slice(4,6),16);
    return `rgba(${r},${gr},${b2},${alpha1})`;
  }
}

/* ── NEON LINE CHART ────────────────────────────────────────────────────── */
function buildNeonLine(id, labels, datasets, opts={}) {
  const canvas = document.getElementById(id);
  if(!canvas) return null;

  const isDark = !document.body.classList.contains('light');
  const gridColor = isDark ? 'rgba(255,255,255,0.055)' : 'rgba(26,86,219,0.08)';
  const tickColor = isDark ? '#4B5563' : '#6B7280';

  const ds = datasets.map((d, i) => {
    const color = d.color || NEON_COLORS[i % NEON_COLORS.length];
    return {
      label: d.label || '',
      data: d.data,
      borderColor: color,
      borderWidth: d.width || 3.0,
      pointRadius: d.points !== false ? (d.pointSizes || 4) : 0,
      pointHoverRadius: 7,
      pointBackgroundColor: color,
      pointBorderColor: isDark ? '#0A0C10' : '#FFFFFF',
      pointBorderWidth: 1.5,
      fill: d.fill !== false,
      backgroundColor: d.fill !== false
        ? (ctx2) => {
            try {
              const realCtx = ctx2 && ctx2.chart ? ctx2.chart.ctx : ctx2;
              const h = ctx2 && ctx2.chart ? ctx2.chart.height : 300;
              const gr = realCtx.createLinearGradient(0, 0, 0, h);
              const hex = color.replace('#','');
              const r = parseInt(hex.slice(0,2),16);
              const g = parseInt(hex.slice(2,4),16);
              const b = parseInt(hex.slice(4,6),16);
              gr.addColorStop(0, `rgba(${r},${g},${b},0.28)`);
              gr.addColorStop(0.5, `rgba(${r},${g},${b},0.10)`);
              gr.addColorStop(1, `rgba(${r},${g},${b},0.01)`);
              return gr;
            } catch(e) { return color + '22'; }
          }
        : 'transparent',
      tension: d.tension !== undefined ? d.tension : 0.4,
      borderDash: d.dash || [],
      yAxisID: d.y2 ? 'y2' : 'y',
    };
  });

  return new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: ds },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 1000, easing: 'easeInOutCubic' },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: tickColor, maxRotation: 0, maxTicksLimit: opts.maxTicks || 9, font: { size: 10 } },
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: tickColor, callback: opts.yFmt || (v => v), font: { size: 10 } },
          min: opts.yMin, max: opts.yMax,
        },
        ...(opts.y2 ? { y2: { position: 'right', grid: { display: false },
          ticks: { color: tickColor, callback: opts.y2Fmt || (v => v), font: { size: 10 } } } } : {}),
      },
      plugins: {
        legend: {
          display: datasets.length > 1,
          position: 'top', align: 'end',
          labels: { color: isDark ? '#9CA3AF' : '#6B7280', font: { size: 10 },
            padding: 12, usePointStyle: true, pointStyleWidth: 8 },
        },
        tooltip: {
          ...CHART_TT,
          callbacks: {
            label: opts.tooltipFmt || (ctx => {
              const v = ctx.raw;
              const fmt = opts.yFmt;
              return ` ${ctx.dataset.label || ''}: ${fmt ? fmt(v) : typeof v === 'number' ? v.toLocaleString('ru') : v}`;
            })
          }
        },
      },
    },
  });
}

/* ── NEON BAR CHART ─────────────────────────────────────────────────────── */
function buildNeonBar(id, labels, datasets, opts={}) {
  const canvas = document.getElementById(id);
  if(!canvas) return null;
  const isDark = !document.body.classList.contains('light');
  const gridColor = isDark ? 'rgba(255,255,255,0.055)' : 'rgba(26,86,219,0.08)';
  const tickColor = isDark ? '#4B5563' : '#6B7280';

  const ds = datasets.map((d, i) => {
    const color = d.color || NEON_COLORS[i % NEON_COLORS.length];
    const hex = color.replace('#','');
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    return {
      label: d.label || '',
      data: d.data,
      backgroundColor: Array.isArray(d.data) && d.colorFn
        ? d.data.map((v, j) => d.colorFn(v, j, color))
        : `rgba(${r},${g},${b},0.82)`,
      borderColor: color,
      borderWidth: 1,
      borderRadius: opts.radius !== undefined ? opts.radius : 6,
      borderSkipped: false,
      stack: d.stack,
      yAxisID: d.y2 ? 'y2' : 'y',
    };
  });

  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: ds },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeInOutQuart' },
      indexAxis: opts.horizontal ? 'y' : 'x',
      scales: {
        x: {
          grid: opts.horizontal ? { color: gridColor } : { display: false },
          ticks: { color: tickColor, maxRotation: 0, maxTicksLimit: 10, font: { size: 10 } },
          stacked: !!opts.stacked,
        },
        y: {
          grid: opts.horizontal ? { display: false } : { color: gridColor },
          ticks: { color: tickColor, callback: opts.yFmt || (v => v), font: { size: 10 } },
          stacked: !!opts.stacked,
          min: opts.yMin, max: opts.yMax,
        },
        ...(opts.y2 ? { y2: { position: 'right', grid: { display: false },
          ticks: { color: tickColor, callback: opts.y2Fmt || (v=>v), font:{size:10} } } } : {}),
      },
      plugins: {
        legend: {
          display: datasets.length > 1,
          position: 'top', align: 'end',
          labels: { color: isDark ? '#9CA3AF' : '#6B7280', font: { size: 10 },
            padding: 12, usePointStyle: true, pointStyleWidth: 8 },
        },
        tooltip: {
          ...CHART_TT,
          callbacks: {
            label: opts.tooltipFmt || (ctx => {
              const v = ctx.raw;
              const fmt = opts.yFmt;
              return ` ${ctx.dataset.label || ''}: ${fmt ? fmt(v) : typeof v === 'number' ? v.toLocaleString('ru') : v}`;
            })
          }
        },
      },
    },
  });
}

function buildNeonDoughnut(id, labels, values, colors, opts={}) {
  const canvas = document.getElementById(id);
  if(!canvas) return null;
  const isDark = !document.body.classList.contains('light');
  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c+'CC'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 10,
        hoverBorderWidth: 3,
      }],
    },
    options: {
      ...chartBase,
      cutout: opts.cutout || '65%',
      plugins: {
        ...chartBase.plugins,
        legend: {
          display: true,
          position: opts.legendPos || 'bottom',
          labels: { color: isDark ? '#9CA3AF' : '#6B7280',
            font: { size: 11 }, padding: 14, usePointStyle: true },
        },
        tooltip: { ...CHART_TT },
      },
    },
  });
}

/* ── NEON HORIZONTAL BAR ────────────────────────────────────────────────── */
function buildNeonHorizBar(id, labels, values, colorFn, opts={}) {
  return buildNeonBar(id, labels, [{
    data: values,
    colorFn: colorFn,
  }], { ...opts, horizontal: true });
}

/* Backward compat wrappers */
function buildStackedBar(id,labels,desired,undesired) {
  return buildNeonBar(id,labels,[
    {label:'Желательные',data:desired,color:'#10B981',stack:'a'},
    {label:'Нежелательные',data:undesired,color:'#EF4444',stack:'a'},
  ],{stacked:true});
}
function buildHorizBar(id,labels,values,colorFn) {
  return buildNeonHorizBar(id,labels,values,colorFn);
}
function buildDoughnut(id,labels,values,colors) {
  return buildNeonDoughnut(id,labels,values,colors);
}
function buildChannelChart(id,labels,callsData,chatsData) {
  return buildNeonBar(id,labels,[
    {label:'Звонки %',data:callsData,color:'#3B82F6',stack:'a'},
    {label:'Чаты %',data:chatsData,color:'#8B5CF6',stack:'a'},
  ],{stacked:true,yFmt:v=>v+'%',yMax:100});
}
function buildLine(id,labels,datasets) {
  return buildNeonLine(id,labels,datasets);
}


/* ── KPI config по цвету ────────────────────────────────────────────────── */
const kpiColors = {
  blue:   { ac: `linear-gradient(90deg,${C.blueDk},${C.blue2})`,   num: C.blue2,   glow: 'rgba(59,130,246,0.2)',   chip: 'b' },
  green:  { ac: `linear-gradient(90deg,#065F46,${C.green2})`,      num: C.green2,  glow: 'rgba(16,185,129,0.2)',   chip: 'g' },
  sage:   { ac: `linear-gradient(90deg,#065F46,${C.green2})`,      num: C.green2,  glow: 'rgba(16,185,129,0.2)',   chip: 'g' },
  red:    { ac: `linear-gradient(90deg,#7F1D1D,${C.red2})`,        num: C.red2,    glow: 'rgba(239,68,68,0.2)',    chip: 'r' },
  rose:   { ac: `linear-gradient(90deg,#7F1D1D,${C.red2})`,        num: C.red2,    glow: 'rgba(239,68,68,0.2)',    chip: 'r' },
  amber:  { ac: `linear-gradient(90deg,#78350F,${C.amber2})`,      num: C.amber2,  glow: 'rgba(245,158,11,0.2)',   chip: 'a' },
  gold:   { ac: `linear-gradient(90deg,#78350F,${C.amber2})`,      num: C.amber2,  glow: 'rgba(245,158,11,0.2)',   chip: 'a' },
  purple: { ac: `linear-gradient(90deg,#4C1D95,${C.purple2})`,     num: C.purple2, glow: 'rgba(139,92,246,0.2)',   chip: 'p' },
  cyan:   { ac: `linear-gradient(90deg,#164E63,${C.cyan2})`,       num: C.cyan2,   glow: 'rgba(6,182,212,0.2)',    chip: 'w' },
  dark:   { ac: `linear-gradient(90deg,#1F2937,#6B7280)`,          num: '#9CA3AF', glow: 'rgba(107,114,128,0.15)', chip: 'b' },
};
function kpiCfg(c) { return kpiColors[c] || kpiColors.blue; }

/* ── Sparkline SVG (как glowing chart на первом скрине) ─────────────────── */
function sparkSVG(vals, color, glowColor) {
  if (!vals || !vals.length) return '';
  const W = 200, H = 48, P = 2;
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1;
  const pts = vals.map((v, i) => {
    const x = P + (i / (vals.length - 1 || 1)) * (W - P * 2);
    const y = H - P - (v - mn) / rng * (H - P * 2 - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const close = pts + ` ${W-P},${H} ${P},${H}`;
  const gradId = 'g' + Math.random().toString(36).slice(2,6);
  return `<svg viewBox="0 0 ${W} ${H}" class="kpi-spark" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
      </linearGradient>
      <filter id="f${gradId}">
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <polyline points="${close}" fill="url(#${gradId})" stroke="none"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8"
      stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="4"
      stroke-linejoin="round" stroke-linecap="round" opacity="0.15" filter="url(#f${gradId})"/>
  </svg>`;
}

/* ── kpi() ────────────────────────────────────────────────────────────────
   kpi(label, value, sub, color='blue', flag='', sparkVals=[], chips=[], formula='')
*/
function kpi(label, value, sub, color, flag, sparkVals, chips, formula) {
  color = color || 'blue';
  flag = flag || '';
  sparkVals = sparkVals || [];
  chips = chips || [];
  formula = formula || '';
  const cfg = kpiCfg(color);

  const flagHtml = flag
    ? `<div class="kpi-flag" style="background:${cfg.glow};border-color:${cfg.num}40;color:${cfg.num}">${flag}</div>`
    : '';
  const spark = sparkVals.length ? sparkSVG(sparkVals, cfg.num, cfg.glow) : '';
  const chipsHtml = chips.length
    ? `<div class="kpi-chips">${chips.map(c => `<span class="kpi-chip ${cfg.chip}">${c}</span>`).join('')}</div>`
    : '';
  const formulaHtml = formula
    ? `<div class="kpi-formula">📐 ${formula}</div>`
    : '';

  return `<div class="kpi">
    <div class="kpi-accent" style="background:${cfg.ac}"></div>
    <div class="kpi-glow" style="background:radial-gradient(circle,${cfg.glow},transparent 70%)"></div>
    ${flagHtml}
    <div class="kpi-tag">${label}</div>
    <div class="kpi-n" style="color:${cfg.num}">${value}</div>
    <div class="kpi-sub">${sub}</div>
    ${spark}
    ${chipsHtml}
    ${formulaHtml}
  </div>`;
}

/* ── Row helpers ─────────────────────────────────────────────────────────── */
function opRow(op, maxT) {
  const bw = Math.round(op.tickets / maxT * 100);
  const rc = op.close_rate >= 99.5 ? 'ok' : op.close_rate >= 97 ? 'warn' : 'bad';
  const tc = op.avg_close <= 15 ? 'f' : op.avg_close <= 35 ? 'm' : 's';
  const sc = (op.sla_pct || 0) >= 80 ? 'ok' : (op.sla_pct || 0) >= 65 ? 'warn' : 'bad';
  return `<tr>
    <td class="n-name">${op.name}</td>
    <td class="n-num">${fmt.num(op.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div><span class="bp">${bw}%</span></div></td>
    <td><span class="tv ${tc}">${op.avg_close} ч</span></td>
    <td><span class="b ${rc}">${op.close_rate}%</span></td>
    <td><span class="b ${sc}">${op.sla_pct || 0}%</span></td>
    ${op.rating_pct !== undefined && (op.rated || 0) > 0
      ? `<td><span class="b ok">${op.rating_pct}%</span></td>` : ''}
    ${op.cost !== undefined
      ? `<td class="cost-cell">${fmt.mln(op.cost)}</td>` : ''}
  </tr>`;
}

function labelRow(lbl, maxT) {
  const bw = Math.round(lbl.tickets / maxT * 100);
  const upct = lbl.undesired ? Math.round(lbl.undesired / lbl.tickets * 100) : 0;
  return `<tr>
    <td class="lbl-name">${lbl.name}</td>
    <td class="n-num">${fmt.num(lbl.tickets)}</td>
    <td><div class="bw"><div class="bb"><div class="bf" style="width:${bw}%"></div></div></div></td>
    <td><span class="b ${upct > 60 ? 'bad' : upct > 40 ? 'warn' : 'ok'}">${upct}% нжл.</span></td>
    <td class="cost-cell">${fmt.mln(lbl.cost)}</td>
  </tr>`;
}

function companyBlock(comp, idx) {
  const upct = comp.undesired ? Math.round(comp.undesired / comp.tickets * 100) : 0;
  const labels = (comp.top_labels || []).map(l =>
    `<span class="comp-label">${l.label} <strong>${l.count}</strong></span>`).join('');
  return `<div class="comp-row">
    <div class="comp-rank">${String(idx + 1).padStart(2, '0')}</div>
    <div class="comp-main">
      <div class="comp-header">
        <span class="comp-name">${comp.name}</span>
        <span class="comp-tickets">${fmt.num(comp.tickets)} тик.</span>
        <span class="b ${upct > 60 ? 'bad' : upct > 40 ? 'warn' : 'ok'}">${upct}% нжл.</span>
        <span class="comp-cost">${fmt.mln(comp.cost)}</span>
      </div>
      <div class="comp-labels">${labels}</div>
    </div>
  </div>`;
}

/* ── Shared init ─────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  // Apply saved theme
  const savedTheme = localStorage.getItem('billz_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
  }
  // Sync floating panel
  const isLight = document.body.classList.contains('light');
  const icon = document.getElementById('themeIcon');
  const lbl  = document.getElementById('themeLabel');
  if (icon) icon.textContent = isLight ? '🌙' : '☀️';
  if (lbl)  lbl.textContent  = isLight ? 'Тёмная' : 'Светлая';
  
  const panel = document.getElementById('actionPanel');
  if (panel && isLight) {
    panel.style.background = 'rgba(255,255,255,0.96)';
    panel.style.borderColor = 'rgba(26,86,219,0.15)';
  }
  // Smooth nav transitions
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const cur = window.location.pathname.split('/').pop() || 'index.html';
      if (href === cur) return;
      e.preventDefault();
      const wrap = document.querySelector('.wrap');
      if (wrap) {
        wrap.style.animation = 'wrapOut .16s ease forwards';
        setTimeout(() => { window.location.href = href; }, 150);
      } else {
        window.location.href = href;
      }
    });
  });
});

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('billz_theme', isLight ? 'light' : 'dark');
  
  // Update floating panel button
  const icon = document.getElementById('themeIcon');
  const lbl  = document.getElementById('themeLabel');
  const btn  = document.getElementById('themeBtn');
  if (icon) icon.textContent = isLight ? '🌙' : '☀️';
  if (lbl)  lbl.textContent  = isLight ? 'Тёмная' : 'Светлая';
  
  // Update panel bg for light theme
  const panel = document.getElementById('actionPanel');
  if (panel) {
    panel.style.background = isLight
      ? 'rgba(255,255,255,0.96)' 
      : 'rgba(8,9,13,0.92)';
    panel.style.borderColor = isLight
      ? 'rgba(26,86,219,0.15)'
      : 'rgba(255,255,255,0.08)';
    if (btn) {
      btn.style.background = isLight ? 'rgba(26,86,219,0.08)' : 'rgba(255,255,255,0.07)';
      btn.style.borderColor = isLight ? 'rgba(26,86,219,0.2)' : 'rgba(255,255,255,0.12)';
      btn.style.color = isLight ? '#1A56DB' : '#9CA3AF';
    }
  }
  
  if (typeof render === 'function') { try { render(); } catch(e) {} }
}

function checkAndExport() {
  const pwd = prompt('🔒 Введите пароль для скачивания:');
  if (pwd === null) return;
  if (pwd === 'khbillz2023') { exportCSExcel(); }
  else { alert('❌ Неверный пароль.'); }
}

/* ── PNG Export ────────────────────────────────────────────────────────── */
async function exportPagePNG(selector, filename) {
  const btn = document.getElementById('pngExportBtn');
  const origHTML = btn ? btn.innerHTML : '';
  if (btn) { btn.innerHTML = '⏳ Формируется...'; btn.disabled = true; }

  try {
    if (typeof html2canvas === 'undefined') {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }

    const isLight = document.body.classList.contains('light');
    const bgHex   = isLight ? '#F0F4FF' : '#0A0C10';

    const el = selector
      ? (typeof selector === 'string' ? document.querySelector(selector) : selector)
      : document.querySelector('.wrap');
    if (!el) throw new Error('Элемент не найден');

    await new Promise(r => setTimeout(r, 150));

    // Wait for all charts to render
    await new Promise(r => setTimeout(r, 500));
    
    const canvas = await html2canvas(el, {
      backgroundColor: bgHex,
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
      onclone: (cloneDoc) => {
        // Force document background to be exactly the target color
        cloneDoc.documentElement.style.background = bgHex;
        // 1. Kill ::after glow gradient that confuses html2canvas CSS parser
        const fix = cloneDoc.createElement('style');
        fix.textContent = [
          '*, *::before, *::after { animation: none !important; transition: none !important; }',
          'body::before, body::after { display:none !important; background:none !important; }',
          'body { background:' + bgHex + ' !important; }',
          '.top-nav { backdrop-filter:none !important; -webkit-backdrop-filter:none !important; background:' + bgHex + ' !important; }',
          '.wrap { animation: none !important; }',
          '.kpi, .card { box-shadow: none !important; animation: none !important; }',
          '.live-dot { animation: none !important; }',
        ].join('\n');
        cloneDoc.head.appendChild(fix);

        // Fix canvas elements - html2canvas needs them drawn
        cloneDoc.querySelectorAll('canvas').forEach(cv => {
          if (cv.width === 0 || cv.height === 0) {
            cv.style.display = 'none';
          }
        });
        
        // 2. Flatten all CSS custom properties so html2canvas sees plain values
        const cs = getComputedStyle(document.documentElement);
        const varList = [
          '--bg','--nav','--card','--card-hover','--card-border','--card-border-hover',
          '--br','--br2','--br3',
          '--blue','--blue2','--blue-dk','--blue-glow',
          '--green','--green2','--green-glow',
          '--red','--red2','--red-glow',
          '--amber','--amber2','--amber-glow',
          '--purple','--purple2','--purple-glow',
          '--cyan','--cyan2','--pink','--pink2',
          '--t1','--t2','--t3','--t4',
        ];
        const resolved = varList
          .map(v => { const val = cs.getPropertyValue(v).trim(); return val ? v + ':' + val : ''; })
          .filter(Boolean).join(';');
        if (resolved) {
          const varStyle = cloneDoc.createElement('style');
          varStyle.textContent = ':root{' + resolved + '}';
          cloneDoc.head.insertBefore(varStyle, cloneDoc.head.firstChild);
        }
      }
    });

    const link = document.createElement('a');
    link.download = (filename || 'billz-cc') + '-' + new Date().toISOString().slice(0, 10) + '.png';
    link.href = canvas.toDataURL('image/png', 0.95);
    link.click();

  } catch (e) {
    console.error('PNG error:', e);
    alert('Ошибка PNG:\n' + e.message);
  } finally {
    if (btn) { btn.innerHTML = origHTML; btn.disabled = false; }
  }
}

async function exportSectionPNG(sectionId, filename) {
  const el = document.getElementById(sectionId);
  if(!el) { alert('Раздел не найден: ' + sectionId); return; }
  await exportPagePNG(el, filename || sectionId);
}
