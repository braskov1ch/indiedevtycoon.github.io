// ============================================================
// DATA — static game data (platforms, genres, timeline, etc.)
// ============================================================

const DATA = {};

DATA.COUNTRIES = [
  { id:'us', name:'United States', tax:0.25, costOfLiving:1.0,  startCapital:30000 },
  { id:'uk', name:'United Kingdom', tax:0.22, costOfLiving:0.95, startCapital:27000 },
  { id:'de', name:'Germany',         tax:0.30, costOfLiving:0.9,  startCapital:26000 },
  { id:'jp', name:'Japan',           tax:0.28, costOfLiving:1.05, startCapital:29000 },
  { id:'pl', name:'Poland',          tax:0.19, costOfLiving:0.55, startCapital:18000 },
  { id:'se', name:'Sweden',          tax:0.32, costOfLiving:1.0,  startCapital:28000 },
  { id:'ca', name:'Canada',          tax:0.26, costOfLiving:0.9,  startCapital:27000 },
  { id:'ru', name:'Russia',          tax:0.20, costOfLiving:0.5,  startCapital:15000 },
  { id:'br', name:'Brazil',          tax:0.27, costOfLiving:0.5,  startCapital:15000 },
  { id:'au', name:'Australia',       tax:0.28, costOfLiving:1.0,  startCapital:28000 },
];

DATA.PLATFORMS = [
  { id:'pc',     name:'PC',                releaseYear:2000, marketSize:100, fee:0.00, audience:'core',    difficulty:1.0 },
  { id:'ps2',    name:'PlayStation 2',     releaseYear:2000, marketSize:180, fee:0.15, audience:'core',    difficulty:1.3 },
  { id:'gba',    name:'Game Boy Advance',  releaseYear:2001, marketSize:55,  fee:0.30, audience:'casual',  difficulty:0.8 },
  { id:'xbox',   name:'Xbox',              releaseYear:2001, marketSize:70,  fee:0.15, audience:'core',    difficulty:1.3 },
  { id:'steam',  name:'Steam',             releaseYear:2003, marketSize:200, fee:0.30, audience:'core',    difficulty:0.5 },
  { id:'nds',    name:'Nintendo DS',       releaseYear:2004, marketSize:120, fee:0.15, audience:'casual',  difficulty:0.9 },
  { id:'x360',   name:'Xbox 360',          releaseYear:2005, marketSize:150, fee:0.15, audience:'core',    difficulty:1.5 },
  { id:'ps3',    name:'PlayStation 3',     releaseYear:2006, marketSize:150, fee:0.15, audience:'core',    difficulty:1.6 },
  { id:'wii',    name:'Wii',               releaseYear:2006, marketSize:130, fee:0.15, audience:'casual',  difficulty:1.1 },
  { id:'ios',    name:'iPhone / iOS',      releaseYear:2007, marketSize:250, fee:0.30, audience:'mobile',  difficulty:1.2 },
  { id:'android',name:'Android',           releaseYear:2008, marketSize:280, fee:0.30, audience:'mobile',  difficulty:1.0 },
  { id:'ps4',    name:'PlayStation 4',     releaseYear:2013, marketSize:200, fee:0.15, audience:'core',    difficulty:1.8 },
  { id:'xone',   name:'Xbox One',          releaseYear:2013, marketSize:150, fee:0.15, audience:'core',    difficulty:1.8 },
  { id:'switch', name:'Nintendo Switch',   releaseYear:2017, marketSize:220, fee:0.15, audience:'core',    difficulty:1.6 },
  { id:'epic',   name:'Epic Games Store',  releaseYear:2018, marketSize:150, fee:0.12, audience:'core',    difficulty:0.6 },
  { id:'ps5',    name:'PlayStation 5',     releaseYear:2020, marketSize:180, fee:0.15, audience:'core',    difficulty:2.0 },
  { id:'xsx',    name:'Xbox Series X|S',   releaseYear:2020, marketSize:120, fee:0.15, audience:'core',    difficulty:2.0 },
];

