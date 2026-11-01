// Pixel art: duygu cincikleri, hayvan avatarları, ay ikonları, sarmaşık.
// Her sprite bir harf ızgarası; harfler paletten renge çevrilip canvas'a çizilir.

const INK = '#3B2A3A';

const BASE = {
  o: INK, p: '#EFA3A9', w: '#FFFFFF', y: '#F7D774', f: '#F4A3B9', r: '#E2603F',
  d: '#7FA6D9', c: '#F2F5FA', g: '#7FB069', k: '#8A5A3B', b: '#9CC0E6',
  a: '#E89A5C', s: '#C46A2E', t: '#5E8F4E', n: '#BFDDF2', h: '#8BBF6A'
};

export const EMOTIONS = [
  { id: 'joy', label: 'Neşe', c: '#F2C14E', l: '#FBE3A1', s: '#D49A2A' },
  { id: 'sad', label: 'Hüzün', c: '#6C8EBF', l: '#A9C2E3', s: '#4C6C9C' },
  { id: 'anger', label: 'Öfke', c: '#D9654B', l: '#F0A08C', s: '#A9452F' },
  { id: 'fear', label: 'Korku', c: '#A88BC7', l: '#D3C2E6', s: '#7E64A0' },
  { id: 'disgust', label: 'Tiksinti', c: '#8DB580', l: '#C3DDB8', s: '#5F8A55' },
  { id: 'anx', label: 'Kaygı', c: '#F2A672', l: '#F9D2B3', s: '#C97A45' },
  { id: 'envy', label: 'Kıskançlık', c: '#4FA59A', l: '#94D1C8', s: '#357A70' },
  { id: 'emb', label: 'Utanç', c: '#E2919F', l: '#F2C3CB', s: '#B5687A' },
  { id: 'ennui', label: 'Can sıkıntısı', c: '#8A6A9E', l: '#BBA3C9', s: '#634A75' }
];
export const EMO = Object.fromEntries(EMOTIONS.map(e => [e.id, e]));

const BODY = [
  '......oooo......', '....ooBBBBoo....', '...oBLLBBBBBo...', '..oBLLLBBBBBBo..',
  '..oBLLBBBBBBBo..', '.oBBBBBBBBBBBBo.', '.oBBBBBBBBBBBBo.', '.oBBBBBBBBBBBBo.',
  '.oBBBBBBBBBBBBo.', '.oBBBBBBBBBBBSo.', '.oBBBBBBBBBBBSo.', '..oBBBBBBBBBSo..',
  '..oBBBBBBBBSSo..', '...oSBBBBBSSo...', '....ooSSSSoo....', '......oooo......'
];
const ACC = {
  joy: ['................', '...f...f...f....', '..fyf.fyf.fyf...', '...f.g.f.g.f....'],
  sad: ['......cccc......', '.....cccccc.....', '......d..d......', '.......d..d.....'],
  anger: ['......r..r......', '.....rr.rr......', '....ryr.ryr.....', '.....y...y......'],
  fear: ['................', '.o..........d...', 'o.o........ddd..', '.o.........ddd..'],
  disgust: ['........ggg.....', '.....gg.gg......', '....gg.k........', '.......k........'],
  anx: ['................', '....o.o.o.o.....', '.....o.o.o.o....', '................'],
  envy: ['...........y....', '..........yyy...', '...........y....', '................'],
  emb: ['......pp.pp.....', '......ppppp.....', '.......ppp......', '........p.......'],
  ennui: ['...........ooo..', '............o...', '...........ooo..', '................']
};
const E2 = [[6, 5], [7, 5], [6, 10], [7, 10]];
const BIG = [[6, 4], [6, 5], [7, 4], [7, 5], [6, 10], [6, 11], [7, 10], [7, 11]];
const FACE = {
  joy: { o: [...E2, [9, 5], [10, 6], [10, 7], [10, 8], [10, 9], [9, 10]], p: [[9, 3], [9, 12]] },
  sad: { o: [...E2, [10, 5], [9, 6], [9, 7], [9, 8], [9, 9], [10, 10]], d: [[8, 4], [9, 4]] },
  anger: { o: [...E2, [4, 4], [5, 5], [4, 11], [5, 10], [10, 5], [9, 6], [9, 7], [9, 8], [9, 9], [10, 10]] },
  fear: { o: [...BIG, [9, 7], [9, 8], [10, 6], [10, 9], [11, 7], [11, 8]], w: [[6, 4], [6, 10]] },
  disgust: { o: [[7, 4], [7, 5], [7, 6], [7, 9], [7, 10], [7, 11], [10, 5], [9, 6], [10, 7], [9, 8], [10, 9], [9, 10]] },
  anx: { o: [...BIG, [10, 5], [9, 6], [10, 7], [9, 8], [10, 9], [9, 10]], w: [[6, 4], [6, 10]] },
  envy: { o: [[6, 6], [7, 6], [6, 11], [7, 11], [10, 7], [10, 8], [10, 9], [9, 10]], p: [[9, 4]] },
  emb: { o: [[7, 4], [6, 5], [7, 6], [7, 9], [6, 10], [7, 11], [10, 7], [10, 8]], p: [[9, 3], [9, 4], [9, 11], [9, 12]] },
  ennui: { o: [[7, 4], [7, 5], [7, 6], [7, 9], [7, 10], [7, 11], [8, 5], [8, 10], [10, 6], [10, 7], [10, 8], [10, 9]] }
};

