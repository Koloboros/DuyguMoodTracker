import { EMOTIONS, EMO, ANIMALS, ANIMAL, SEASON_OF_MONTH, sprite, spriteURL } from './sprites.js';
import { Repo, Store, shrinkPhoto } from './data.js';

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

function orbCss(entry, size, mode) {
  let st = `width:${size}px;height:${size}px;`;
  const em = emoList(entry);
  if (!em.length) {
    st += 'background:radial-gradient(circle at 33% 27%, #fff 0, rgba(255,255,255,.7) 18%, rgba(255,255,255,0) 44%), #F3E9D6;';
    if (mode === 'today') st += 'border:2px dashed #D9A53A;';
    else if (mode === 'future') st += 'border:1.5px dashed #E2D2B4;opacity:.45;';
    else st += 'border:1.5px solid #E2D2B4;';
    return st;
  }
  const cols = em.map(([id]) => EMO[id].c);
  const sum = em.reduce((a, [, w]) => a + w, 0);
  let bg;
  if (cols.length === 1) bg = `radial-gradient(circle at 50% 62%, ${cols[0]}, ${cols[0]}E6 80%)`;
  else {
    let acc = 0;
    const stops = em.map(([id, w]) => { const span = w / sum * 100; const s = `${EMO[id].c} ${(acc + span / 2).toFixed(1)}%`; acc += span; return s; });
    const rot = entry.date ? (Number(entry.date.slice(-2)) * 47) % 360 : 30;
    bg = `conic-gradient(from ${rot}deg, ${cols[cols.length - 1]} 0%, ${stops.join(', ')}, ${cols[0]} 100%)`;
  }
  const m = cols[0];
  let shadow = `0 ${Math.round(size / 7)}px ${Math.round(size / 2.6)}px ${m}55, inset -${Math.max(2, Math.round(size / 9))}px -${Math.max(2, Math.round(size / 7))}px ${Math.round(size / 4)}px rgba(59,42,58,.22), inset ${Math.max(1, Math.round(size / 14))}px ${Math.max(1, Math.round(size / 12))}px ${Math.round(size / 5)}px rgba(255,255,255,.35)`;
  if (entry.core) shadow = `0 0 0 ${Math.max(2, Math.round(size / 22))}px #FFFBF2, 0 0 0 ${Math.max(3, Math.round(size / 11))}px #D9A53A, 0 0 ${Math.round(size / 2)}px rgba(217,165,58,.55), ${shadow}`;
  return st + `background:radial-gradient(circle at 32% 25%, #fff 0, rgba(255,255,255,.75) 9%, rgba(255,255,255,0) 30%), ${bg};box-shadow:${shadow};`;
}

function orb(entry, size, mode) {
  const el = h('span', { class: 'orb' + (mode === 'today' && !emoList(entry).length ? ' orb-today' : '') });
  el.style.cssText = orbCss(entry, size, mode);
  return el;
}

