import { EMOTIONS, EMO, ANIMALS, ANIMAL, SEASON_OF_MONTH, EXTRA_FACES, SWATCHES, registerCustom, art, artURL, vineSVG, flourishSVG, dividerSVG, petalSVG, snowSVG, leafFallSVG, blossomSVG, hangingVineSVG, STAR_SVG, svgURL } from './art.js?v=202611031223';
import { DemoStore, DEMO_YEAR } from './demo.js?v=202611031223';
import { Repo, Store, shrinkPhoto } from './data.js?v=202611031223';
import { renderDay, renderMonth, renderYear, toPDF, toPNG, download } from './export.js?v=202611031223';

// ---------- küçük yardımcılar ----------

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : String(kid));
  }
  return el;
}

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const WEEKDAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const WEEK_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTH_LINES = [
  'kar sessizliğinde, sıcak çay kokulu günler…', 'kısa günler, uzun sohbetler…', 'dallarda ilk tomurcuklar…',
  'lale bahçesi gibi renkli günler…', 'papatyalar arasında hafif bir rüzgâr…', 'çilek tadında uzun akşamlar…',
  'karpuz serinliğinde sıcak öğleden sonralar…', 'deniz kabukları ve tuz kokusu…', 'yeni defterler, ilk elmalar…',
  'mantar avı ve kızıl yapraklar…', 'yapraklar dökülürken, balkabağı kokulu günler…', 'mum ışığında yılın son sayfaları…'
];
const SEASON_TINT = { winter: '#E6EEF6', spring: '#FBE4EA', summer: '#FFF1C9', autumn: '#F8E0C8' };

const pad = n => String(n).padStart(2, '0');

// Veriler uygulamanın kendi reposunda tutulur. GitHub Pages adresinden (kullanıcı.github.io/Repo) çıkarılır.
const DATA_REPO = (() => {
  const m = location.hostname.match(/^([^.]+)\.github\.io$/);
  const name = location.pathname.split('/').filter(Boolean)[0];
  return m && name ? `${m[1]}/${name}` : 'Koloboros/DuyguMoodTracker';
})();
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ymd(new Date());
const daysIn = (y, m) => new Date(y, m, 0).getDate();           // m: 1–12
const weekIdx = d => (d.getDay() + 6) % 7;                       // Pazartesi = 0
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const longDate = s => { const d = parseYmd(s); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const shortDate = s => { const d = parseYmd(s); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`; };

const LS = {
  get(k) { try { return localStorage.getItem('ak.' + k); } catch (e) { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem('ak.' + k) : localStorage.setItem('ak.' + k, v); } catch (e) { /* özel pencere */ } }
};

function toast(msg, kind = '') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = h('div', { class: 'toast ' + kind, role: 'status' }, msg);
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
}

// ---------- küre ----------

function emoList(entry) {
  if (!entry || !entry.emotions) return [];
  return Object.entries(entry.emotions).filter(([id, w]) => EMO[id] && w > 0).sort((a, b) => b[1] - a[1]);
}

function orbCss(entry, mode) {
  const em = emoList(entry);
  if (!em.length && mode === 'glass') {
    return 'background:radial-gradient(circle at 32% 24%, rgba(255,255,255,.7) 0, rgba(255,255,255,.22) 9%, rgba(255,255,255,0) 26%), radial-gradient(circle at 68% 82%, rgba(255,255,255,.2) 0, rgba(255,255,255,0) 28%), radial-gradient(circle at 50% 50%, rgba(255,255,255,.02) 56%, rgba(214,190,255,.16) 88%, rgba(255,255,255,.3) 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16), 0 .06em .2em rgba(6,0,20,.35);';
  }
  if (!em.length) {
    let st = 'background:radial-gradient(circle at 32% 26%, rgba(255,255,255,.5) 0, rgba(255,255,255,.1) 22%, rgba(255,255,255,0) 46%), radial-gradient(circle at 50% 50%, rgba(255,255,255,.03) 48%, rgba(214,190,255,.18) 100%);';
    if (mode === 'today') st += 'box-shadow:0 0 0 1.5px #FFD27A;';
    else if (mode === 'future') st += 'box-shadow:inset 0 0 0 1px rgba(214,190,255,.14);opacity:.45;';
    else st += 'box-shadow:inset 0 0 0 1px rgba(214,190,255,.3);';
    return st;
  }
  const cols = em.map(([id]) => EMO[id].c);
  const sum = em.reduce((a, [, w]) => a + w, 0);
  let bg;
  if (cols.length === 1) bg = `radial-gradient(circle at 50% 62%, ${cols[0]} 0%, ${cols[0]} 55%, ${cols[0]}B0 100%)`;
  else {
    let acc = 0;
    const stops = em.map(([id, w]) => { const span = w / sum * 100; const s = `${EMO[id].c} ${(acc + span / 2).toFixed(1)}%`; acc += span; return s; });
    const rot = entry.date ? (Number(entry.date.slice(-2)) * 47) % 360 : 30;
    bg = `conic-gradient(from ${rot}deg, ${cols[cols.length - 1]} 0%, ${stops.join(', ')}, ${cols[cols.length - 1]} 100%)`;
  }
  let shadow = `0 0 .55em ${cols[0]}B3, 0 .2em .3em rgba(6,0,20,.6), inset 0 0 .22em rgba(255,255,255,.3)`;
  if (entry.core) shadow = `0 0 0 .07em #FFF3C4, 0 0 .9em rgba(255,214,110,.85), ${shadow}`;
  return `background:radial-gradient(circle at 32% 24%, rgba(255,255,255,.98) 0, rgba(255,255,255,.6) 7%, rgba(255,255,255,0) 24%), radial-gradient(circle at 66% 80%, rgba(255,255,255,.45) 0, rgba(255,255,255,0) 26%), radial-gradient(circle at 48% 46%, rgba(255,255,255,0) 52%, rgba(18,6,40,.55) 100%), ${bg};box-shadow:${shadow};`;
}

function orb(entry, size, mode) {
  const filled = emoList(entry).length > 0;
  const el = h('span', { class: 'orb' + (filled && size >= 60 ? ' glitter' : '') });
  el.style.cssText = orbCss(entry, mode);
  if (size) el.style.fontSize = size + 'px';
  return el;
}

function emotionTotals(entries) {
  const t = Object.fromEntries(Object.keys(EMO).map(id => [id, 0]));
  let days = 0;
  for (const e of entries) {
    const em = emoList(e);
    const sum = em.reduce((a, [, w]) => a + w, 0);
    if (!sum) continue;
    days++;
    for (const [id, w] of em) t[id] = (t[id] || 0) + w / sum;
  }
  return { totals: t, days };
}

// ---------- uygulama durumu ----------

const S = {
  store: null,
  profileId: LS.get('profile'),
  mode: LS.get('mode') || 'me',
  drafts: new Map(),
  renderId: 0
};
const app = document.getElementById('app');

const profile = () => S.store && S.store.profiles.find(p => p.id === S.profileId);
const profileById = id => S.store.profiles.find(p => p.id === id);
function setProfile(id) { S.profileId = id; if (!S.demo) LS.set('profile', id); }
function setMode(m) { S.mode = m; LS.set('mode', m); }

// Arka planda süzülen simler ve mevsime göre düşen süsler (bir kez kurulur, mevsim değişince güncellenir)
const FALLING = {
  winter: { make: c => snowSVG(c), cols: ['#FFFFFF', '#E3ECF8', '#D6E4FF'], ratio: 1 },
  spring: { make: c => petalSVG(c), cols: ['#F7A8C4', '#FBC7D8', '#FFE3EC'], ratio: 1.2 },
  summer: { make: c => blossomSVG(c, '#FFD25E'), cols: ['#FFFFFF', '#FFE08A', '#FFC2D2'], ratio: 1 },
  autumn: { make: c => leafFallSVG(c), cols: ['#E59A4E', '#D9653E', '#F2C14E'], ratio: 1.15 }
};
let skyLayer = null, skySeason = null;
function sky() {
  const layer = h('div', { class: 'sky', 'aria-hidden': 'true' });
  const url = svgURL(STAR_SVG);
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 34; i++) {
    const size = 6 + Math.round(rnd() * 12);
    layer.append(h('span', { style: `left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 100).toFixed(1)}%;width:${size}px;height:${size}px;background-image:url("${url}");animation-delay:${(rnd() * 6).toFixed(1)}s;animation-duration:${(3 + rnd() * 4).toFixed(1)}s;--glow:${['#FFE9A8', '#FFD1E3', '#E4D6FF', '#FFFFFF'][i % 4]}` }));
  }
  for (let i = 0; i < 16; i++) {
    const size = 10 + Math.round(rnd() * 10);
    layer.append(h('b', { class: 'petal', 'data-size': size, style: `left:${(rnd() * 100).toFixed(1)}%;width:${size}px;height:${size}px;animation-delay:-${(rnd() * 22).toFixed(1)}s;animation-duration:${(16 + rnd() * 14).toFixed(1)}s;--sway:${(30 + rnd() * 60).toFixed(0)}px` }));
  }
  for (let i = 0; i < 60; i++) {
    layer.append(h('i', { style: `left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 100).toFixed(1)}%;animation-delay:${(rnd() * 5).toFixed(1)}s` }));
  }
  skyLayer = layer;
  return layer;
}
function setSkySeason(season) {
  if (!skyLayer || season === skySeason) return;
  skySeason = season;
  const f = FALLING[season] || FALLING.spring;
  const urls = f.cols.map(c => `url("${svgURL(f.make(c))}")`);
  skyLayer.dataset.season = season;
  skyLayer.querySelectorAll('.petal').forEach((el, i) => {
    const size = Number(el.dataset.size) * (season === 'winter' ? .8 : 1);
    el.style.width = size + 'px';
    el.style.height = Math.round(size * f.ratio) + 'px';
    el.style.backgroundImage = urls[i % urls.length];
  });
}

