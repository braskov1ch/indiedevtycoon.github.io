// ============================================================
// CORE — utils, state, time, save/load
// ============================================================

const SAVE_KEY   = 'indieDevTycoon_save_v1';
const BACKUP_KEY = 'indieDevTycoon_backup';
const DAY_MS = 1000; // 1 real second = 1 game day at x1
const OFFLINE_DAY_CAP = 90; // max game days simulated offline

let _offlineMode = false;

// ---------- utils ----------
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const rndInt=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const num=v=>{v=Number(v);return Number.isFinite(v)?v:0;};
const add=(a,b)=>num(a)+num(b);
const sub=(a,b)=>num(a)-num(b);
const fmt=n=>{n=num(n);const a=Math.abs(n);let s;if(a>=1e9)s=(n/1e9).toFixed(2)+'B';else if(a>=1e6)s=(n/1e6).toFixed(2)+'M';else if(a>=1e3)s=(n/1e3).toFixed(1)+'K';else s=Math.round(n).toString();return '$'+s;};
const fmtNum=n=>{n=num(n);const a=Math.abs(n);if(a>=1e6)return (n/1e6).toFixed(2)+'M';if(a>=1e3)return (n/1e3).toFixed(1)+'K';return Math.round(n).toString();};
const MONTHS=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_IN_MONTH=[31,28,31,30,31,30,31,31,30,31,30,31];
function daysInMonth(y,m){if(m===1&&((y%4===0&&y%100!==0)||y%400===0))return 29;return DAYS_IN_MONTH[m];}
function dateToStr(d){return `${d.day} ${MONTHS[d.month]} ${d.year}`;}
function dateToStrShort(d){return `${MONTHS_EN[d.month]} ${d.year}`;}
function dateToStrFull(d){return `${String(d.day).padStart(2,'0')}.${String(d.month+1).padStart(2,'0')}.${d.year}`;}

// ---------- state ----------
let state = null;
let speed = 1;
let lastRealTime = 0;
let accumMs = 0;
let running = false;
let domUpdateTimer = 0;

function newState(){
  return {
    version: 'v0.1beta',
    player:{ name:'Alex', studio:'Pixel Forge', country:'us', difficulty:'normal', startYear:2008 },
    date:{ year:2008, month:0, day:1 },
    money:30000,
    rep:1, fans:0, energy:100, hype:0, popularity:5,
    skills:{ programming:5, design:5, art:5, audio:5, management:5, marketing:5 },
    employees:[],
    projects:[],
    releasedGames:[],
    ips:[],
    contracts:[],
    contractOffers:[],
    engines:[],
    research:{ unlocked:['2d'], active:null, completed:[] },
    awards:[],
    news:[],
    trends:{ genres:{}, themes:{}, updatedYear:-1 },
    competitors: [],
    timelineDone:[],
    stats:{
      totalRevenue:0, totalExpenses:0, gamesReleased:0, monthsPlayed:0,
      bestGame:null, bestReview:0, totalSales:0, awards:0,
      history:[],
    },
    finance:{ lastMonthIncome:0, lastMonthExpense:0, monthIncome:0, monthExpense:0, lastDlcIncome:0 },
    flags:{ lastDaily:null, dailyStreak:0, lastDayTs:Date.now(), startedAt:Date.now(), endedAt:null },
    settings:{ showTutorial:true },
    tutorialDone:false,
  };
}

// ---------- save / load ----------
function saveGame(){
  if(_offlineMode) return true;
  try{
    state.flags.lastDayTs = Date.now();
    const json = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, json);
    localStorage.setItem(BACKUP_KEY, json);
    return true;
  }catch(e){console.error('save failed',e);return false;}
}

function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(BACKUP_KEY);
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(!obj || typeof obj !== 'object') throw new Error('bad save');
    return migrate(obj);
  }catch(e){
    console.error('load failed',e);
    toast('Не удалось загрузить сохранение. Создан бэкап.','err');
    try{ localStorage.setItem(BACKUP_KEY+'_corrupt_'+Date.now(), localStorage.getItem(SAVE_KEY)||''); }catch(_){}
    return null;
  }
}

