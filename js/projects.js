// ============================================================
// PROJECTS — game development, quality, reviews, lifecycle
// ============================================================

function startProject(opts){
  const diff = DATA.DIFFICULTY[state.player.difficulty]||DATA.DIFFICULTY.normal;
  const sizeDef = DATA.PROJECT_SIZES.find(s=>s.id===opts.size);
  if(!sizeDef) return {error:'Invalid size'};
  const totalCost = Math.round(sizeDef.cost * diff.devCostMul + (opts.marketing||0));
  if(state.money < totalCost*0.3) return {error:'Недостаточно денег для старта'};

  const totalDays = Math.round(sizeDef.days * (1 + (opts.marketing||0)/50000*0.1));
  const project = {
    id:'pr_'+Date.now()+'_'+Math.random(),
    type:'game',
    name: opts.name,
    genre: opts.genre,
    theme: opts.theme,
    platform: opts.platform,
    size: opts.size,
    marketing: num(opts.marketing),
    publisher: opts.publisher||null,
    engineId: opts.engineId||null,
    stage:0,
    stageProgress:0,
    totalDays,
    daysElapsed:0,
    budgetSpent:0,
    spentInitial: totalCost,
    quality:{graphics:0,design:0,tech:0,audio:0,polish:0},
    bugs:0,
    startedAt:{year:state.date.year,month:state.date.month,day:state.date.day},
    released:false,
    hype: 0,
    _accumulatedQuality:{graphics:0,design:0,tech:0,audio:0,polish:0},
  };

  let advance = 0;
  if(project.publisher){
    advance = project.publisher.advance;
    project.publisher_marketing = project.publisher.marketing;
    earn(advance, 'advance');
    addNews(`Издатель ${project.publisher.name} предоставил аванс ${fmt(advance)}`, 'good');
  }
  spend(totalCost - advance*0.5, 'development');
  project.budgetSpent = totalCost;

  project.hype = clamp(5 + state.rep*0.3 + (project.publisher? project.publisher.marketing/20000 : 0), 0, 100);

  state.projects.push(project);
  addNews(`Начата разработка: "${project.name}" (${project.genre}/${project.theme})`, 'good');
  toast('Проект запущен','ok');
  return {ok:true};
}

function projectStageProgress(project){
  const stage = DATA.STAGES[project.stage];
  if(!stage) return 1;
  return clamp(project.stageProgress / (project.totalDays*stage.weight), 0, 1);
}

function projectProgress(project){
  let done = 0;
  for(let i=0;i<project.stage;i++) done += DATA.STAGES[i].weight;
  if(project.stage < DATA.STAGES.length){
    done += DATA.STAGES[project.stage].weight * projectStageProgress(project);
  }
  return clamp(done, 0, 1);
}

function projectTick(project, days=1){
  const stage = DATA.STAGES[project.stage];
  if(!stage) return;

  const employees = state.employees;
  const skillMul = 1 +
    state.skills.programming*0.004 +
    state.skills.design*0.004 +
    state.skills.art*0.003 +
    state.skills.audio*0.003 +
    state.skills.management*0.002;
  const empSkill = employees.reduce((s,e)=>s + e.skill*0.02, 0);
  const empCount = employees.length;
  const teamMul = 1 + empSkill + empCount*0.15;
  const engineMul = project.engineId ? 1.15 : 1.0;
  const productivity = teamMul * skillMul * engineMul;

  const stageDays = project.totalDays * stage.weight;
  project.stageProgress += days * productivity;
  project.daysElapsed += days;
  state.energy = clamp(state.energy - 0.4*days, 0, 100);

  const genreDef = DATA.GENRES.find(g=>g.id===project.genre) || DATA.GENRES[0];
  const base = genreDef.base;

  const gainPerDay = {
    graphics: productivity*0.35*base.g,
    design:   productivity*0.32*base.d,
    tech:     productivity*0.30*base.t,
    audio:    productivity*0.28*base.a,
  };
  const k = days*0.10;
  for(const key of ['graphics','design','tech','audio']){
    project._accumulatedQuality[key] += gainPerDay[key]*k;
  }

  // FIX: правильная группировка — AAA багается сильнее
  const bugRate = (project.size==='aaa' ? 1.5 : 0.3);
  const qaMitigation = employees.some(e=>e.role==='qa') ? 0.5 : 1.0;
  if(project.stage>=3) project.bugs += days * (0.5 + bugRate) * qaMitigation;

  if(project.stageProgress >= stageDays){
    project.stageProgress = 0;
    project.stage++;
    if(project.stage >= DATA.STAGES.length){
      releaseProject(project);
      return;
    }
    addNews(`"${project.name}" — стадия ${DATA.STAGES[project.stage].name}`, '');
  }
}

