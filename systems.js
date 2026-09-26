// ============================================================
// SYSTEMS — employees, awards, events, competitors, news
// ============================================================

// ---------- employees ----------
function hireEmployee(role){
  const roleDef = DATA.ROLES.find(r=>r.id===role);
  if(!roleDef){ toast('Unknown role','err'); return; }
  const skill = clamp(rndInt(15, 55) + Math.floor(state.rep*0.5), 5, 95);
  const salary = Math.round(rnd(roleDef.salary[0], roleDef.salary[1]) * (0.7 + skill/100));
  const hireCost = Math.round(salary * 1.2);
  if(state.money < hireCost){ toast('Недостаточно денег для найма','err'); return; }
  spend(hireCost, 'hire');
  const e = {
    id:'em_'+Date.now()+'_'+Math.random(),
    name: pick(DATA.NAMES)+' '+pick(DATA.NAME_SUR),
    role: roleDef.id,
    roleName: roleDef.name,
    skill,
    salary,
    exp: 0,
    morale: 70,
    hiredAt: state.date.year,
    stats: { games: 0 },
  };
  state.employees.push(e);
  addNews(`Нанят сотрудник: ${e.name} (${roleDef.name}, skill ${skill})`, 'good');
  toast(`Нанят: ${e.name}`, 'ok');
}

function fireEmployee(id){
  const e = state.employees.find(x=>x.id===id);
  if(!e) return;
  state.employees = state.employees.filter(x=>x.id!==id);
  spend(e.salary*2, 'severance');
  state.rep = sub(state.rep, 0.3);
  addNews(`Уволен сотрудник: ${e.name}`, 'warn');
  toast('Сотрудник уволен','warn');
}

function promoteEmployee(id){
  const e = state.employees.find(x=>x.id===id);
  if(!e) return;
  if(e.skill<40){ toast('Слишком низкий навык','warn'); return; }
  const cost = 1500;
  if(state.money<cost){ toast('Недостаточно денег','err'); return; }
  spend(cost,'training');
  e.skill = clamp(e.skill+3,1,100);
  e.morale = clamp(e.morale+10,0,100);
  e.salary = Math.round(e.salary*1.15);
  toast(`${e.name} повышен`, 'ok');
}

// ---------- awards ----------
function holdAwards(){
  const thisYear = state.date.year;
  const candidates = state.releasedGames.filter(g=>g.releaseYear===thisYear);
  if(candidates.length===0) return;
  for(const a of DATA.AWARDS){
    let best=null, bestScore=-1;
    for(const g of candidates){
      const base = g.quality;
      const weightBonus = ({
        quality: base,
        debut: state.stats.gamesReleased<=3 ? base+5 : base-5,
        graphics: g.graphics + 3,
        audio: g.audio + 3,
        design: g.design + 3,
        tech: g.tech + 3,
        popularity: g.players + Math.log10(1+state.fans)*3,
      })[a.weight] ?? base;
      const score = weightBonus + Math.random()*15;
      if(score>bestScore){bestScore=score;best=g;}
    }
    if(best && best.quality>=75 && Math.random()<0.55){
      best.awards.push(a.id);
      state.awards.push({awardId:a.id, gameId:best.id, year:thisYear});
      state.rep = add(state.rep, 2);
      state.hype = clamp(state.hype+10, 0, 100);
      state.fans = add(state.fans, 200 + best.quality*10);
      addNews(`🏆 "${best.name}" получила награду: ${a.name}!`, 'good');
    }
  }
  state.stats.awards = state.awards.length;
}

// ---------- random events ----------
function triggerRandomEvent(){
  const ev = pick(DATA.EVENTS);
  if(!ev) return;
  const result = ev.apply(state) || {};
  if(result.money!==undefined) state.money = result.money;
  if(result.fans!==undefined) state.fans = Math.max(0, result.fans);
  if(result.rep!==undefined) state.rep = clamp(result.rep,0,100);
  if(result.hype!==undefined) state.hype = clamp(result.hype,0,100);

  if(result.quit && state.employees.length>0){
    const idx = rndInt(0, state.employees.length-1);
    const e = state.employees[idx];
    state.employees.splice(idx,1);
    result.news = `${e.name} покинул студию.`;
  }
  if(result.boost && state.employees.length>0){
    const e = pick(state.employees);
    e.skill = clamp(e.skill+2,1,100);
    e.morale = clamp(e.morale+5,0,100);
    result.news = `${e.name} показал отличные результаты (+2 skill).`;
  }
  if(result.feeChange){
    const p = pick(DATA.PLATFORMS);
    p.fee = clamp(p.fee + rnd(-0.03, 0.03), 0, 0.4);
    result.news = `Платформа ${p.name} изменила комиссию до ${(p.fee*100).toFixed(0)}%.`;
  }
  if(result.news) addNews(result.news, ev.kind==='bad'?'bad':(ev.kind==='good'?'good':'warn'));
}