// Kartların süsleri: takvim ve gün sayfalarında kenarlardan aşağı sarkan sarmaşıklar, diğerlerinde köşe kıvrımları
const DECORATED = '.login, .shelf-card, .calendar, .page, .future-card, .stats-card, .colors-card';
const HANGING = '.calendar, .page';
function decorate(root) {
  for (const el of root.querySelectorAll(DECORATED)) {
    if (el.dataset.deco) continue;
    el.dataset.deco = '1';
    const season = el.dataset.season || S.season || SEASON_OF_MONTH[new Date().getMonth()];
    const left = !el.classList.contains('right'), right = !el.classList.contains('left');
    if (el.matches(HANGING)) {
      el.classList.add('hung');
      const seed = (el.classList.contains('right') ? 7 : 3) + season.length;
      if (left) el.prepend(h('span', { class: 'hang-vine l', 'aria-hidden': 'true', style: `background-image:url("${svgURL(hangingVineSVG(season, seed))}")` }));
      if (right) el.prepend(h('span', { class: 'hang-vine r', 'aria-hidden': 'true', style: `background-image:url("${svgURL(hangingVineSVG(season, seed + 5))}")` }));
      continue;
    }
    const url = `url("${svgURL(flourishSVG(season))}")`;
    if (left) el.prepend(h('span', { class: 'flourish tl', 'aria-hidden': 'true', style: `background-image:${url}` }));
    if (right) el.prepend(h('span', { class: 'flourish tr', 'aria-hidden': 'true', style: `background-image:${url}` }));
  }
}

function vineStrip(season, cls = 'vine') {
  return h('div', { class: cls, 'aria-hidden': 'true', style: `background-image:url("${svgURL(vineSVG(season))}")` });
}

function shell(content, active, season = SEASON_OF_MONTH[new Date().getMonth()], tools = null) {
  const p = profile();
  S.season = season;
  setSkySeason(season);
  const nav = h('nav', { class: 'tabs', 'aria-label': 'Görünüm' },
    h('a', { href: '#/yil/' + (S.demo ? DEMO_YEAR : new Date().getFullYear()), class: 'btn' + (active === 'yil' ? ' on' : '') }, 'Yıl'),
    h('a', { href: '#/ay/' + (S.demo ? DEMO_YEAR + '-12' : today().slice(0, 7)), class: 'btn' + (active === 'ay' ? ' on' : '') }, 'Ay'),
    h('a', { href: '#/gun/' + (S.demo ? DEMO_YEAR + '-12-31' : today()), class: 'btn' + (active === 'gun' ? ' on' : '') }, S.demo ? 'Gün' : 'Bugün')
  );
  const menu = h('details', { class: 'menu' },
    h('summary', { class: 'who', 'aria-label': 'Hesap menüsü' }, art(p.animal, 30), h('span', null, p.name),
      h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'aria-hidden': 'true' }, h('path', { d: 'M6 9l6 6 6-6' }))),
    h('div', { class: 'menu-pop' },
      h('span', { class: 'menu-label' }, 'Kim yazıyor?'),
      S.store.profiles.map(pr => h('button', {
        class: 'menu-item' + (pr.id === S.profileId ? ' on' : ''),
        onClick: () => { setProfile(pr.id); setMode('me'); route(); }
      }, art(pr.animal, 30), pr.name)),
      h('hr'),
      S.demo ? h('button', { class: 'menu-item', onClick: exitDemo }, 'Örnekten çık') : [
        h('a', { class: 'menu-item', href: '#/profil' }, 'Profil ve duygularım'),
        h('button', { class: 'menu-item', onClick: enterDemo }, 'Dolu bir yıl örneği'),
        h('a', { class: 'menu-item', href: '#/hesap-olustur' }, 'Yeni hesap oluştur'),
        h('button', { class: 'menu-item', onClick: logout }, 'Bu cihazdan çık')]
    )
  );

  const header = h('header', { class: 'top' },
    h('a', { href: '#/yil/' + new Date().getFullYear(), class: 'brand' },
      orb({ emotions: { joy: 1, emb: 1, sad: 1, disgust: 1 } }, 34), h('span', null, 'Anı Küreleri')),
    nav, menu);
  const banner = S.demo ? h('div', { class: 'demo-banner', role: 'note' },
    h('span', null, art('hope', 34), h('span', null, h('strong', null, 'Örnek yıl. '), 'Bu küreler gerçek verin değil; dolu bir yılın nasıl göründüğünü gösterir. Burada yaptığın değişiklikler kaydedilmez.')),
    h('button', { class: 'btn', onClick: exitDemo }, 'Örnekten çık')) : null;
  app.replaceChildren(vineStrip(season), h('div', { class: 'wrap' }, header, banner, tools ? h('div', { class: 'page-tools' }, tools) : null, content));
}

// ---------- örnek yıl ----------

function enterDemo() {
  const base = S.store && S.store.profiles.find(p => p.id === S.profileId);
  S.real = { store: S.store, profileId: S.profileId, mode: S.mode };
  S.store = new DemoStore(base ? { ...base } : { id: 'ornek', name: 'Duygu', animal: 'fox', custom: [] });
  S.demo = true;
  S.profileId = S.store.profiles[0].id;
  S.mode = 'me';
  S.drafts.clear();
  location.hash = '#/yil/' + DEMO_YEAR;
  route();
}

function exitDemo() {
  const real = S.real || {};
  S.demo = false;
  S.store = real.store || null;
  S.profileId = real.profileId || LS.get('profile');
  S.mode = real.mode || 'me';
  S.drafts.clear();
  location.hash = '#/yil/' + new Date().getFullYear();
  route();
}

