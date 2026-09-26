// ============================================================
// UI — rendering, screens, modals
// ============================================================

let currentTab = 'dashboard';

function renderCurrent(){
  if(!state) return;
  renderTopbar();
  const main = $('#main');
  switch(currentTab){
    case 'dashboard': main.innerHTML = renderDashboard(); break;
    case 'projects': main.innerHTML = renderProjects(); break;
    case 'studio': main.innerHTML = renderStudio(); break;
    case 'market': main.innerHTML = renderMarket(); break;
    case 'news': main.innerHTML = renderNews(); break;
    case 'more': main.innerHTML = renderMore(); break;
  }
  bindMain();
}

function renderTopbar(){
  $('#tb-studio').textContent = state.player.studio;
  $('#tb-date').textContent = dateToStr(state.date);
}

function renderDashboard(){
  const p = state.projects[0];
  const activeContract = state.contracts.find(c=>c.active);
  const projBlock = p ? `
    <div class="card">
      <div class="row"><h3>${escapeHtml(p.name)}</h3><span class="tag accent">${DATA.STAGES[p.stage].name}</span></div>
      <div class="pbar"><div style="width:${(projectProgress(p)*100).toFixed(1)}%"></div></div>
      <div class="sub">${(projectProgress(p)*100).toFixed(1)}% · ${p.genre}/${p.theme} · ${p.platform}</div>
      <div class="row sub" style="margin-top:6px"><span>Бюджет: ${fmt(p.budgetSpent)}</span><span>День ${p.daysElapsed}/${p.totalDays}</span></div>
    </div>` : `
    <div class="card"><div class="sub">Нет активного проекта.</div>
    <button class="btn primary full" data-action="new-project" style="margin-top:10px">🎮 Новая игра</button>
    <button class="btn full" data-action="open-contracts" style="margin-top:6px">📄 Найти контракт</button></div>`;

  const lastGame = state.releasedGames[state.releasedGames.length-1];
  const lastGameBlock = lastGame ? `
    <div class="card tight">
      <div class="row"><div class="sub">Последний релиз</div><div class="sub">${dateToStrShort({day:lastGame.releaseDay,month:lastGame.releaseMonth,year:lastGame.releaseYear})}</div></div>
      <div class="li-title" style="font-size:16px;margin-top:4px">${escapeHtml(lastGame.name)}</div>
      <div class="row" style="margin-top:6px">
        <span class="sub">Critics <b class="${lastGame.critics>=75?'green':lastGame.critics>=50?'yellow':'red'}">${lastGame.critics}</b></span>
        <span class="sub">Players <b class="${lastGame.players>=75?'green':lastGame.players>=50?'yellow':'red'}">${lastGame.players}</b></span>
        <span class="sub">Sales ${fmtNum(lastGame.totalSales)}</span>
      </div>
    </div>` : '';

  const tutorial = (!state.tutorialDone && state.stats.gamesReleased===0) ? `
    <div class="card" style="background:linear-gradient(135deg,rgba(108,140,255,.15),rgba(169,108,255,.15));border-color:var(--accent)">
      <h4>Начало карьеры</h4>
      <div class="sub">Создайте первую игру, выполните контракт и наймите первого сотрудника чтобы понять базовый цикл.</div>
      <div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">
        <button class="btn small primary" data-action="new-project">🎮 Игра</button>
        <button class="btn small" data-action="open-contracts">📄 Контракт</button>
        <button class="btn small" data-action="hire">👥 Нанять</button>
      </div>
    </div>` : '';

  const contractBlock = activeContract ? `
    <div class="card tight">
      <h4>Активный контракт</h4>
      <div class="li-title">${escapeHtml(activeContract.name)}</div>
      <div class="pbar"><div style="width:${(activeContract.progress*100).toFixed(1)}%"></div></div>
      <div class="sub">Прогресс ${(activeContract.progress*100).toFixed(0)}% · Дедлайн: ${dateToStrFull(activeContract.deadlineDay)}</div>
    </div>` : '';

  const recentNews = state.news.slice(0,3).map(n=>`
    <div class="news-item ${n.kind}">
      <div class="news-date">${dateToStrFull(n.date)}</div>
      <div>${escapeHtml(n.text)}</div>
    </div>`).join('');

  return `
    <div class="card">
      <div class="row"><div><div class="sub">Деньги</div><div class="big-num ${state.money>=0?'green':'red'}">${fmt(state.money)}</div></div>
      <div><div class="sub">Репутация</div><div class="big-num">${state.rep.toFixed(1)}</div></div>
      <div><div class="sub">Фанаты</div><div class="big-num">${fmtNum(state.fans)}</div></div></div>
      <div class="divider"></div>
      <div class="grid3">
        <div class="stat"><div class="lbl">⚡ Энергия</div><div class="val">${Math.round(state.energy)}</div></div>
        <div class="stat"><div class="lbl">📈 Популярность</div><div class="val">${state.popularity.toFixed(0)}</div></div>
        <div class="stat"><div class="lbl">🎯 Хайп</div><div class="val">${state.hype.toFixed(0)}</div></div>
      </div>
    </div>
    ${tutorial}
    ${contractBlock}
    ${projBlock}
    ${lastGameBlock}
    <div class="card tight">
      <div class="row"><h4>Новости</h4><button class="btn small" data-action="tab" data-tab="news">Все →</button></div>
      ${recentNews || '<div class="sub">Пока нет новостей.</div>'}
    </div>
  `;
}