DATA.GENRES = [
  { id:'action',      name:'Action',       base:{g:1.0,d:1.0,t:1.0,a:1.0}, trend:1.0 },
  { id:'adventure',   name:'Adventure',    base:{g:1.0,d:1.2,t:0.9,a:1.0}, trend:1.0 },
  { id:'rpg',         name:'RPG',          base:{g:1.0,d:1.2,t:1.1,a:1.1}, trend:1.0 },
  { id:'strategy',    name:'Strategy',     base:{g:0.9,d:1.1,t:1.2,a:0.9}, trend:1.0 },
  { id:'simulation',  name:'Simulation',   base:{g:0.9,d:1.0,t:1.1,a:0.9}, trend:1.0 },
  { id:'puzzle',      name:'Puzzle',       base:{g:0.8,d:1.3,t:1.0,a:0.9}, trend:1.0 },
  { id:'platformer',  name:'Platformer',   base:{g:1.1,d:1.1,t:1.0,a:1.0}, trend:1.0 },
  { id:'horror',      name:'Horror',       base:{g:1.1,d:1.0,t:1.0,a:1.3}, trend:1.0 },
  { id:'racing',      name:'Racing',       base:{g:1.3,d:0.9,t:1.1,a:1.0}, trend:1.0 },
  { id:'sports',      name:'Sports',       base:{g:1.1,d:0.9,t:1.0,a:1.0}, trend:1.0 },
  { id:'roguelike',   name:'Roguelike',    base:{g:1.0,d:1.2,t:1.0,a:0.9}, trend:1.0 },
  { id:'metroidvania',name:'Metroidvania', base:{g:1.1,d:1.2,t:1.0,a:1.1}, trend:1.0 },
  { id:'vn',          name:'Visual Novel', base:{g:0.8,d:1.3,t:0.8,a:1.2}, trend:1.0 },
  { id:'survival',    name:'Survival',     base:{g:1.0,d:1.0,t:1.2,a:1.0}, trend:1.0 },
  { id:'shooter',     name:'Shooter',      base:{g:1.3,d:1.0,t:1.1,a:1.0}, trend:1.0 },
];

DATA.THEMES = [
  { id:'fantasy',    name:'Fantasy',      mod:{rpg:1.1,adventure:1.1} },
  { id:'scifi',      name:'Sci-Fi',       mod:{shooter:1.1,strategy:1.1} },
  { id:'cyberpunk',  name:'Cyberpunk',    mod:{rpg:1.15,action:1.1} },
  { id:'medieval',   name:'Medieval',     mod:{strategy:1.1,rpg:1.1} },
  { id:'horror',     name:'Horror',       mod:{horror:1.2,survival:1.15} },
  { id:'space',      name:'Space',        mod:{simulation:1.1,strategy:1.1} },
  { id:'military',   name:'Military',     mod:{shooter:1.15,strategy:1.1} },
  { id:'detective',  name:'Detective',    mod:{adventure:1.15,vn:1.1} },
  { id:'superheroes',name:'Superheroes',  mod:{action:1.15,adventure:1.1} },
  { id:'pirates',    name:'Pirates',      mod:{adventure:1.1,survival:1.05} },
  { id:'postapoc',   name:'Post-apocalypse',mod:{survival:1.2,shooter:1.1} },
  { id:'modern',     name:'Modern',       mod:{sports:1.1,simulation:1.05} },
  { id:'nature',     name:'Nature',       mod:{simulation:1.1,adventure:1.05} },
  { id:'steampunk',  name:'Steampunk',    mod:{rpg:1.1,strategy:1.1} },
  { id:'noir',       name:'Noir',         mod:{detective:1.2,vn:1.1} },
];

DATA.PUBLISHERS = [
  { id:'team17',    name:'Team17',              founded:1990, advance:[8000,40000],  share:0.70, marketing:[20000,80000],  platforms:['pc','switch','xone','ps4'],  genres:['platformer','strategy','simulation'], rep:55 },
  { id:'devolver',  name:'Devolver Digital',    founded:2009, advance:[15000,80000], share:0.75, marketing:[40000,150000], platforms:['pc','switch','ps4','xone'],  genres:['action','roguelike','shooter','horror'], rep:70 },
  { id:'paradox',   name:'Paradox Interactive', founded:1999, advance:[20000,120000],share:0.65, marketing:[50000,200000], platforms:['pc'],                        genres:['strategy','simulation'], rep:72 },
  { id:'focus',     name:'Focus Entertainment', founded:1996, advance:[15000,100000],share:0.70, marketing:[40000,180000], platforms:['pc','ps5','xsx','ps4'],      genres:['action','adventure','rpg'], rep:65 },
  { id:'505',       name:'505 Games',           founded:2006, advance:[12000,90000], share:0.70, marketing:[30000,150000], platforms:['pc','ps4','xone','switch'], genres:['action','adventure','simulation'], rep:60 },
  { id:'rawfury',   name:'Raw Fury',            founded:2015, advance:[10000,60000], share:0.75, marketing:[25000,120000], platforms:['pc','switch','ps4','xone'],  genres:['adventure','puzzle','roguelike'], rep:68 },
  { id:'annapurna', name:'Annapurna Interactive',founded:2016,advance:[18000,90000], share:0.75, marketing:[35000,150000], platforms:['pc','ps5','ps4','switch'], genres:['adventure','vn','puzzle'], rep:78 },
];