function dlButton(label, onClick) {
  return h('button', { type: 'button', class: 'btn gold dl-btn', onClick }, dlIcon(), label);
}

function divider(season) {
  return h('div', { class: 'divider', 'aria-hidden': 'true', style: `background-image:url("${svgURL(dividerSVG(season))}")` });
}

// ---------- kendi duygunu ekle ----------

function customOf(p) { return (p && p.custom) || []; }

function emotionDialog(onDone) {
  let color = SWATCHES[Math.floor(Math.random() * SWATCHES.length)], face = 'x:' + EXTRA_FACES[0].id;
  const nameIn = h('input', { id: 'cname', type: 'text', maxlength: 22, placeholder: 'ör. Şükran, Merak, Kahve keyfi', required: true, autocomplete: 'off' });
  const preview = h('div', { class: 'emo-preview' });
  const swatches = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': 'Renk' });
  const faces = h('div', { class: 'faces', role: 'radiogroup', 'aria-label': 'Yüz ifadesi' });
  let autoName = '';
  const colorIn = h('input', { type: 'color', 'aria-label': 'Başka bir renk', class: 'color-in' });
  const err = h('p', { class: 'err', role: 'alert' });
  const paint = () => {
    registerCustom([...S.store.profiles.flatMap(p => p.custom || []), { id: 'c-onizleme', label: nameIn.value || 'Yeni duygu', c: color, face }]);
    preview.replaceChildren(art('c-onizleme', 96, { className: 'bob' }), h('strong', null, nameIn.value.trim() || 'Yeni duygu'));
    swatches.replaceChildren(...SWATCHES.map(c => h('button', { type: 'button', role: 'radio', 'aria-checked': String(c === color), 'aria-label': c, class: 'swatch' + (c === color ? ' on' : ''), style: `background:${c}`, onClick: () => { color = c; paint(); } })), colorIn);
    registerCustom([...S.store.profiles.flatMap(p => p.custom || []), ...EXTRA_FACES.map(f => ({ id: 'c-yuz-' + f.id, label: f.label, c: color, face: 'x:' + f.id }))]);
    faces.replaceChildren(...EXTRA_FACES.map(f => {
      const val = 'x:' + f.id;
      return h('button', { type: 'button', role: 'radio', 'aria-checked': String(val === face), 'aria-label': f.label, class: 'face' + (val === face ? ' on' : ''), onClick: () => {
        face = val;
        const cur = nameIn.value.trim();
        if (!cur || cur === autoName) { nameIn.value = f.label; autoName = f.label; }
        paint();
      } }, art('c-yuz-' + f.id, 52), h('span', null, f.label));
    }));
    registerCustom([...S.store.profiles.flatMap(p => p.custom || []), { id: 'c-onizleme', label: nameIn.value || 'Yeni duygu', c: color, face }]);
  };
  nameIn.value = EXTRA_FACES[0].label; autoName = EXTRA_FACES[0].label;
  colorIn.value = color;
  colorIn.addEventListener('input', () => { color = colorIn.value; paint(); });
  nameIn.addEventListener('input', () => { preview.lastChild.textContent = nameIn.value.trim() || 'Yeni duygu'; });
  const save = h('button', { type: 'submit', class: 'btn gold' }, 'Duyguyu ekle');
  const dlg = h('dialog', { class: 'emo-dialog' },
    h('form', { method: 'dialog', class: 'card', onSubmit: async e => {
      e.preventDefault();
      const label = nameIn.value.trim();
      if (!label) { err.textContent = 'Duyguna bir isim ver.'; return; }
      const all = [...EMOTIONS, ...Object.values(EMO).filter(x => x.custom && !/^c-(yuz|emo)-/.test(x.id) && x.id !== 'c-onizleme')];
      if (all.some(x => x.label.toLocaleLowerCase('tr') === label.toLocaleLowerCase('tr'))) { err.textContent = 'Bu isimde bir duygu zaten var.'; return; }
      save.disabled = true;
      try {
        const p = profile();
        const id = 'c-' + Date.now().toString(36);
        await S.store.updateProfile(p.id, { custom: [...customOf(p), { id, label, c: color, face }] });
        registerCustom(S.store.profiles.flatMap(x => x.custom || []));
        dlg.close(); dlg.remove();
        toast(`"${label}" duygularına eklendi`);
        onDone && onDone(id);
      } catch (ex) { err.textContent = ex.message; save.disabled = false; }
    } },
      h('h2', null, 'Yeni bir duygu'),
      h('p', { class: 'muted' }, 'Bir yüz seç; ismi istersen değiştir.'),
      preview,
      h('span', { class: 'label' }, 'Yüz'), faces,
      h('span', { class: 'label' }, 'Renk'), swatches,
      h('label', { for: 'cname' }, 'İsim'), nameIn,
      err,
      h('div', { class: 'dialog-actions' }, h('button', { type: 'button', class: 'linkbtn', onClick: () => { registerCustom(S.store.profiles.flatMap(x => x.custom || [])); dlg.close(); dlg.remove(); } }, 'Vazgeç'), save)
    ));
  document.body.append(dlg);
  paint();
  dlg.showModal();
  nameIn.focus();
}

function loading() {
  return h('div', { class: 'loading' }, art('joy', 54, { className: 'bob' }), h('span', null, 'Küreler raftan iniyor…'));
}

// ---------- giriş ve hesaplar ----------

function viewLogin(error) {
  const tokenIn = h('input', { id: 'tok', type: 'password', autocomplete: 'off', placeholder: 'github_pat_…', required: true });
  const err = h('p', { class: 'err', role: 'alert' }, error || '');
  const btn = h('button', { class: 'btn big gold', type: 'submit' }, 'Bahçeye gir');
  const form = h('form', { class: 'card login', onSubmit: async e => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Kapı açılıyor…'; err.textContent = '';
    const repo = new Repo(tokenIn.value.trim(), DATA_REPO);
    try {
      await repo.check();
      LS.set('token', repo.token);
      S.store = new Store(repo);
      await S.store.loadProfiles();
      route();
    } catch (ex) {
      err.textContent = ex.message;
      btn.disabled = false; btn.textContent = 'Bahçeye gir';
    }
  } },
    h('div', { class: 'login-sprites', 'aria-hidden': 'true' }, ['joy', 'sad', 'anger', 'fear', 'disgust'].map((id, i) => art(id, 54, { className: 'bob d' + i }))),
    h('h1', null, 'Anı Küreleri'),
    h('p', { class: 'lead' }, 'Her gün bir küre, her küre bir anı. Devam etmek için anahtarını gir; bu cihaz seni hatırlar.'),
    h('label', { for: 'tok' }, 'Anahtar'), tokenIn,
    err, btn,
    h('details', { class: 'help' }, h('summary', null, 'Anahtar nedir, nereden alınır?'),
      h('ol', null,
        h('li', null, 'GitHub › Settings › Developer settings › Fine-grained tokens › Generate new token.'),
        h('li', null, 'Repository access: yalnızca ', h('code', null, 'DuyguMoodTracker'), '. Permissions › Contents: Read and write.'),
        h('li', null, 'Oluşan ', h('code', null, 'github_pat_…'), ' anahtarını buraya yapıştır. Anahtar sadece bu cihazda saklanır.')
      ))
  );
  app.replaceChildren(vineStrip(SEASON_OF_MONTH[new Date().getMonth()]), h('div', { class: 'wrap center' }, form));
}

function logout() {
  if (!confirm('Bu cihazdaki anahtar silinsin mi? Verilerin repoda kalır; tekrar girmek için anahtar gerekir.')) return;
  LS.set('token', null); LS.set('profile', null);
  S.store = null; S.profileId = null;
  location.hash = '';
  viewLogin();
}

