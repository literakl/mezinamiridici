---
title: "Jak vzniká fantomová kolona"
slug: "jak-vznika-fantomova-kolona"
author: "Leoš Literák"
authorId: "leos-literak"
image: "/images/stream/fantomova-kolona-simulator.png"
date: 2026-09-06T13:00:00.000Z
tags: ["Bezpečnost", "Plynulost provozu", "Kolony"]
---

Určitě znáte ten pocit, když vjedete do kolony, ploužíte se a najednou se rozjede, aniž by bylo vidět, co ji způsobilo. Vidím to každou neděli na 
Štěrboholské spojce v Praze u Černého mostu, která se ztratí u Spořilova. Byla tu, i když se nic neopravovalo, nestavělo a nebyla nehoda. Někdo
to může odbýt komentářem, že důvodem je hustý provoz. Jenže proč auta vlastně zastaví a vy pak jedete v krátkých přískocích vpřed?

Na začátku je častý nešvar řidičů, kterým je nedodržení bezpečné vzdálenosti, alias lepení se na zadek auta před vámi. Když má řidič od auta před
sebou pouhé jednotky metrů, zbývá mu na reakci jen zlomek vteřiny, a proto musí reagovat prudce. Představte si hustý provoz, řidiče a za
ním dva lepiče. První řidič z nějakého důvodu silněji přibrzdí, první lepič začne razantně brzdit, druhý lepič dupne na brzdu, až musí zastavit.
Když je provoz hustý, auta za ním musí také zastavit. A fantomová kolona je na světě. Při hustém provozu a nedostatečnými mezerami může trvat hodně dlouho,
než kolona zmizí. A tisíce řidičů budou zbytečně ztrácet spoustu času kvůli pár bezohledným řidičům.

Pro demonstraci principu jsem připravil simulátor fantomové kolony, kde si můžete nastavit různé parametry a přibrzdit zvýrazněné auto. 
Můžete nastavit hustotu provozu a rychlost aut, reakční dobu a hlavně podíl řidičů, kteří jedou za nárazníkem. 

<div class="traffic-sim" id="traffic-sim" aria-label="Simulátor vzniku fantomové kolony">
  <div class="traffic-sim__intro">
    <strong>Vyzkoušejte si to</strong>
    <span>Auta jedou plynule, každé ale s jiným odstupem. Nad vozem je jeho okamžitá rychlost v km/h, pod ním pruh s odstupem od vozu vpředu v metrech: 
<b>zelený</b> je bezpečný, <b>červený</b> znamená jízdu za nárazníkem. Žlutě zvýrazněné auto právě projelo vyznačeným místem brzdění — vyberte, 
na kolik má zabrzdit, a sledujte, co to udělá s proudem za ním.</span>
  </div>

  <div class="traffic-sim__road-wrap">
    <canvas class="traffic-sim__road" aria-label="Animace dopravy v jednom jízdním pruhu"></canvas>
    <p class="traffic-sim__fallback">Simulátor se nespustil. Potřebuje zapnutý JavaScript — pokud ho máte povolený, zkuste stránku načíst znovu.</p>
  </div>

  <div class="traffic-sim__actions">
    <span class="traffic-sim__actions-label"><b>Zabrzdi zvýrazněné auto na</b></span>
    <button type="button" class="traffic-sim__button traffic-sim__button--primary" data-brake="5">5 km/h</button>
    <button type="button" class="traffic-sim__button traffic-sim__button--primary" data-brake="10">10 km/h</button>
    <button type="button" class="traffic-sim__button traffic-sim__button--primary" data-brake="half"><b data-value="half">–</b> km/h</button>
    <button type="button" class="traffic-sim__button" data-action="reset">Restart</button>
  </div>

  <div class="traffic-sim__legend" aria-hidden="true">
    <span><i class="traffic-sim__key traffic-sim__key--safe"></i>odstup přes 2 s</span>
    <span><i class="traffic-sim__key traffic-sim__key--tight"></i>1–2 s</span>
    <span><i class="traffic-sim__key traffic-sim__key--risk"></i>pod 1 s</span>
    <span><i class="traffic-sim__key traffic-sim__key--trigger"></i>vybrané auto</span>
  </div>

  <div class="traffic-sim__map-wrap">
    <p class="traffic-sim__map-title">Provoz na celém 3km úseku, který simulátor počítá. Doleva pokračuje silnice proti směru jízdy — tam kolona roste. 
