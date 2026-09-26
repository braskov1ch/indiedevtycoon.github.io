// ============================================================
// ECONOMY — sales, prices, income, platform commissions
// ============================================================

function monthsBetween(a,b){
  return (b.year-a.year)*12 + (b.month-a.month);
}

function computeSalePrice(project){
  const sizeIdx = {tiny:5, small:9, medium:19, large:29, aaa:59};
  let base = sizeIdx[project.size]||9;
  const age = monthsBetween({year:project.releaseYear,month:project.releaseMonth}, state.date);
  if(age>12) base = Math.max(2, base*0.7);
  if(age>36) base = Math.max(2, base*0.5);
  return Math.round(base*100)/100;
}

function computeMonthlySales(game){
  const platform = DATA.PLATFORMS.find(p=>p.id===game.platform);
  if(!platform) return 0;
  const now = state.date;
  const rel = {year:game.releaseYear, month:game.releaseMonth};
  const age = Math.max(0, monthsBetween(rel, now));

  let life;
  if(age<2) life = 2.2;
  else if(age<6) life = 1.4;
  else if(age<12) life = 1.0;
  else if(age<24) life = 0.55;
  else if(age<48) life = 0.22;
  else life = 0.07;

  const quality = num(game.quality)/100;
  const critics = num(game.critics)/100;
  const players = num(game.players)/100;
  const basePlatform = platform.marketSize;
  const trend = (state.trends.genres[game.genre]||1);
  const dlcBoost = 1 + num(game.dlcBoost);
  const hype = num(game.hypeAtRelease)/100 * Math.max(0, 1 - age/12);
  const mkt = 1 + num(game.marketing)/100 * 0.5;
  const repMul = 0.6 + state.rep*0.04;
  const fansMul = 1 + Math.log10(1+state.fans)/8;
  const diff = DATA.DIFFICULTY[state.player.difficulty]||DATA.DIFFICULTY.normal;
  const comp = game.compPenalty||1;

  let sales = basePlatform * 4.0 *
    Math.pow(0.4+quality, 2.2) *
    (0.6 + 0.4*(critics+players)/2) *
    life * trend * dlcBoost * mkt * repMul * fansMul * diff.salesMul *
    (0.6 + 0.4*(1+hype)) / comp;

  const revenuePerCopy = computeSalePrice(game);
  const gross = sales * revenuePerCopy * (1 - platform.fee);
  // Publisher revenue share (developer cut)
  let devShare = 1;
  if(game.publisher && typeof game.publisher.share === 'number'){
    devShare = game.publisher.share;
  }
  const netRevenue = gross * devShare;

  game.monthlySales = Math.max(0, Math.floor(sales));
  game.monthlyRevenue = Math.max(0, netRevenue);

  if(game.dlcBoost>0) game.dlcBoost = Math.max(0, game.dlcBoost - 0.08);

  return sales;
}

function processMonthlySales(){
  let totalSales = 0;
  let totalRevenue = 0;
  for(const g of state.releasedGames){
    const s = computeMonthlySales(g);
    totalSales += s;
    totalRevenue += g.monthlyRevenue;
    g.totalSales = (g.totalSales|0) + (s|0);
    g.lifetimeRevenue = num(g.lifetimeRevenue) + g.monthlyRevenue;
    g.lastMonthSales = s;
    g.lastMonthRevenue = g.monthlyRevenue;
    const newFans = s * 0.15;
    state.fans = add(state.fans, newFans);
    if(g.critics>=80 && Math.random()<0.2) state.rep = add(state.rep, 0.05);
  }
  if(totalRevenue>0) earn(totalRevenue, 'sales');
  state.stats.totalSales = num(state.stats.totalSales) + totalSales;

  let dlcIncome = 0;
  for(const g of state.releasedGames){
    if((g.dlcCount|0)>0){
      const inc = (g.dlcCount|0) * 200 * (state.rep*0.05+0.5);
      dlcIncome += inc;
    }
  }
  if(dlcIncome>0) earn(dlcIncome, 'dlc');
  state.finance.lastDlcIncome = dlcIncome;
}