function viewProfileForm({ editing = false } = {}) {
  const current = editing ? profile() : null;
  const first = S.store.profiles.length === 0;
  const nameIn = h('input', { id: 'pname', type: 'text', maxlength: 24, required: true, autocomplete: 'off' });
  nameIn.value = current ? current.name : (first ? 'Duygu' : '');
  let chosen = current ? current.animal : null;
  const err = h('p', { class: 'err', role: 'alert' });
  const grid = h('div', { class: 'animals', role: 'radiogroup', 'aria-label': 'Hayvan avatarı' });
  const paint = () => grid.replaceChildren(...ANIMALS.map(a => h('button', {
    type: 'button', role: 'radio', 'aria-checked': String(chosen === a.id), class: 'animal' + (chosen === a.id ? ' on' : ''),
    onClick: () => { chosen = a.id; paint(); }
  }, art(a.id, 88, { className: chosen === a.id ? 'bob' : '' }), h('span', null, a.label))));
  paint();
  const btn = h('button', { class: 'btn big gold', type: 'submit' }, editing ? 'Kaydet' : 'Hesabı oluştur');
  const form = h('form', { class: 'card login wide', onSubmit: async e => {
    e.preventDefault();
    const name = nameIn.value.trim();
    if (!name) { err.textContent = 'Bir isim yaz.'; return; }
    if (!chosen) { err.textContent = 'Bir hayvan seç.'; return; }
    btn.disabled = true;
    try {
      if (editing) { await S.store.updateProfile(current.id, { name, animal: chosen }); toast('Avatar güncellendi'); }
      else { const p = await S.store.addProfile({ name, animal: chosen }); setProfile(p.id); setMode('me'); toast(`Hoş geldin, ${p.name}`); }
      location.hash = '#/yil/' + new Date().getFullYear();
      route();
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
  } },
    h('h1', null, editing ? 'Profil ve duygular' : (first ? 'Bahçene hoş geldin' : 'Yeni hesap')),
    h('p', { class: 'lead' }, editing ? 'İsmini, hayvanını ve kendi duygularını buradan düzenleyebilirsin.' : 'Bir isim ve seni anlatan bir hayvan seç. Küreler bu hesapta birikecek.'),
    h('label', { for: 'pname' }, 'İsim'), nameIn,
    h('span', { class: 'label' }, 'Hayvanın'), grid,
    editing ? customSection(current) : null,
    err, btn,
    (!first) ? h('a', { href: '#/yil/' + new Date().getFullYear(), class: 'quiet' }, 'Vazgeç') : null
  );
  if (first || !profile()) app.replaceChildren(vineStrip(SEASON_OF_MONTH[new Date().getMonth()]), h('div', { class: 'wrap center' }, form));
  else shell(h('div', { class: 'center' }, form), '');
}

function customSection(p) {
  const list = h('div', { class: 'custom-list' });
  const paint = () => {
    const cur = profile();
    registerCustom(S.store.profiles.flatMap(x => x.custom || []));
    list.replaceChildren(...customOf(cur).map(c => h('div', { class: 'custom-item' },
      art(c.id, 48), h('strong', null, c.label),
      h('button', { type: 'button', class: 'linkbtn danger', onClick: async () => {
        if (!confirm(`"${c.label}" silinsin mi? Bu duyguyla boyanmış eski küreler rengini korur ama listede görünmez.`)) return;
        try { await S.store.updateProfile(cur.id, { custom: customOf(cur).filter(x => x.id !== c.id) }); paint(); } catch (ex) { toast(ex.message, 'warn'); }
      } }, 'Sil'))),
      h('button', { type: 'button', class: 'chip add-chip row', onClick: () => emotionDialog(paint) }, h('span', { class: 'plus', 'aria-hidden': 'true' }, '+'), h('span', null, 'Yeni duygu ekle')));
  };
  paint();
  return h('div', { class: 'custom-wrap' }, h('span', { class: 'label' }, 'Kendi duyguların'), h('p', { class: 'muted' }, 'Hazır duyguların yanına istediğin kadar duygu ekleyebilirsin.'), list);
}

function viewWho() {
  app.replaceChildren(vineStrip(SEASON_OF_MONTH[new Date().getMonth()]), h('div', { class: 'wrap center' },
    h('div', { class: 'card login wide' },
      h('h1', null, 'Kim yazıyor?'),
      h('div', { class: 'animals' }, S.store.profiles.map(p => h('button', {
        class: 'animal', onClick: () => { setProfile(p.id); route(); }
      }, art(p.animal, 88), h('span', null, p.name))))
    )));
}

// ---------- yıl: anı arşivi ----------

const SHORT_M = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];
const TOWER_VINE = `<svg class="tower-vine" aria-hidden="true" viewBox="0 0 34 460" preserveAspectRatio="none">
  <path d="M17 0 C4 40 30 80 17 120 C4 160 30 200 17 240 C4 280 30 320 17 360 C4 400 30 440 17 460" stroke="#7FBF8A" stroke-width="2.4" fill="none" vector-effect="non-scaling-stroke"/>
  <ellipse cx="8" cy="60" rx="7" ry="3.4" fill="#8FD39A" transform="rotate(-30 8 60)"/><ellipse cx="27" cy="150" rx="7" ry="3.4" fill="#A6E0AE" transform="rotate(30 27 150)"/>
  <ellipse cx="8" cy="270" rx="7" ry="3.4" fill="#8FD39A" transform="rotate(-30 8 270)"/><ellipse cx="27" cy="380" rx="7" ry="3.4" fill="#A6E0AE" transform="rotate(30 27 380)"/>
  <circle cx="22" cy="100" r="5" fill="#FF9FC6"/><circle cx="22" cy="100" r="2" fill="#FFE08A"/>
  <circle cx="11" cy="210" r="5" fill="#FFE08A"/><circle cx="11" cy="210" r="2" fill="#FF9F6B"/>
  <circle cx="23" cy="320" r="5" fill="#C9B2FF"/><circle cx="23" cy="320" r="2" fill="#FFE08A"/>
  <circle cx="12" cy="430" r="5" fill="#FF9FC6"/><circle cx="12" cy="430" r="2" fill="#FFE08A"/>
</svg>`;

// Arşivdeki küreler için üzerine gelince açılan küçük kart
let tipEl = null;
function orbTip(target, entry, date) {
  if (!tipEl) { tipEl = h('div', { class: 'orb-tip', role: 'tooltip' }); document.body.append(tipEl); }
  const txt = entry ? (entry.caption || entry.note || '') : '';
  tipEl.replaceChildren(
    orb(entry ? { ...entry, date } : null, 40, entry ? 'fill' : 'empty'),
    h('span', null,
      h('strong', null, `${WEEKDAYS[weekIdx(parseYmd(date))]} · ${longDate(date)}`),
      h('span', { class: 'hand' }, txt ? (txt.length > 70 ? txt.slice(0, 70) + '…' : txt) : (entry ? emoList(entry).map(([id]) => EMO[id].label).join(', ') : 'henüz boş'))));
  const r = target.getBoundingClientRect();
  tipEl.classList.add('show');
  const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  let x = r.left + r.width / 2 - tw / 2, y = r.top - th - 12;
  x = Math.max(8, Math.min(window.innerWidth - tw - 8, x));
  if (y < 8) y = r.bottom + 12;
  tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
}
function hideTip() { if (tipEl) tipEl.classList.remove('show'); }
window.addEventListener('scroll', hideTip, { passive: true });

