// Masal kitabı tarzı çizimler: duygu karakterleri, hayvan avatarları, ay ikonları,
// mevsimlik sarmaşık süsleri ve simler. Hepsi elle yazılmış SVG.

export const EMOTIONS = [
  { id: 'joy', label: 'Neşe', c: '#F2C14E', l: '#FFF0B8', s: '#D99A2B' },
  { id: 'sad', label: 'Hüzün', c: '#6C8EBF', l: '#C6D8F0', s: '#4A6A9A' },
  { id: 'anger', label: 'Öfke', c: '#D9654B', l: '#F8B8A6', s: '#A8432D' },
  { id: 'fear', label: 'Korku', c: '#A88BC7', l: '#E2D5F2', s: '#7A5E9E' },
  { id: 'disgust', label: 'Tiksinti', c: '#8DB580', l: '#D3EBC8', s: '#5C8752' },
  { id: 'anx', label: 'Kaygı', c: '#F2A672', l: '#FCDCC4', s: '#C77840' },
  { id: 'envy', label: 'Kıskançlık', c: '#4FA59A', l: '#A8DDD5', s: '#33786F' },
  { id: 'emb', label: 'Utanç', c: '#E2919F', l: '#F8D0D7', s: '#B4657A' },
  { id: 'ennui', label: 'Can sıkıntısı', c: '#8A6A9E', l: '#CDB9DA', s: '#5F4672' },
  { id: 'love', label: 'Sevgi', c: '#D9577A', l: '#F9C4D2', s: '#A93A5C' },
  { id: 'calm', label: 'Huzur', c: '#7FCFB8', l: '#D5F2E8', s: '#4E9F88' },
  { id: 'hope', label: 'Umut', c: '#8EC9F0', l: '#DDF0FC', s: '#5A9BC8' },
  { id: 'excite', label: 'Heyecan', c: '#FF8A5B', l: '#FFD3BE', s: '#D9603A' },
  { id: 'longing', label: 'Özlem', c: '#9AA3D9', l: '#DDE1F6', s: '#6D76AE' },
  { id: 'tired', label: 'Yorgunluk', c: '#A89BA6', l: '#E4DDE2', s: '#7D6F7B' }
];
export const EMO = Object.fromEntries(EMOTIONS.map(e => [e.id, e]));

// Kullanıcının eklediği duygular (profiles.json'da saklanır) EMO'ya kaydedilir.
// Kendi duygun için yeni çizili yüzler (hazır duygularda olmayanlar)
export const EXTRA_FACES = [
  { id: 'duygulanma', label: 'Duygulanma' }, { id: 'rahatlama', label: 'Rahatlama' }, { id: 'sefkat', label: 'Şefkat' },
  { id: 'kutlama', label: 'Kutlama' }, { id: 'ozguven', label: 'Özgüven' }, { id: 'merak', label: 'Merak' },
  { id: 'saskinlik', label: 'Şaşkınlık' }, { id: 'hirs', label: 'Hırs' }, { id: 'kirginlik', label: 'Kırgınlık' },
  { id: 'gerginlik', label: 'Gerginlik' }, { id: 'bunalma', label: 'Bunalma' }, { id: 'sersemlik', label: 'Sersemlik' },
  { id: 'hastalik', label: 'Hastalık' }, { id: 'sukran', label: 'Şükran' }, { id: 'cilginlik', label: 'Çılgınlık' }
];

export const CUSTOM_FACES = [
  { id: 'joy', label: 'Gülümseyen' }, { id: 'calm', label: 'Sakin' }, { id: 'love', label: 'Âşık' },
  { id: 'excite', label: 'Coşkulu' }, { id: 'hope', label: 'Umutlu' }, { id: 'sad', label: 'Hüzünlü' },
  { id: 'fear', label: 'Şaşkın' }, { id: 'anger', label: 'Kızgın' }, { id: 'envy', label: 'Düşünceli' }, { id: 'tired', label: 'Uykulu' }
];
export const SWATCHES = ['#F2C14E', '#FF8A5B', '#D9577A', '#E2919F', '#C98A5A', '#8DB580', '#7FCFB8', '#4FA59A', '#8EC9F0', '#6C8EBF', '#9AA3D9', '#A88BC7', '#8A6A9E', '#A89BA6'];

function mix(hex, target, t) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(target.slice(1), 16);
  const ch = sh => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t);
  return '#' + [16, 8, 0].map(sh => ch(sh).toString(16).padStart(2, '0')).join('');
}

export function registerCustom(list) {
  for (const k of Object.keys(EMO)) if (EMO[k].custom) delete EMO[k];
  for (const c of list || []) {
    if (!c || !c.id || !/^#[0-9a-f]{6}$/i.test(c.c || '')) continue;
    EMO[c.id] = { id: c.id, label: c.label, c: c.c, l: mix(c.c, '#FFFFFF', .62), s: mix(c.c, '#2E1D3A', .25), face: c.face || 'joy', custom: true };
  }
}

export const ANIMALS = [
  { id: 'cat', label: 'Kedi' }, { id: 'fox', label: 'Tilki' }, { id: 'rabbit', label: 'Tavşan' },
  { id: 'owl', label: 'Baykuş' }, { id: 'hedgehog', label: 'Kirpi' }
];
export const ANIMAL = Object.fromEntries(ANIMALS.map(a => [a.id, a]));

export const SEASON_OF_MONTH = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];

const INK = '#2E1D3A';
let n = 0;
const uid = () => 'a' + (++n).toString(36);

// ---------- ortak parçalar ----------

function eye(x, y, kind = 'normal', body = '#fff') {
  switch (kind) {
    case 'big':
      return `<ellipse cx="${x}" cy="${y}" rx="9" ry="10.5" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="${x}" cy="${y + 1.5}" r="5.6" fill="${INK}"/><circle cx="${x - 2}" cy="${y - 1}" r="2.2" fill="#fff"/>`;
    case 'closed':
      return `<path d="M${x - 6.5} ${y + 1} Q${x} ${y - 6} ${x + 6.5} ${y + 1}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 'lid':
      return `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="8" fill="${INK}"/><circle cx="${x - 2}" cy="${y + 2}" r="2" fill="#fff"/>
        <path d="M${x - 9} ${y - 10} H${x + 9} V${y} H${x - 9}Z" fill="${body}"/>
        <path d="M${x - 7.5} ${y} H${x + 7.5}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'side':
      return `<ellipse cx="${x}" cy="${y}" rx="7" ry="8.5" fill="#fff" stroke="${INK}" stroke-width="1.4"/>
        <ellipse cx="${x + 3}" cy="${y + 1}" rx="4" ry="5.5" fill="${INK}"/><circle cx="${x + 2}" cy="${y - 1.5}" r="1.6" fill="#fff"/>`;
    default:
      return `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="8" fill="${INK}"/>
        <circle cx="${x - 2.2}" cy="${y - 3.4}" r="2.7" fill="#fff"/><circle cx="${x + 2}" cy="${y + 3}" r="1.25" fill="#fff"/>`;
  }
}
const blush = (o = .55, rx = 6) => `<ellipse cx="30" cy="72" rx="${rx}" ry="3.6" fill="#FF8FA3" opacity="${o}"/><ellipse cx="70" cy="72" rx="${rx}" ry="3.6" fill="#FF8FA3" opacity="${o}"/>`;
const stroke = (d, w = 3) => `<path d="${d}" stroke="${INK}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

function flower(cx, cy, r, petal, center) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 - 90) * Math.PI / 180;
    s += `<circle cx="${(cx + Math.cos(a) * r * .85).toFixed(1)}" cy="${(cy + Math.sin(a) * r * .85).toFixed(1)}" r="${(r * .62).toFixed(1)}" fill="${petal}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${(r * .48).toFixed(1)}" fill="${center}"/>`;
}
const star = (cx, cy, r, fill) => `<path d="M${cx} ${cy - r}C${cx + r * .15} ${cy - r * .15} ${cx + r * .15} ${cy - r * .15} ${cx + r} ${cy}C${cx + r * .15} ${cy + r * .15} ${cx + r * .15} ${cy + r * .15} ${cx} ${cy + r}C${cx - r * .15} ${cy + r * .15} ${cx - r * .15} ${cy + r * .15} ${cx - r} ${cy}C${cx - r * .15} ${cy - r * .15} ${cx - r * .15} ${cy - r * .15} ${cx} ${cy - r}Z" fill="${fill}"/>`;
const heart = (cx, cy, s, fill) => `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0 6C-6 2-8-2-6-5-4.5-7.5-1.5-7.5 0-5 1.5-7.5 4.5-7.5 6-5 8-2 6 2 0 6Z" fill="${fill}"/>`;