DATA.TIMELINE = [
  { year:2001, month:1, text:'Game Boy Advance launches worldwide.' },
  { year:2001, month:11,text:'Microsoft enters the console market with Xbox.' },
  { year:2002, month:8, text:'Steam announced by Valve.' },
  { year:2003, month:9, text:'Steam launches as digital distribution platform.' },
  { year:2004, month:11,text:'Nintendo DS launches.' },
  { year:2005, month:11,text:'Xbox 360 launches. HD era begins.' },
  { year:2006, month:11,text:'PlayStation 3 and Wii launch.' },
  { year:2007, month:6, text:'First iPhone releases — mobile gaming era begins.' },
  { year:2008, month:9, text:'Android 1.0 released.' },
  { year:2008, month:11,text:'Steam reaches 15 million active accounts.' },
  { year:2010, month:5, text:'Indie games boom: Minecraft enters alpha.' },
  { year:2011, month:11,text:'Humble Bundle popularizes indie bundles.' },
  { year:2012, month:4, text:'Kickstarter becomes a major funding route for indie games.' },
  { year:2013, month:11,text:'PlayStation 4 and Xbox One launch.' },
  { year:2014, month:8, text:'Indie games thrive on Steam Greenlight.' },
  { year:2015, month:3, text:'Steam Directories replaced by Greenlight successor.' },
  { year:2017, month:3, text:'Nintendo Switch launches.' },
  { year:2017, month:11,text:'Steam Direct replaces Greenlight.' },
  { year:2018, month:12,text:'Epic Games Store launches.' },
  { year:2019, month:5, text:'Indie titles dominate award season.' },
  { year:2020, month:11,text:'PlayStation 5 and Xbox Series X|S launch.' },
  { year:2021, month:2, text:'Steam hits 25 million concurrent users.' },
  { year:2022, month:5, text:'Steam Deck launches — handheld PC boom.' },
  { year:2023, month:10,text:'Indie games represent over 40% of Steam releases.' },
  { year:2024, month:6, text:'AI-assisted development tools reshape indie scene.' },
  { year:2025, month:3, text:'Global indie market reaches all-time high.' },
];

DATA.COMPETITORS = [
  { id:'valve',    name:'Valve',              type:'major', founded:1996, skill:95 },
  { id:'nintendo', name:'Nintendo',           type:'major', founded:1889, skill:93 },
  { id:'sony',     name:'Sony',               type:'major', founded:1946, skill:92 },
  { id:'ms',       name:'Microsoft',          type:'major', founded:1975, skill:91 },
  { id:'ea',       name:'Electronic Arts',    type:'major', founded:1982, skill:85 },
  { id:'ubisoft',  name:'Ubisoft',            type:'major', founded:1986, skill:83 },
  { id:'activ',    name:'Activision',         type:'major', founded:1979, skill:86 },
  { id:'bethesda', name:'Bethesda',           type:'major', founded:1986, skill:82 },
  { id:'cdpr',     name:'CD Projekt',         type:'major', founded:1994, skill:88 },
  { id:'moonlight',name:'Moonlight Games',    type:'indie', founded:2012, skill:72 },
  { id:'pixelpeak',name:'PixelPeak Studio',   type:'indie', founded:2014, skill:66 },
  { id:'retrorock',name:'Retro Rocket',       type:'indie', founded:2010, skill:68 },
  { id:'neonbyte', name:'Neon Byte',          type:'indie', founded:2016, skill:63 },
  { id:'goldendeer',name:'Golden Deer Games', type:'indie', founded:2013, skill:70 },
  { id:'tinytitan',name:'Tiny Titan Interactive',type:'indie',founded:2017, skill:60 },
];