function emotionTotals(entries) {
  const t = Object.fromEntries(EMOTIONS.map(e => [e.id, 0]));
  let days = 0;
  for (const e of entries) {
    const em = emoList(e);
    const sum = em.reduce((a, [, w]) => a + w, 0);
    if (!sum) continue;
    days++;
    for (const [id, w] of em) t[id] += w / sum;
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
function setProfile(id) { S.profileId = id; LS.set('profile', id); }
function setMode(m) { S.mode = m; LS.set('mode', m); }

function vineStrip(season, cls = 'vine') {
  return h('div', { class: cls, 'aria-hidden': 'true', style: `background-image:url(${spriteURL('vine', { season, repeat: 1 }).url})` });
}

function shell(content, active) {
  const p = profile();
  const nav = h('nav', { class: 'tabs', 'aria-label': 'Görünüm' },
    h('a', { href: '#/yil/' + new Date().getFullYear(), class: 'pxbtn' + (active === 'yil' ? ' on' : '') }, 'Yıl'),
    h('a', { href: '#/ay/' + today().slice(0, 7), class: 'pxbtn' + (active === 'ay' ? ' on' : '') }, 'Ay'),
    h('a', { href: '#/gun/' + today(), class: 'pxbtn' + (active === 'gun' ? ' on' : '') }, 'Bugün')
  );
  const menu = h('details', { class: 'menu' },
    h('summary', { class: 'who', 'aria-label': 'Hesap menüsü' }, sprite(p.animal, 2), h('span', null, p.name),
      h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'aria-hidden': 'true' }, h('path', { d: 'M6 9l6 6 6-6' }))),
    h('div', { class: 'menu-pop' },
      h('span', { class: 'menu-label' }, 'Kim yazıyor?'),
      S.store.profiles.map(pr => h('button', {
        class: 'menu-item' + (pr.id === S.profileId ? ' on' : ''),
        onClick: () => { setProfile(pr.id); setMode('me'); route(); }
      }, sprite(pr.animal, 2), pr.name)),
      h('hr'),
      h('a', { class: 'menu-item', href: '#/profil' }, 'Avatarımı değiştir'),
      h('a', { class: 'menu-item', href: '#/hesap-olustur' }, 'Yeni hesap oluştur'),
      h('button', { class: 'menu-item', onClick: logout }, 'Bu cihazdan çık')
    )
  );

  const header = h('header', { class: 'top' },
    h('a', { href: '#/yil/' + new Date().getFullYear(), class: 'brand' },
      orb({ emotions: { joy: 1, emb: 1, sad: 1, disgust: 1 } }, 34), h('span', null, 'Anı Küreleri')),
    nav, menu);
  const season = SEASON_OF_MONTH[new Date().getMonth()];
  app.replaceChildren(vineStrip(season), h('div', { class: 'wrap' }, header, content));
}

function loading() {
  return h('div', { class: 'loading' }, sprite('joy', 3, { className: 'bob' }), h('span', null, 'Küreler raftan iniyor…'));
}

// ---------- giriş ve hesaplar ----------

function viewLogin(error) {
  const tokenIn = h('input', { id: 'tok', type: 'password', autocomplete: 'off', placeholder: 'github_pat_…', required: true });
  const repoIn = h('input', { id: 'repo', type: 'text', placeholder: 'kullanıcı/repo', required: true });
  repoIn.value = LS.get('repo') || 'koloboros/ani-kureleri-veri';
  const err = h('p', { class: 'err', role: 'alert' }, error || '');
  const btn = h('button', { class: 'pxbtn big gold', type: 'submit' }, 'Bahçeye gir');
  const form = h('form', { class: 'card login', onSubmit: async e => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Kapı açılıyor…'; err.textContent = '';
    const repo = new Repo(tokenIn.value.trim(), repoIn.value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, ''));
    try {
      await repo.check();
      LS.set('token', repo.token); LS.set('repo', repo.repo);
      S.store = new Store(repo);
      await S.store.loadProfiles();
      route();
    } catch (ex) {
      err.textContent = ex.message;
      btn.disabled = false; btn.textContent = 'Bahçeye gir';
    }
  } },
    h('div', { class: 'login-sprites', 'aria-hidden': 'true' }, ['joy', 'sad', 'anger', 'fear', 'disgust'].map((id, i) => sprite(id, 3, { className: 'bob d' + i }))),
    h('h1', null, 'Anı Küreleri'),
    h('p', { class: 'lead' }, 'Her gün bir küre, her küre bir anı. Devam etmek için anahtarını gir; bu cihaz seni hatırlar.'),
    h('label', { for: 'tok' }, 'Anahtar'), tokenIn,
    h('label', { for: 'repo' }, 'Veri reposu'), repoIn,
    err, btn,
    h('details', { class: 'help' }, h('summary', null, 'Anahtar nedir, nereden alınır?'),
      h('ol', null,
        h('li', null, 'GitHub’da gizli (private) bir veri reposu aç; örneğin ', h('code', null, 'ani-kureleri-veri'), '.'),
        h('li', null, 'Settings › Developer settings › Fine-grained tokens › Generate new token.'),
        h('li', null, 'Repository access: yalnızca o veri reposu. Permissions › Contents: Read and write.'),
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
  }, sprite(a.id, 5, { className: chosen === a.id ? 'bob' : '' }), h('span', null, a.label))));
  paint();
  const btn = h('button', { class: 'pxbtn big gold', type: 'submit' }, editing ? 'Kaydet' : 'Hesabı oluştur');
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
    h('h1', null, editing ? 'Avatarını değiştir' : (first ? 'Bahçene hoş geldin' : 'Yeni hesap')),
    h('p', { class: 'lead' }, editing ? 'İsmini ya da hayvanını değiştirebilirsin.' : 'Bir isim ve seni anlatan bir hayvan seç. Küreler bu hesapta birikecek.'),
    h('label', { for: 'pname' }, 'İsim'), nameIn,
    h('span', { class: 'label' }, 'Hayvanın'), grid,
    err, btn,
    (!first) ? h('a', { href: '#/yil/' + new Date().getFullYear(), class: 'quiet' }, 'Vazgeç') : null
  );
  if (first || !profile()) app.replaceChildren(vineStrip(SEASON_OF_MONTH[new Date().getMonth()]), h('div', { class: 'wrap center' }, form));
  else shell(h('div', { class: 'center' }, form), '');
}