// ---------- duygu karakterleri ----------

const FACES = {
  joy: () => eye(38, 60) + eye(62, 60) + `<path d="M39 72 Q50 87 61 72 Q50 77 39 72Z" fill="#7A2E3A"/>` + blush(),
  sad: () => eye(38, 61) + eye(62, 61) + stroke('M29 50 L43 46') + stroke('M57 46 L71 50') + stroke('M42 80 Q50 73 58 80') +
    `<path d="M31 70 C29 74 29 77 31.5 78 C34 77 34 74 31 70Z" fill="#8DB4E2"/>`,
  anger: () => `<ellipse cx="38" cy="62" rx="6" ry="6.5" fill="${INK}"/><ellipse cx="62" cy="62" rx="6" ry="6.5" fill="${INK}"/><circle cx="36" cy="60" r="2" fill="#fff"/><circle cx="60" cy="60" r="2" fill="#fff"/>` +
    stroke('M28 47 L45 54', 3.6) + stroke('M72 47 L55 54', 3.6) + stroke('M41 80 Q50 73 59 80'),
  fear: () => eye(37, 59, 'big') + eye(63, 59, 'big') + stroke('M28 44 Q36 39 44 44', 2.6) + stroke('M56 44 Q64 39 72 44', 2.6) +
    `<ellipse cx="50" cy="79" rx="4.5" ry="5.5" fill="#7A2E3A"/>`,
  disgust: body => eye(38, 61, 'lid', body) + eye(62, 61, 'lid', body) + stroke('M40 79 Q45 74 50 79 T60 79') + stroke('M30 51 L44 53', 2.6) + stroke('M56 52 L70 49', 2.6),
  anx: () => eye(37, 59, 'big') + eye(63, 59, 'big') + stroke('M40 80 Q43.5 76 47 80 T54 80 T61 80', 2.6) +
    `<path d="M77 44 C74 49 74 52 77 53 C80 52 80 49 77 44Z" fill="#8DB4E2"/>`,
  envy: () => eye(38, 60, 'side') + eye(62, 60, 'side') + stroke('M43 77 Q53 82 60 74') + stroke('M30 49 L43 51', 2.6) + stroke('M57 51 L70 48', 2.6),
  emb: () => eye(38, 61, 'closed') + eye(62, 61, 'closed') + blush(.8, 8) + stroke('M45 76 Q50 80 55 76', 2.6),
  ennui: body => eye(38, 61, 'lid', body) + eye(62, 61, 'lid', body) + stroke('M43 78 L57 78'),
  love: () => heart(38, 60, 1.35, '#C2264E') + heart(62, 60, 1.35, '#C2264E') + `<circle cx="35.5" cy="56" r="1.6" fill="#fff"/><circle cx="59.5" cy="56" r="1.6" fill="#fff"/>` +
    `<path d="M40 72 Q50 85 60 72 Q50 77 40 72Z" fill="#7A2E3A"/>` + blush(.6),
  calm: () => stroke('M32 60 Q38 65 44 60', 2.8) + stroke('M56 60 Q62 65 68 60', 2.8) + stroke('M44 75 Q50 80 56 75', 2.6) + blush(.45),
  hope: () => `<ellipse cx="38" cy="59" rx="6.5" ry="8" fill="${INK}"/><ellipse cx="62" cy="59" rx="6.5" ry="8" fill="${INK}"/>
    <circle cx="36" cy="55" r="3" fill="#fff"/><circle cx="60" cy="55" r="3" fill="#fff"/><circle cx="40" cy="56" r="1.2" fill="#fff"/><circle cx="64" cy="56" r="1.2" fill="#fff"/>` +
    stroke('M43 75 Q50 81 57 75', 2.6) + blush(.4),
  excite: () => star(38, 60, 8, INK) + star(62, 60, 8, INK) + `<circle cx="36.5" cy="58" r="1.5" fill="#fff"/><circle cx="60.5" cy="58" r="1.5" fill="#fff"/>` +
    `<path d="M38 71 Q50 91 62 71Z" fill="#7A2E3A"/><ellipse cx="50" cy="80" rx="6" ry="3.6" fill="#F28CA8"/>` + blush(.55),
  longing: () => `<ellipse cx="38" cy="61" rx="6" ry="7.5" fill="${INK}"/><ellipse cx="62" cy="61" rx="6" ry="7.5" fill="${INK}"/><circle cx="36" cy="57.5" r="2.5" fill="#fff"/><circle cx="60" cy="57.5" r="2.5" fill="#fff"/>` +
    stroke('M30 50 L43 48', 2.4) + stroke('M57 48 L70 50', 2.4) + stroke('M44 77 Q50 80 56 77', 2.4) + `<path d="M68 69 C66 73 66 76 68.5 77 C71 76 71 73 68 69Z" fill="#8DB4E2"/>`,
  tired: body => eye(38, 61, 'lid', body) + eye(62, 61, 'lid', body) + stroke('M32 68 Q38 71 44 68', 1.6) + stroke('M56 68 Q62 71 68 68', 1.6) + `<ellipse cx="50" cy="79" rx="3.6" ry="4.6" fill="#7A2E3A"/>`
};