async function viewYear(year) {
  const p = profile();
  const id = ++S.renderId;
  shell(loading(), 'yil');
  const data = await S.store.loadYear(p.id, year);
  if (id !== S.renderId) return;

  const t = today();
  const entries = Object.entries(data).map(([date, e]) => ({ ...e, date })).sort((a, b) => a.date.localeCompare(b.date));
  const photos = entries.filter(e => e.photo).length;
  const cores = entries.filter(e => e.core);
  const isThisYear = String(year) === t.slice(0, 4);

  // kuleler: her biri bir mevsim, her ay 4 raf × 8 küre
  const COLS = 8;
  const towers = [0, 1, 2, 3].map(ti => {
    const months = [0, 1, 2].map(k => {
      const mi = ti * 3 + k;
      const mKey = `${year}-${pad(mi + 1)}`;
      const n = daysIn(year, mi + 1);
      const rows = [];
      for (let r0 = 0; r0 < 4; r0++) {
        const slots = [];
        for (let c = 0; c < COLS; c++) {
          const d = r0 * COLS + c + 1;
          if (d > n) { slots.push(h('span', { class: 'tslot empty-slot' })); continue; }
          const date = `${mKey}-${pad(d)}`;
          const e = data[date] ? { ...data[date], date } : null;
          const f = (.7 + .3 * Math.sin(Math.PI * (c + .5) / COLS)) * (e && e.core ? 1.22 : 1);
          const mode = date === t ? 'today' : (date > t ? 'future' : 'empty');
          const o = orb(e, null, mode);
          if (e && e.core) o.classList.add('pulse');
          o.style.setProperty('--f', f.toFixed(3));
          const attrs = { class: 'tslot', 'data-date': date, 'aria-label': longDate(date), style: `opacity:${(.8 + .2 * Math.sin(Math.PI * (c + .5) / COLS)).toFixed(2)}` };
          const slot = date > t ? h('span', attrs, o) : h('a', { ...attrs, href: '#/gun/' + date }, o);
          slot.addEventListener('mouseenter', () => orbTip(slot, e, date));
          slot.addEventListener('focus', () => orbTip(slot, e, date));
          slot.addEventListener('mouseleave', hideTip);
          slot.addEventListener('blur', hideTip);
          slots.push(slot);
        }
        rows.push(h('div', { class: 'trow' }, h('div', { class: 'tgrid' }, slots), h('div', { class: 'rail' })));
      }
      return h('div', { class: 'tmonth' }, h('a', { class: 'tlabel', href: '#/ay/' + mKey, 'aria-label': MONTHS[mi] + ' takvimi' }, SHORT_M[mi]), rows);
    });
    const body = h('div', { class: 'tower-body' }, months);
    body.insertAdjacentHTML('afterbegin', TOWER_VINE);
    return h('div', { class: 'tower' + (ti === 0 || ti === 3 ? ' outer' : '') },
      h('div', { class: 'tower-cap' }, h('span', { class: 'plaque' }, `${MONTHS[ti * 3].toLocaleUpperCase('tr')} – ${MONTHS[ti * 3 + 2].toLocaleUpperCase('tr')}`)),
      body,
      h('div', { class: 'plinth' }));
  });

  // core memory kürsüsü
  const shownCores = cores.slice(0, 12);
  const coreSize = shownCores.length > 9 ? 32 : (shownCores.length > 6 ? 40 : 46);
  const pedestal = h('div', { class: 'pedestal-wrap' },
    h('span', { class: 'ped-title' }, 'Core Memories'),
    h('div', { class: 'pedestal' },
      h('div', { class: 'ped-back' }),
      h('div', { class: 'ped-orbs' }, shownCores.length
        ? shownCores.map(e => { const o = orb(e, coreSize); o.classList.add('pulse'); return h('a', { href: '#/gun/' + e.date, class: 'ped-orb', title: longDate(e.date) + (e.caption ? ' · ' + e.caption : '') }, o); })
        : [0, 1, 2].map(() => h('span', { class: 'ped-orb', title: 'sıradaki core memory' }, orb(null, coreSize, 'future')))),
      h('div', { class: 'ped-front' }),
      h('div', { class: 'ped-stem' })),
    cores.length > shownCores.length ? h('small', { class: 'muted' }, `+${cores.length - shownCores.length} core memory daha`) : null);

  const { totals, days } = emotionTotals(entries);
  const keys = Object.values(EMO).filter(e => totals[e.id] > 0).sort((a, b) => totals[b.id] - totals[a.id]);
  const grand = keys.reduce((a, e) => a + totals[e.id], 0) || 1;

  const exportBtn = dlButton('Yılı indir', () => exportDialog({
    title: `${year} anı arşivi`, size: 'A5 · 148 × 210 mm', pdfFormat: 'a5', filename: `ani-arsivi-${year}`,
    render: (theme, scale) => renderYear({ year, entries, profile: p, theme, today: t, scale })
  }));

  const content = h('div', { class: 'stack' },
    h('section', { class: 'hero' },
      h('div', { class: 'hero-text' },
        h('div', { class: 'year-switch' },
          h('a', { class: 'arrow', href: '#/yil/' + (year - 1), 'aria-label': 'Önceki yıl' }, '‹'),
          h('h1', { class: 'glow-title' }, String(year)),
          h('a', { class: 'arrow', href: '#/yil/' + (year + 1), 'aria-label': 'Sonraki yıl' }, '›')),
        h('p', { class: 'muted' }, `${entries.length} küre · ${photos} fotoğraf · ${cores.length} core memory`)),
      pedestal),
    h('section', { class: 'archive', 'aria-label': `${year} anı arşivi` },
      h('div', { class: 'far-wall', 'aria-hidden': 'true' }),
      towers,
      h('div', { class: 'floor-glow', 'aria-hidden': 'true' })),
    h('section', { class: 'card colors-card' },
      h('div', { class: 'card-head' }, h('h2', null, `${year}'in renkleri`), keys.length ? h('small', null, 'En çok uğrayan: ', h('strong', { class: 'gold-text' }, keys[0].label)) : null),
      keys.length ? [
        h('div', { class: 'colorbar' }, keys.map(e => h('span', { title: e.label, style: `width:${(totals[e.id] / grand * 100).toFixed(2)}%;background:${e.c}` }))),
        h('div', { class: 'legend-grid' }, keys.slice(0, 10).map((e, i) => h('div', { class: 'legend-item' },
          h('span', { class: 'bob', style: `animation-delay:${i * .25}s` }, art(e.id, 46)),
          h('span', null, h('strong', null, e.label), h('small', null, '%' + Math.round(totals[e.id] / days * 100))))))
      ] : h('p', { class: 'muted' }, 'Henüz küre yok.'))
  );
  shell(content, 'yil', undefined, exportBtn);
}

function dlIcon() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', '18'); s.setAttribute('height', '18'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
  return s;
}

// ---------- indirme penceresi ----------