export const ANIMALS = [
  { id: 'cat', label: 'Kedi', pal: { B: '#B9AECB' }, rows: [
    '.oo..........oo.', '.opo........opo.', '.oppo......oppo.', '.oBBooooooooBBo.',
    '.oBBBBBBBBBBBBo.', 'oBBBBBBBBBBBBBBo', 'oBBowBBBBBBowBBo', 'oBBooBBBBBBooBBo',
    'oBBBBBBppBBBBBBo', 'oBpBBBoBBoBBBpBo', 'oBBBBBBooBBBBBBo', '.oBBBBBBBBBBBBo.',
    '..ooBBBBBBBBoo..', '....oooooooo....'] },
  { id: 'fox', label: 'Tilki', pal: { B: '#E8894A', L: '#FFF4E6' }, rows: [
    'oo............oo', 'oBo..........oBo', 'oBBo........oBBo', 'oBBBooooooooBBBo',
    '.oBBBBBBBBBBBBo.', 'oBBBBBBBBBBBBBBo', 'oBBowBBBBBBowBBo', 'oBBooBBBBBBooBBo',
    'oLLLLLLooLLLLLLo', '.oLLLLLLLLLLLLo.', '..oLLLLLLLLLLo..', '...oLLLLLLLLo...',
    '....ooLLLLoo....', '......oooo......'] },
  { id: 'rabbit', label: 'Tavşan', pal: { B: '#F4EFE9' }, rows: [
    '...oo......oo...', '..oBpo....opBo..', '..oBpo....opBo..', '..oBpo....opBo..',
    '..oBBooooooBBo..', '.oBBBBBBBBBBBBo.', 'oBBBBBBBBBBBBBBo', 'oBBowBBBBBBowBBo',
    'oBBooBBBBBBooBBo', 'oBpBBBBppBBBBpBo', 'oBBBBBBooBBBBBBo', '.oBBBBBBBBBBBBo.',
    '..ooBBBBBBBBoo..', '....oooooooo....'] },
  { id: 'owl', label: 'Baykuş', pal: { B: '#A07B5A', L: '#E8D3B5', s: '#7A5A40' }, rows: [
    '..o..........o..', '.oBo........oBo.', '.oBBooooooooBBo.', 'oBBBBBBBBBBBBBBo',
    'oBLLLLBBBBLLLLBo', 'oLLooLLBBLLooLLo', 'oLLowLLBBLLowLLo', 'oBLLLLByyBLLLLBo',
    'oBBBBBBBBBBBBBBo', 'oBBsBsBBBBsBsBBo', '.oBBsBBBBBBsBBo.', '.oBBBBBBBBBBBBo.',
    '..ooBBBBBBBBoo..', '....oooooooo....'] },
  { id: 'hedgehog', label: 'Kirpi', pal: { S: '#8A6A50', L: '#F0D9B8' }, rows: [
    '...o..o..o..o...', '..oSooSooSooSo..', '.oSSSSSSSSSSSSo.', 'oSSSSSSSSSSSSSSo',
    'oSSSSLLLLLLSSSSo', 'oSSSLLLLLLLLSSSo', 'oSSLLowLLowLLSSo', 'oSSLLooLLooLLSSo',
    'oSSLpLLLLLLpLSSo', 'oSSLLLLooLLLLSSo', '.oSLLLLLLLLLLSo.', '.oSSLLLLLLLLSSo.',
    '..ooSSSSSSSSoo..', '....oooooooo....'] }
];
export const ANIMAL = Object.fromEntries(ANIMALS.map(a => [a.id, a]));

