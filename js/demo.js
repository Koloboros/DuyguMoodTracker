// "Dolu bir yıl" örneği: gerçek repoya hiç dokunmadan, bellekte üretilmiş bir yıl.
import { Store } from './data.js?v=202611031658';

export const DEMO_YEAR = 2025;

function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Mevsime göre hangi duyguların daha sık uğradığı
const SEASON_WEIGHTS = {
  winter: { joy: 3, calm: 3, longing: 3, tired: 3, sad: 2, love: 3, ennui: 2, hope: 2, anx: 1, 'c-kahve': 3 },
  spring: { joy: 4, hope: 4, excite: 3, love: 3, calm: 2, anx: 2, emb: 1, envy: 1, fear: 1, 'c-kahve': 1 },
  summer: { joy: 5, excite: 4, love: 3, calm: 3, tired: 1, anger: 1, disgust: 1, emb: 1, 'c-kahve': 1 },
  autumn: { calm: 3, longing: 3, joy: 3, anx: 3, tired: 2, sad: 2, hope: 2, ennui: 1, anger: 1, fear: 1, 'c-kahve': 3 }
};
const SEASONS = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];

const NOTES = [
  'Sabah kahvesi balkonda, kuş sesleriyle.', 'Uzun bir yürüyüş; yapraklar ayağımın altında hışırdadı.', 'Yağmur camlara vururken battaniyenin altında kitap okudum.',
  'Pazarda ilk çilekleri gördüm, eve bir kasa taşıdım.', 'Bugün her şey biraz ağır geldi. Erken yatacağım.', 'Eski bir arkadaştan beklenmedik bir mesaj geldi.',
  'Mutfakta yeni bir tarif denedim; yarısı yandı ama çok güldük.', 'İş yoğundu, akşam çay demleyip derin bir nefes aldım.', 'Gün batımı pembe ve turuncuydu, durup baktım.',
  'Sabah sisli, öğleden sonra güneşli. Tam bir sürpriz gün.', 'Bir şarkı tüm günü taşıdı.', 'Bahçede ilk tomurcuklar açmış!',
  'Kafam biraz dağınıktı, listeler yaptım.', 'Akşam yemeğinde uzun uzun sohbet ettik.', 'Kar yağdı! Pencereden izlemek bile yetti.',
  'Biraz özledim eski günleri.', 'Bugün kendimle gurur duydum.', 'Denize gitmeyi hayal ettim, yakında.',
  'Sakin, sessiz, iyi bir gün.', 'Yorgunum ama içim rahat.', 'Kalabalıktan biraz bunaldım.', 'Yeni bir deftere başladım.',
  'Parkta salıncakta sallandık, çocuk gibi.', 'Gece yıldızlar çok netti.', 'Bir hata yaptım, sonra düzelttim. Ders oldu.'
];
const CORES = {
  '01-01': ['Yeni yılın ilk sabahı, sıcak çikolata ve umut.', { joy: 50, hope: 50 }, 'Yeni yıl'],
  '02-14': ['Küçük bir sürpriz, kocaman bir gülümseme.', { love: 70, joy: 30 }, 'Kalpler'],
  '03-21': ['Baharın ilk günü; ağaçlar pembe pembe.', { hope: 50, joy: 30, calm: 20 }, 'İlk bahar'],
  '05-12': ['Piknik! Papatyalar, limonata, bol kahkaha.', { joy: 60, excite: 40 }, 'Piknik günü'],
  '06-28': ['Denize ilk giriş. Su buz gibi, an sıcacık.', { excite: 50, joy: 50 }, 'İlk deniz'],
  '08-09': ['Yıldız kaymasını izledik, dilek tuttuk.', { love: 40, hope: 40, calm: 20 }, 'Dilek gecesi'],
  '10-18': ['Ormanda mantar avı ve termosta çay.', { calm: 50, joy: 30, 'c-kahve': 20 }, 'Orman'],
  '11-23': ['Eski fotoğraflara baktık, saatlerce.', { longing: 50, love: 30, joy: 20 }, 'Albüm akşamı'],
  '12-31': ['Yılın son gecesi; mum ışığı ve teşekkürler.', { love: 40, calm: 30, hope: 30 }, 'Yılın sonu']
};

function pick(r, weights, exclude) {
  const entries = Object.entries(weights).filter(([k]) => !exclude.includes(k));
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let x = r() * total;
  for (const [k, w] of entries) { if ((x -= w) <= 0) return k; }
  return entries[0][0];
}

function generate() {
  const r = rng(20251101);
  const data = {};
  const pad = n => String(n).padStart(2, '0');
  for (let m = 1; m <= 12; m++) {
    const days = new Date(DEMO_YEAR, m, 0).getDate();
    const w = SEASON_WEIGHTS[SEASONS[m - 1]];
    for (let d = 1; d <= days; d++) {
      const date = `${DEMO_YEAR}-${pad(m)}-${pad(d)}`;
      const core = CORES[`${pad(m)}-${pad(d)}`];
      if (core) { data[date] = { emotions: core[1], note: core[0], caption: core[2], core: true, photo: 'demo:' + date }; continue; }
      const n = r() < .35 ? 1 : (r() < .75 ? 2 : 3);
      const emotions = {};
      for (let i = 0; i < n; i++) emotions[pick(r, w, Object.keys(emotions))] = 10 + Math.round(r() * 60);
      const e = { emotions, core: false };
      if (r() < .42) e.note = NOTES[Math.floor(r() * NOTES.length)];
      if (r() < .1) { e.photo = 'demo:' + date; e.caption = ['küçük mutluluklar', 'bugünden', 'unutmamak için', 'ışık', ''][Math.floor(r() * 5)]; }
      data[date] = e;
    }
  }
  return data;
}