const ACC = {
  joy: () => `<ellipse cx="43" cy="31" rx="4.5" ry="2.2" fill="#8DC27A" transform="rotate(-25 43 31)"/><ellipse cx="57" cy="31" rx="4.5" ry="2.2" fill="#8DC27A" transform="rotate(25 57 31)"/>` +
    flower(34, 32, 5.5, '#F7A8C4', '#FFD25E') + flower(50, 27, 6.5, '#FFE08A', '#F28CA8') + flower(66, 32, 5.5, '#C6B4F0', '#FFD25E'),
  sad: () => `<g opacity=".95"><circle cx="64" cy="16" r="7" fill="#F2F6FC"/><circle cx="72" cy="12" r="8.5" fill="#F2F6FC"/><circle cx="80" cy="17" r="6" fill="#F2F6FC"/><rect x="60" y="16" width="24" height="7" rx="3.5" fill="#F2F6FC"/></g>
    <path d="M67 27 C65 30 65 32 67 33 C69 32 69 30 67 27Z" fill="#8DB4E2"/><path d="M76 29 C74 32 74 34 76 35 C78 34 78 32 76 29Z" fill="#8DB4E2"/>`,
  anger: () => `<path d="M41 32 C36 24 43 19 41 9 C49 15 52 23 47 32Z" fill="#FF8A4C"/><path d="M43 31 C41 26 45 23 44 17 C48 21 49 26 46 31Z" fill="#FFD25E"/>
    <path d="M59 32 C64 24 57 19 59 9 C51 15 48 23 53 32Z" fill="#FF8A4C"/><path d="M57 31 C59 26 55 23 56 17 C52 21 51 26 54 31Z" fill="#FFD25E"/>`,
  fear: () => stroke('M12 55 q-4 6 0 12', 2.4) + stroke('M7 52 q-5 9 0 18', 2.4) + stroke('M88 55 q4 6 0 12', 2.4) + stroke('M93 52 q5 9 0 18', 2.4),
  disgust: () => `<path d="M50 31 C50 25 51 20 54 15" stroke="#6E9F5E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="45" cy="19" rx="7" ry="3.6" fill="#8FC27A" transform="rotate(25 45 19)"/><ellipse cx="60" cy="14" rx="7" ry="3.6" fill="#A9D68F" transform="rotate(-25 60 14)"/>`,
  anx: () => `<path d="M50 24 m-7 0 a7 7 0 1 1 7 7 a3.5 3.5 0 1 1 -3.5 -3.5" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` + stroke('M34 18 l-4 -4', 2.2) + stroke('M66 18 l4 -4', 2.2),
  envy: () => star(72, 21, 8, '#FFE08A') + star(82, 32, 4, '#FFF4C2'),
  emb: () => heart(70, 22, 1.4, '#FF8FAE') + heart(80, 12, .8, '#FFC2D2'),
  ennui: () => stroke('M64 16 h9 l-9 10 h9', 2.4) + stroke('M77 5 h6 l-6 7 h6', 2),
  love: () => heart(68, 20, 1.4, '#FF7A9A') + heart(80, 32, .8, '#FFB3C6') + heart(30, 20, 1, '#FF9DB5'),
  calm: () => `<path d="M72 6 a12 12 0 1 0 9 20 a9.5 9.5 0 1 1 -9 -20z" fill="#FFE9A8"/>` + star(58, 12, 3.5, '#FFF4C2') + `<ellipse cx="38" cy="28" rx="7" ry="3.2" fill="#A9D68F" transform="rotate(-30 38 28)"/>`,
  hope: () => `<path d="M30 33 A20 20 0 0 1 70 33" stroke="#F7A8C4" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M35 33 A15 15 0 0 1 65 33" stroke="#FFE08A" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 33 A10 10 0 0 1 60 33" stroke="#A8D8F0" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  excite: () => `<rect x="24" y="18" width="5" height="3" rx="1" fill="#FFD25E" transform="rotate(30 26 19)"/><rect x="70" y="14" width="5" height="3" rx="1" fill="#7FCFB8" transform="rotate(-20 72 15)"/><rect x="40" y="10" width="4" height="3" rx="1" fill="#F28CA8" transform="rotate(50 42 11)"/><rect x="60" y="24" width="4" height="3" rx="1" fill="#A8D8F0" transform="rotate(10 62 25)"/>` + star(52, 18, 6, '#FFE08A') + star(80, 30, 3.5, '#FFF4C2'),
  longing: () => `<path transform="translate(66 8) rotate(30)" d="M6 0 C11 5 11 13 6 18 C1 13 1 5 6 0Z" fill="#F7B8C8"/><path transform="translate(26 18) rotate(-40)" d="M5 0 C9 4 9 10 5 14 C1 10 1 4 5 0Z" fill="#DDE1F6"/>`,
  tired: () => `<path d="M30 38 C34 26 48 18 62 16 C70 15 76 20 80 12 C79 24 72 34 70 37 Z" fill="#8E9AD6"/><path d="M33 34 C40 30 56 28 69 33" stroke="#C6CCF0" stroke-width="3" fill="none"/><circle cx="81" cy="10" r="4.6" fill="#F4F0FF"/>`
};

// ---------- yeni yüzler: [yüz(e), aksesuar(e)] ----------

const drop = (x, y, sc = 1, c = '#8DB4E2') => `<path transform="translate(${x} ${y}) scale(${sc})" d="M0 0 C-2.5 4 -2.5 7 0 8 C2.5 7 2.5 4 0 0Z" fill="${c}"/>`;
const spiral = (x, y) => `<path d="M${x} ${y} m-1 0 a1 1 0 1 1 2 0 a2.5 2.5 0 1 1 -5 0 a4 4 0 1 1 8 0 a5.5 5.5 0 1 1 -11 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const shine = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;

const XFACES = {
  duygulanma: [
    () => eye(38, 60, 'big') + eye(62, 60, 'big') + shine(40, 64, 1.6) + shine(64, 64, 1.6) + drop(31, 66) + drop(69, 66) + stroke('M41 77 Q45.5 81 50 78 Q54.5 81 59 77', 2.6) + blush(.5),
    () => heart(70, 22, 1.1, '#FF9DB5') + star(30, 24, 4, '#FFF4C2')],
  rahatlama: [
    () => stroke('M31 59 Q38 64 45 59', 2.8) + stroke('M55 59 Q62 64 69 59', 2.8) + stroke('M43 76 Q50 81 57 76', 2.6) + blush(.5),
    () => `<g fill="#F2F6FC" opacity=".85"><circle cx="81" cy="77" r="4"/><circle cx="87" cy="72" r="3"/><circle cx="91" cy="67" r="2"/></g>` + star(28, 24, 4, '#FFF4C2')],
  sefkat: [
    e => eye(38, 60, 'closed') + eye(62, 60, 'closed') + `<path d="M42 72 Q50 82 58 72 Q50 76 42 72Z" fill="#7A2E3A"/>` + blush(.6) +
      heart(50, 87, 1.5, '#FF6F91') + `<ellipse cx="35" cy="88" rx="9" ry="5.5" fill="${e.s}" transform="rotate(25 35 88)"/><ellipse cx="65" cy="88" rx="9" ry="5.5" fill="${e.s}" transform="rotate(-25 65 88)"/>`,
    () => heart(72, 22, .9, '#FFB3C6') + heart(28, 26, .7, '#FFB3C6')],
  kutlama: [
    () => stroke('M32 61 L38 56 L44 61', 2.8) + stroke('M56 61 L62 56 L68 61', 2.8) + `<path d="M39 70 Q50 88 61 70Z" fill="#7A2E3A"/><ellipse cx="50" cy="79" rx="5" ry="3" fill="#F28CA8"/>` + blush(.55),
    () => `<path d="M38 36 L50 4 L62 34Z" fill="#7FCFB8"/><path d="M42 26 L58 25 M45 17 L55 17" stroke="#FFE08A" stroke-width="3"/><circle cx="50" cy="4" r="4" fill="#FF8FB1"/>` +
      `<rect x="20" y="20" width="5" height="3" rx="1" fill="#FFD25E" transform="rotate(30 22 21)"/><rect x="76" y="16" width="5" height="3" rx="1" fill="#A8D8F0" transform="rotate(-25 78 17)"/><rect x="80" y="34" width="4" height="3" rx="1" fill="#FF8FB1" transform="rotate(50 82 35)"/><rect x="16" y="38" width="4" height="3" rx="1" fill="#C6B4F0" transform="rotate(10 18 39)"/>`],
  ozguven: [
    () => `<path d="M26 54 H47 Q48 66 38 67 Q28 67 26 54Z M53 54 H74 Q72 67 62 67 Q52 66 53 54Z" fill="${INK}"/><path d="M47 56 H53" stroke="${INK}" stroke-width="3"/>` +
      `<path d="M30 57 L36 57" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M57 57 L63 57" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>` + stroke('M42 78 Q52 81 60 73', 2.8),
    () => star(74, 20, 7, '#FFE08A') + star(84, 32, 3.5, '#FFF4C2')],
  merak: [
    () => eye(38, 61) + eye(62, 59, 'big') + stroke('M30 50 L45 50', 2.6) + stroke('M53 46 Q62 40 71 46', 2.6) + `<ellipse cx="54" cy="78" rx="3.5" ry="3" fill="#7A2E3A"/>`,
    () => `<path d="M68 10 Q72 4 78 6 Q84 9 80 15 Q76 19 76 24" stroke="#FFE08A" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="76" cy="31" r="2.4" fill="#FFE08A"/>`],
  saskinlik: [
    () => eye(37, 59, 'big') + eye(63, 59, 'big') + stroke('M28 45 Q36 40 44 45', 2.4) + stroke('M56 45 Q64 40 72 45', 2.4) + `<ellipse cx="50" cy="80" rx="6" ry="7" fill="#7A2E3A"/>`,
    () => star(50, 16, 10, '#FFD25E') + star(34, 24, 6, '#FF9F6B') + star(66, 22, 6, '#FF9F6B') + star(50, 30, 3, '#FFF4C2')],
  hirs: [
    () => eye(38, 62) + eye(62, 62) + stroke('M28 49 L45 55', 3.6) + stroke('M72 49 L55 55', 3.6) + `<rect x="41" y="74" width="18" height="7" rx="3" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M47 74 V81 M53 74 V81" stroke="${INK}" stroke-width="1.4"/>`,
    () => `<g fill="#F2F6FC" opacity=".9"><circle cx="18" cy="44" r="4"/><circle cx="13" cy="38" r="3"/><circle cx="82" cy="44" r="4"/><circle cx="87" cy="38" r="3"/></g>`],
  kirginlik: [
    () => eye(37, 61, 'big') + eye(63, 61, 'big') + shine(39, 65, 2) + shine(65, 65, 2) + stroke('M28 49 L43 45', 2.4) + stroke('M57 45 L72 49', 2.4) + stroke('M44 80 Q50 76 56 80', 2.6),
    () => drop(72, 22, 1.2) + star(28, 24, 3.5, '#DDE1F6')],
  gerginlik: [
    () => eye(38, 60, 'big') + eye(62, 60, 'big') + `<rect x="36" y="72" width="28" height="10" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M36 77 H64 M43 72 V82 M50 72 V82 M57 72 V82" stroke="${INK}" stroke-width="1.3"/>`,
    () => drop(76, 30, 1.4) + drop(24, 36, .9)],
  bunalma: [
    e => eye(38, 61, 'lid', e.c) + eye(62, 61, 'lid', e.c) + stroke('M40 77 Q45 73 50 77 T60 77', 2.6) +
      `<path d="M30 90 Q31 100 34 99 Q37 98 36 90Z M46 96 Q47 106 50 105 Q53 104 52 96Z M62 92 Q63 101 66 100 Q69 99 68 92Z" fill="${e.c}"/>`,
    () => drop(76, 26, 1.2) + `<path d="M22 28 q4 -4 8 0 t8 0" stroke="#F2F6FC" stroke-width="2" fill="none" stroke-linecap="round"/>`],
  sersemlik: [
    () => spiral(38, 61) + spiral(62, 61) + stroke('M40 79 Q45 75 50 79 T60 79', 2.4),
    () => `<ellipse cx="50" cy="26" rx="22" ry="6" stroke="#FFE08A" stroke-width="1.4" fill="none" stroke-dasharray="3 3"/>` + star(30, 26, 4, '#FFE08A') + star(70, 24, 4.5, '#FFF4C2') + star(52, 20, 3, '#FFD25E')],
  hastalik: [
    e => eye(38, 61, 'lid', e.c) + eye(62, 61, 'lid', e.c) + blush(.85, 8) + stroke('M43 78 Q48 76 53 78', 2.4) +
      `<g transform="rotate(-25 56 77)"><rect x="54" y="74" width="20" height="5" rx="2.5" fill="#fff" stroke="${INK}" stroke-width="1.4"/><circle cx="74" cy="76.5" r="3.6" fill="#FF5E4D" stroke="${INK}" stroke-width="1.4"/></g>`,
    () => drop(74, 30, 1.1) + `<rect x="34" y="20" width="32" height="10" rx="5" fill="#BFDDF2" opacity=".9"/>`],
  sukran: [
    () => eye(38, 60, 'closed') + eye(62, 60, 'closed') + stroke('M42 75 Q50 82 58 75', 2.6) + blush(.65),
    () => `<ellipse cx="50" cy="22" rx="17" ry="5" stroke="#FFE08A" stroke-width="3.4" fill="none"/>` + star(76, 30, 3.5, '#FFF4C2')],
  cilginlik: [
    () => eye(37, 58, 'big') + eye(63, 61) + `<path d="M39 72 Q50 88 61 72Z" fill="#7A2E3A"/><path d="M47 78 Q50 90 56 82 Q55 77 47 78Z" fill="#FF8FB1"/>` + blush(.5),
    () => `<path d="M70 12 l4 6 l-5 3 l5 5" stroke="#FFE08A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + star(28, 22, 4.5, '#FF9FC6') + star(80, 32, 3, '#FFF4C2')]
};

function emotionSVG(id) {
  const e = EMO[id], g = uid();
  const xf = e.face && e.face.startsWith('x:') ? XFACES[e.face.slice(2)] : null;
  const emoji = e.face && e.face.startsWith('e:') ? e.face.slice(2).replace(/[<>&"]/g, '') : null;
  const face = xf ? () => xf[0](e) : emoji
    ? () => `<text x="50" y="67" text-anchor="middle" dominant-baseline="central" font-size="46" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${emoji}</text>`
    : (FACES[e.face || id] || FACES.joy);
  const acc = xf ? () => xf[1](e) : e.custom ? () => star(73, 21, 7.5, e.l) + star(83, 33, 3.6, '#FFF4C2') + star(28, 24, 4, e.l) : ACC[id];
  return `<svg viewBox="0 0 100 104" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="${g}" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="${e.l}"/><stop offset=".55" stop-color="${e.c}"/><stop offset="1" stop-color="${e.s}"/></radialGradient></defs>
    <circle cx="50" cy="65" r="39" fill="${e.c}" opacity=".18"/>
    <circle cx="50" cy="65" r="33" fill="url(#${g})"/>
    <ellipse cx="37" cy="48" rx="10" ry="5.5" fill="#fff" opacity=".5" transform="rotate(-28 37 48)"/>
    ${face(e.c)}${acc()}
  </svg>`;
}

// ---------- hayvanlar ----------

function grad(g, a, b) {
  return `<defs><radialGradient id="${g}" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs>`;
}

const ANIMAL_SVG = {
  cat: g => `${grad(g, '#D6CDE3', '#A396B8')}
    <path d="M20 46 L25 12 L46 32Z" fill="#A99DBD"/><path d="M80 46 L75 12 L54 32Z" fill="#A99DBD"/>
    <path d="M25 37 L27.5 20 L38 31Z" fill="#F4B6C6"/><path d="M75 37 L72.5 20 L62 31Z" fill="#F4B6C6"/>
    <ellipse cx="50" cy="58" rx="35" ry="31" fill="url(#${g})"/>
    <ellipse cx="50" cy="71" rx="14" ry="10" fill="#EEE9F4"/>
    ${eye(37, 56)}${eye(63, 56)}
    <path d="M46.5 66 h7 l-3.5 4z" fill="#E98BA0"/>${stroke('M50 70 q-3 5 -7 3 M50 70 q3 5 7 3', 2)}
    <g stroke="${INK}" stroke-width="1.3" stroke-linecap="round" opacity=".55"><path d="M30 67 L15 64"/><path d="M30 71 L16 73"/><path d="M70 67 L85 64"/><path d="M70 71 L84 73"/></g>
    <ellipse cx="27" cy="65" rx="5" ry="3" fill="#FF8FA3" opacity=".5"/><ellipse cx="73" cy="65" rx="5" ry="3" fill="#FF8FA3" opacity=".5"/>`,
  fox: g => `${grad(g, '#F6AE74', '#D9703A')}
    <path d="M18 48 L21 9 L45 30Z" fill="#E2803F"/><path d="M82 48 L79 9 L55 30Z" fill="#E2803F"/>
    <path d="M21 9 L20 23 L31 18Z" fill="#6B3A24"/><path d="M79 9 L80 23 L69 18Z" fill="#6B3A24"/>
    <path d="M24 38 L25.5 21 L37 31Z" fill="#FBE2CF"/><path d="M76 38 L74.5 21 L63 31Z" fill="#FBE2CF"/>
    <path d="M13 50 C13 31 33 26 50 26 C67 26 87 31 87 50 C87 68 67 86 50 91 C33 86 13 68 13 50Z" fill="url(#${g})"/>
    <path d="M16 57 C27 59 40 65 50 89 C60 65 73 59 84 57 C80 74 65 86 50 91 C35 86 20 74 16 57Z" fill="#FFF4E6"/>
    ${eye(36, 53)}${eye(64, 53)}
    <ellipse cx="50" cy="77" rx="4.6" ry="3.4" fill="${INK}"/>${stroke('M50 80 q-2.5 4 -6 2.5 M50 80 q2.5 4 6 2.5', 1.8)}`,
  rabbit: g => `${grad(g, '#FFFDFB', '#E6DBD0')}
    <ellipse cx="37" cy="24" rx="9" ry="23" fill="#EFE6DD" transform="rotate(-10 37 24)"/><ellipse cx="63" cy="24" rx="9" ry="23" fill="#EFE6DD" transform="rotate(10 63 24)"/>
    <ellipse cx="37" cy="25" rx="4.3" ry="16" fill="#F7B8C8" transform="rotate(-10 37 25)"/><ellipse cx="63" cy="25" rx="4.3" ry="16" fill="#F7B8C8" transform="rotate(10 63 25)"/>
    <circle cx="50" cy="63" r="32" fill="url(#${g})"/>
    ${eye(38, 61)}${eye(62, 61)}
    <ellipse cx="50" cy="71" rx="3.6" ry="2.6" fill="#E98BA0"/>${stroke('M50 73 q-3 4 -6 2 M50 73 q3 4 6 2', 1.8)}
    ${blush(.5, 5.5)}`,
  owl: g => `${grad(g, '#C49B76', '#8A6448')}
    <path d="M20 36 L16 12 L37 27Z" fill="#7E5B40"/><path d="M80 36 L84 12 L63 27Z" fill="#7E5B40"/>
    <ellipse cx="50" cy="59" rx="36" ry="34" fill="url(#${g})"/>
    <circle cx="35" cy="54" r="15.5" fill="#F1E1C6"/><circle cx="65" cy="54" r="15.5" fill="#F1E1C6"/>
    <circle cx="35" cy="54" r="9.5" fill="#fff" stroke="#E7B14E" stroke-width="2.6"/><circle cx="65" cy="54" r="9.5" fill="#fff" stroke="#E7B14E" stroke-width="2.6"/>
    <circle cx="35" cy="55" r="5.6" fill="${INK}"/><circle cx="65" cy="55" r="5.6" fill="${INK}"/><circle cx="33" cy="52.5" r="2.2" fill="#fff"/><circle cx="63" cy="52.5" r="2.2" fill="#fff"/>
    <path d="M50 62 L45 68 L50 76 L55 68Z" fill="#F2B544"/>
    <g stroke="#6E4E36" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"><path d="M37 82 q4 4 8 0"/><path d="M47 86 q4 4 8 0"/><path d="M55 82 q4 4 8 0"/></g>`,
  hedgehog: g => {
    let spikes = '';
    for (let i = 0; i <= 14; i++) {
      const a = (195 + i * 10.7) * Math.PI / 180, r = i % 2 ? 33 : 46;
      spikes += `${i ? 'L' : 'M'}${(50 + Math.cos(a) * r).toFixed(1)} ${(60 + Math.sin(a) * r).toFixed(1)} `;
    }
    return `${grad(g, '#FBEAD2', '#E3C29A')}
      <path d="${spikes} L84 72 L16 72Z" fill="#8A6A50"/>
      <circle cx="29" cy="44" r="6.5" fill="#E2C29C"/><circle cx="71" cy="44" r="6.5" fill="#E2C29C"/>
      <ellipse cx="50" cy="63" rx="29" ry="27" fill="url(#${g})"/>
      ${eye(39, 61)}${eye(61, 61)}
      <ellipse cx="50" cy="71" rx="4.6" ry="3.4" fill="${INK}"/>${stroke('M50 74 q-2.5 3.5 -5.5 2 M50 74 q2.5 3.5 5.5 2', 1.8)}
      ${blush(.5, 5)}`;
  }
};

function animalSVG(id) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${ANIMAL_SVG[id](uid())}</svg>`;
}

// ---------- ay ikonları ----------

const MONTH_SVG = [
  () => `<g stroke="#7FA9DA" stroke-width="2.6" stroke-linecap="round">${[0, 60, 120].map(r => `<g transform="rotate(${r} 20 20)"><path d="M20 5 V35"/><path d="M15 9 L20 13 L25 9"/><path d="M15 31 L20 27 L25 31"/></g>`).join('')}</g><circle cx="20" cy="20" r="2.6" fill="#BFD6F2"/>`,
  () => `<path d="M20 34 C8 26 4 19 8 12.5 C11 7.5 17 7.5 20 12.5 C23 7.5 29 7.5 32 12.5 C36 19 32 26 20 34Z" fill="#E86A7E"/><ellipse cx="13" cy="14" rx="3" ry="2" fill="#fff" opacity=".6" transform="rotate(-30 13 14)"/>`,
  () => `<path d="M6 34 C14 26 18 20 22 8" stroke="#8A5A3B" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M15 24 C20 24 25 22 30 18" stroke="#8A5A3B" stroke-width="2" fill="none" stroke-linecap="round"/>` + flower(22, 9, 5.5, '#F7A8C4', '#FFE08A') + flower(30, 18, 4.5, '#FBC7D8', '#FFE08A') + flower(12, 27, 3.5, '#F7A8C4', '#FFE08A'),
  () => `<path d="M20 36 V20" stroke="#6E9F5E" stroke-width="2.4"/><path d="M20 32 C12 30 9 24 10 20 C15 22 19 26 20 32Z" fill="#8DC27A"/><path d="M12 8 L15 14 L20 7 L25 14 L28 8 C30 16 27 22 20 22 C13 22 10 16 12 8Z" fill="#E8607A"/><path d="M15 14 L20 7 L25 14 C23 18 17 18 15 14Z" fill="#F58AA0"/>`,
  () => `<path d="M20 38 V24" stroke="#6E9F5E" stroke-width="2.2"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(r => `<ellipse cx="20" cy="9" rx="3.4" ry="7" fill="#fff" stroke="#E6D6BE" stroke-width="1" transform="rotate(${r} 20 17)"/>`).join('')}<circle cx="20" cy="17" r="5" fill="#F7C948"/>`,
  () => `<path d="M20 36 C9 30 7 19 11 14 C14 11 26 11 29 14 C33 19 31 30 20 36Z" fill="#E8485C"/><path d="M11 13 C15 9 18 11 20 8 C22 11 25 9 29 13 C25 15 15 15 11 13Z" fill="#6E9F5E"/>${[[15, 19], [21, 18], [26, 21], [17, 25], [23, 26], [20, 31]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1" ry="1.5" fill="#FFE08A"/>`).join('')}`,
  () => `<path d="M4 16 A16 16 0 0 0 36 16 Z" fill="#6E9F5E"/><path d="M7 16 A13 13 0 0 0 33 16 Z" fill="#F4F0D0"/><path d="M9 16 A11 11 0 0 0 31 16 Z" fill="#EE5B6A"/>${[[14, 19], [20, 22], [26, 19], [17, 24], [23, 24]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1" ry="1.6" fill="${INK}"/>`).join('')}`,
  () => `<path d="M20 34 L8 16 C10 8 30 8 32 16 Z" fill="#F7B48A"/>${[-14, -7, 0, 7, 14].map(dx => `<path d="M20 34 L${20 + dx} 10" stroke="#E08C5C" stroke-width="1.4"/>`).join('')}<path d="M16 34 h8 v3 h-8z" fill="#E08C5C"/>`,
  () => `<path d="M20 12 C14 8 6 11 7 20 C8 30 15 35 20 33 C25 35 32 30 33 20 C34 11 26 8 20 12Z" fill="#E2563F"/><path d="M20 12 C20 8 21 6 23 4" stroke="#8A5A3B" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 8 C26 4 31 5 32 7 C28 10 24 10 22 8Z" fill="#7FB069"/><ellipse cx="13" cy="17" rx="2.6" ry="4" fill="#fff" opacity=".45"/>`,
  () => `<path d="M16 22 h8 v12 c0 2 -8 2 -8 0z" fill="#F6EBD8"/><path d="M5 22 C5 10 35 10 35 22 Z" fill="#E2563F"/><circle cx="13" cy="16" r="2.4" fill="#fff"/><circle cx="22" cy="13" r="2" fill="#fff"/><circle cx="28" cy="18" r="1.8" fill="#fff"/>`,
  () => `<path d="M20 9 C21 6 23 4 25 4" stroke="#6E9F5E" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="13" cy="22" rx="8" ry="11" fill="#E8894A"/><ellipse cx="27" cy="22" rx="8" ry="11" fill="#E8894A"/><ellipse cx="20" cy="22" rx="8" ry="12" fill="#F29E5A"/><ellipse cx="17" cy="17" rx="2" ry="4" fill="#fff" opacity=".35"/>`,
  () => `<circle cx="20" cy="9" r="7" fill="#FFE08A" opacity=".35"/><path d="M20 3 C23 7 23 11 20 13 C17 11 17 7 20 3Z" fill="#F7A74A"/><path d="M20 7 C21.5 9 21.5 11 20 12 C18.5 11 18.5 9 20 7Z" fill="#FFE08A"/><rect x="14.5" y="14" width="11" height="20" rx="2" fill="#FBF3E4" stroke="#E6D4B5"/><path d="M14.5 18 q3 3 3 -1" fill="#FBF3E4" stroke="#E6D4B5"/><rect x="10" y="33" width="20" height="4" rx="2" fill="#C9935A"/>`
];

function monthSVG(m) {
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">${MONTH_SVG[m - 1]()}</svg>`;
}

// ---------- süsler ----------

const SEASON = {
  winter: { stem: '#8FA79B', leaf: '#A9C4B8', leaf2: '#C8DCD2', petal: '#FFFFFF', center: '#BFD6F2', rose: '#E9EEF8', roseDark: '#B9C6DE', bell: '#DDE8F6', berry: '#D9535F' },
  spring: { stem: '#7FA06A', leaf: '#9CCB86', leaf2: '#BFE0AA', petal: '#F7A8C4', center: '#FFE08A', rose: '#F6B6CB', roseDark: '#D9789A', bell: '#C6B4F0', berry: '#FBC7D8' },
  summer: { stem: '#6E9F5E', leaf: '#8DC27A', leaf2: '#B3DB9C', petal: '#FFE08A', center: '#F2A33A', rose: '#FF9DA8', roseDark: '#E0606F', bell: '#A8D8F0', berry: '#F28CA8' },
  autumn: { stem: '#9A6B45', leaf: '#E59A4E', leaf2: '#D9653E', petal: '#F2C14E', center: '#C46A2E', rose: '#E9876A', roseDark: '#B8513A', bell: '#F2C9A0', berry: '#C9534A' }
};

function leaf(x, y, rot, fill, len = 14) {
  const k = len / 14;
  return `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" d="M0 0 C4 -5 11 -5 14 0 C11 5 4 5 0 0Z" fill="${fill}"/><path transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" d="M1 0 H12" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>`;
}
function rose(cx, cy, r, col, dark) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>
    <path d="M${cx - r * .55} ${cy + r * .1} a${r * .55} ${r * .55} 0 1 1 ${r * .55} ${r * .5} a${r * .32} ${r * .32} 0 1 1 ${r * .05} -${r * .62}" stroke="${dark}" stroke-width="${(r / 6).toFixed(1)}" fill="none" stroke-linecap="round"/>
    <circle cx="${cx - r * .35}" cy="${cy - r * .38}" r="${r * .22}" fill="#fff" opacity=".45"/>`;
}
function bud(x, y, rot, col, sepal) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse cx="0" cy="-4" rx="3" ry="4.6" fill="${col}"/><path d="M-3.4 -1 Q0 2 3.4 -1 L0 3Z" fill="${sepal}"/></g>`;
}
function bell(x, y, len, col, stem) {
  return `<path d="M${x} ${y} V${y + len}" stroke="${stem}" stroke-width="1.2"/><path d="M${x - 4} ${y + len + 6} Q${x - 4} ${y + len - 1} ${x} ${y + len - 1} Q${x + 4} ${y + len - 1} ${x + 4} ${y + len + 6} Q${x + 2} ${y + len + 4} ${x} ${y + len + 6.5} Q${x - 2} ${y + len + 4} ${x - 4} ${y + len + 6}Z" fill="${col}"/>`;
}