DATA.RESEARCH = [
  { id:'2d',       name:'2D Graphics',        cost:2000,  days:20, year:2000, req:[],             effect:{graphics:3, tech:2}, desc:'Modern 2D rendering.' },
  { id:'3d',       name:'3D Graphics',        cost:8000,  days:45, year:2002, req:['2d'],          effect:{graphics:6, tech:4}, desc:'Real-time 3D engine.' },
  { id:'phys',     name:'Physics',            cost:12000, days:50, year:2004, req:['3d'],          effect:{tech:5},             desc:'Realistic physics simulation.' },
  { id:'ai',       name:'Game AI',            cost:14000, days:55, year:2005, req:['3d'],          effect:{design:4, tech:3},   desc:'Adaptive NPC behavior.' },
  { id:'audio',    name:'Advanced Audio',     cost:6000,  days:30, year:2003, req:[],              effect:{audio:6},            desc:'Dynamic music and voice.' },
  { id:'online',   name:'Online Features',    cost:10000, days:45, year:2005, req:['3d'],          effect:{tech:4},             desc:'Leaderboards and updates.' },
  { id:'multi',    name:'Multiplayer',        cost:22000, days:70, year:2007, req:['online'],      effect:{tech:6, design:3},   desc:'Real-time multiplayer.' },
  { id:'mobile',   name:'Mobile Optimization',cost:8000,  days:35, year:2008, req:[],              effect:{tech:3},             desc:'Touch controls, low-end support.' },
  { id:'proc',     name:'Procedural Gen',     cost:18000, days:60, year:2010, req:['3d'],          effect:{design:5, tech:4},   desc:'Endless worlds.' },
  { id:'adv3d',    name:'Advanced 3D',        cost:26000, days:75, year:2011, req:['3d','phys'],   effect:{graphics:8, tech:5}, desc:'PBR and modern shaders.' },
  { id:'vr',       name:'VR Support',         cost:40000, days:90, year:2016, req:['adv3d'],       effect:{graphics:4, tech:6}, desc:'Virtual reality.' },
  { id:'rt',       name:'Ray Tracing',        cost:80000, days:120,year:2019, req:['adv3d'],       effect:{graphics:10,tech:8}, desc:'Real-time ray tracing.' },
  { id:'openworld',name:'Open World Tech',    cost:60000, days:100,year:2013, req:['proc','adv3d'],effect:{design:8, tech:6},   desc:'Massive explorable worlds.' },
];

DATA.AWARDS = [
  { id:'goty',      name:'Indie Game of the Year', weight:'quality' },
  { id:'debut',     name:'Best Debut',             weight:'debut' },
  { id:'art',       name:'Best Art Direction',     weight:'graphics' },
  { id:'sound',     name:'Best Soundtrack',        weight:'audio' },
  { id:'design',    name:'Best Design',            weight:'design' },
  { id:'tech',      name:'Technical Achievement',  weight:'tech' },
  { id:'players',   name:"Players' Choice",        weight:'popularity' },
];

DATA.EVENTS = [
  { id:'viral',     name:'Viral trailer',           kind:'good', weight:0.6, apply:s=>({fans:add(s.fans, rnd(50,400)), hype:add(s.hype, rnd(5,20)), news:'Ваш трейлер стал вирусным!'}) },
  { id:'streamer',  name:'Streamer played your game',kind:'good',weight:0.9, apply:s=>({fans:add(s.fans, rnd(100,800)), hype:add(s.hype, rnd(10,30)), news:'Популярный стример показал вашу игру.'}) },
  { id:'expo',      name:'Indie showcase',          kind:'good', weight:0.7, apply:s=>({hype:add(s.hype, rnd(8,25)), rep:add(s.rep, 1), news:'Ваша игра попала на инди-выставку.'}) },
  { id:'review-pos',name:'Positive review',         kind:'good', weight:0.8, apply:s=>({rep:add(s.rep, 1), fans:add(s.fans, rnd(20,150)), news:'Крупный обзор: положительный отзыв.'}) },
  { id:'server',    name:'Server outage',           kind:'bad',  weight:0.5, apply:s=>({rep:sub(s.rep,1), money:sub(s.money,rnd(500,2500)), news:'Проблемы с серверами — небольшие потери.'}) },
  { id:'review-neg',name:'Negative review',         kind:'bad',  weight:0.7, apply:s=>({rep:sub(s.rep,1), fans:sub(s.fans, rnd(20,150)), news:'Отрицательный разбор на вашу игру.'}) },
  { id:'rival-hit', name:'Rival released a hit',    kind:'bad',  weight:0.6, apply:s=>({hype:sub(s.hype, rnd(5,20)), news:'Конкурент выпустил хит.'}) },
  { id:'emp-quit',  name:'Employee left',           kind:'bad',  weight:0.4, apply:s=>({quit:true, news:'Сотрудник покинул студию.'}) },
  { id:'emp-product',name:'Employee leveled up',    kind:'good', weight:0.7, apply:s=>({boost:true, news:'Сотрудник стал продуктивнее.'}) },
  { id:'fee-change',name:'Platform fee change',     kind:'warn', weight:0.3, apply:s=>({feeChange:true, news:'Платформа изменила комиссию.'}) },
  { id:'press',     name:'Magazine feature',        kind:'good', weight:0.6, apply:s=>({rep:add(s.rep,2), news:'Про вас написали в игровом журнале.'}) },
  { id:'ddos',      name:'DDoS attack',             kind:'bad',  weight:0.3, apply:s=>({money:sub(s.money,rnd(1000,3000)), news:'Студия подверглась DDoS-атаке.'}) },
];