// ---------- competitors ----------
function initCompetitors(){
  state.competitors = DATA.COMPETITORS.map(c=>({
    id:c.id, name:c.name, type:c.type, skill:c.skill,
    hype: rnd(20,80), fans: c.type==='major'? rnd(5000,50000) : rnd(200,3000),
    lastRelease: null,
    _cd: rndInt(6,24),
  }));
}

function ensureCompetitors(){
  if(!Array.isArray(state.competitors) || state.competitors.length===0){
    initCompetitors();
  }
}

function competitorMonthTick(){
  if(!state.competitors || state.competitors.length===0){ initCompetitors(); return; }
  for(const c of state.competitors){
    c._cd = (c._cd||rndInt(3,12)) - 1;
    if(c._cd<=0){
      const genre = pick(DATA.GENRES).id;
      const quality = clamp(Math.round(c.skill + rnd(-10,10)), 20, 99);
      const critics = clamp(Math.round(quality + rnd(-6,6)), 10, 99);
      const sales = Math.round((c.type==='major'? rnd(2e6,20e6) : rnd(5e4,1.2e6)) * (quality/80));
      c.lastRelease = {
        year:state.date.year, month:state.date.month,
        name: generateRivalTitle(), genre, critics, sales,
      };
      c.hype = clamp(c.hype + rnd(-10,20), 0, 100);
      c.fans = add(c.fans, sales*0.05);
      if(c.type==='indie' && c.fans>200000) c.type='major';
      addNews(`🎮 ${c.name} выпустила "${c.lastRelease.name}". Жанр: ${genre}. Оценка: ${critics}. Продажи: ${fmtNum(sales)}`, c.type==='indie'?'warn':'');
      c._cd = rndInt(c.type==='major'?12:8, c.type==='major'?36:24);
    }
  }
}

function generateRivalTitle(){
  const a = ['Dark','Crimson','Silent','Neon','Eternal','Shadow','Iron','Lost','Neo','Wild','Cosmic','Frozen','Hollow','Radiant','Broken'];
  const b = ['Forest','Empire','Saga','Protocol','Rift','Chronicles','Legacy','Vortex','Kingdom','Nexus','Omen','Requiem','Circuit','Frontier','Echoes'];
  return pick(a)+' '+pick(b);
}

// ---------- news ----------
function addNews(text, kind=''){
  state.news.unshift({
    id:'nw_'+Date.now()+'_'+Math.random(),
    date: {year:state.date.year,month:state.date.month,day:state.date.day},
    text, kind,
  });
  if(state.news.length>200) state.news.length=200;
}

// ---------- timeline ----------
function checkTimeline(){
  for(let i=0;i<DATA.TIMELINE.length;i++){
    if(state.timelineDone.includes(i)) continue;
    const ev = DATA.TIMELINE[i];
    if(ev.year < state.date.year){ state.timelineDone.push(i); addNews(ev.text, 'hist'); continue; }
    if(ev.year === state.date.year && (ev.month-1) <= state.date.month){
      state.timelineDone.push(i);
      addNews(`📅 ${ev.text}`, 'hist');
    }
  }
}

// ---------- daily bonus ----------
function tryDailyBonus(){
  const today = new Date().toISOString().slice(0,10);
  if(state.flags.lastDaily === today) return null;
  const yest = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if(state.flags.lastDaily === yest) state.flags.dailyStreak = (state.flags.dailyStreak||0)+1;
  else state.flags.dailyStreak = 1;
  state.flags.lastDaily = today;
  const streak = state.flags.dailyStreak;
  const mult = 1 + Math.min(streak,7)*0.25;
  const reward = {
    money: Math.round((2000 + state.rep*500) * mult),
    energy: 20,
    rep: Math.round(1*mult),
    fans: Math.round(50*mult),
    research: 1,
  };
  state.money = add(state.money, reward.money);
  state.energy = clamp(state.energy + reward.energy, 0, 100);
  state.rep = clamp(add(state.rep, reward.rep), 0, 100);
  state.fans = add(state.fans, reward.fans);
  state.hype = clamp(state.hype + 5*mult, 0, 100);
  return { reward, streak };
}

// ---------- career ----------
function careerSummary(){
  const startYear = state.player.startYear || state.date.year;
  const years = Math.max(0, state.date.year - startYear);
  return {
    yearsInIndustry: years,
    gamesReleased: state.stats.gamesReleased,
    bestGame: state.stats.bestGame ? state.stats.bestGame.name : '—',
    bestReview: state.stats.bestReview,
    totalSales: Math.round(state.stats.totalSales),
    totalRevenue: Math.round(state.stats.totalRevenue),
    awards: state.awards.length,
    fans: Math.round(state.fans),
    employees: state.employees.length,
    money: Math.round(state.money),
    rep: state.rep,
  };
}