<b>Klepnutím do mapy přesunete výřez</b> zobrazený nahoře; jeho polohu ukazuje rámeček.</p>
    <canvas class="traffic-sim__map" aria-label="Přehled provozu na třech kilometrech silnice"></canvas>
    <div class="traffic-sim__legend" aria-hidden="true">
      <span><i class="traffic-sim__key traffic-sim__key--flow"></i>plynulý provoz</span>
      <span><i class="traffic-sim__key traffic-sim__key--slow"></i>zpomalený</span>
      <span><i class="traffic-sim__key traffic-sim__key--jam"></i>kolona</span>
      <span><i class="traffic-sim__key traffic-sim__key--empty"></i>prázdná silnice</span>
    </div>
  </div>

  <div class="traffic-sim__stats" aria-live="polite">
    <div><span>Průměrná rychlost</span><strong data-stat="speed">–</strong></div>
    <div><span>Nejmenší odstup</span><strong data-stat="gap">–</strong></div>
    <div><span>Jede pod 20 km/h</span><strong data-stat="queue">–</strong></div>
    <div><span>Právě brzdí</span><strong data-stat="braking">–</strong></div>
    <div><span>Délka kolony</span><strong data-stat="jam">–</strong></div>
  </div>

  <div class="traffic-sim__controls">
    <label>
      <span>Hustota provozu <b data-value="density">45 aut/km</b></span>
      <input data-control="density" type="range" min="20" max="70" step="1" value="45">
    </label>
    <label>
      <span>Rychlost aut <b data-value="speed">50 km/h</b></span>
      <input data-control="speed" type="range" min="40" max="80" step="5" value="50">
    </label>
    <label>
      <span>Rozestupy mezi auty <b data-value="style">vyrovnané</b></span>
      <input data-control="style" type="range" min="0" max="100" step="5" value="45">
    </label>
    <label>
      <span>Reakční doba řidičů <b data-value="reaction">0,4 s</b></span>
      <input data-control="reaction" type="range" min="0.2" max="1.2" step="0.1" value="0.4">
    </label>
  </div>

  <p class="traffic-sim__note">
Model počítá 3 km silnice v metrech a sekundách: každý řidič si drží svůj odstup, na změnu rychlosti vpředu ale zareaguje 
až po reakční době a pak brzdí tak, aby stihl dobrzdit do zbývající mezery (komfortně 2,2 m/s², v nouzi až 8 m/s²). 
Zabrzděné auto po dvou sekundách zase plynule zrychlí a odjede. Čísla v dlaždicích platí pro celý 3km úsek.
</p>
</div>

