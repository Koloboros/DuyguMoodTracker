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
  { id: 'ennui', label: 'Can sıkıntısı', c: '#8A6A9E', l: '#CDB9DA', s: '#5F4672' }
];
export const EMO = Object.fromEntries(EMOTIONS.map(e => [e.id, e]));

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
  ennui: body => eye(38, 61, 'lid', body) + eye(62, 61, 'lid', body) + stroke('M43 78 L57 78')
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
  ennui: () => stroke('M64 16 h9 l-9 10 h9', 2.4) + stroke('M77 5 h6 l-6 7 h6', 2)
};

function emotionSVG(id) {
  const e = EMO[id], g = uid();
  return `<svg viewBox="0 0 100 104" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="${g}" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="${e.l}"/><stop offset=".55" stop-color="${e.c}"/><stop offset="1" stop-color="${e.s}"/></radialGradient></defs>
    <circle cx="50" cy="65" r="39" fill="${e.c}" opacity=".18"/>
    <circle cx="50" cy="65" r="33" fill="url(#${g})"/>
    <ellipse cx="37" cy="48" rx="10" ry="5.5" fill="#fff" opacity=".5" transform="rotate(-28 37 48)"/>
    ${FACES[id](e.c)}${ACC[id]()}
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
  winter: { stem: '#8FA79B', leaf: '#A9C4B8', leaf2: '#C3D8CE', petal: '#FFFFFF', center: '#BFD6F2', berry: '#D9535F' },
  spring: { stem: '#7FA06A', leaf: '#9CCB86', leaf2: '#B8DDA4', petal: '#F7A8C4', center: '#FFE08A', berry: '#FBC7D8' },
  summer: { stem: '#6E9F5E', leaf: '#8DC27A', leaf2: '#A9D68F', petal: '#FFE08A', center: '#F2A33A', berry: '#F28CA8' },
  autumn: { stem: '#9A6B45', leaf: '#E59A4E', leaf2: '#D9653E', petal: '#F2C14E', center: '#C46A2E', berry: '#C9534A' }
};

function leaf(x, y, rot, fill) {
  return `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 0 C4 -5 11 -5 14 0 C11 5 4 5 0 0Z" fill="${fill}"/>`;
}

export function vineSVG(season) {
  const s = SEASON[season] || SEASON.spring;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="36" viewBox="0 0 160 36">
    <path d="M0 20 C27 6 53 6 80 20 C107 34 133 34 160 20" stroke="${s.stem}" stroke-width="2" fill="none"/>
    ${leaf(14, 14, -40, s.leaf)}${leaf(54, 10, 20, s.leaf2)}${leaf(92, 25, 30, s.leaf)}${leaf(140, 28, -20, s.leaf2)}${leaf(66, 14, 200, s.leaf)}
    ${flower(36, 10, 6, s.petal, s.center)}${flower(118, 29, 5.5, s.petal, s.center)}
    <circle cx="80" cy="13" r="2.4" fill="${s.berry}"/><circle cx="84" cy="10" r="2" fill="${s.berry}"/><circle cx="152" cy="15" r="2.2" fill="${s.berry}"/>
    ${star(100, 9, 3.5, '#FFF6D6')}
  </svg>`;
}

export function flourishSVG(season) {
  const s = SEASON[season] || SEASON.spring;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="110" viewBox="0 0 150 110">
    <path d="M4 8 C40 6 56 18 64 38 C70 54 84 62 104 56" stroke="${s.stem}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M8 6 C10 30 18 46 34 58" stroke="${s.stem}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M60 30 C66 22 76 18 86 20" stroke="${s.stem}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${leaf(26, 9, -10, s.leaf)}${leaf(44, 16, 30, s.leaf2)}${leaf(62, 44, 60, s.leaf)}${leaf(80, 58, 10, s.leaf2)}${leaf(12, 28, 70, s.leaf)}${leaf(22, 46, 50, s.leaf2)}${leaf(72, 22, -20, s.leaf2)}
    ${flower(106, 55, 8, s.petal, s.center)}${flower(88, 20, 5.5, s.petal, s.center)}${flower(36, 60, 5, s.petal, s.center)}
    <circle cx="52" cy="26" r="2.4" fill="${s.berry}"/><circle cx="56" cy="23" r="2" fill="${s.berry}"/>
    ${star(122, 34, 5, '#FFF6D6')}${star(132, 70, 3, '#FFE9A8')}
  </svg>`;
}

export const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${star(12, 12, 12, '#FFFFFF')}</svg>`;
export const svgURL = svg => 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s+/g, ' '));

// ---------- dışa açık ----------

function svgFor(name) {
  if (EMO[name]) return emotionSVG(name);
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