function exportDialog({ title, size, render, filename, pdfFormat }) {
  let theme = LS.get('exportTheme') === 'dark' ? 'dark' : 'light';
  let canvas = null, token = 0;
  const preview = h('img', { class: 'exp-preview', alt: title + ' önizlemesi' });
  const status = h('p', { class: 'muted exp-status', role: 'status' }, 'Hazırlanıyor…');
  const themeSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Renk' });
  const pdfBtn = h('button', { type: 'button', class: 'btn gold' }, dlIcon(), 'PDF indir');
  const pngBtn = h('button', { type: 'button', class: 'btn' }, dlIcon(), 'Resim (PNG)');
  const setBusy = b => { pdfBtn.disabled = b; pngBtn.disabled = b; };
  const paintSeg = () => themeSeg.replaceChildren(...[['light', 'Açık (baskı dostu)'], ['dark', 'Koyu (gece)']].map(([k, label]) =>
    h('button', { type: 'button', class: theme === k ? 'on' : '', 'aria-pressed': String(theme === k), onClick: () => { theme = k; LS.set('exportTheme', k); paintSeg(); refresh(); } }, label)));
  async function refresh() {
    const my = ++token;
    setBusy(true); status.textContent = 'Hazırlanıyor…'; preview.classList.add('dim');
    try {
      const cv = await render(theme, 1);
      if (my !== token) return;
      canvas = cv;
      preview.src = cv.toDataURL('image/jpeg', .82);
      preview.classList.remove('dim');
      status.textContent = size + ' · 300 dpi. Yazdırırken "gerçek boyut" seç.';
      setBusy(false);
    } catch (ex) { status.textContent = ex.message || 'Sayfa hazırlanamadı.'; }
  }
  pdfBtn.addEventListener('click', async () => {
    setBusy(true); status.textContent = 'PDF hazırlanıyor…';
    try { download(await toPDF(canvas, pdfFormat), filename + '.pdf'); status.textContent = 'PDF indirildi.'; }
    catch (ex) { status.textContent = ex.message; }
    setBusy(false);
  });
  pngBtn.addEventListener('click', async () => {
    setBusy(true);
    try { download(await toPNG(canvas), filename + '.png'); status.textContent = 'Resim indirildi.'; }
    catch (ex) { status.textContent = ex.message; }
    setBusy(false);
  });
  const close = () => { token++; dlg.close(); dlg.remove(); };
  const dlg = h('dialog', { class: 'emo-dialog exp-dialog' },
    h('div', { class: 'card' },
      h('div', { class: 'exp-head' }, h('h2', null, title), h('button', { type: 'button', class: 'linkbtn', onClick: close }, 'Kapat')),
      themeSeg,
      h('div', { class: 'exp-frame' }, preview),
      status,
      h('div', { class: 'dialog-actions' }, pngBtn, pdfBtn)));
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  document.body.append(dlg);
  paintSeg();
  dlg.showModal();
  refresh();
}

// ---------- ay ----------