<style>
  .traffic-sim { --ts-blue:#1976a8; --ts-dark:#172b3a; --ts-muted:#667782; --ts-line:#d9e2e7; margin:2rem 0; padding:1rem; color:var(--ts-dark); background:#f4f8fa; border:1px solid var(--ts-line); border-radius:12px; font-family:Poppins,Arial,sans-serif; }
  .traffic-sim * { box-sizing:border-box; }
  .traffic-sim__intro { display:grid; gap:.2rem; margin:0 0 1rem; }
  .traffic-sim__intro strong { font-size:1.15rem; }
  .traffic-sim__intro span, .traffic-sim__note, .traffic-sim__map-title { color:var(--ts-muted); font-size:.86rem; line-height:1.45; }
  .traffic-sim__intro b { color:var(--ts-dark); }
  .traffic-sim__road-wrap { position:relative; overflow:hidden; border-radius:9px; background:#26333b; }
  .traffic-sim__road { display:block; width:100%; height:200px; touch-action:manipulation; }
  .traffic-sim__fallback { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; margin:0; padding:1rem; color:#c6d2d8; font-size:.82rem; text-align:center; }
  .traffic-sim__legend { display:flex; flex-wrap:wrap; gap:.3rem .9rem; margin:.5rem 0 0; color:var(--ts-muted); font-size:.72rem; }
  .traffic-sim__legend span { display:flex; align-items:center; gap:.3rem; white-space:nowrap; }
  .traffic-sim__key { display:inline-block; width:1.15rem; height:.35rem; border-radius:2px; background:#43a047; }
  .traffic-sim__key--tight { background:#fb8c00; }
  .traffic-sim__key--risk { background:#e53935; }
  .traffic-sim__key--trigger { width:.7rem; height:.7rem; background:#3c4a54; border:2px solid #ffd54f; border-radius:2px; }
  .traffic-sim__key--flow { background:#43a047; }
  .traffic-sim__key--slow { background:#fdd835; }
  .traffic-sim__key--jam { background:#e53935; }
  .traffic-sim__key--empty { background:#cfd8dc; }
  .traffic-sim__map-wrap { margin-top:1.1rem; }
  .traffic-sim__map-title { margin:0 0 .4rem; font-size:.78rem; }
  /* pan-y, ať jde po mapě prstem stránku posouvat; vodorovné tažení patří výřezu */
  .traffic-sim__map { display:block; width:100%; height:56px; cursor:pointer; touch-action:pan-y; }
  .traffic-sim__map-title b { color:var(--ts-dark); font-weight:600; }
  .traffic-sim__stats { display:grid; grid-template-columns:repeat(2,1fr); gap:.45rem; margin:.85rem 0 1rem; }
  .traffic-sim__stats div { min-width:0; padding:.55rem .4rem; text-align:center; background:#fff; border:1px solid var(--ts-line); border-radius:7px; }
  .traffic-sim__stats div:last-child { grid-column:span 2; }
  .traffic-sim__stats span { display:block; color:var(--ts-muted); font-size:.69rem; line-height:1.2; }
  .traffic-sim__stats strong { display:block; margin-top:.15rem; font-size:.92rem; }
  .traffic-sim__controls { display:grid; gap:.85rem; }
  .traffic-sim__controls label { display:grid; gap:.35rem; margin:0; font-size:.86rem; font-weight:500; }
  .traffic-sim__controls label span { display:flex; justify-content:space-between; gap:.75rem; }
  .traffic-sim__controls b { color:var(--ts-blue); font-weight:700; white-space:nowrap; }
  .traffic-sim__controls input { width:100%; height:1.8rem; margin:0; accent-color:var(--ts-blue); cursor:pointer; }
  .traffic-sim__actions { display:flex; flex-wrap:wrap; align-items:center; gap:.5rem; margin-top:1.1rem; }
  .traffic-sim__actions-label { flex:1 0 100%; font-size:.86rem; }
  .traffic-sim__actions-label b { font-weight:600; }
  .traffic-sim__button { min-height:44px; padding:.55rem .9rem; color:var(--ts-dark); font:600 .84rem Poppins,Arial,sans-serif; background:#fff; border:1px solid #9caeb8; border-radius:6px; cursor:pointer; touch-action:manipulation; }
  .traffic-sim__button--primary { color:#fff; background:#c62828; border-color:#c62828; }
  .traffic-sim__button--primary b { font-weight:700; }
  .traffic-sim__button:hover { filter:brightness(.95); }
  .traffic-sim__button[disabled] { opacity:.45; cursor:default; }
  .traffic-sim__button:focus-visible, .traffic-sim__controls input:focus-visible { outline:3px solid #f5c84c; outline-offset:2px; }
  .traffic-sim__note { margin:.85rem 0 0; }
  @media (min-width:600px) { .traffic-sim { padding:1.25rem; } .traffic-sim__controls { grid-template-columns:repeat(2,1fr); gap:1rem 1.5rem; } .traffic-sim__road { height:235px; } .traffic-sim__stats { grid-template-columns:repeat(5,1fr); } .traffic-sim__stats div:last-child { grid-column:auto; } .traffic-sim__actions-label { flex:0 0 auto; } }
</style>

<script>
(() => {
  const root = document.getElementById('traffic-sim');
  if (!root || !window.requestAnimationFrame) return;

  const canvas = root.querySelector('.traffic-sim__road');
  const ctx = canvas.getContext('2d');
  const mapCanvas = root.querySelector('.traffic-sim__map');
  const mapCtx = mapCanvas.getContext('2d');
  const inputs = Object.fromEntries([...root.querySelectorAll('[data-control]')].map(el => [el.dataset.control, el]));
  const labels = Object.fromEntries([...root.querySelectorAll('[data-value]')].map(el => [el.dataset.value, el]));
  const stats = Object.fromEntries([...root.querySelectorAll('[data-stat]')].map(el => [el.dataset.stat, el]));
  const brakeButtons = [...root.querySelectorAll('[data-brake]')];
  const halfButton = root.querySelector('[data-brake="half"]');

  // Fyzika v jednotkách SI (metry, sekundy).
  const CAR_LENGTH = 4.5;        // délka osobního auta
  const CAR_WIDTH = 1.8;         // šířka osobního auta
  const JAM_GAP = 5;             // odstup mezi nárazníky, jen když auto úplně stojí
  const MIN_CRUISE_GAP = 2;      // nejmenší reálný odstup, který si držíme za jízdy
  const ACCEL = 1.3;             // běžné zrychlení
  const COMFORT_DECEL = 2.2;     // komfortní zpomalení
  const MAX_DECEL = 8;           // nouzové brzdění na suché vozovce
  const TRIGGER_DECEL = MAX_DECEL; // prudké brzdění auta, které spustí vlnu
  const TRIGGER_HOLD = 1;        // jak dlouho pak jede pomalu, než zase zrychlí
  const K_SPEED = .9;            // jak silně řidič srovnává rychlost s vozem vpředu
  const K_GAP = .25;             // jak silně dorovnává odstup na svůj obvyklý
  const K_CRUISE = .5;           // jak rychle se vrací na svou cestovní rychlost
  const JAM_DROP = .33;          // pokles rychlosti, od kterého auto počítáme do kolony
  // Počítáme 3 km silnice: auta vjíždějí daleko proti směru jízdy, aby měla kam
  // couvat, když kolona roste. Do obrazu se kreslí až úsek od 0 m dál.
  const SPAWN_X = -3000;
  const DT = .02;                // pevný krok výpočtu [s]
  const HIST = 64;               // paměť na reakci řidiče: 64 × 0,02 s = 1,28 s
  const MAX_STEPS = 15;          // strop kroků na snímek, ať se to nezacyklí
  const PALETTE = ['#8ecae6', '#f6bd60', '#a7c957', '#e56b6f', '#b8b8f3', '#e9edef', '#5ec8c8', '#f4978e'];

  // Čtyři skupiny řidičů. „factor“ je násobek průměrného odstupu v proudu,
  // „calm“ a „wild“ jsou jejich podíly na obou koncích posuvníku rozestupů.
  // „eager“ určuje, jak rychle se řidič ze stání dotáhne na rychlost vozu
  // vpředu: jen ta nejopatrnější skupina (velký odstup) si na to nechává čas,
  // ostatní na jeho rozjezd naskočí prakticky okamžitě.
  const GROUPS = [
    { factor: 2.00, calm: .45, wild: .04, eager: 1.0 },
    { factor: 1.25, calm: .42, wild: .21, eager: 1.8 },
    { factor: .70, calm: .11, wild: .40, eager: 2.6 },
    { factor: .38, calm: .02, wild: .35, eager: 3.3 },
  ];

  // x = poloha předního nárazníku [m]; auto zabírá úsek <x - CAR_LENGTH, x>
  const view = { length: 105, pxPerM: 6, marker: 70, offset: 0 };
  let cars = [], pending = null, nextId = 0, armed = null, leftover = 0;
  let lastFrame = performance.now(), lastSlow = 0, running = true;
  const binSum = new Float64Array(400), binCount = new Int32Array(400);

  const cruise = () => +inputs.speed.value / 3.6;
  const density = () => +inputs.density.value;
  const wildShare = () => +inputs.style.value / 100;
  // průměrná mezera mezi nárazníky, která odpovídá nastavené hustotě provozu
  const meanGap = () => Math.max(MIN_CRUISE_GAP + 2, 1000 / density() - CAR_LENGTH);
  const decimal = value => value.toFixed(1).replace('.', ',');
  const contextEnd = () => view.length + 60;

  function styleName(p) {
    if (p < .2) return 'většinou opatrné';
    if (p < .4) return 'spíš opatrné';
    if (p < .6) return 'vyrovnané';
    if (p < .8) return 'spíš těsné';
    return 'většinou těsné';
  }

  // Polovina nastavené rychlosti proudu – pod 14 km/h už je tlačítku blízko
  // to desetikilometrové, tak ho v tu chvíli raději schováme.
  const halfTarget = () => Math.round(+inputs.speed.value / 2);

  function showSettings() {
    labels.density.textContent = `${density()} aut/km · ≈ ${Math.round(meanGap())} m`;
    labels.style.textContent = styleName(wildShare());
    labels.speed.textContent = `${inputs.speed.value} km/h`;
    labels.reaction.textContent = `${decimal(+inputs.reaction.value)} s`;
    const half = halfTarget();
    labels.half.textContent = half;
    halfButton.style.display = half < 14 ? 'none' : '';
  }

  // Odstup, který si řidič drží při cestovní rychlosti [m]. Skupiny se míchají
  // podle posuvníku a normalizují tak, aby průměr odpovídal hustotě provozu.
  function pickGap() {
    const p = wildShare();
    const weights = GROUPS.map(g => g.calm * (1 - p) + g.wild * p);
    const normal = GROUPS.reduce((sum, g, i) => sum + weights[i] * g.factor, 0);
    let roll = Math.random(), picked = GROUPS[GROUPS.length - 1];
    for (let i = 0; i < GROUPS.length; i++) { roll -= weights[i]; if (roll <= 0) { picked = GROUPS[i]; break; } }
    return { gap: Math.max(MIN_CRUISE_GAP + 1.5, meanGap() * picked.factor / normal), eager: picked.eager };
  }

  // Historii vozu držíme v kruhovém bufferu s pevným krokem – řidič za ním si
  // z ní přečte stav starý přesně jeho reakční dobu, bez jediné alokace navíc.
  function newDriver(x, v) {
    const id = nextId++;
    const { gap, eager } = pickGap();
    const car = {
      id,
      x,
      v,
      acc: 0,
      gap,                                  // obvyklý odstup při cestovní rychlosti [m]
      headway: (gap - JAM_GAP) / cruise(),   // týž odstup vyjádřený v sekundách
      eager,                                // jak rychle se ze stání dotáhne na rychlost vozu vpředu
      v0: cruise() * (.985 + Math.random() * .03),
      color: PALETTE[id % PALETTE.length],
      hx: new Float32Array(HIST),
      hv: new Float32Array(HIST),
      head: 0,
      brakeTo: null,
      holdFrom: 0,
    };
    car.hx.fill(x); car.hv.fill(v);
    return car;
  }

  function place(car, x, v) {
    car.x = x; car.v = v; car.acc = 0; car.head = 0;
    car.hx.fill(x); car.hv.fill(v);
    return car;
  }

  const spacing = car => CAR_LENGTH + JAM_GAP + car.v * car.headway;

  function reset() {
    cars = []; pending = null; armed = null; leftover = 0; view.offset = 0;
    const v = cruise();
    // Auta zařadíme rovnou do ustáleného stavu: každé má přesně ten odstup,
    // který si samo drží, takže proud jede na začátku plynule.
    let car = newDriver(view.length * .97, v);
    while (car.x > SPAWN_X) {
      cars.push(car);
      const next = newDriver(0, v);
      place(next, car.x - spacing(next), v);
      car = next;
    }
    showSettings();
  }

  // Model sledování vozidla s konstantním odstupem, doplněný o reakční
  // zpoždění řidiče a o brzdnou dráhu potřebnou k zastavení včas.
  function decide(car, lead, back, time) {
    if (car.brakeTo !== null) {
      if (car.v > car.brakeTo + .1 && !car.holdFrom) return -TRIGGER_DECEL;
      if (!car.holdFrom) car.holdFrom = time;
      if (time - car.holdFrom < TRIGGER_HOLD) return (car.brakeTo - car.v) * 3;
      car.brakeTo = null; car.holdFrom = 0;
    }
    let acc = K_CRUISE * (car.v0 - car.v);
    if (lead) {
      // Vzdálenost k vozu vpředu řidič vidí průběžně, na změnu jeho rychlosti
      // ale zareaguje až po své reakční době – právě odtud se bere celý problém.
      const seen = (lead.head - back + HIST) % HIST;
      const gap = lead.x - CAR_LENGTH - car.x;
      const closing = car.v - lead.hv[seen];
      const wanted = JAM_GAP + car.v * car.headway;
      // běžné srovnávání rychlosti a odstupu – při rozjezdu ze stání díky
      // „eager" reaguje řidič na pohyb vozu vpředu silněji, než jen podle
      // toho, kolik místa mu zatím vzniklo
      acc = Math.min(acc, K_SPEED * car.eager * -closing + K_GAP * (gap - wanted));
      // kolik je potřeba ubrat, aby auto stihlo dobrzdit do mezery, která zbývá
      if (closing > 0) {
        const needed = (closing * closing) / (2 * Math.max(.5, gap - JAM_GAP));
        if (needed > COMFORT_DECEL) acc = Math.min(acc, -needed);
      }
      // poslední metry řidič vidí bez zpoždění, na plynulé zpomalení je ale pozdě
      if (gap < 2 && car.v > lead.v) acc = -MAX_DECEL;
    }
    return Math.max(-MAX_DECEL, Math.min(ACCEL, acc));
  }

  // Nová auta přijíždějí zezadu svou cestovní rychlostí, jakmile je pro ně
  // dost místa – tedy i tolik, aby stihla dobrzdit za pomalejší kolonu.
  function spawn() {
    if (!pending) pending = newDriver(SPAWN_X, cruise());
    pending.v = pending.v0;
    const last = cars[cars.length - 1];
    if (last) {
      const closing = pending.v - last.v;
      const needed = spacing(pending) + (closing > 0 ? (closing * closing) / (2 * COMFORT_DECEL) : 0);
      if (last.x - SPAWN_X < needed) return;
    }
    cars.push(place(pending, SPAWN_X, pending.v0));
    pending = null;
  }

  let clock = 0;
  function step() {
    const back = Math.min(HIST - 1, Math.max(0, Math.round(+inputs.reaction.value / DT)));
    clock += DT;
    for (let i = 0; i < cars.length; i++) cars[i].acc = decide(cars[i], cars[i - 1], back, clock);
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const v = Math.max(0, car.v + car.acc * DT);
      car.x += (car.v + v) / 2 * DT;
      car.v = v;
    }
    // Auta nemohou projet skrz sebe.
    for (let i = 1; i < cars.length; i++) {
      const lead = cars[i - 1], car = cars[i], limit = lead.x - CAR_LENGTH - .1;
      if (car.x > limit) { car.x = limit; car.v = Math.min(car.v, lead.v); }
    }
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      car.head = (car.head + 1) % HIST;
      car.hx[car.head] = car.x; car.hv[car.head] = car.v;
    }
    while (cars.length && cars[0].x > contextEnd()) cars.shift();
    spawn();
  }

  const braking = () => cars.find(car => car.brakeTo !== null);

  function applyBrake(car, target) {
    car.brakeTo = target === 'half' ? halfTarget() / 3.6 : +target / 3.6;
    car.holdFrom = 0;
  }

  function candidate() {
    if (braking()) return null;
    let best = null;
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      if (car.x >= view.marker && car.x <= view.offset + view.length && (!best || car.x < best.x)) best = car;
    }
    return best;
  }

  // Nejdelší souvislý úsek aut, která jedou výrazně pod nastavenou rychlostí.
  function jamLength() {
    const limit = cruise() * (1 - JAM_DROP);
    let best = 0, headX = null, tailX = 0;
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      if (car.v < limit) {
        if (headX === null) headX = car.x;
        tailX = car.x - CAR_LENGTH;
      } else if (headX !== null) {
        best = Math.max(best, headX - tailX);
        headX = null;
      }
    }
    return headX === null ? best : Math.max(best, headX - tailX);
  }

  function fitCanvas(target, context) {
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * ratio)), h = Math.max(1, Math.round(rect.height * ratio));
    if (target.width !== w || target.height !== h) { target.width = w; target.height = h; }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return rect;
  }

  function measure() {
    const rect = fitCanvas(canvas, ctx);
    // měřítko volíme tak, aby se do okna vešlo zhruba 105 m silnice a auta
    // přitom zůstala co největší
    view.pxPerM = Math.min(6.6, Math.max(3, rect.width / 105));
    view.length = rect.width / view.pxPerM;
    view.offset = Math.min(Math.max(view.offset, SPAWN_X), contextEnd() - view.length);
    view.marker = view.offset + view.length * 2 / 3;
    return rect;
  }

  function roundedPath(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  const gapColor = seconds => (seconds < 1 ? '#e53935' : seconds < 2 ? '#fb8c00' : '#43a047');
  const flowColor = ratio => (ratio < .25 ? '#e53935' : ratio < .5 ? '#fb8c00' : ratio < .75 ? '#fdd835' : '#43a047');

  function draw(rect) {
    const w = rect.width, h = rect.height, scale = view.pxPerM;
    const roadTop = Math.round(h * .16), roadBottom = Math.round(h * .64);
    const laneY = (roadTop + roadBottom) / 2;
    const gapY = roadBottom + Math.round(h * .1);
    // šířku vozu kreslíme mírně zvětšenou, aby zůstalo poznat, že jde o auto
    const carH = Math.max(10, Math.min(22, CAR_WIDTH * scale * 1.55)), carR = Math.min(4, carH / 3);
    const hot = candidate(), slow = braking();
    // popisky u kraje vozovky posuneme tak, aby zůstaly celé vidět
    const inside = (x, half) => Math.min(Math.max(x, half + 2), w - half - 2);
    // svět → obrazovka; výřez si čtenář může posunout kliknutím do mapy
    const from = view.offset, to = view.offset + view.length;
    const px = m => (m - from) * scale;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#eef3f6'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3b4a54'; ctx.fillRect(0, roadTop, w, roadBottom - roadTop);
    ctx.fillStyle = '#f0f2f2'; ctx.fillRect(0, roadTop, w, 3); ctx.fillRect(0, roadBottom - 3, w, 3);

    // Pevné metrové značky u kraje vozovky: silnice stojí, pohybují se jen auta.
    ctx.font = '600 10px Poppins, Arial, sans-serif';
    ctx.textAlign = 'center';
    for (let m = Math.ceil(from / 10) * 10; m <= to; m += 10) {
      const x = px(m);
      const big = m % 50 === 0;
      ctx.fillStyle = big ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.3)';
      ctx.fillRect(x, roadBottom - 3 - (big ? 9 : 5), 1, big ? 9 : 5);
      if (big) {
        ctx.fillStyle = '#8b9aa3';
        ctx.fillText(`${m} m`, inside(x, 26), h - 4);
      }
    }

    // Místo, kde vybrané auto zabrzdí.
    const markX = px(view.marker);
    ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(markX, roadTop); ctx.lineTo(markX, gapY + 8); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#8b9aa3';
    ctx.textAlign = 'right'; ctx.fillText('Místo brzdění', markX - 6, roadTop - 4);
    ctx.textAlign = 'left'; ctx.fillText('Směr jízdy →', 2, roadTop - 4);

    // Odstupy: pruh mezi zádí vozu vpředu a přídí vozu za ním.
    for (let i = 1; i < cars.length; i++) {
      const lead = cars[i - 1], car = cars[i];
      if (car.x > to) continue;
      if (car.x < from - CAR_LENGTH) break;
      const gap = Math.max(0, lead.x - CAR_LENGTH - car.x);
      const seconds = gap / Math.max(car.v, .1);
      const x1 = Math.max(0, px(car.x)), x2 = Math.min(w, px(lead.x - CAR_LENGTH));
      if (x2 - x1 < 2) continue;
      ctx.fillStyle = car.v > 2 ? gapColor(seconds) : '#90a4ae';
      roundedPath(x1, gapY, x2 - x1, 5, 2.5); ctx.fill();
      const width = x2 - x1;
      if (width > 34) {
        ctx.fillStyle = '#5c6b74'; ctx.textAlign = 'center';
        ctx.fillText(width > 82 && car.v > 2 ? `${Math.round(gap)} m · ${decimal(seconds)} s` : `${Math.round(gap)} m`, (x1 + x2) / 2, gapY + 17);
      }
    }

    // Auta, od předního vozu směrem dozadu.
    let lastLabel = Infinity;
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      if (car.x - CAR_LENGTH > to) continue;     // ještě nedojelo do výřezu
      if (car.x < from) break;                   // dál už je jen provoz za výřezem
      const x = px(car.x - CAR_LENGTH), cw = CAR_LENGTH * scale, y = laneY - carH / 2;
      const isHot = car === hot, isSlow = car === slow;
      if (isHot || isSlow) {
        ctx.fillStyle = isSlow ? 'rgba(229,57,53,.35)' : 'rgba(255,213,79,.32)';
        roundedPath(x - 5, y - 5, cw + 10, carH + 10, carR + 3); ctx.fill();
      }
      ctx.fillStyle = isSlow ? '#ef5350' : car.color;
      roundedPath(x, y, cw, carH, carR); ctx.fill();
      if (isHot || isSlow) { ctx.strokeStyle = isSlow ? '#fff' : '#ffd54f'; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.fillStyle = 'rgba(20,32,40,.32)';
      ctx.fillRect(x + cw * .32, y + carH * .22, cw * .28, carH * .56);
      if (car.acc < -1.5) {
        ctx.fillStyle = '#ff5252';
        ctx.fillRect(x, y + 1, 3, carH * .3);
        ctx.fillRect(x, y + carH * .7 - 1, 3, carH * .3);
      }
      // ve stojící koloně jsou auta na sobě, popisky rychlosti proto proředíme
      const labelX = inside(x + cw / 2, 14);
      if (labelX < lastLabel - 24) {
        lastLabel = labelX;
        ctx.textAlign = 'center';
        ctx.fillStyle = car.acc < -1.5 ? '#ffcdd2' : 'rgba(255,255,255,.92)';
        ctx.font = '700 11px Poppins, Arial, sans-serif';
        ctx.fillText(`${Math.round(car.v * 3.6)}`, labelX, y - 6);
        ctx.font = '600 10px Poppins, Arial, sans-serif';
      }
    }
  }

  // Mapa celého počítaného úseku: každý dílek obarvíme podle toho, jak rychle
  // se v něm zrovna jede. Auta se do dílků rozhodí jedním průchodem.
  function drawMap() {
    const rect = fitCanvas(mapCanvas, mapCtx);
    const w = rect.width, h = rect.height;
    const barTop = 4, barH = h - 24;
    const start = SPAWN_X, span = contextEnd() - start;
    const count = Math.min(binSum.length, Math.max(30, Math.round(w / 4)));
    const binLength = span / count;
    binSum.fill(0, 0, count); binCount.fill(0, 0, count);
    for (let i = 0; i < cars.length; i++) {
      const bin = Math.floor((cars[i].x - start) / binLength);
      if (bin >= 0 && bin < count) { binSum[bin] += cars[i].v; binCount[bin]++; }
    }
    const top = cruise();
    mapCtx.clearRect(0, 0, w, h);
    for (let i = 0; i < count; i++) {
      let sum = 0, n = 0;
      for (let j = Math.max(0, i - 2); j <= Math.min(count - 1, i + 2); j++) { sum += binSum[j]; n += binCount[j]; }
      mapCtx.fillStyle = n ? flowColor(sum / n / top) : '#cfd8dc';
      mapCtx.fillRect(i * w / count, barTop, w / count + 1, barH);
    }
    // kilometrovník a výřez, který je vidět nahoře
    mapCtx.font = '600 10px Poppins, Arial, sans-serif';
    mapCtx.fillStyle = '#8b9aa3';
    for (let m = 0; m >= SPAWN_X; m -= 1000) {
      const x = Math.min(w - 1, (m - start) / span * w);
      mapCtx.fillRect(x, barTop + barH, 1, 4);
      mapCtx.textAlign = m === 0 ? 'right' : m === SPAWN_X ? 'left' : 'center';
      mapCtx.fillText(`${m / 1000}`.replace('-', '−') + ' km', x, h - 4);
    }
    const x1 = (view.offset - start) / span * w, x2 = (view.offset + view.length - start) / span * w;
    mapCtx.strokeStyle = '#172b3a'; mapCtx.lineWidth = 2;
    mapCtx.strokeRect(x1 - 1, barTop - 2, Math.max(4, x2 - x1) + 2, barH + 4);
  }

  // Všechna čísla se vztahují k celému počítanému úseku, ne jen k výřezu.
  function refreshStats() {
    const count = n => `${n} ${n === 1 ? 'auto' : n < 5 ? 'auta' : 'aut'}`;
    let sum = 0, queue = 0, slowing = 0, min = Infinity;
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      sum += car.v;
      if (car.v * 3.6 < 20) queue++;
      if (car.acc < -1.5) slowing++;
      // nejmenší odstup hlásíme mezi jedoucími auty; ve stojící koloně by to
      // byla vždy jen délka nárazníku
      if (i > 0 && car.v * 3.6 > 20) min = Math.min(min, cars[i - 1].x - CAR_LENGTH - car.x);
    }
    const jam = jamLength();
    if (cars.length) {
      stats.speed.textContent = `${Math.round(sum / cars.length * 3.6)} km/h`;
      stats.gap.textContent = min === Infinity ? '–' : `${Math.round(Math.max(0, min))} m`;
      stats.queue.textContent = queue ? count(queue) : 'nikdo';
      stats.braking.textContent = slowing ? count(slowing) : 'nikdo';
    }
    stats.jam.textContent = jam < CAR_LENGTH ? 'žádná' : jam < 1000 ? `${Math.round(jam / 10) * 10} m` : `${decimal(jam / 1000)} km`;
  }

  function render(now) {
    if (!running) return;
    leftover += Math.min(.25, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    const rect = measure();
    for (let i = 0; i < MAX_STEPS && leftover >= DT; i++) { step(); leftover -= DT; }
    if (leftover > DT) leftover = 0;
    // Když v okamžiku kliknutí zrovna žádné auto místem brzdění neprojíždělo,
    // počkáme na první další – tlačítka tak nemusí problikávat mezi vozy.
    if (armed !== null && !braking()) {
      const waiting = candidate();
      if (waiting) { applyBrake(waiting, armed); armed = null; }
    }
    draw(rect);
    if (now - lastSlow > 200) { refreshStats(); drawMap(); lastSlow = now; }
    const busy = !!braking();
    brakeButtons.forEach(button => { button.disabled = busy; });
    requestAnimationFrame(render);
  }

  Object.values(inputs).forEach(input => input.addEventListener('input', () => {
    showSettings();
    if (input.dataset.control !== 'reaction') reset();
  }));
  brakeButtons.forEach(button => button.addEventListener('click', () => {
    const car = candidate();
    if (car) applyBrake(car, button.dataset.brake); else armed = button.dataset.brake;
  }));
  root.querySelector('[data-action="reset"]').addEventListener('click', reset);
  // Kliknutím (nebo tažením) do mapy si čtenář přesune výřez po celém úseku.
  function moveView(event) {
    const rect = mapCanvas.getBoundingClientRect();
    const share = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const target = SPAWN_X + share * (contextEnd() - SPAWN_X) - view.length / 2;
    view.offset = Math.min(Math.max(target, SPAWN_X), contextEnd() - view.length);
  }
  mapCanvas.addEventListener('pointerdown', event => {
    moveView(event);
    try { mapCanvas.setPointerCapture(event.pointerId); } catch (e) { /* tažení nebude, klepnutí ano */ }
    event.preventDefault();
  });
  mapCanvas.addEventListener('pointermove', event => {
    try { if (mapCanvas.hasPointerCapture(event.pointerId)) moveView(event); } catch (e) { /* nic */ }
  });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { lastFrame = performance.now(); leftover = 0; requestAnimationFrame(render); }
  });

  const fallback = root.querySelector('.traffic-sim__fallback');
  if (fallback) fallback.remove();
  measure(); reset(); requestAnimationFrame(render);
})();
</script>

Simulátor jen demonstruje principy, není přesným odrazem reality. Nicméně ukazuje hezky, jak se jednotlivé faktory ovlivňují.
Je malá hustota dopravy? Kolona se rychle rozpustí. Je malý podíl lepičů? Pár aut s větším rozestupem ji dokážou rozhýbat.

Poučením je, že když se budete někomu agresivně držet za zadkem, ničemu tím nepomůžete a kvůli řidičům jako vy budete trčet v koloně.
Stejně důležité je vědět, že poskakující kolona se uvolňuje jen velice pomalu. Zácpu rozproudíte jen plynulou jízdou a k tomu potřebujete prostor. 
Takže je mnohem efektivnější jet krokem, než rychle dohnat auto před vámi a pak se zastavit. 

Všeho ale s mírou: držet si odstup v řádu stovek metrů bude zase frustrovat řidiče za vámi. Na silnicích s více pruhy může být extra dlouhý odstup
brán jako pozvánka pro řidiče z vedlejších pruhů, což zase zpomalí váš pruh.

Závěr je jednoduchý: nelepte se na auto před vámi, držte si rozumně velký odstup a v koloně usilujte o plynulou jízdu.

P.S. Mimochodem, vedle této stránky stavím web [Poctivé slevy](https://www.poctiveslevy.cz/) — komunitou ověřované slevy a akce, kdyby se hodilo.