function viewWho() {
  app.replaceChildren(vineStrip(SEASON_OF_MONTH[new Date().getMonth()]), h('div', { class: 'wrap center' },
    h('div', { class: 'card login wide' },
      h('h1', null, 'Kim yazıyor?'),
      h('div', { class: 'animals' }, S.store.profiles.map(p => h('button', {
        class: 'animal', onClick: () => { setProfile(p.id); route(); }
      }, sprite(p.animal, 5), h('span', null, p.name))))
    )));
}

// ---------- yıl ----------

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
  const startMonth = (p.createdAt || '').slice(0, 7);

  const months = MONTHS.map((name, mi) => {
    const mKey = `${year}-${pad(mi + 1)}`;
    const mEntries = entries.filter(e => e.date.startsWith(mKey));
    const season = SEASON_OF_MONTH[mi];
    const blank = !mEntries.length && mKey < startMonth;
    const days = [];
    if (!blank) for (let d = 1; d <= daysIn(year, mi + 1); d++) {
      const date = `${mKey}-${pad(d)}`;
      const e = data[date] ? { ...data[date], date } : null;
      days.push(h('span', { title: longDate(date) }, orb(e, 22, date === t ? 'today' : (date > t ? 'future' : 'empty'))));
    }
    return h('a', { href: '#/ay/' + mKey, class: 'month' + (blank ? ' blank' : '') },
      vineStrip(season, 'vine card-vine'),
      h('div', { class: 'month-head' },
        h('span', { class: 'badge', style: `background:${SEASON_TINT[season]}` }, sprite('m' + (mi + 1), 3)),
        h('span', { class: 'month-title' }, h('strong', null, name),
          h('small', null, mEntries.length ? `${mEntries.length} küre${mEntries.some(e => e.photo) ? ' · ' + mEntries.filter(e => e.photo).length + ' fotoğraf' : ''}` : (mKey === t.slice(0, 7) ? 'bu ay' : '')))),
      blank ? h('span', { class: 'unwritten' }, 'henüz yazılmamış sayfa') : h('div', { class: 'mini-grid' }, days)
    );
  });

  const { totals, days } = emotionTotals(entries);
  const top = EMOTIONS.filter(e => totals[e.id] > 0).sort((a, b) => totals[b.id] - totals[a.id]).slice(0, 5);
  const maxT = top.length ? totals[top[0].id] : 1;

  const isThisYear = String(year) === t.slice(0, 4);
  const content = h('div', { class: 'stack' },
    h('section', { class: 'hero' },
      h('div', { class: 'hero-text' },
        h('div', { class: 'year-switch' },
          h('a', { class: 'arrow', href: '#/yil/' + (year - 1), 'aria-label': 'Önceki yıl' }, '‹'),
          h('h1', null, String(year)),
          h('a', { class: 'arrow', href: '#/yil/' + (year + 1), 'aria-label': 'Sonraki yıl' }, '›')),
        h('p', { class: 'lead' }, entries.length
          ? [`${p.name}, bu yıl `, h('strong', null, `${entries.length} küre`), photos ? [', ', h('strong', null, `${photos} fotoğraf`)] : '', cores.length ? [' ve ', h('strong', null, `${cores.length} core memory`)] : '', ' biriktirdin.']
          : (isThisYear ? `Bahçen yeni filizlendi, ${p.name}. İlk küreni boyayınca raflar dolmaya başlayacak.` : 'Bu yılın sayfaları boş.'))),
      isThisYear ? h('a', { class: 'pxbtn big gold', href: '#/gun/' + t }, orb(data[t] ? { ...data[t], date: t } : null, 24, 'today'), data[t] ? 'Bugünün küresi' : 'Bugünün küresini boya') : null
    ),
    h('section', { class: 'months', 'aria-label': 'Aylar' }, months),
    h('div', { class: 'duo' },
      h('section', { class: 'card shelf-card' },
        h('div', { class: 'card-head' }, h('h2', null, 'Core Memories'), h('small', null, 'yılın en parlak günleri')),
        h('div', { class: 'core-row' }, cores.length
          ? cores.map((e, i) => h('a', { href: '#/gun/' + e.date, class: 'core' }, h('span', { class: 'bob', style: `animation-delay:${i * .4}s` }, orb(e, 72)), h('span', { class: 'hand' }, shortDate(e.date))))
          : [0, 1, 2].map(i => h('span', { class: 'core' }, h('span', { class: 'bob', style: `animation-delay:${i * .5}s` }, orb(null, 72, 'future')), h('span', { class: 'hand' }, 'sıradaki…')))),
        h('div', { class: 'shelf' })
      ),
      h('section', { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', null, 'Bu yılın cincikleri'), h('small', null, 'en sık uğrayanlar')),
        top.length ? h('div', { class: 'stats' }, top.map((e, i) => h('div', { class: 'stat' },
          h('span', { class: 'bob', style: `animation-delay:${i * .3}s` }, sprite(e.id, 3)),
          h('span', { class: 'stat-name' }, e.label),
          h('span', { class: 'bar' }, h('span', { style: `width:${Math.max(6, totals[e.id] / maxT * 100)}%;background:${e.c}` })),
          h('span', { class: 'stat-pct' }, '%' + Math.round(totals[e.id] / days * 100))
        ))) : h('p', { class: 'muted' }, 'Küreler biriktikçe hangi cinciklerin sana en çok uğradığını burada göreceksin.')
      )
    )
  );
  shell(content, 'yil');
}