function migrate(s){
  const base = newState();
  const merged = Object.assign({}, base, s);
  merged.skills = Object.assign({}, base.skills, s.skills||{});
  merged.stats = Object.assign({}, base.stats, s.stats||{});
  merged.finance = Object.assign({}, base.finance, s.finance||{});
  merged.flags = Object.assign({}, base.flags, s.flags||{});
  merged.settings = Object.assign({}, base.settings, s.settings||{});
  merged.player = Object.assign({}, base.player, s.player||{});

  // ensure arrays
  for(const k of ['projects','releasedGames','employees','ips','contracts','contractOffers','engines','awards','news','timelineDone','competitors']){
    if(!Array.isArray(merged[k])) merged[k] = [];
  }
  if(!merged.research || typeof merged.research !== 'object') merged.research = base.research;
  if(!Array.isArray(merged.research.completed)) merged.research.completed = [];
  if(!Array.isArray(merged.research.unlocked)) merged.research.unlocked = ['2d'];
  if(!merged.trends || typeof merged.trends !== 'object') merged.trends = base.trends;
  if(!merged.trends.genres) merged.trends.genres = {};
  if(!merged.trends.themes) merged.trends.themes = {};

  // numeric validation
  for(const k of ['money','rep','fans','energy','hype','popularity']){
    if(!Number.isFinite(Number(merged[k]))) merged[k] = (k==='money'?30000:0);
  }
  if(!merged.date || !Number.isFinite(merged.date.year)) merged.date = base.date;
  if(!Number.isFinite(merged.date.month)) merged.date.month = 0;
  if(!Number.isFinite(merged.date.day)) merged.date.day = 1;

  if(!merged.player.startYear) merged.player.startYear = merged.date.year;

  return merged;
}

// ---------- date advance ----------
function tickDay(){
  const d = state.date;
  d.day++;
  const max = daysInMonth(d.year,d.month);
  if(d.day>max){
    d.day=1;d.month++;
    if(d.month>11){d.month=0;d.year++;onYearChange();}
    onMonthChange();
  }
  state.energy = clamp(state.energy+2,0,100);
  state.hype = Math.max(0, state.hype - 0.5);
  state.popularity = clamp(state.popularity*0.995 + state.rep*0.005, 0, 100);

  // systems (defined in other modules; resolved at runtime)
  tickEngines(1);
  tickResearch(1);
  for(const p of state.projects.slice()) projectTick(p, 1);
  progressContractByDays(1);
  checkTimeline();

  if(!_offlineMode && state.date.day%3===0) saveGame();
}

function onMonthChange(){
  state.stats.monthsPlayed++;
  state.stats.history.push({
    year:state.date.year, month:state.date.month,
    money:Math.round(state.money), fans:Math.round(state.fans),
    rep:state.rep, games:state.stats.gamesReleased,
    revenue:Math.round(state.stats.totalRevenue),
  });
  if(state.stats.history.length>400) state.stats.history.shift();

  state.finance.lastMonthIncome = state.finance.monthIncome;
  state.finance.lastMonthExpense = state.finance.monthExpense;
  state.finance.monthIncome = 0;
  state.finance.monthExpense = 0;

  paySalaries();
  payOperations();
  processMonthlySales();
  competitorMonthTick();
  if(Math.random()<0.18) triggerRandomEvent();
  if(state.date.month%3===0) updateTrends();
  if(state.date.month===11) holdAwards();
  if(!state.tutorialDone && state.stats.gamesReleased>=1 && state.employees.length>=1){ state.tutorialDone=true; }
}

function onYearChange(){
  addNews(`Новый год: ${state.date.year}.`, 'hist');
  state.hype = Math.max(0, state.hype*0.5);
}

// ---------- financial helpers ----------
function paySalaries(){
  let total = 0;
  const diff = DATA.DIFFICULTY[state.player.difficulty]||DATA.DIFFICULTY.normal;
  for(const e of state.employees){
    const s = e.salary * diff.salaryMul;
    total += s;
    e.morale = clamp(e.morale - (Math.random()<0.2?1:0) + (Math.random()<0.25?1:0), 20, 100);
    e.exp += rnd(0.3,1.5);
    if(e.exp>50){ e.exp=0; e.skill=clamp(e.skill+1,1,100); addNews(`${e.name} повысил навык до ${e.skill}.`, 'good'); }
  }
  if(total>0){ spend(total,'salaries'); }
}

function payOperations(){
  const base = 400 + state.employees.length*60;
  const co = (DATA.COUNTRIES.find(c=>c.id===state.player.country)||{costOfLiving:1}).costOfLiving;
  spend(base*co,'operations');
}