function releaseProject(project){
  const sizeDef = DATA.PROJECT_SIZES.find(s=>s.id===project.size) || DATA.PROJECT_SIZES[0];
  const q = project._accumulatedQuality;
  const norm = Math.max(1, project.totalDays * 0.45);

  let graphics = clamp(30 + (q.graphics/norm)*60, 0, sizeDef.qualityCap);
  let design   = clamp(30 + (q.design/norm)*60, 0, sizeDef.qualityCap);
  let tech     = clamp(30 + (q.tech/norm)*60, 0, sizeDef.qualityCap);
  let audio    = clamp(30 + (q.audio/norm)*60, 0, sizeDef.qualityCap);
  const polish = clamp(70 - project.bugs*0.8 + state.skills.management*0.2, 0, 100);

  graphics = clamp(graphics + rnd(-4,4), 0, 100);
  design   = clamp(design   + rnd(-4,4), 0, 100);
  tech     = clamp(tech     + rnd(-4,4), 0, 100);
  audio    = clamp(audio    + rnd(-4,4), 0, 100);

  const quality = Math.round(graphics*0.25 + design*0.30 + tech*0.20 + audio*0.10 + polish*0.15);

  const theme = DATA.THEMES.find(t=>t.id===project.theme);
  const synergy = (theme && theme.mod[project.genre]) ? theme.mod[project.genre] : 1;
  const finalQuality = clamp(Math.round(quality * synergy), 0, 100);

  const criticsRaw = finalQuality + rnd(-6,6) + (state.rep*0.15) + (project.marketing/5000*0.5);
  const critics = clamp(Math.round(criticsRaw), 5, 99);
  const playersRaw = finalQuality + rnd(-8,8) + Math.log10(1+state.fans)*3 + (state.hype*0.1);
  const players = clamp(Math.round(playersRaw), 5, 99);

  const platform = DATA.PLATFORMS.find(p=>p.id===project.platform);

  const released = {
    id: project.id,
    name: project.name,
    genre: project.genre,
    theme: project.theme,
    platform: project.platform,
    size: project.size,
    quality: finalQuality,
    graphics: Math.round(graphics),
    design: Math.round(design),
    tech: Math.round(tech),
    audio: Math.round(audio),
    polish: Math.round(polish),
    critics, players,
    releaseYear: state.date.year,
    releaseMonth: state.date.month,
    releaseDay: state.date.day,
    hypeAtRelease: project.hype,
    marketing: project.marketing,
    publisher: project.publisher,
    engineId: project.engineId,
    totalSales: 0,
    lifetimeRevenue: 0,
    lastMonthSales:0,
    lastMonthRevenue:0,
    dlcCount:0,
    dlcBoost:0,
    ports: [],
    isPort:false,
    parentId: null,
    origin: project.type==='remake' ? 'remake' : 'original',
    compPenalty: 1,
    history: [],
    awards: [],
  };

  state.releasedGames.push(released);
  state.projects = state.projects.filter(p=>p.id!==project.id);
  state.stats.gamesReleased++;

  if(!state.stats.bestGame || finalQuality > state.stats.bestGame.quality){
    state.stats.bestGame = {name:released.name, quality:finalQuality};
  }
  if(critics > state.stats.bestReview) state.stats.bestReview = critics;

  let ip = state.ips.find(i=>i.name===released.name);
  if(!ip){
    ip = { id:'ip_'+released.id, name: released.name, popularity: 10, fans: 0, games: [released.id], revenue: 0 };
    state.ips.push(ip);
  } else {
    ip.games.push(released.id);
  }
  released.ipId = ip.id;

  const fanGain = Math.pow(Math.max(0,finalQuality), 1.8) * 0.6 * (1 + (platform?platform.marketSize/200:1));
  state.fans = add(state.fans, fanGain);

  const repGain = clamp((finalQuality-50)/15 + (critics-50)/25, -3, 4);
  state.rep = clamp(add(state.rep, repGain), 0, 100);

  addNews(`Выпущена игра "${released.name}" — Critic ${critics}, Player ${players}, Quality ${finalQuality}`, critics>=75?'good':(critics<50?'bad':''));
  toast(`Релиз: "${released.name}" — ${critics}/100`, critics>=75?'ok':(critics<50?'err':''));
  state.hype = clamp(state.hype + Math.max(0, (finalQuality-60)/10), 0, 100);
}