export function vineSVG(season) {
  const s = SEASON[season] || SEASON.spring;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="48" viewBox="0 0 200 48">
    <path d="M0 22 C33 6 67 6 100 22 C133 38 167 38 200 22" stroke="${s.stem}" stroke-width="2.2" fill="none"/>
    <path d="M58 12 C64 4 72 3 78 6" stroke="${s.stem}" stroke-width="1.4" fill="none"/><path d="M140 32 C146 40 156 42 162 38" stroke="${s.stem}" stroke-width="1.4" fill="none"/>
    ${bell(26, 15, 10, s.bell, s.stem)}${bell(172, 31, 6, s.bell, s.stem)}${bell(118, 30, 8, s.bell, s.stem)}
    ${leaf(8, 17, -40, s.leaf)}${leaf(40, 9, 20, s.leaf2)}${leaf(46, 12, 160, s.leaf, 11)}${leaf(86, 16, 30, s.leaf)}${leaf(110, 27, 210, s.leaf2, 12)}${leaf(130, 33, 20, s.leaf)}${leaf(186, 27, -30, s.leaf2)}${leaf(70, 8, -60, s.leaf, 10)}
    ${rose(100, 22, 8, s.rose, s.roseDark)}
    ${flower(52, 10, 6.5, s.petal, s.center)}${flower(150, 34, 6, s.petal, s.center)}${flower(80, 6, 4, s.petal, s.center)}${flower(164, 39, 3.8, s.petal, s.center)}
    ${bud(16, 15, -20, s.rose, s.leaf)}${bud(192, 22, 25, s.rose, s.leaf)}
    <circle cx="124" cy="24" r="2.4" fill="${s.berry}"/><circle cx="128" cy="21" r="2" fill="${s.berry}"/><circle cx="66" cy="15" r="2" fill="${s.berry}"/>
    ${star(34, 34, 3.4, '#FFF6D6')}${star(140, 8, 3, '#FFF6D6')}${star(178, 10, 2.2, '#FFE9A8')}
  </svg>`;
}

export function flourishSVG(season) {
  const s = SEASON[season] || SEASON.spring;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="140" viewBox="0 0 190 140">
    <path d="M4 8 C46 4 66 18 76 42 C84 62 100 74 128 68" stroke="${s.stem}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M8 6 C8 36 18 58 40 74 C50 82 54 92 50 104" stroke="${s.stem}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M70 32 C78 22 92 18 106 22" stroke="${s.stem}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    <path d="M128 68 C140 66 146 58 144 50 C143 44 136 44 136 50" stroke="${s.stem}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M22 50 C14 52 10 60 14 66" stroke="${s.stem}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    ${bell(96, 46, 12, s.bell, s.stem)}${bell(30, 66, 10, s.bell, s.stem)}
    ${leaf(26, 8, -10, s.leaf, 16)}${leaf(48, 14, 30, s.leaf2, 16)}${leaf(70, 48, 60, s.leaf, 15)}${leaf(92, 66, 10, s.leaf2, 15)}${leaf(110, 72, -20, s.leaf, 13)}
    ${leaf(10, 30, 70, s.leaf, 15)}${leaf(20, 52, 50, s.leaf2, 14)}${leaf(36, 76, 40, s.leaf, 14)}${leaf(80, 24, -20, s.leaf2, 13)}${leaf(60, 22, 200, s.leaf, 12)}
    ${rose(128, 68, 11, s.rose, s.roseDark)}${rose(108, 22, 7.5, s.rose, s.roseDark)}
    ${flower(50, 104, 7, s.petal, s.center)}${flower(84, 36, 5, s.petal, s.center)}${flower(14, 66, 4.5, s.petal, s.center)}${flower(146, 84, 4.5, s.petal, s.center)}
    ${bud(40, 30, -30, s.rose, s.leaf)}${bud(136, 50, 20, s.rose, s.leaf)}${bud(64, 88, -10, s.rose, s.leaf)}
    <circle cx="58" cy="30" r="2.6" fill="${s.berry}"/><circle cx="62" cy="27" r="2.1" fill="${s.berry}"/><circle cx="26" cy="40" r="2" fill="${s.berry}"/>
    ${star(158, 40, 6, '#FFF6D6')}${star(170, 92, 3.6, '#FFE9A8')}${star(92, 92, 3, '#FFF6D6')}${star(30, 124, 2.6, '#FFE9A8')}
  </svg>`;
}