function renderProjects(){
  const projBlocks = state.projects.map(p=>{
    const stages = DATA.STAGES.map((s,i)=>{
      const cls = i<p.stage ? 'tag green' : (i===p.stage?'tag accent':'tag');
      return `<span class="${cls}">${s.name}</span>`;
    }).join('');
    return `
      <div class="card">
        <div class="row"><h3>${escapeHtml(p.name)}</h3><span class="tag">${(DATA.PROJECT_SIZES.find(x=>x.id===p.size)||{name:'?'}).name}</span></div>
        <div class="pbar"><div style="width:${(projectProgress(p)*100).toFixed(1)}%"></div></div>
        <div style="margin:6px 0">${stages}</div>
        <div class="sub">${p.genre}/${p.theme} · Платформа: ${(DATA.PLATFORMS.find(x=>x.id===p.platform)||{name:'?'}).name}</div>
        <div class="row sub" style="margin-top:4px"><span>День ${p.daysElapsed}/${p.totalDays}</span><span>Бюджет: ${fmt(p.budgetSpent)}</span></div>
        ${p.publisher?`<div class="sub" style="margin-top:4px">Издатель: ${escapeHtml(p.publisher.name)} (доля разработчика ${(p.publisher.share*100).toFixed(0)}%)</div>`:''}
      </div>`;
  }).join('');

  const released = state.releasedGames.slice().reverse().map(g=>{
    const platName = (DATA.PLATFORMS.find(p=>p.id===g.platform)||{name:'?'}).name;
    const badges = [
      g.isPort ? '<span class="tag">PORT</span>' : '',
      g.origin==='remake' ? '<span class="tag yellow">REMAKE</span>' : '',
    ].join(' ');
    return `
      <div class="list-item">
        <div class="li-main">
          <div class="li-title">${escapeHtml(g.name)} ${badges}</div>
          <div class="li-sub">${dateToStrShort({day:g.releaseDay,month:g.releaseMonth,year:g.releaseYear})} · ${platName}</div>
          <div class="li-sub">Critics <b>${g.critics}</b> · Players <b>${g.players}</b> · Q <b>${g.quality}</b> · Sales <b>${fmtNum(g.totalSales)}</b> · ${fmt(g.lifetimeRevenue)}${g.dlcCount?` · ${g.dlcCount} DLC`:''}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${!g.isPort ? `<button class="btn small" data-action="port" data-id="${g.id}">🌐 Порт</button>` : ''}
          ${!g.isPort ? `<button class="btn small" data-action="dlc" data-id="${g.id}">📦 DLC</button>` : ''}
          <button class="btn small" data-action="reissue" data-id="${g.id}">♻️ Переиздать</button>
          ${!g.isPort ? `<button class="btn small" data-action="remake" data-id="${g.id}">🔁 Ремейк</button>` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="card">
      <div class="row"><h3>Разработка</h3><button class="btn small primary" data-action="new-project">+ Новая игра</button></div>
      ${projBlocks || '<div class="sub">Нет активных проектов.</div>'}
    </div>
    <div class="card">
      <h3>Выпущенные игры</h3>
      ${released || '<div class="sub">Пока ничего не выпущено.</div>'}
    </div>
  `;
}

function renderStudio(){
  const empList = state.employees.map(e=>`
    <div class="list-item">
      <div class="li-main">
        <div class="li-title">${escapeHtml(e.name)} <span class="tag">${e.roleName}</span></div>
        <div class="li-sub">Skill ${Math.round(e.skill)} · Мораль ${Math.round(e.morale)}% · ЗП ${fmt(e.salary)}/мес · Опыт ${Math.round(e.exp)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <button class="btn small" data-action="promote" data-id="${e.id}">↑ Учить</button>
        <button class="btn small danger" data-action="fire" data-id="${e.id}">Уволить</button>
      </div>
    </div>`).join('');

  const skillList = Object.entries(state.skills).map(([k,v])=>`
    <div class="row"><span class="sub">${k}</span>
      <div style="flex:1;margin:0 8px"><div class="pbar"><div style="width:${v}%"></div></div></div>
      <span class="mono">${Math.round(v)}</span>
    </div>`).join('');

  return `
    <div class="card">
      <h3>${escapeHtml(state.player.name)}</h3>
      <div class="sub">${escapeHtml(state.player.studio)} · ${(DATA.COUNTRIES.find(c=>c.id===state.player.country)||{name:'?'}).name}</div>
      <div class="divider"></div>
      <h4>Навыки</h4>
      ${skillList}
    </div>
    <div class="card">
      <div class="row"><h3>Сотрудники (${state.employees.length})</h3>
        <button class="btn small primary" data-action="hire">+ Нанять</button>
      </div>
      ${empList || '<div class="sub">Нет сотрудников. Нанимайте чтобы ускорить разработку.</div>'}
    </div>
    <div class="card">
      <h3>Движки</h3>
      ${state.engines.length ? state.engines.map(en=>`
        <div class="list-item">
          <div class="li-main">
            <div class="li-title">${escapeHtml(en.name)}</div>
            <div class="li-sub">Gfx ${en.graphics} · Phys ${en.physics} · AI ${en.ai} · Tools ${en.tools} · ${en.daysLeft>0?'В разработке '+en.daysLeft+'д':(en.licensed?'лицензирован':'готов')}</div>
          </div>
          ${en.daysLeft===0 && !en.licensed?`<button class="btn small" data-action="license-engine" data-id="${en.id}">Лиценз.</button>`:''}
        </div>`).join('') : '<div class="sub">Нет собственных движков.</div>'}
      <button class="btn primary full" data-action="new-engine" style="margin-top:8px">🛠 Создать движок</button>
    </div>
  `;
}

function renderMarket(){
  const trends = DATA.GENRES.map(g=>({name:g.name, v: state.trends.genres[g.id]||1.0})).sort((a,b)=>b.v-a.v);
  const rising = trends.filter(t=>t.v>1.05).slice(0,4);
  const falling = trends.slice().reverse().filter(t=>t.v<0.95).slice(0,4);
  const top = trends.slice(0,5);

  const platforms = DATA.PLATFORMS.filter(p=>p.releaseYear<=state.date.year).map(p=>`
    <tr><td>${p.name}</td><td class="mono">${p.releaseYear}</td><td class="mono">${p.marketSize}</td><td class="mono">${(p.fee*100).toFixed(0)}%</td></tr>
  `).join('');

  const upcoming = DATA.PLATFORMS.filter(p=>p.releaseYear>state.date.year).slice(0,5).map(p=>`
    <div class="list-item"><div class="li-main"><div class="li-title">${p.name}</div><div class="li-sub">Ожидается в ${p.releaseYear}</div></div></div>
  `).join('');

  return `
    <div class="card">
      <h3>Рынок · ${state.date.year}</h3>
      <div class="sub">Обновление трендов каждый квартал</div>
      <div class="divider"></div>
      <h4>🔥 Популярные жанры</h4>
      ${top.map(t=>`<div class="row"><span>${t.name}</span><span class="mono ${t.v>1.05?'green':t.v<0.95?'red':''}">${((t.v-1)*100>=0?'+':'')}${((t.v-1)*100).toFixed(0)}%</span></div>`).join('')}
      <div class="divider"></div>
      <div class="grid2">
        <div><h4 class="green">📈 Растущие</h4>${rising.map(r=>`<div class="sub">${r.name} +${((r.v-1)*100).toFixed(0)}%</div>`).join('')||'<div class="sub">—</div>'}</div>
        <div><h4 class="red">📉 Падающие</h4>${falling.map(r=>`<div class="sub">${r.name} ${((r.v-1)*100).toFixed(0)}%</div>`).join('')||'<div class="sub">—</div>'}</div>
      </div>
    </div>
    <div class="card">
      <h3>Платформы</h3>
      <table><thead><tr><th>Название</th><th>Год</th><th>Рынок</th><th>Комиссия</th></tr></thead>
      <tbody>${platforms}</tbody></table>
    </div>
    ${upcoming ? `<div class="card"><h3>Скоро</h3>${upcoming}</div>` : ''}
    <div class="card">
      <h3>Конкуренты</h3>
      ${(state.competitors||[]).map(c=>`
        <div class="list-item"><div class="li-main">
          <div class="li-title">${escapeHtml(c.name)} <span class="tag ${c.type==='major'?'red':'accent'}">${c.type}</span></div>
          <div class="li-sub">Skill ${c.skill} · Fans ${fmtNum(c.fans)} ${c.lastRelease?`· последний релиз: "${escapeHtml(c.lastRelease.name)}" (${c.lastRelease.critics})`:''}</div>
        </div></div>`).join('') || '<div class="sub">Нет данных.</div>'}
    </div>
  `;
}

function renderNews(){
  const items = state.news.map(n=>`
    <div class="news-item ${n.kind}">
      <div class="news-date">${dateToStrFull(n.date)}</div>
      <div>${escapeHtml(n.text)}</div>
    </div>`).join('');
  return `<div class="card"><h3>📰 Новости</h3>${items || '<div class="sub">Пока пусто.</div>'}</div>`;
}

function renderMore(){
  return `
    <div class="card">
      <h3>💰 Финансы</h3>
      <div class="row"><span>Доход за месяц</span><span class="green mono">${fmt(state.finance.monthIncome)}</span></div>
      <div class="row"><span>Расход за месяц</span><span class="red mono">${fmt(state.finance.monthExpense)}</span></div>
      <div class="row"><span>Прошлый месяц</span><span class="mono">${fmt(state.finance.lastMonthIncome - state.finance.lastMonthExpense)}</span></div>
      <div class="divider"></div>
      <div class="row"><span>Общий доход</span><span class="green mono">${fmt(state.stats.totalRevenue)}</span></div>
      <div class="row"><span>Общие расходы</span><span class="red mono">${fmt(state.stats.totalExpenses)}</span></div>
      <div class="row"><span>Итого</span><span class="mono">${fmt(state.money)}</span></div>
    </div>
    <div class="card">
      <h3>🧪 Исследования</h3>
      ${state.research.active?`<div class="sub">Активно: ${(DATA.RESEARCH.find(r=>r.id===state.research.active.id)||{name:'?'}).name} — ${state.research.active.daysLeft}д</div>`:''}
      <div class="divider"></div>
      ${DATA.RESEARCH.map(r=>{
        const done = state.research.completed.includes(r.id);
        const locked = r.year > state.date.year;
        const reqOk = r.req.every(x=>state.research.completed.includes(x));
        return `<div class="list-item">
          <div class="li-main">
            <div class="li-title">${r.name} ${done?'<span class="tag green">OK</span>':locked?`<span class="tag yellow">${r.year}</span>`:''}</div>
            <div class="li-sub">${r.desc} · ${fmt(r.cost)} · ${r.days}д${r.req.length?' · требует: '+r.req.join(', '):''}</div>
          </div>
          ${!done && !locked && reqOk && !state.research.active?`<button class="btn small primary" data-action="research" data-id="${r.id}">Изучить</button>`:''}
        </div>`;
      }).join('')}
    </div>
    <div class="card">
      <h3>📄 Контракты</h3>
      <button class="btn primary full" data-action="open-contracts" style="margin-bottom:8px">🔎 Найти контракт</button>
      ${state.contracts.length? state.contracts.slice().reverse().map(c=>`
        <div class="list-item">
          <div class="li-main">
            <div class="li-title">${escapeHtml(c.name)} ${c.active?'<span class="tag accent">активен</span>':'<span class="tag green">завершён</span>'}</div>
            <div class="li-sub">${fmt(c.budget)} · требование: Quality ${c.qualityReq}+ · ${c.months} мес.</div>
          </div>
        </div>`).join('') : '<div class="sub">Контрактов ещё не было.</div>'}
    </div>
    <div class="card">
      <h3>🏆 Награды</h3>
      ${state.awards.length? state.awards.slice().reverse().map(a=>{
        const aw = DATA.AWARDS.find(x=>x.id===a.awardId);
        const g = state.releasedGames.find(x=>x.id===a.gameId);
        return `<div class="list-item"><div class="li-main"><div class="li-title">${aw?.name||'Award'}</div><div class="li-sub">${g?.name||''} · ${a.year}</div></div></div>`;
      }).join('') : '<div class="sub">Пока без наград. Выпустите качественную игру и ждите церемонию в декабре.</div>'}
    </div>
    <div class="card">
      <h3>📈 Карьера</h3>
      <button class="btn full" data-action="career" style="margin-bottom:8px">Открыть сводку</button>
      <div class="row"><span>Игр выпущено</span><span class="mono">${state.stats.gamesReleased}</span></div>
      <div class="row"><span>Всего продаж</span><span class="mono">${fmtNum(state.stats.totalSales)}</span></div>
      <div class="row"><span>Лучший обзор</span><span class="mono">${state.stats.bestReview}</span></div>
      <div class="row"><span>Награды</span><span class="mono">${state.awards.length}</span></div>
    </div>
    <div class="card">
      <h3>⚙️ Настройки</h3>
      <div class="sub">Сложность: <b>${state.player.difficulty}</b></div>
      <div class="grid2" style="margin-top:8px">
        <button class="btn" data-action="save">💾 Сохранить</button>
        <button class="btn" data-action="export">📤 Export</button>
        <button class="btn" data-action="import">📥 Import</button>
        <button class="btn danger" data-action="reset">🗑 Reset</button>
        <button class="btn" data-action="daily">🎁 Daily</button>
        <button class="btn" data-action="about">ℹ️ About</button>
      </div>
    </div>
    <div class="card" style="text-align:center;color:var(--txt2);font-size:11px">
      Indie Dev Tycoon · v0.1beta<br>Game by @braskov1ch · © 2026
    </div>
  `;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- modals ----------
function modalNewProject(){
  const year = state.date.year;
  const platforms = DATA.PLATFORMS.filter(p=>p.releaseYear<=year);
  const engines = state.engines.filter(e=>e.daysLeft===0);
  const sizes = DATA.PROJECT_SIZES;
  const html = `
    <h2>🎮 Новая игра</h2>
    <label>Название<input id="np-name" type="text" maxlength="40" placeholder="My Indie Game"></label>
    <div class="field-row">
      <label>Жанр<select id="np-genre">${DATA.GENRES.map(g=>`<option value="${g.id}">${g.name}</option>`).join('')}</select></label>
      <label>Тема<select id="np-theme">${DATA.THEMES.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
    </div>
    <div class="field-row">
      <label>Платформа<select id="np-platform">${platforms.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></label>
      <label>Размер<select id="np-size">${sizes.map(s=>`<option value="${s.id}">${s.name} — ${fmt(s.cost)} · ~${s.days}д</option>`).join('')}</select></label>
    </div>
    <label>Маркетинг ($)<input id="np-mkt" type="number" min="0" value="0"></label>
    <label>Собственный движок<select id="np-engine"><option value="">— внешний (без бонуса) —</option>${engines.map(e=>`<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('')}</select></label>
    <label>Издатель<select id="np-publisher"><option value="">— Самоиздание —</option></select></label>
    <div class="sub" id="np-pub-info" style="margin-top:6px"></div>
    <div class="close-row">
      <button class="btn" data-action="close-modal">Отмена</button>
      <button class="btn primary" data-action="confirm-project">Начать разработку</button>
    </div>
  `;
  openModal(html, {onMount:(bg)=>{
    const sel = bg.querySelector('#np-publisher');
    const info = bg.querySelector('#np-pub-info');
    info.textContent = 'Вы получаете 100% выручки после комиссии платформ.';
    const avail = DATA.PUBLISHERS.filter(p=>p.founded<=state.date.year);
    for(const p of avail){
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name + ` (advance up to $${p.advance[1]}, доля разработчика ${(p.share*100).toFixed(0)}%)`;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', ()=>{
      if(!sel.value){ info.textContent='Вы получаете 100% выручки после комиссии платформ.'; return; }
      const p = DATA.PUBLISHERS.find(x=>x.id===sel.value);
      if(!p) return;
      info.textContent = `Аванс до ${fmt(p.advance[1])} · доля разработчика ${(p.share*100).toFixed(0)}% · маркетинг-бюджет до ${fmt(p.marketing[1])}`;
    });
  }});
}

function confirmNewProject(){
  const g = $('#np-name')?.value.trim() || 'Untitled';
  const genre = $('#np-genre').value;
  const theme = $('#np-theme').value;
  const platform = $('#np-platform').value;
  const size = $('#np-size').value;
  const marketing = num($('#np-mkt').value);
  const engineId = $('#np-engine').value || null;
  const pubId = $('#np-publisher').value;

  let publisher = null;
  if(pubId){
    const pdef = DATA.PUBLISHERS.find(x=>x.id===pubId);
    if(pdef){
      publisher = {
        id: pdef.id, name: pdef.name,
        advance: Math.round(rnd(pdef.advance[0], pdef.advance[1]) * (1+state.rep/60)),
        share: pdef.share,
        marketing: Math.round(rnd(pdef.marketing[0], pdef.marketing[1])),
        platforms: pdef.platforms,
        genrePreference: pdef.genres,
      };
    }
  }

  if(state.projects.some(p=>p.type==='game')){ toast('Сначала завершите текущий проект','warn'); return; }
  const res = startProject({
    name: g, genre, theme, platform, size, marketing, publisher, engineId
  });
  if(res.error){ toast(res.error,'err'); return; }
  closeAllModals();
}

function modalNewEngine(){
  const html = `
    <h2>🛠 Создать движок</h2>
    <label>Название<input id="en-name" type="text" maxlength="30" placeholder="Brask Engine"></label>
    <label>Graphics<input id="en-gfx" type="range" min="20" max="100" value="50"></label>
    <label>Physics<input id="en-phys" type="range" min="20" max="100" value="50"></label>
    <label>AI<input id="en-ai" type="range" min="20" max="100" value="50"></label>
    <label>Tools<input id="en-tools" type="range" min="20" max="100" value="50"></label>
    <div class="sub">Стоимость зависит от параметров.</div>
    <div class="close-row">
      <button class="btn" data-action="close-modal">Отмена</button>
      <button class="btn primary" data-action="confirm-engine">Создать</button>
    </div>
  `;
  openModal(html);
}
function confirmNewEngine(){
  createEngine({
    name: $('#en-name').value.trim() || 'Custom Engine',
    graphics: +$('#en-gfx').value,
    physics: +$('#en-phys').value,
    ai: +$('#en-ai').value,
    tools: +$('#en-tools').value,
  });
  closeAllModals();
}

function modalHire(){
  const html = `
    <h2>👥 Нанять сотрудника</h2>
    <div class="sub">Навык и зарплата случайны. Навык выше у студий с высокой репутацией.</div>
    ${DATA.ROLES.map(r=>`
      <div class="list-item">
        <div class="li-main">
          <div class="li-title">${r.name}</div>
          <div class="li-sub">ЗП ${fmt(r.salary[0])} – ${fmt(r.salary[1])}</div>
        </div>
        <button class="btn small primary" data-action="confirm-hire" data-role="${r.id}">Нанять</button>
      </div>`).join('')}
    <div class="close-row"><button class="btn" data-action="close-modal">Закрыть</button></div>
  `;
  openModal(html);
}

function modalPort(gameId){
  const g = state.releasedGames.find(x=>x.id===gameId);
  if(!g) return;
  const avail = DATA.PLATFORMS.filter(p=>p.releaseYear<=state.date.year && p.id!==g.platform && !g.ports.some(pp=>pp.platform===p.id));
  if(avail.length===0){ toast('Нет доступных платформ','warn'); return; }
  const html = `
    <h2>🌐 Порт "${escapeHtml(g.name)}"</h2>
    <div class="sub">Стоимость зависит от размера, возраста и сложности платформы.</div>
    <label>Платформа<select id="pt-plat">${avail.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></label>
    <div class="close-row">
      <button class="btn" data-action="close-modal">Отмена</button>
      <button class="btn primary" data-action="confirm-port" data-id="${g.id}">Порт</button>
    </div>
  `;
  openModal(html);
}

function modalRemake(gameId){
  const g = state.releasedGames.find(x=>x.id===gameId);
  if(!g) return;
  const html = `
    <h2>🔁 Ремейк</h2>
    <div class="sub">Ремейк наследует часть качества оригинала.</div>
    <label>Название<input id="rm-name" type="text" value="${escapeHtml(g.name)} Remake"></label>
    <div class="sub" style="margin-top:6px">Оценка оригинала: ${g.critics}/100 · Размер: ${g.size}</div>
    <div class="close-row">
      <button class="btn" data-action="close-modal">Отмена</button>
      <button class="btn primary" data-action="confirm-remake" data-id="${g.id}">Создать</button>
    </div>
  `;
  openModal(html);
}

function modalReissue(gameId){
  const html = `
    <h2>♻️ Переиздание</h2>
    <div class="row" style="gap:6px">
      <button class="btn full primary" data-action="confirm-reissue" data-id="${gameId}" data-kind="standard">Standard Edition</button>
    </div>
    <div class="row" style="gap:6px;margin-top:8px">
      <button class="btn full" data-action="confirm-reissue" data-id="${gameId}" data-kind="goty">GOTY Edition</button>
    </div>
    <div class="close-row"><button class="btn" data-action="close-modal">Закрыть</button></div>
  `;
  openModal(html);
}

function modalContracts(){
  if(state.contractOffers.length===0) refreshContractOffers();
  const html = `
    <h2>📄 Рынок контрактов</h2>
    ${state.contracts.some(c=>c.active)?'<div class="sub" style="color:var(--yellow)">У вас уже активный контракт.</div>':''}
    ${state.contractOffers.map(o=>`
      <div class="list-item">
        <div class="li-main">
          <div class="li-title">${escapeHtml(o.name)}</div>
          <div class="li-sub">Бюджет ${fmt(o.budget)} · срок ${o.months} мес · Quality ${o.qualityReq}+</div>
        </div>
        <button class="btn small primary" data-action="accept-contract" data-id="${o.id}">Принять</button>
      </div>`).join('')}
    <div class="close-row">
      <button class="btn" data-action="refresh-contracts">Обновить</button>
      <button class="btn" data-action="close-modal">Закрыть</button>
    </div>
  `;
  openModal(html);
}

function modalCareer(){
  const s = careerSummary();
  const hist = state.stats.history.slice(-60);
  const chart1 = renderHistoryChart(hist, 'money', '#6c8cff');
  const chart2 = renderHistoryChart(hist, 'fans', '#a96cff');
  const html = `
    <h2>📈 Career Summary</h2>
    <div class="grid2">
      <div class="stat"><div class="lbl">Лет в индустрии</div><div class="val">${s.yearsInIndustry}</div></div>
      <div class="stat"><div class="lbl">Игр выпущено</div><div class="val">${s.gamesReleased}</div></div>
      <div class="stat"><div class="lbl">Всего продаж</div><div class="val">${fmtNum(s.totalSales)}</div></div>
      <div class="stat"><div class="lbl">Всего выручки</div><div class="val">${fmt(s.totalRevenue)}</div></div>
      <div class="stat"><div class="lbl">Награды</div><div class="val">${s.awards}</div></div>
      <div class="stat"><div class="lbl">Фанаты</div><div class="val">${fmtNum(s.fans)}</div></div>
      <div class="stat"><div class="lbl">Сотрудники</div><div class="val">${s.employees}</div></div>
      <div class="stat"><div class="lbl">Баланс</div><div class="val">${fmt(s.money)}</div></div>
    </div>
    <div class="divider"></div>
    <div class="sub">Лучшая игра: <b>${escapeHtml(s.bestGame)}</b> · Лучший обзор: <b>${s.bestReview}</b></div>
    <div class="divider"></div>
    <h4>Капитал</h4>${chart1}
    <h4 style="margin-top:8px">Фанаты</h4>${chart2}
    <div class="close-row"><button class="btn" data-action="close-modal">Закрыть</button></div>
  `;
  openModal(html);
}

function renderHistoryChart(hist, key, color){
  if(!hist || hist.length<2) return '<div class="sub">Недостаточно данных.</div>';
  const w=400,h=100,pad=4;
  const vals = hist.map(d=>num(d[key]));
  const max = Math.max(1, ...vals);
  const min = Math.min(0, ...vals);
  const range = (max-min) || 1;
  const pts = vals.map((v,i)=>{
    const x = pad + (i/(vals.length-1))*(w-pad*2);
    const y = h-pad - ((v-min)/range)*(h-pad*2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = vals[vals.length-1]|0;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline fill="none" stroke="${color}" stroke-width="1.8" points="${pts}" />
  </svg>
  <div class="sub">Последнее: ${key==='money'?fmt(last):fmtNum(last)}</div>`;
}

function modalAbout(){
  const html = `
    <h2>About</h2>
    <p><b>Indie Dev Tycoon</b></p>
    <p class="sub">Игра от @braskov1ch<br>2026<br>v0.1beta</p>
    <p class="sub">Симулятор инди-разработчика, в котором история игровой индустрии развивается вместе с вашей студией.</p>
    <div class="close-row"><button class="btn primary" data-action="close-modal">OK</button></div>
  `;
  openModal(html);
}

function modalReset(){
  const html = `
    <h2>Reset game</h2>
    <p class="sub">Все данные будут удалены без возможности отката.</p>
    <div class="close-row">
      <button class="btn" data-action="close-modal">Отмена</button>
      <button class="btn danger" data-action="confirm-reset">Удалить</button>
    </div>
  `;
  openModal(html);
}

// ---------- event binding ----------
function bindMain(){
  $$('#main [data-action]').forEach(el=>{
    el.addEventListener('click', handleAction);
  });
}

function handleAction(e){
  const btn = e.currentTarget;
  const a = btn.dataset.action;
  const id = btn.dataset.id;
  switch(a){
    case 'tab': currentTab = btn.dataset.tab; syncTabs(); renderCurrent(); break;
    case 'new-project': modalNewProject(); break;
    case 'hire': modalHire(); break;
    case 'new-engine': modalNewEngine(); break;
    case 'open-contracts': modalContracts(); break;
    case 'career': modalCareer(); break;
    case 'about': modalAbout(); break;
    case 'daily': {
      const r = tryDailyBonus();
      if(!r) toast('Уже получено сегодня','warn');
      else toast(`🎁 Бонус! Streak ${r.streak} · +${fmt(r.reward.money)}`,'ok');
      renderCurrent();
      break;
    }
    case 'save': saveGame(); toast('Сохранено','ok'); break;
    case 'export': exportSave(); break;
    case 'import': importSave(); break;
    case 'reset': modalReset(); break;
    case 'port': modalPort(id); break;
    case 'dlc': addDLC(id); renderCurrent(); break;
    case 'reissue': modalReissue(id); break;
    case 'remake': modalRemake(id); break;
    case 'fire': fireEmployee(id); renderCurrent(); break;
    case 'promote': promoteEmployee(id); renderCurrent(); break;
    case 'research': startResearch(id); renderCurrent(); break;
    case 'license-engine': licenseEngine(id); renderCurrent(); break;
    case 'close-modal': closeAllModals(); break;
    case 'confirm-project': confirmNewProject(); break;
    case 'confirm-engine': confirmNewEngine(); break;
    case 'confirm-hire': hireEmployee(btn.dataset.role); closeAllModals(); renderCurrent(); break;
    case 'confirm-port': portGame(id, $('#pt-plat').value); closeAllModals(); renderCurrent(); break;
    case 'confirm-remake': remakeGame(id, $('#rm-name').value.trim()); closeAllModals(); renderCurrent(); break;
    case 'confirm-reissue': reissueGame(id, btn.dataset.kind); closeAllModals(); renderCurrent(); break;
    case 'accept-contract': acceptContract(id); closeAllModals(); renderCurrent(); break;
    case 'refresh-contracts': refreshContractOffers(); closeAllModals(); modalContracts(); break;
    case 'confirm-reset':
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(BACKUP_KEY);
      location.reload();
      break;
  }
}

function syncTabs(){
  $$('#bottomnav button').forEach(b=>b.classList.toggle('active', b.dataset.tab===currentTab));
}

// ---------- export / import ----------
function exportSave(){
  try{
    const blob = new Blob([JSON.stringify(state)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `indie-dev-tycoon-save-${Date.now()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    toast('Экспортировано','ok');
  }catch(e){ toast('Ошибка экспорта','err'); }
}

function importSave(){
  const inp = document.createElement('input');
  inp.type='file'; inp.accept='application/json';
  inp.addEventListener('change',()=>{
    const f = inp.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=>{
      try{
        const obj = JSON.parse(r.result);
        if(!obj || typeof obj!=='object' || !obj.date || !obj.player) throw new Error('bad');
        state = migrate(obj);
        ensureCompetitors();
        saveGame();
        toast('Импортировано','ok');
        renderCurrent();
      }catch(e){ toast('Некорректный файл','err'); }
    };
    r.readAsText(f);
  });
  inp.click();
}