// Basit "suluboya" manzaralar: fotoğraf yerine
const SKIES = {
  winter: ['#DCE8F5', '#F7F9FC', '#FFFFFF', ['#C9D9E8', '#E6EEF6', '#F7FAFD']],
  spring: ['#FBD3E1', '#E3F0FB', '#FFF6E4', ['#9CCB86', '#BFE0AA', '#D9EFC8']],
  summer: ['#9BD3F2', '#D9F0FB', '#FFF2C4', ['#6E9F5E', '#8DC27A', '#B3DB9C']],
  autumn: ['#F7C59F', '#FBE1C8', '#FFF1DE', ['#B8693E', '#D98A4E', '#E9B076']]
};
const paintCache = new Map();
function paint(date) {
  if (paintCache.has(date)) return paintCache.get(date);
  const r = rng(Number(date.replace(/-/g, '')));
  const season = SEASONS[Number(date.slice(5, 7)) - 1];
  const [top, mid, low, hills] = SKIES[season];
  const cv = document.createElement('canvas');
  cv.width = 640; cv.height = 480;
  const g = cv.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, top); sky.addColorStop(.6, mid); sky.addColorStop(1, low);
  g.fillStyle = sky; g.fillRect(0, 0, 640, 480);
  const sx = 120 + r() * 400, sy = 80 + r() * 90;
  const sun = g.createRadialGradient(sx, sy, 4, sx, sy, 90);
  sun.addColorStop(0, 'rgba(255,240,190,1)'); sun.addColorStop(.35, 'rgba(255,230,160,.8)'); sun.addColorStop(1, 'rgba(255,230,160,0)');
  g.fillStyle = sun; g.beginPath(); g.arc(sx, sy, 90, 0, Math.PI * 2); g.fill();
  hills.forEach((c, i) => {
    g.fillStyle = c; g.beginPath();
    const base = 300 + i * 50;
    g.moveTo(0, 480); g.lineTo(0, base);
    for (let x = 0; x <= 640; x += 40) g.lineTo(x, base - Math.sin((x / 640) * Math.PI * (1.2 + r()) + r() * 3) * (40 + r() * 30));
    g.lineTo(640, 480); g.closePath(); g.fill();
  });
  const dots = { winter: '#FFFFFF', spring: '#F7A8C4', summer: '#FFE08A', autumn: '#E2563F' }[season];
  for (let i = 0; i < 70; i++) {
    g.fillStyle = dots; g.globalAlpha = .5 + r() * .5;
    g.beginPath(); g.arc(r() * 640, season === 'winter' ? r() * 480 : 360 + r() * 120, 2 + r() * 4, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  const url = cv.toDataURL('image/jpeg', .85);
  paintCache.set(date, url);
  return url;
}

export class DemoStore extends Store {
  constructor(profile) {
    super(null);
    this.demo = true;
    this.profiles = [{
      ...profile,
      createdAt: `${DEMO_YEAR}-01-01T00:00:00Z`,
      custom: [...(profile.custom || []).filter(c => c.id !== 'c-kahve'), { id: 'c-kahve', label: 'Kahve keyfi', c: '#C98A5A', face: 'calm' }]
    }];
    this.data = generate();
  }
  async loadProfiles() { return this.profiles; }
  async addProfile({ name, animal }) { const p = { id: 'ornek-' + this.profiles.length, name, animal, createdAt: new Date().toISOString(), custom: [] }; this.profiles.push(p); return p; }
  async updateProfile(id, patch) { this.profiles = this.profiles.map(p => p.id === id ? { ...p, ...patch } : p); }
  async loadYear(pid, year, { force = false } = {}) {
    const key = pid + '|' + year;
    if (!force && this.years.has(key)) return this.years.get(key);
    const own = pid === this.profiles[0].id;
    const prefix = String(year);
    const out = own ? Object.fromEntries(Object.entries(this.data).filter(([d]) => d.startsWith(prefix))) : {};
    this.years.set(pid + '|' + year, out);
    return out;
  }
  async saveDay(pid, date, entry) {
    if (pid === this.profiles[0].id) { if (entry) this.data[date] = entry; else delete this.data[date]; }
    return this.loadYear(pid, date.slice(0, 4), { force: true });
  }
  async uploadPhoto(pid, date, blob) { const path = 'local:' + date + Date.now(); this.photos.set(path, URL.createObjectURL(blob)); return path; }
  async deletePhoto(path) { this.photos.delete(path); }
  async photoURL(path) {
    if (path.startsWith('demo:')) return paint(path.slice(5));
    return this.photos.get(path) || '';
  }
}