function updateTrends(){
  const genres = state.trends.genres;
  const themes = state.trends.themes;
  for(const g of DATA.GENRES){
    let t = genres[g.id]||1.0;
    t += rnd(-0.25,0.25);
    t = clamp(t, 0.6, 1.5);
    genres[g.id] = Math.round(t*100)/100;
  }
  for(const t of DATA.THEMES){
    let v = themes[t.id]||1.0;
    v += rnd(-0.2,0.2);
    v = clamp(v, 0.7, 1.35);
    themes[t.id] = Math.round(v*100)/100;
  }
  state.trends.updatedYear = state.date.year;
}

// ---------- contracts ----------
function generateContractOffer(){
  const diffs = DATA.DIFFICULTY[state.player.difficulty]||DATA.DIFFICULTY.normal;
  const budgetBase = [8000, 25000, 60000, 120000][Math.min(3, Math.floor(state.rep/8))] || 8000;
  const budget = Math.round(budgetBase * rnd(0.7,1.4) * diffs.salesMul);
  const months = rndInt(2,6);
  const qualityReq = 50 + rndInt(0,35);
  const genre = pick(DATA.GENRES).name;
  const plat = pick(DATA.PLATFORMS.filter(p=>p.releaseYear<=state.date.year));
  return {
    id:'ct_'+Date.now()+'_'+Math.random(),
    name: `Contract: ${genre} game for ${plat.name}`,
    genre, platform:plat.id,
    budget,
    months,
    qualityReq,
    repReward: 1 + rndInt(0,3),
    accepted:false,
    active:false,
    progress:0,
    deadlineDay: null,
    startedAt:null,
  };
}

function refreshContractOffers(){
  state.contractOffers = [];
  const n = rndInt(2,4);
  for(let i=0;i<n;i++) state.contractOffers.push(generateContractOffer());
}

function acceptContract(offerId){
  const o = state.contractOffers.find(c=>c.id===offerId);
  if(!o) return;
  if(state.contracts.some(c=>c.active)){ toast('Уже есть активный контракт','warn');return; }
  o.accepted = true;
  o.active = true;
  o.startedAt = {year:state.date.year,month:state.date.month,day:state.date.day};
  o.deadlineDay = addDaysToDate(o.startedAt, o.months*30);
  state.contracts.push(o);
  state.contractOffers = state.contractOffers.filter(c=>c.id!==offerId);
  addNews(`Принят контракт: ${o.name}`, 'good');
  toast('Контракт принят','ok');
}

function addDaysToDate(d0, days){
  let {year,month,day} = d0;
  for(let i=0;i<days;i++){
    day++;
    const max = daysInMonth(year,month);
    if(day>max){day=1;month++;if(month>11){month=0;year++;}}
  }
  return {year,month,day};
}

function progressContractByDays(days){
  for(const c of state.contracts){
    if(!c.active) continue;
    const skillSum = state.employees.reduce((s,e)=>s+e.skill,0) + state.skills.programming*2 + state.skills.design*2;
    const rate = clamp(skillSum / (200 + c.months*40), 0.3, 3);
    c.progress = clamp(num(c.progress) + rate*days/ (c.months*30), 0, 1);
    if(c.progress>=1){
      c.active=false;
      const success = c.qualityReq <= (70 + state.rep);
      const reward = success ? c.budget : Math.round(c.budget*0.5);
      earn(reward, 'contract');
      state.rep = add(state.rep, success?c.repReward:0);
      state.skills.programming = clamp(state.skills.programming + 1,1,100);
      state.skills.design = clamp(state.skills.design + 1,1,100);
      addNews(`Контракт выполнен: ${c.name} — ${fmt(reward)}`, 'good');
      toast(`Контракт выполнен: ${fmt(reward)}`,'ok');
    }
    const now = state.date;
    const overdue = compareDate(now, c.deadlineDay) > 0;
    if(overdue && c.active){
      c.active = false;
      state.rep = sub(state.rep, 2);
      addNews(`Провален контракт: ${c.name}`, 'bad');
      toast('Просрочен контракт!','err');
    }
  }
}

function compareDate(a,b){
  if(a.year!==b.year) return a.year-b.year;
  if(a.month!==b.month) return a.month-b.month;
  return a.day-b.day;
}