// ---------- port / remake / reissue ----------
function portGame(gameId, newPlatformId){
  const g = state.releasedGames.find(x=>x.id===gameId);
  if(!g) return;
  const platform = DATA.PLATFORMS.find(p=>p.id===newPlatformId);
  if(!platform){ toast('Платформа недоступна','err'); return; }
  if(platform.releaseYear > state.date.year){ toast('Платформа ещё не вышла','warn'); return; }
  if(g.ports.some(p=>p.platform===newPlatformId)){ toast('Уже есть порт на эту платформу','warn'); return; }

  const baseCost = DATA.PORT_COST[g.size] || 5000;
  const age = monthsBetween({year:g.releaseYear,month:g.releaseMonth}, state.date);
  const ageMul = age<6?1.5:(age<24?1:0.7);
  const cost = Math.round(baseCost * ageMul * platform.difficulty);
  if(state.money < cost){ toast('Недостаточно денег для порта','err'); return; }
  spend(cost, 'port');

  const inherit = clamp(0.7 + state.skills.programming/300, 0.7, 1.05);
  const port = {
    id: 'port_'+Date.now(),
    platform: newPlatformId,
    quality: Math.round(g.quality * inherit),
    releaseYear: state.date.year,
    releaseMonth: state.date.month,
    releaseDay: state.date.day,
    totalSales:0, lifetimeRevenue:0, lastMonthSales:0, lastMonthRevenue:0,
    isPort:true, parentId:g.id,
    critics: Math.round(g.critics*rnd(0.9,1.05)),
    players: Math.round(g.players*rnd(0.9,1.05)),
    name: g.name + ' ('+platform.name+')',
    genre:g.genre, theme:g.theme, size:g.size, marketing:0, hypeAtRelease:0,
    graphics:g.graphics, design:g.design, tech:g.tech, audio:g.audio, polish:g.polish,
    dlcCount:0, dlcBoost:0, ports:[],
    ipId: g.ipId, origin:'port',
    publisher: g.publisher,
  };
  g.ports.push({platform:newPlatformId, releaseYear:state.date.year});
  state.releasedGames.push(port);
  addNews(`Порт "${g.name}" на ${platform.name}`, 'good');
  toast('Порт выпущен','ok');
}

function remakeGame(gameId, newName){
  const g = state.releasedGames.find(x=>x.id===gameId);
  if(!g) return;
  if(g.isPort){ toast('Порты нельзя переделывать в ремейк','warn'); return; }
  if(!newName || newName.length<2){ toast('Введите название','err'); return; }
  const sizeDef = DATA.PROJECT_SIZES.find(s=>s.id===g.size) || DATA.PROJECT_SIZES[0];
  const cost = Math.round(sizeDef.cost * 1.6);
  if(state.money < cost){ toast('Недостаточно денег для ремейка','err'); return; }
  if(state.projects.some(p=>p.type==='game')){ toast('Сначала завершите активный проект','warn'); return; }
  spend(cost, 'remake');

  const proj = {
    id:'pr_'+Date.now(),
    type:'remake',
    name:newName,
    genre:g.genre, theme:g.theme, platform:g.platform, size:g.size,
    marketing:0, publisher:null, engineId:null,
    stage:0, stageProgress:0,
    totalDays: Math.round(sizeDef.days*0.6),
    daysElapsed:0, budgetSpent:cost, spentInitial:cost,
    quality:{graphics:0,design:0,tech:0,audio:0,polish:0},
    bugs:0,
    startedAt:{year:state.date.year,month:state.date.month,day:state.date.day},
    hype: clamp(g.critics*0.3 + state.rep*0.5, 5, 90),
    _accumulatedQuality:{
      graphics: g.graphics*2,
      design: g.design*2,
      tech: g.tech*2,
      audio: g.audio*2,
    },
    _parentId:g.id,
  };
  state.projects.push(proj);
  addNews(`Начат ремейк: "${newName}" (оригинал: ${g.name})`,'good');
  toast('Ремейк запущен','ok');
}

function reissueGame(gameId, kind){
  const g = state.releasedGames.find(x=>x.id===gameId);
  if(!g) return;
  const cost = Math.round((DATA.PORT_COST[g.size]||5000) * (kind==='goty'?0.6:0.4));
  if(state.money < cost){ toast('Недостаточно денег','err'); return; }
  spend(cost, 'reissue');
  g.dlcBoost = num(g.dlcBoost) + (kind==='goty'?0.6:0.35);
  g.hypeAtRelease = Math.max(g.hypeAtRelease, 40);
  addNews(`Переиздание "${g.name}" (${kind.toUpperCase()}) — ${fmt(cost)}`, 'good');
  toast('Переиздание выпущено','ok');
}