DATA.DIFFICULTY = {
  easy:   { startMul:1.5, devCostMul:0.8, salaryMul:0.9,  salesMul:1.3, compMul:0.7 },
  normal: { startMul:1.0, devCostMul:1.0, salaryMul:1.0,  salesMul:1.0, compMul:1.0 },
  hard:   { startMul:0.7, devCostMul:1.3, salaryMul:1.2,  salesMul:0.8, compMul:1.4 },
};

DATA.PROJECT_SIZES = [
  { id:'tiny',   name:'Tiny',   days:25,  cost:1500,   qualityCap:70,  value:0.5 },
  { id:'small',  name:'Small',  days:60,  cost:4000,   qualityCap:78,  value:1.0 },
  { id:'medium', name:'Medium', days:120, cost:14000,  qualityCap:85,  value:2.2 },
  { id:'large',  name:'Large',  days:220, cost:45000,  qualityCap:92,  value:4.5 },
  { id:'aaa',    name:'AAA',    days:400, cost:140000, qualityCap:97,  value:9.0 },
];

DATA.STAGES = [
  { id:'idea',    name:'Idea',            weight:0.05 },
  { id:'pre',     name:'Pre-production',  weight:0.08 },
  { id:'proto',   name:'Prototype',       weight:0.12 },
  { id:'prod',    name:'Production',      weight:0.35 },
  { id:'alpha',   name:'Alpha',           weight:0.12 },
  { id:'beta',    name:'Beta',            weight:0.10 },
  { id:'qa',      name:'QA',              weight:0.10 },
  { id:'release', name:'Release',         weight:0.03 },
];

DATA.PORT_COST = {
  tiny:3000, small:8000, medium:25000, large:70000, aaa:180000
};

DATA.ROLES = [
  { id:'prog',  name:'Programmer', skill:'programming', salary:[2800,9000] },
  { id:'des',   name:'Designer',   skill:'design',      salary:[2500,8000] },
  { id:'art',   name:'Artist',     skill:'art',         salary:[2200,7500] },
  { id:'prod',  name:'Producer',   skill:'management',  salary:[3500,11000]},
  { id:'qa',    name:'QA',         skill:'testing',     salary:[1800,5500] },
  { id:'audio', name:'Audio',      skill:'audio',       salary:[2200,7000] },
  { id:'mkt',   name:'Marketing',  skill:'marketing',   salary:[2500,8500] },
];

DATA.NAMES = ['Alex','Max','Sam','Riley','Kai','Nova','Rowan','Sky','Robin','Quinn','Ash','Drew','Iris','Jade','Leo','Mia','Nils','Ola','Pia','Rey','Sora','Tess','Uma','Vik','Wren','Xander','Yuki','Zane','Erik','Anna','Ivan','Olga','Pavel','Maria','Jin','Kim','Lars','Nina'];
DATA.NAME_SUR = ['Kim','Park','Novak','Ivanov','Smith','Brown','Garcia','Nguyen','Miller','Sato','Fischer','Kowalski','Larsson','Silva','Torres','Costa','Berg','Dubois','Rossi','Yamada'];