function spend(amount, reason){
  amount = num(amount);
  if(amount<0) amount=0;
  state.money = sub(state.money, amount);
  state.finance.monthExpense += amount;
  state.stats.totalExpenses += amount;
  if(state.money<-20000){
    addNews('Кредиторы требуют платежи. Студия в опасности!', 'bad');
  }
}

function earn(amount, reason){
  amount = num(amount);
  if(amount<0) amount=0;
  state.money = add(state.money, amount);
  state.finance.monthIncome += amount;
  state.stats.totalRevenue += amount;
}

// ---------- toast / modal ----------
function toast(msg, kind=''){
  const el=document.createElement('div');
  el.className='toast '+(kind||'');
  el.textContent=msg;
  $('#toast-root').appendChild(el);
  setTimeout(()=>{el.style.transition='opacity .3s';el.style.opacity='0';setTimeout(()=>el.remove(),320);},2600);
}

function openModal(html, opts={}){
  const bg=document.createElement('div');
  bg.className='modal-bg';
  bg.innerHTML=`<div class="modal">${html}</div>`;
  bg.addEventListener('click',e=>{if(e.target===bg && !opts.noClose) closeModal();});
  $('#modal-root').appendChild(bg);
  if(opts.onMount) opts.onMount(bg);
  return bg;
}
function closeModal(){ const m=$('#modal-root').firstChild; if(m) m.remove(); }
function closeAllModals(){ $('#modal-root').innerHTML=''; }

// ---------- main loop ----------
function startLoop(){
  running = true;
  lastRealTime = Date.now();
  accumMs = 0;
  requestAnimationFrame(loop);
}

function loop(){
  if(!running) return;
  const now = Date.now();
  const dt = now-lastRealTime;
  lastRealTime = now;
  if(speed>0 && state && !_offlineMode){
    accumMs += dt*speed;
    let safety=0;
    while(accumMs>=DAY_MS && safety<500){
      accumMs -= DAY_MS;
      tickDay();
      safety++;
    }
    if(safety>=500) accumMs = 0; // drop remaining to prevent runaway
  }
  domUpdateTimer += dt;
  if(domUpdateTimer>250){
    domUpdateTimer=0;
    if(state) renderCurrent();
  }
  requestAnimationFrame(loop);
}

// ---------- offline progress ----------
function processOffline(){
  if(!state || !state.flags.lastDayTs) return;
  const now = Date.now();
  const elapsedRealMs = clamp(now - state.flags.lastDayTs, 0, 7*24*3600*1000);
  const gameDaysRaw = Math.floor(elapsedRealMs / DAY_MS);
  const gameDays = Math.min(gameDaysRaw, OFFLINE_DAY_CAP);
  if(gameDays < 1) return;

  const before = {
    money: state.money, fans: state.fans, rep: state.rep,
    totalSales: state.stats.totalSales|0,
  };

  _offlineMode = true;
  for(let i=0;i<gameDays;i++){
    try { tickDay(); } catch(e){ console.error('offline tick', e); break; }
  }
  _offlineMode = false;

  const deltaMoney = state.money - before.money;
  const deltaFans  = state.fans - before.fans;
  const deltaSales = (state.stats.totalSales|0) - before.totalSales;

  showOfflineSummary(gameDays, gameDaysRaw, deltaMoney, deltaFans, deltaSales);
  saveGame();
}

function showOfflineSummary(gameDays, gameDaysRaw, deltaMoney, deltaFans, deltaSales){
  const capped = gameDaysRaw > gameDays;
  const cls = deltaMoney>=0?'green':'red';
  openModal(`
    <h2>Пока вас не было</h2>
    <p class="sub">Игровых дней: <b>${gameDays}</b>${capped?` <span class="yellow">(из ${gameDaysRaw}, лимит ${OFFLINE_DAY_CAP})</span>`:''}</p>
    <div class="divider"></div>
    <div class="row"><span>Баланс</span><span class="${cls} big-num">${deltaMoney>=0?'+':''}${fmt(deltaMoney)}</span></div>
    <div class="row"><span>Фанаты</span><span>${deltaFans>=0?'+':''}${fmtNum(deltaFans)}</span></div>
    <div class="row"><span>Продажи (копий)</span><span>${fmtNum(deltaSales)}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Текущий баланс</span><span>${fmt(state.money)}</span></div>
    <div class="row"><span>Фанатов сейчас</span><span>${fmtNum(state.fans)}</span></div>
    <div class="close-row"><button class="btn primary" onclick="closeAllModals()">OK</button></div>
  `, {noClose:true});
}