function addDLC(gameId){
  const g = state.releasedGames.find(x=>x.id===gameId);
  if(!g) return;
  if(g.isPort){ toast('DLC для портов не выпускается','warn'); return; }
  const cost = Math.round((DATA.PORT_COST[g.size]||3000) * 0.5);
  if(state.money < cost){ toast('Недостаточно денег','err'); return; }
  if(!state.research.completed.includes('audio') && !state.research.completed.includes('online') && !state.research.completed.includes('3d')){
    toast('Нужна хотя бы одна технология (2D+ уровень)','warn'); return;
  }
  spend(cost, 'dlc');
  g.dlcCount = (g.dlcCount|0) + 1;
  g.dlcBoost = num(g.dlcBoost) + 0.5;
  state.rep = add(state.rep, 0.3);
  addNews(`DLC для "${g.name}" выпущено — ${fmt(cost)}`, 'good');
  toast('DLC выпущено','ok');
}

// ---------- engines ----------
function createEngine(opts){
  const cost = 5000 + (opts.graphics||0)*50 + (opts.physics||0)*40 + (opts.ai||0)*40 + (opts.tools||0)*40;
  if(state.money < cost){ toast('Недостаточно денег','err'); return; }
  spend(cost, 'engine');
  const days = 60 + Math.round((opts.graphics+opts.physics+opts.ai+opts.tools)/4);
  const engine = {
    id:'en_'+Date.now(),
    name: opts.name || 'Custom Engine',
    graphics: clamp(opts.graphics||50,1,100),
    physics:  clamp(opts.physics||50,1,100),
    ai:       clamp(opts.ai||50,1,100),
    tools:    clamp(opts.tools||50,1,100),
    builtYear: state.date.year,
    builtMonth: state.date.month,
    licensed: false,
    daysLeft: days,
    cost,
  };
  state.engines.push(engine);
  addNews(`Разработка движка "${engine.name}" началась (${days} дней)`, 'good');
  toast('Движок в разработке','ok');
}

function tickEngines(days){
  for(const e of state.engines){
    if(e.daysLeft>0){
      e.daysLeft = Math.max(0, e.daysLeft - days);
      if(e.daysLeft===0){
        addNews(`Движок "${e.name}" готов!`, 'good');
        toast(`Движок "${e.name}" готов`,'ok');
      }
    }
  }
}

function licenseEngine(engineId){
  const e = state.engines.find(x=>x.id===engineId);
  if(!e) return;
  if(e.daysLeft>0){ toast('Движок ещё в разработке','warn'); return; }
  if(e.licensed){ toast('Уже лицензирован','warn'); return; }
  e.licensed = true;
  const income = 2000 + (e.graphics+e.physics+e.ai+e.tools)*50;
  earn(income, 'license');
  addNews(`Движок "${e.name}" лицензирован — ${fmt(income)}`, 'good');
  toast('Движок лицензирован','ok');
}

// ---------- research ----------
function startResearch(id){
  const r = DATA.RESEARCH.find(x=>x.id===id);
  if(!r) return;
  if(state.research.completed.includes(id)){ toast('Уже изучено','warn'); return; }
  if(state.research.active){ toast('Уже идёт исследование','warn'); return; }
  if(r.year > state.date.year){ toast('Технология ещё не появилась','warn'); return; }
  for(const req of r.req){
    if(!state.research.completed.includes(req)){ toast('Требуется: '+req,'warn'); return; }
  }
  if(state.money < r.cost){ toast('Недостаточно денег','err'); return; }
  spend(r.cost, 'research');
  state.research.active = { id, daysLeft: r.days, totalDays: r.days };
  addNews(`Начато исследование: ${r.name}`,'good');
  toast('Исследование начато','ok');
}

function tickResearch(days){
  const a = state.research.active;
  if(!a) return;
  a.daysLeft = Math.max(0, a.daysLeft - days);
  if(a.daysLeft<=0){
    state.research.completed.push(a.id);
    if(!state.research.unlocked.includes(a.id)) state.research.unlocked.push(a.id);
    const r = DATA.RESEARCH.find(x=>x.id===a.id);
    if(r){
      addNews(`Исследование завершено: ${r.name}`,'good');
      toast(`Изучено: ${r.name}`,'ok');
      if(r.effect){
        if(r.effect.graphics) state.skills.art = clamp(state.skills.art+1,1,100);
        if(r.effect.tech) state.skills.programming = clamp(state.skills.programming+1,1,100);
        if(r.effect.design) state.skills.design = clamp(state.skills.design+1,1,100);
        if(r.effect.audio) state.skills.audio = clamp(state.skills.audio+1,1,100);
      }
    }
    state.research.active = null;
  }
}