export function dividerSVG(season) {
  const s = SEASON[season] || SEASON.spring;
  const side = `<path d="M150 20 C120 20 100 10 70 14 C50 17 34 22 8 20" stroke="${s.stem}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${leaf(130, 18, 190, s.leaf)}${leaf(110, 13, 160, s.leaf2)}${leaf(88, 13, 200, s.leaf)}${leaf(60, 16, 170, s.leaf2, 12)}${leaf(36, 20, 190, s.leaf, 11)}
    ${flower(76, 12, 4.4, s.petal, s.center)}${flower(44, 19, 3.6, s.petal, s.center)}<circle cx="16" cy="20" r="2.4" fill="${s.berry}"/>${star(100, 28, 2.6, '#FFF6D6')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="40" viewBox="0 0 320 40">
    ${side}<g transform="translate(320 0) scale(-1 1)">${side}</g>${rose(160, 20, 10, s.rose, s.roseDark)}${star(160, 4, 3.4, '#FFE9A8')}
  </svg>`;
}

export function petalSVG(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24"><path d="M10 0 C17 6 18 15 10 24 C2 15 3 6 10 0Z" fill="${color}"/><path d="M10 3 V20" stroke="#fff" stroke-opacity=".5" stroke-width="1"/></svg>`;
}

export function butterflySVG(a, b) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32">
    <g class="wl"><path d="M19 16 C10 2 0 4 2 12 C3 17 10 18 19 17Z" fill="${a}"/><path d="M19 17 C10 20 6 28 11 30 C15 31 18 24 19 18Z" fill="${b}"/><circle cx="8" cy="10" r="2" fill="#fff" opacity=".6"/></g>
    <g class="wr"><path d="M21 16 C30 2 40 4 38 12 C37 17 30 18 21 17Z" fill="${a}"/><path d="M21 17 C30 20 34 28 29 30 C25 31 22 24 21 18Z" fill="${b}"/><circle cx="32" cy="10" r="2" fill="#fff" opacity=".6"/></g>
    <rect x="19" y="10" width="2" height="15" rx="1" fill="${INK}"/><path d="M20 10 C18 6 16 5 15 4 M20 10 C22 6 24 5 25 4" stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round"/>
  </svg>`;
}

export const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${star(12, 12, 12, '#FFFFFF')}</svg>`;
export const svgURL = svg => 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s+/g, ' '));

