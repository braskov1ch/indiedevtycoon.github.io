// ============================================================
// GAME — init, top bar, new game flow
// ============================================================

function bindTopBar(){
  $$('.spd').forEach(b=>{
    b.addEventListener('click',()=>{
      speed = +b.dataset.speed;
      $$('.spd').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
    });
  });
  $('#btn-step-day').addEventListener('click',()=>{
    if(!state) return;
    tickDay();
    saveGame();
    renderCurrent();
  });
  $('#btn-step-week').addEventListener('click',()=>{
    if(!state) return;
    for(let i=0;i<7;i++) tickDay();
    saveGame();
    renderCurrent();
  });
  $$('#bottomnav button').forEach(b=>{
    b.addEventListener('click',()=>{
      currentTab = b.dataset.tab;
      syncTabs();
      renderCurrent();
    });
  });
}

// -------- START SCREEN --------
function showStartScreen(){
  const cSel = $('#in-country');
  cSel.innerHTML = DATA.COUNTRIES.map(c=>`<option value="${c.id}">${c.name} — capital ~${fmt(c.startCapital)}, tax ${(c.tax*100).toFixed(0)}%</option>`).join('');

  const ySel = $('#in-year');
  let html='';
  for(let y=2000;y<=2026;y++) html+=`<option value="${y}" ${y===2008?'selected':''}>${y}</option>`;
  ySel.innerHTML = html;

  if(localStorage.getItem(SAVE_KEY)||localStorage.getItem(BACKUP_KEY)){
    const btn = $('#btn-continue');
    btn.style.display='block';
    btn.addEventListener('click',()=>{
      const s = loadGame();
      if(!s){ toast('Сохранение повреждено','err'); return; }
      state = s;
      startGame(true);
    });
  }

  $('#btn-start').addEventListener('click',()=>{
    const name = $('#in-name').value.trim() || 'Alex';
    const studio = $('#in-studio').value.trim() || 'Pixel Forge';
    const country = $('#in-country').value;
    const year = +$('#in-year').value;
    const diff = $('#in-diff').value;
    startNewGame({name, studio, country, year, difficulty:diff});
  });
}

function startNewGame(opts){
  state = newState();
  state.player.name = opts.name;
  state.player.studio = opts.studio;
  state.player.country = opts.country;
  state.player.difficulty = opts.difficulty;
  state.player.startYear = opts.year;
  const c = DATA.COUNTRIES.find(x=>x.id===opts.country) || DATA.COUNTRIES[0];
  const diff = DATA.DIFFICULTY[opts.difficulty] || DATA.DIFFICULTY.normal;
  state.money = Math.round(c.startCapital * diff.startMul);
  state.date = {year:opts.year, month:0, day:1};
  state.flags.lastDayTs = Date.now();
  state.flags.startedAt = Date.now();
  initCompetitors();
  updateTrends();
  addNews(`Студия "${opts.studio}" основана в ${opts.year} году.`, 'hist');
  saveGame();
  startGame(false);
}

function startGame(fromLoad){
  $('#start-screen').style.display='none';
  $('#app').style.display='';
  ensureCompetitors();
  syncTabs();
  renderCurrent();

  // Offline progress (показывает модалку при наличии пропуска)
  processOffline();

  if(!startLoop._running){
    startLoop._running = true;
    startLoop();
  }
}

// Save on unload
window.addEventListener('beforeunload',()=>{
  if(state && !_offlineMode){
    state.flags.lastDayTs = Date.now();
    saveGame();
  }
});
window.addEventListener('pagehide',()=>{
  if(state && !_offlineMode){
    state.flags.lastDayTs = Date.now();
    saveGame();
  }
});

// Init
window.addEventListener('DOMContentLoaded', ()=>{
  showStartScreen();
  bindTopBar();
});

// Expose for inline handlers
window.closeAllModals = closeAllModals;