const MONTH_ICONS = [
  ['....b....', '.b..b..b.', '..b.b.b..', '...bbb...', 'bbbbbbbbb', '...bbb...', '..b.b.b..', '.b..b..b.', '....b....'],
  ['.rr...rr.', 'rrrr.rrrr', 'rwrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'],
  ['.fff.....', 'ffyff....', '.fff..fff', '..k..ffyf', '..kk..fff', '...k..k..', '...kkkk..', '....k....', '....k....'],
  ['..r.r.r..', '..rrrrr..', '..rrrrr..', '...rrr...', '....g....', '.gg.g....', '..ggg.gg.', '....ggg..', '....g....'],
  ['...w.w...', '..wwwww..', '.wwyyyww.', '..wyyyw..', '.wwyyyww.', '..wwwww..', '...wgw...', '....g.gg.', '....gg...'],
  ['...g.g...', '..ggggg..', '.rrrrrrr.', '.rwrrrwr.', '.rrrrrrr.', '..rwrrr..', '..rrrrr..', '...rwr...', '....r....'],
  ['.........', 'grrrrrrrg', 'grkrrrkrg', '.grrrkrg.', '.grrrrrg.', '..ggggg..'],
  ['....a....', '..aaaaa..', '.aasasaa.', 'aasasasaa', 'aasasasaa', '.asasasa.', '..aaaaa..', '...aaa...', '....a....'],
  ['....k....', '....kgg..', '.rrr.rr..', 'rrrrrrrr.', 'rwrrrrrr.', 'rrrrrrrr.', 'rrrrrrrr.', '.rrrrrr..', '..rr.rr..'],
  ['...rrr...', '.rrwrrrr.', 'rrrrrrwrr', 'rwrrrrrrr', 'rrrrrrrrr', '...ccc...', '...ccc...', '...ccc...', '..ccccc..'],
  ['....g....', '....gg...', '.aaaaaaa.', 'aaasaasaa', 'aaasaasaa', 'aaasaasaa', 'aaasaasaa', '.aaaaaaa.'],
  ['....y....', '...yry...', '....y....', '...ccc...', '...ccc...', '...ccc...', '...ccc...', '...ccc...', '.kkkkkkk.']
];

export const SEASON_OF_MONTH = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
const SEASON = {
  winter: { f: '#D9654B', g: '#9DB8A0' }, spring: { f: '#F4A3B9', g: '#7FB069' },
  summer: { f: '#F7D774', g: '#5E8F4E' }, autumn: { f: '#E89A5C', g: '#C9803A' }
};
const VINE = ['..g.........', '.ggk....f...', '...kkk.fyf..', 'kkk...kkfk..', '.........kkk', '............'];

function emotionGrid(id) {
  const e = EMO[id];
  const grid = [...ACC[id], ...BODY].map(r => r.split(''));
  const face = FACE[id];
  for (const ch of Object.keys(face)) for (const [r, c] of face[ch]) grid[r + 4][c] = ch;
  return { grid, pal: { ...BASE, B: e.c, L: e.l, S: e.s } };
}

function resolve(name, opts) {
  if (EMO[name]) return emotionGrid(name);
  if (ANIMAL[name]) { const a = ANIMAL[name]; return { grid: a.rows.map(r => r.split('')), pal: { ...BASE, ...a.pal } }; }
  if (/^m\d+$/.test(name)) return { grid: MONTH_ICONS[Number(name.slice(1)) - 1].map(r => r.split('')), pal: BASE };
  if (name === 'vine') {
    const se = SEASON[opts.season] || SEASON.autumn;
    const n = opts.repeat || 8;
    return { grid: VINE.map(r => r.repeat(n).split('')), pal: { ...BASE, ...se } };
  }
  throw new Error('Bilinmeyen sprite: ' + name);
}

const cache = new Map();

// Sprite'ı 1 piksel = 1 hücre olarak çizer; büyütmeyi CSS (image-rendering: pixelated) yapar.
export function spriteURL(name, opts = {}) {
  const key = name + '|' + (opts.season || '') + '|' + (opts.repeat || '');
  if (cache.has(key)) return cache.get(key);
  const { grid, pal } = resolve(name, opts);
  const w = Math.max(...grid.map(r => r.length));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = grid.length;
  const ctx = cv.getContext('2d');
  grid.forEach((row, y) => row.forEach((ch, x) => {
    const c = pal[ch];
    if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
  }));
  const out = { url: cv.toDataURL('image/png'), w, h: grid.length };
  cache.set(key, out);
  return out;
}

export function sprite(name, scale = 3, opts = {}) {
  const s = spriteURL(name, opts);
  const img = document.createElement('img');
  img.src = s.url;
  img.width = s.w * scale;
  img.height = s.h * scale;
  img.alt = opts.alt || '';
  img.className = 'px' + (opts.className ? ' ' + opts.className : '');
  if (!opts.alt) img.setAttribute('aria-hidden', 'true');
  return img;
}