// ---------- dışa açık ----------

function svgFor(name) {
  if (EMO[name]) return emotionSVG(name);
  if (/^c-/.test(name)) return emotionSVG('joy');
  if (ANIMAL_SVG[name]) return animalSVG(name);
  if (/^m\d+$/.test(name)) return monthSVG(Number(name.slice(1)));
  throw new Error('Bilinmeyen çizim: ' + name);
}

export function art(name, size, opts = {}) {
  const el = document.createElement('span');
  el.className = 'art' + (opts.className ? ' ' + opts.className : '');
  el.innerHTML = svgFor(name);
  const svg = el.firstElementChild;
  const ratio = EMO[name] ? 1.04 : 1;
  svg.setAttribute('width', size);
  svg.setAttribute('height', Math.round(size * ratio));
  if (opts.alt) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', opts.alt); }
  else el.setAttribute('aria-hidden', 'true');
  return el;
}

export function artURL(name) {
  return svgURL(svgFor(name));
}

// ---------- mevsimlik düşen süsler ----------

export function snowSVG(color) {
  const arm = a => `<g transform="rotate(${a} 12 12)"><path d="M12 2 V22 M12 5 L9.5 3 M12 5 L14.5 3 M12 19 L9.5 21 M12 19 L14.5 21" stroke="${color}" stroke-width="1.6" stroke-linecap="round" fill="none"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${arm(0)}${arm(60)}${arm(120)}<circle cx="12" cy="12" r="1.6" fill="${color}"/></svg>`;
}
export function leafFallSVG(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28"><path d="M12 1 C15 5 21 6 21 12 C21 18 16 22 12 25 C8 22 3 18 3 12 C3 6 9 5 12 1Z" fill="${color}"/><path d="M12 3 V27 M12 10 L7 7 M12 10 L17 7 M12 16 L6 13 M12 16 L18 13" stroke="#fff" stroke-opacity=".45" stroke-width="1" fill="none" stroke-linecap="round"/></svg>`;
}
export function blossomSVG(color, center) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${flower(12, 12, 8, color, center)}</svg>`;
}

// ---------- kartların kenarından aşağı sarkan sarmaşık ----------

export function hangingVineSVG(season, seed = 1) {
  const s = SEASON[season] || SEASON.spring;
  let st = seed * 9301 + 49297;
  const r = () => { st = (st * 9301 + 49297) % 233280; return st / 233280; };
  const H = 430, phase = r() * 3;
  const xAt = y => 16 + Math.sin(y / 52 + phase) * 9 * (1 - y / (H * 1.25)) + (y / H) * 4;
  const pts = [];
  for (let y = 0; y <= H - 30; y += 15) pts.push([xAt(y), y]);
  const pathOf = (from, to) => {
    const seg = pts.slice(from, to + 1);
    let d = `M${seg[0][0].toFixed(1)} ${seg[0][1]}`;
    for (let i = 1; i < seg.length - 1; i++) {
      const mx = (seg[i][0] + seg[i + 1][0]) / 2, my = (seg[i][1] + seg[i + 1][1]) / 2;
      d += ` Q${seg[i][0].toFixed(1)} ${seg[i][1]} ${mx.toFixed(1)} ${my}`;
    }
    const last = seg[seg.length - 1];
    return d + ` L${last[0].toFixed(1)} ${last[1]}`;
  };
  const n = pts.length - 1, a = Math.floor(n / 3), b = Math.floor(n * 2 / 3);
  let out = `<path d="${pathOf(0, a)}" stroke="${s.stem}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="${pathOf(a, b)}" stroke="${s.stem}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="${pathOf(b, n)}" stroke="${s.stem}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  // köşeden yana uzanan kısa dal
  out += `<path d="M14 2 C30 0 46 4 64 10 C72 13 80 12 86 8" stroke="${s.stem}" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${leaf(34, 3, -10, s.leaf, 12)}${leaf(52, 7, 15, s.leaf2, 11)}${leaf(70, 12, -25, s.leaf, 10)}${flower(84, 8, 4.2, s.petal, s.center)}`;
  // yapraklar
  let side = 1;
  for (let y = 16; y < H - 30; y += 13 + r() * 8) {
    const x = xAt(y), t = y / H, len = 21 - t * 9 + r() * 4;
    const rot = side > 0 ? -30 + r() * 35 : 180 + 30 - r() * 35;
    out += leaf(x, y, rot, r() < .5 ? s.leaf : s.leaf2, len);
    if (r() < .45) out += leaf(x, y + 3, side > 0 ? 200 - r() * 30 : -20 + r() * 30, r() < .5 ? s.leaf2 : s.leaf, len * .6);
    side *= -1;
  }
  // kıvrık filizler
  for (const y of [95 + r() * 20, 265 + r() * 20]) {
    const x = xAt(y);
    out += `<path d="M${x.toFixed(1)} ${y.toFixed(0)} c8 2 14 8 12 15 c-1 5 -7 6 -9 2 c-2 -3 1 -6 3 -4" stroke="${s.stem}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  }
  // çiçekler, çanlar, meyveler, tomurcuklar
  const at = y => [xAt(y), y];
  let [fx, fy] = at(58); out += rose(fx + 4, fy, 10, s.rose, s.roseDark);
  [fx, fy] = at(132); out += flower(fx - 7, fy, 7.5, s.petal, s.center);
  [fx, fy] = at(176); out += `<circle cx="${(fx + 7).toFixed(1)}" cy="${fy}" r="2.6" fill="${s.berry}"/><circle cx="${(fx + 10.5).toFixed(1)}" cy="${fy + 3}" r="2.2" fill="${s.berry}"/><circle cx="${(fx + 6).toFixed(1)}" cy="${fy + 4.5}" r="2" fill="${s.berry}"/>`;
  [fx, fy] = at(215); out += bell(fx + 1, fy, 9, s.bell, s.stem) + bell(fx + 7, fy + 4, 6, s.bell, s.stem);
  [fx, fy] = at(250); out += rose(fx - 2, fy, 8.5, s.rose, s.roseDark);
  [fx, fy] = at(305); out += flower(fx + 7, fy, 6.5, s.petal, s.center);
  [fx, fy] = at(190); out += flower(fx - 8, fy, 5, s.petal, s.center);
  [fx, fy] = at(338); out += bell(fx, fy, 7, s.bell, s.stem);
  [fx, fy] = at(372); out += bud(fx + 3, fy, 20, s.rose, s.leaf);
  [fx, fy] = at(398); out += bud(fx - 2, fy + 2, -15, s.petal, s.leaf);
  out += star(46, 40 + r() * 30, 3.4, '#FFF6D6') + star(40, 200 + r() * 40, 2.6, '#FFE9A8') + star(44, 330 + r() * 30, 2.2, '#FFF6D6');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="${H}" viewBox="0 0 92 ${H}">${out}</svg>`;
}