// ---------- ay ----------

async function viewMonth(mKey) {
  const [year, month] = mKey.split('-').map(Number);
  const id = ++S.renderId;
  shell(loading(), 'ay');
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
  const top = EMOTIONS.filter(e => totals[e.id] > 0).sort((a, b) => totals[b.id] - totals[a.id]).slice(0, 4);
  const photoEntries = (both ? flat : mine).filter(e => e.photo).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const notes = (both ? flat : mine).filter(e => e.note).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  const toggle = multi ? h('div', { class: 'seg', role: 'group', 'aria-label': 'Kimin ayı' },
    S.store.profiles.map(pr => h('button', {
      class: !both && pr.id === S.profileId ? 'on' : '', 'aria-pressed': String(!both && pr.id === S.profileId),
      onClick: () => { setProfile(pr.id); setMode('me'); viewMonth(mKey); }
    }, sprite(pr.animal, 2), pr.name)),
    h('button', { class: both ? 'on' : '', 'aria-pressed': String(both), onClick: () => { setMode('both'); viewMonth(mKey); } }, 'Birlikte')
  ) : null;

  const polaroids = h('div', { class: 'polaroids' }, photoEntries.map((e, i) => {
    const img = h('img', { alt: shortDate(e.date) + ' fotoğrafı', loading: 'lazy' });
    S.store.photoURL(e.photo).then(u => { img.src = u; }).catch(() => { img.alt = 'yüklenemedi'; });
    return h('a', { href: '#/gun/' + e.date, class: 'polaroid small', style: `--r:${[-5, 3, -2, 4, -3, 2][i]}deg` }, img, h('span', { class: 'hand' }, shortDate(e.date)));
  }));

  const content = h('div', { class: 'stack' },
    h('section', { class: 'hero' },
      h('div', { class: 'month-hero' },
        h('span', { class: 'badge big', style: `background:${SEASON_TINT[season]}` }, sprite('m' + month, 6)),
        h('div', null,
          h('div', { class: 'year-switch' },
            h('a', { class: 'arrow', href: '#/ay/' + prevKey, 'aria-label': 'Önceki ay' }, '‹'),
            h('h1', null, `${MONTHS[mi]} ${year}`),
            h('a', { class: 'arrow', href: '#/ay/' + nextKey, 'aria-label': 'Sonraki ay' }, '›')),
          h('p', { class: 'muted' }, both ? `${flat.length} küre · ${people.map(p => p.name).join(' ve ')} yan yana`
            : `${mine.length} küre · ${mine.filter(e => e.photo).length} fotoğraf · ${mine.filter(e => e.core).length} core memory`))),
      h('span', { class: 'hand line' }, MONTH_LINES[mi])
    ),
    toggle,
    h('div', { class: 'month-layout' },
      h('section', { class: 'card calendar', 'aria-label': 'Takvim' },
        both ? h('div', { class: 'legend' }, people.map(p => h('span', null, sprite(p.animal, 2), p.name))) : null,
        h('div', { class: 'week' }, WEEK_SHORT.map(w => h('span', null, w))),
        h('div', { class: 'cells' + (both ? ' both' : '') }, cells)
      ),
      h('aside', { class: 'side' },
        h('section', { class: 'card' }, h('h2', null, 'Ayın cincikleri'),
          top.length ? h('div', { class: 'cinc4' }, top.map((e, i) => h('div', null,
            h('span', { class: 'bob', style: `animation-delay:${i * .3}s` }, sprite(e.id, 3)),
            h('strong', null, e.label), h('small', null, '%' + Math.round(totals[e.id] / days * 100)))))
            : h('p', { class: 'muted' }, 'Bu ay henüz küre yok.')),
        h('section', { class: 'card' }, h('h2', null, 'Ayın fotoğrafları'),
          photoEntries.length ? polaroids : h('p', { class: 'muted' }, 'Bir güne fotoğraf eklediğinde burada polaroid olarak görünecek.')),
        h('section', { class: 'card' }, h('h2', null, 'Son notlar'),
          notes.length ? notes.map(e => h('a', { href: '#/gun/' + e.date, class: 'note-snip' },
            h('span', { class: 'hand' }, `${shortDate(e.date)}${both ? ' · ' + profileById(e.pid).name : ''} — ${e.note.length > 120 ? e.note.slice(0, 120) + '…' : e.note}`)))
            : h('p', { class: 'muted' }, 'Notların burada kısa kısa görünecek.'))
      )
    )
  );
  shell(content, 'ay');
}