async function viewMonth(mKey) {
  const [year, month] = mKey.split('-').map(Number);
  const id = ++S.renderId;
  shell(loading(), 'ay', SEASON_OF_MONTH[Number(mKey.slice(5, 7)) - 1]);
  const multi = S.store.profiles.length >= 2;
  const both = multi && S.mode === 'both';
  const people = both ? S.store.profiles : [profile()];
  const datas = await Promise.all(people.map(pr => S.store.loadYear(pr.id, year)));
  if (id !== S.renderId) return;

  const t = today();
  const mi = month - 1;
  const season = SEASON_OF_MONTH[mi];
  const nDays = daysIn(year, month);
  const lead = weekIdx(new Date(year, mi, 1));
  const prevKey = ymd(new Date(year, mi - 1, 1)).slice(0, 7);
  const nextKey = ymd(new Date(year, mi + 1, 1)).slice(0, 7);

  const monthEntries = datas.map((data, i) => Object.entries(data).filter(([d]) => d.startsWith(mKey)).map(([date, e]) => ({ ...e, date, pid: people[i].id })));
  const flat = monthEntries.flat();
  const mine = monthEntries[both ? people.findIndex(pr => pr.id === S.profileId) : 0] || [];

  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(h('span', { class: 'cell pad' }));
  for (let d = 1; d <= nDays; d++) {
    const date = `${mKey}-${pad(d)}`;
    const future = date > t;
    const es = datas.map(data => data[date] ? { ...data[date], date } : null);
    const size = both ? (people.length > 2 ? 24 : 32) : 44;
    const anyPhoto = es.some(e => e && e.photo), anyNote = es.some(e => e && e.note);
    const core = es.some(e => e && e.core);
    const inner = [
      h('span', { class: 'num' }, String(d)),
      h('span', { class: 'cell-orbs' }, es.map(e => orb(e, size, date === t ? 'today' : (future ? 'future' : 'empty')))),
      h('span', { class: 'cell-marks' },
        anyPhoto ? h('img', { src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" rx="1" fill="#fff" stroke="#8A5A3B" stroke-width="1.4"/><rect x="4" y="3" width="8" height="7" fill="#BFDDF2"/><path d="M4 10l3-3 2 2 3-2v3z" fill="#8BBF6A"/></svg>'), width: 14, height: 14, alt: 'fotoğraf var' }) : null,
        anyNote ? h('img', { src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="#8A5A3B" stroke-width="1.5"><path d="M3 2h7l3 3v9H3z"/><path d="M5.5 7h5M5.5 10h5"/></svg>'), width: 14, height: 14, alt: 'not var' }) : null)
    ];
    const cls = 'cell' + (date === t ? ' today' : '') + (core ? ' core' : '') + (future ? ' future' : '');
    cells.push(future ? h('span', { class: cls }, inner) : h('a', { class: cls, href: '#/gun/' + date, 'aria-label': longDate(date) }, inner));
  }
  while (cells.length % 7) cells.push(h('span', { class: 'cell pad' }));

  const { totals, days } = emotionTotals(both ? flat : mine);
  const top = Object.values(EMO).filter(e => totals[e.id] > 0).sort((a, b) => totals[b.id] - totals[a.id]).slice(0, 4);
  const photoEntries = (both ? flat : mine).filter(e => e.photo).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const notes = (both ? flat : mine).filter(e => e.note).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  const toggle = multi ? h('div', { class: 'seg', role: 'group', 'aria-label': 'Kimin ayı' },
    S.store.profiles.map(pr => h('button', {
      class: !both && pr.id === S.profileId ? 'on' : '', 'aria-pressed': String(!both && pr.id === S.profileId),
      onClick: () => { setProfile(pr.id); setMode('me'); viewMonth(mKey); }
    }, art(pr.animal, 30), pr.name)),
    h('button', { class: both ? 'on' : '', 'aria-pressed': String(both), onClick: () => { setMode('both'); viewMonth(mKey); } }, 'Birlikte')
  ) : null;

  const polaroids = h('div', { class: 'polaroids' }, photoEntries.map((e, i) => {
    const img = h('img', { alt: shortDate(e.date) + ' fotoğrafı', loading: 'lazy' });
    S.store.photoURL(e.photo).then(u => { img.src = u; }).catch(() => { img.alt = 'yüklenemedi'; });
    return h('a', { href: '#/gun/' + e.date, class: 'polaroid small', style: `--r:${[-5, 3, -2, 4, -3, 2][i]}deg` }, img, h('span', { class: 'hand' }, shortDate(e.date)));
  }));

  const exportBtn = dlButton('Ayı indir', () => {
          const pr = profile();
          const own = Object.entries(S.store.cachedYear(pr.id, year) || {}).filter(([d]) => d.startsWith(mKey)).map(([date, e]) => ({ ...e, date })).sort((a, b) => a.date.localeCompare(b.date));
          exportDialog({
            title: `${MONTHS[mi]} ${year} özeti`, size: 'A5 · 148 × 210 mm', pdfFormat: 'a5', filename: `ani-kureleri-${mKey}`,
            render: async (theme, scale) => {
              const photoSrc = {};
              for (const e of own.filter(x => x.core && x.photo).slice(0, 3)) { try { photoSrc[e.date] = await S.store.photoURL(e.photo); } catch (er) { /* fotoğrafsız devam */ } }
              return renderMonth({ year, month, entries: own, profile: pr, theme, photoSrc, scale });
            }
          });
  });

  const content = h('div', { class: 'stack' },
    h('section', { class: 'hero' },
      h('div', { class: 'month-hero' },
        h('span', { class: 'badge big', style: `background:${SEASON_TINT[season]}` }, art('m' + month, 58)),
        h('div', null,
          h('div', { class: 'year-switch' },
            h('a', { class: 'arrow', href: '#/ay/' + prevKey, 'aria-label': 'Önceki ay' }, '‹'),
            h('h1', null, `${MONTHS[mi]} ${year}`),
            h('a', { class: 'arrow', href: '#/ay/' + nextKey, 'aria-label': 'Sonraki ay' }, '›')),
          h('p', { class: 'muted' }, both ? `${flat.length} küre · ${people.map(p => p.name).join(' ve ')} yan yana`
            : `${mine.length} küre · ${mine.filter(e => e.photo).length} fotoğraf · ${mine.filter(e => e.core).length} core memory`))),
    ),
    toggle,
    h('div', { class: 'month-layout' },
      h('section', { class: 'card calendar', 'aria-label': 'Takvim', 'data-season': season },
        both ? h('div', { class: 'legend' }, people.map(p => h('span', null, art(p.animal, 30), p.name))) : null,
        h('div', { class: 'week' }, WEEK_SHORT.map(w => h('span', null, w))),
        h('div', { class: 'cells' + (both ? ' both' : '') }, cells)
      ),

      h('aside', { class: 'side' },
        h('section', { class: 'card' }, h('h2', null, 'Ayın duyguları'),
          top.length ? h('div', { class: 'cinc4' }, top.map((e, i) => h('div', null,
            h('span', { class: 'bob', style: `animation-delay:${i * .3}s` }, art(e.id, 54)),
            h('strong', null, e.label), h('small', null, '%' + Math.round(totals[e.id] / days * 100)))))
            : h('p', { class: 'muted' }, 'Bu ay henüz küre yok.')),
        h('section', { class: 'card' }, h('h2', null, 'Ayın fotoğrafları'),
          photoEntries.length ? polaroids : h('p', { class: 'muted' }, 'Henüz fotoğraf yok.')),
        h('section', { class: 'card' }, h('h2', null, 'Son notlar'),
          notes.length ? notes.map(e => h('a', { href: '#/gun/' + e.date, class: 'note-snip' },
            h('span', { class: 'hand' }, `${shortDate(e.date)}${both ? ' · ' + profileById(e.pid).name : ''} — ${e.note.length > 120 ? e.note.slice(0, 120) + '…' : e.note}`)))
            : h('p', { class: 'muted' }, 'Henüz not yok.'))
      )
    )
  );
  shell(content, 'ay', season, exportBtn);
}

// ---------- gün ----------

async function viewDay(date) {
  const p = profile();
  const id = ++S.renderId;
  shell(loading(), 'gun', SEASON_OF_MONTH[Number(date.slice(5, 7)) - 1]);
  const year = Number(date.slice(0, 4));
  const data = await S.store.loadYear(p.id, year);
  if (id !== S.renderId) return;

  const t = today();
  const d = parseYmd(date);
  const weekday = WEEKDAYS[weekIdx(d)];
  const season = SEASON_OF_MONTH[d.getMonth()];
  const nav = h('nav', { class: 'day-nav', 'aria-label': 'Günler arası geçiş' },
    h('a', { class: 'btn', href: '#/gun/' + addDays(date, -1), 'aria-label': 'Önceki gün' }, '‹ ' + shortDate(addDays(date, -1))),
    h('a', { class: 'btn', href: '#/ay/' + date.slice(0, 7) }, MONTHS[d.getMonth()] + ' takvimi'),
    addDays(date, 1) <= t ? h('a', { class: 'btn', href: '#/gun/' + addDays(date, 1), 'aria-label': 'Sonraki gün' }, shortDate(addDays(date, 1)) + ' ›') : null);

  if (date > t) {
    shell(h('div', { class: 'stack' }, h('section', { class: 'card future-card' },
      art('ennui', 88, { className: 'bob' }),
      h('h1', null, longDate(date)),
      h('p', { class: 'lead' }, 'Bu sayfa henüz yazılmadı. O gün geldiğinde küresini boyayabilirsin.'),
      h('a', { class: 'btn gold', href: '#/gun/' + t }, 'Bugüne dön')), ), 'gun', season, nav);
    return;
  }

  const key = p.id + '|' + date;
  const saved = data[date] || null;
  if (!S.drafts.has(key)) S.drafts.set(key, {
    emotions: { ...(saved ? saved.emotions : {}) }, note: saved ? saved.note || '' : '', caption: saved ? saved.caption || '' : '',
    core: saved ? !!saved.core : false, photo: saved ? saved.photo || null : null, newPhoto: null, removedPhoto: null
  });
  const dr = S.drafts.get(key);

  // --- sol sayfa: küre, duygular, oranlar ---
  const orbBox = h('div', { class: 'big-orb bob' });
  const orbStand = h('div', { class: 'orb-stand' }, orbBox, h('div', { class: 'stand-top' }), h('div', { class: 'stand-stem' }));
  const coreBadge = h('span', { class: 'core-badge' }, 'Core Memory');
  const paintOrb = () => {
    orbBox.replaceChildren(orb({ emotions: dr.emotions, core: dr.core, date }, 210, 'glass'));
    coreBadge.hidden = !dr.core;
  };
  const sliders = h('div', { class: 'sliders' });
  const chips = h('div', { class: 'chips' });
  const sum = () => Object.values(dr.emotions).reduce((a, b) => a + b, 0) || 1;
  const pctEls = {};
  const paintPcts = () => { for (const [eid, el] of Object.entries(pctEls)) if (dr.emotions[eid]) el.textContent = '%' + Math.round(dr.emotions[eid] / sum() * 100); };
  const paintSliders = () => {
    for (const k in pctEls) delete pctEls[k];
    const sel = Object.values(EMO).filter(e => dr.emotions[e.id] && !/^c-(yuz|emo)-/.test(e.id) && e.id !== 'c-onizleme');
    if (!sel.length) { sliders.replaceChildren(h('p', { class: 'muted' }, 'Yukarıdan en az bir duygu seç; sonra burada oranlarını ayarlarsın.')); return; }
    sliders.replaceChildren(...sel.map(e => {
      const pct = h('span', { class: 'pct' });
      pctEls[e.id] = pct;
      const input = h('input', { type: 'range', min: 1, max: 100, id: 'r-' + e.id, style: `color:${e.c}` });
      input.value = dr.emotions[e.id];
      input.addEventListener('input', () => { dr.emotions[e.id] = Number(input.value); paintPcts(); paintOrb(); });
      return h('div', { class: 'slider' }, h('label', { for: 'r-' + e.id }, e.label), input, pct);
    }));
    paintPcts();
  };
  const paintChips = () => chips.replaceChildren(...[...EMOTIONS, ...customOf(p).map(c => EMO[c.id]).filter(Boolean)].map(e => h('button', {
    type: 'button', class: 'chip' + (dr.emotions[e.id] ? ' on' : ''), 'aria-pressed': String(!!dr.emotions[e.id]),
    style: dr.emotions[e.id] ? `background:${e.c}33` : '',
    onClick: () => {
      if (dr.emotions[e.id]) delete dr.emotions[e.id]; else dr.emotions[e.id] = 30;
      paintChips(); paintSliders(); paintOrb();
    }
  }, art(e.id, 58, { className: dr.emotions[e.id] ? 'bob' : '' }), h('span', null, e.label))),
    h('button', { type: 'button', class: 'chip add-chip', onClick: () => emotionDialog(id => { dr.emotions[id] = 30; paintChips(); paintSliders(); paintOrb(); }) },
      h('span', { class: 'plus', 'aria-hidden': 'true' }, '+'), h('span', null, 'Yeni duygu')));
  const coreBtn = h('button', { type: 'button', class: 'btn core-toggle' });
  const paintCore = () => { coreBtn.classList.toggle('gold', dr.core); coreBtn.setAttribute('aria-pressed', String(dr.core)); coreBtn.textContent = dr.core ? 'Core Memory oldu' : 'Core Memory yap'; };
  coreBtn.addEventListener('click', () => { dr.core = !dr.core; paintCore(); paintOrb(); });
  paintOrb(); paintChips(); paintSliders(); paintCore();

  // --- sağ sayfa: fotoğraf, not ---
  const fileIn = h('input', { type: 'file', accept: 'image/*', class: 'sr-only', id: 'photo-in' });
  const photoBox = h('div', { class: 'photo-slot' });
  const paintPhoto = () => {
    if (dr.newPhoto || dr.photo) {
      const img = h('img', { alt: 'Günün fotoğrafı' });
      if (dr.newPhoto) img.src = dr.newPhoto.url;
      else S.store.photoURL(dr.photo).then(u => { img.src = u; }).catch(() => { img.alt = 'Fotoğraf yüklenemedi'; });
      photoBox.replaceChildren(h('figure', { class: 'polaroid' }, h('span', { class: 'tape', 'aria-hidden': 'true' }), img),
        h('div', { class: 'photo-actions' },
          h('label', { for: 'photo-in', class: 'linkbtn' }, 'Değiştir'),
          h('button', { type: 'button', class: 'linkbtn', onClick: () => {
            if (dr.newPhoto) { URL.revokeObjectURL(dr.newPhoto.url); dr.newPhoto = null; }
            if (dr.photo) { dr.removedPhoto = dr.photo; dr.photo = null; }
            paintPhoto();
          } }, 'Kaldır')));
    } else {
      photoBox.replaceChildren(h('label', { for: 'photo-in', class: 'polaroid add' },
        h('span', { class: 'add-inner' },
          h('svg', { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'aria-hidden': 'true' }, h('path', { d: 'M3 7h4l2-3h6l2 3h4v13H3z' }), h('circle', { cx: 12, cy: 13, r: 4 })),
          h('span', null, 'Fotoğraf ekle'))));
    }
  };
  fileIn.addEventListener('change', () => {
    const f = fileIn.files && fileIn.files[0];
    if (!f) return;
    if (dr.newPhoto) URL.revokeObjectURL(dr.newPhoto.url);
    dr.newPhoto = { file: f, url: URL.createObjectURL(f) };
    fileIn.value = '';
    paintPhoto();
  });
  paintPhoto();

  const caption = h('input', { type: 'text', class: 'caption', maxlength: 60, placeholder: 'fotoğrafın altına bir söz…', 'aria-label': 'Fotoğraf altı yazısı' });
  caption.value = dr.caption;
  caption.addEventListener('input', () => { dr.caption = caption.value; });
  const note = h('textarea', { id: 'note', class: 'lined', rows: 7, placeholder: 'Bugün neler oldu? Birkaç cümle yeter…' });
  note.value = dr.note;
  note.addEventListener('input', () => { dr.note = note.value; });

  const saveBtn = h('button', { type: 'button', class: 'btn big plum' }, 'Küreyi rafa koy');
  saveBtn.addEventListener('click', async () => {
    if (!Object.keys(dr.emotions).length) { toast('En az bir duygu seç.', 'warn'); return; }
    saveBtn.disabled = true; saveBtn.textContent = 'Rafa konuyor…';
    try {
      let photoPath = dr.photo;
      if (dr.newPhoto) {
        const blob = await shrinkPhoto(dr.newPhoto.file);
        photoPath = await S.store.uploadPhoto(p.id, date, blob);
        if (dr.photo) dr.removedPhoto = dr.photo;
      }
      await S.store.saveDay(p.id, date, {
        emotions: dr.emotions, note: dr.note.trim(), caption: dr.caption.trim(), core: dr.core, photo: photoPath || null
      });
      if (dr.removedPhoto && dr.removedPhoto !== photoPath) S.store.deletePhoto(dr.removedPhoto);
      S.drafts.delete(key);
      toast(dr.core ? 'Core memory parlıyor!' : 'Küre rafa kondu');
      viewDay(date);
    } catch (ex) {
      toast(ex.message, 'warn');
      saveBtn.disabled = false; saveBtn.textContent = 'Küreyi rafa koy';
    }
  });
  const clearBtn = saved ? h('button', { type: 'button', class: 'linkbtn danger', onClick: async () => {
    if (!confirm('Bu günün küresi, notu ve fotoğrafı silinsin mi?')) return;
    try {
      await S.store.saveDay(p.id, date, null);
      if (saved.photo) S.store.deletePhoto(saved.photo);
      S.drafts.delete(key);
      toast('Küre boşaltıldı');
      viewDay(date);
    } catch (ex) { toast(ex.message, 'warn'); }
  } }, 'Küreyi boşalt') : null;
  const exportBtn = dlButton('Günü indir', () => exportDialog({
    title: `${longDate(date)} · gün özeti`, size: 'A6 yatay · 148 × 105 mm (A5’in yarısı)', pdfFormat: 'a6l', filename: `ani-kuresi-${date}`,
    render: async (theme, scale) => {
      let photoSrc = null;
      if (dr.newPhoto) photoSrc = dr.newPhoto.url;
      else if (dr.photo) { try { photoSrc = await S.store.photoURL(dr.photo); } catch (er) { /* fotoğrafsız devam */ } }
      const entry = { emotions: dr.emotions, note: dr.note.trim(), caption: dr.caption.trim(), core: dr.core };
      return renderDay({ date, entry, profile: p, theme, photoSrc, scale });
    }
  }));

  const content = h('div', { class: 'stack' },
    h('div', { class: 'book' },
      h('section', { class: 'page left', 'data-season': season },
        h('div', { class: 'page-head' },
          h('div', null, h('span', { class: 'weekday' }, weekday), h('h1', null, longDate(date))),
          coreBadge),
        orbStand,
        h('h2', null, 'Bugün hangi duygular uğradı?'), chips,
        h('h2', null, 'Oranlar'), sliders,
        coreBtn
      ),
      h('section', { class: 'page right', 'data-season': season },
        fileIn, photoBox, caption,
        h('label', { for: 'note', class: 'h2' }, 'Günlük'), note,
        h('div', { class: 'save-row' }, saveBtn, h('div', { class: 'save-side' }, clearBtn))
      )
    )
  );
  shell(content, 'gun', season, [nav, exportBtn]);
}

// ---------- yönlendirme ----------

async function route() {
  if (!S.store) {
    const token = LS.get('token');
    if (!token) return viewLogin();
    S.store = new Store(new Repo(token, DATA_REPO));
    app.replaceChildren(h('div', { class: 'wrap center' }, loading()));
    try {
      await S.store.repo.check();
      await S.store.loadProfiles();
    } catch (ex) {
      S.store = null;
      return viewLogin(ex.message);
    }
  }
  registerCustom(S.store.profiles.flatMap(p => p.custom || []));
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!S.store.profiles.length || parts[0] === 'hesap-olustur') return viewProfileForm();
  if (!profile()) {
    if (S.store.profiles.length === 1) setProfile(S.store.profiles[0].id);
    else return viewWho();
  }
  if (S.mode === 'both' && S.store.profiles.length < 2) setMode('me');
  try {
    if (parts[0] === 'profil') return viewProfileForm({ editing: true });
    if (parts[0] === 'ay' && /^\d{4}-\d{2}$/.test(parts[1] || '')) return await viewMonth(parts[1]);
    if (parts[0] === 'gun' && /^\d{4}-\d{2}-\d{2}$/.test(parts[1] || '')) return await viewDay(parts[1]);
    if (parts[0] === 'yil' && /^\d{4}$/.test(parts[1] || '')) return await viewYear(Number(parts[1]));
    location.replace('#/yil/' + new Date().getFullYear());
  } catch (ex) {
    shell(h('div', { class: 'card center-card' }, art('sad', 64), h('p', null, ex.message), h('button', { class: 'btn', onClick: () => route() }, 'Tekrar dene')), '');
  }
}

window.addEventListener('hashchange', route);
// Hesap menüsü dışına tıklanınca kapansın
document.addEventListener('click', e => {
  const m = document.querySelector('details.menu[open]');
  if (m && !m.contains(e.target)) m.open = false;
});
document.body.prepend(sky());
const fav = document.querySelector('link[rel="icon"]');
if (fav) fav.href = artURL('joy');
route();