// ---------- gün ----------

async function viewDay(date) {
  const p = profile();
  const id = ++S.renderId;
  shell(loading(), 'gun');
  const year = Number(date.slice(0, 4));
  const data = await S.store.loadYear(p.id, year);
  if (id !== S.renderId) return;

  const t = today();
  const d = parseYmd(date);
  const weekday = WEEKDAYS[weekIdx(d)];
  const season = SEASON_OF_MONTH[d.getMonth()];
  const nav = h('div', { class: 'day-nav' },
    h('a', { href: '#/gun/' + addDays(date, -1) }, '‹ ' + shortDate(addDays(date, -1))),
    h('a', { href: '#/ay/' + date.slice(0, 7) }, MONTHS[d.getMonth()] + ' takvimi'),
    addDays(date, 1) <= t ? h('a', { href: '#/gun/' + addDays(date, 1) }, shortDate(addDays(date, 1)) + ' ›') : h('span'));

  if (date > t) {
    shell(h('div', { class: 'stack' }, h('section', { class: 'card future-card' },
      sprite('ennui', 5, { className: 'bob' }),
      h('h1', null, longDate(date)),
      h('p', { class: 'lead' }, 'Bu sayfa henüz yazılmadı. O gün geldiğinde küresini boyayabilirsin.'),
      h('a', { class: 'pxbtn gold', href: '#/gun/' + t }, 'Bugüne dön')), nav), 'gun');
    return;
  }

  const key = p.id + '|' + date;
  const saved = data[date] || null;
  if (!S.drafts.has(key)) S.drafts.set(key, {
    emotions: { ...(saved ? saved.emotions : {}) }, note: saved ? saved.note || '' : '', caption: saved ? saved.caption || '' : '',
    core: saved ? !!saved.core : false, photo: saved ? saved.photo || null : null, newPhoto: null, removedPhoto: null
  });
  const dr = S.drafts.get(key);

  // --- sol sayfa: küre, cincikler, oranlar ---
  const orbBox = h('div', { class: 'big-orb bob' });
  const coreBadge = h('span', { class: 'core-badge' }, 'Core Memory');
  const paintOrb = () => {
    orbBox.replaceChildren(orb({ emotions: dr.emotions, core: dr.core, date }, 210, 'today'));
    coreBadge.hidden = !dr.core;
  };
  const sliders = h('div', { class: 'sliders' });
  const chips = h('div', { class: 'chips' });
  const sum = () => Object.values(dr.emotions).reduce((a, b) => a + b, 0) || 1;
  const pctEls = {};
  const paintPcts = () => { for (const [eid, el] of Object.entries(pctEls)) if (dr.emotions[eid]) el.textContent = '%' + Math.round(dr.emotions[eid] / sum() * 100); };
  const paintSliders = () => {
    for (const k in pctEls) delete pctEls[k];
    const sel = EMOTIONS.filter(e => dr.emotions[e.id]);
    if (!sel.length) { sliders.replaceChildren(h('p', { class: 'muted' }, 'Yukarıdan en az bir cincik seç; sonra burada oranlarını ayarlarsın.')); return; }
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
  const paintChips = () => chips.replaceChildren(...EMOTIONS.map(e => h('button', {
    type: 'button', class: 'chip' + (dr.emotions[e.id] ? ' on' : ''), 'aria-pressed': String(!!dr.emotions[e.id]),
    style: dr.emotions[e.id] ? `background:${e.c}33` : '',
    onClick: () => {
      if (dr.emotions[e.id]) delete dr.emotions[e.id]; else dr.emotions[e.id] = 30;
      paintChips(); paintSliders(); paintOrb();
    }
  }, sprite(e.id, 2, { className: dr.emotions[e.id] ? 'bob' : '' }), h('span', null, e.label))));
  const coreBtn = h('button', { type: 'button', class: 'pxbtn core-toggle' });
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

  const saveBtn = h('button', { type: 'button', class: 'pxbtn big plum' }, 'Küreyi rafa koy');
  saveBtn.addEventListener('click', async () => {
    if (!Object.keys(dr.emotions).length) { toast('En az bir cincik seç.', 'warn'); return; }
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

  const content = h('div', { class: 'stack' },
    h('div', { class: 'book' },
      h('section', { class: 'page left' },
        vineStrip(season, 'vine page-vine'),
        h('div', { class: 'page-head' },
          h('div', null, h('span', { class: 'weekday' }, weekday), h('h1', null, longDate(date))),
          coreBadge),
        orbBox,
        h('h2', null, 'Bugün kimler uğradı?'), chips,
        h('h2', null, 'Oranlar'), sliders,
        coreBtn
      ),
      h('section', { class: 'page right' },
        h('span', { class: 'page-icon bob', 'aria-hidden': 'true' }, sprite('m' + (d.getMonth() + 1), 4)),
        fileIn, photoBox, caption,
        h('label', { for: 'note', class: 'h2' }, 'Günlük'), note,
        h('div', { class: 'save-row' }, saveBtn, clearBtn)
      )
    ),
    nav
  );
  shell(content, 'gun');
}

// ---------- yönlendirme ----------

async function route() {
  if (!S.store) {
    const token = LS.get('token'), repo = LS.get('repo');
    if (!token || !repo) return viewLogin();
    S.store = new Store(new Repo(token, repo));
    app.replaceChildren(h('div', { class: 'wrap center' }, loading()));
    try {
      await S.store.repo.check();
      await S.store.loadProfiles();
    } catch (ex) {
      S.store = null;
      return viewLogin(ex.message);
    }
  }
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
    shell(h('div', { class: 'card center-card' }, sprite('sad', 4), h('p', null, ex.message), h('button', { class: 'pxbtn', onClick: () => route() }, 'Tekrar dene')), '');
  }
}

window.addEventListener('hashchange', route);
// Hesap menüsü dışına tıklanınca kapansın
document.addEventListener('click', e => {
  const m = document.querySelector('details.menu[open]');
  if (m && !m.contains(e.target)) m.open = false;
});
const fav = document.querySelector('link[rel="icon"]');
if (fav) fav.href = spriteURL('joy').url;
route();
