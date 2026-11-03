// Basılabilir sayfalar: günlük (A6 yatay), aylık özet (A5), yıllık arşiv (A5).
// Hepsi canvas'a milimetre ölçeğinde çizilir (300 dpi), sonra PNG ya da PDF olarak indirilir.
import { EMO, SEASON_OF_MONTH, artURL, vineSVG, flourishSVG, svgURL } from './art.js?v=202611031223';

const DPI = 300;
const K = DPI / 25.4;
export const SIZES = { a6: [105, 148], a6l: [148, 105], a5: [148, 210] };
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const SHORT = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];
const WEEKDAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const WEEK_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const THEMES = {
  dark: {
    text: '#F4ECFF', muted: '#C9BCE6', accent: '#FFCF7A', card: 'rgba(255,255,255,0.07)', cardLine: 'rgba(214,190,255,0.28)',
    line: 'rgba(214,190,255,0.22)', ink: '#FFF4E0', emptyFill: 'rgba(255,255,255,0.07)', emptyLine: 'rgba(214,190,255,0.32)',
    towerEdge: '#160C34', towerMid: '#5B3D9E', towerSide: '#8E6BD6', cap1: '#E6D6FF', cap2: '#6B48B5', rail: '#D9C4FF', railEdge: '#5B3D9E',
    tray1: '#CDB6FF', tray2: '#6242AA', glow: 1, tagText: '#3B2410'
  },
  light: {
    text: '#3A2649', muted: '#6F5A73', accent: '#A8721E', card: 'rgba(255,255,255,0.82)', cardLine: '#E8D8BE',
    line: '#E6D7BF', ink: '#3A2649', emptyFill: '#F4ECDF', emptyLine: '#DCCBB0',
    towerEdge: '#C6B4E8', towerMid: '#F6F0FF', towerSide: '#A68BDA', cap1: '#FFFFFF', cap2: '#B49CE4', rail: '#9F86D6', railEdge: '#D9CCF2',
    tray1: '#EFE6FF', tray2: '#B49CE4', glow: .5, tagText: '#3B2410'
  }
};

// ---------- yardımcılar ----------

const imgCache = new Map();
function loadImg(src) {
  if (!src) return Promise.resolve(null);
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise(res => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
  if (!src.startsWith('blob:')) imgCache.set(src, p);
  return p;
}

async function fontsReady() {
  try {
    const sample = 'AaĞğÜüŞşİıÖöÇç0123456789%';
    await Promise.all(['600 10px Fraunces', 'italic 600 10px Fraunces', '700 10px Nunito', '800 10px Nunito', '700 10px Caveat'].map(f => document.fonts.load(f, sample)));
  } catch (e) { /* yazı tipi gelmezse sistem yazısıyla devam */ }
}

function canvasFor(fmt, scale = 1) {
  const [w, h] = SIZES[fmt];
  const c = document.createElement('canvas');
  c.width = Math.round(w * K * scale);
  c.height = Math.round(h * K * scale);
  const ctx = c.getContext('2d');
  ctx.scale(K * scale, K * scale);
  ctx.px = K * scale; // 1 mm kaç piksel (gölge bulanıklığı için)
  return { c, ctx, w, h };
}

const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const shortDate = s => { const d = parse(s); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`; };

function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function text(ctx, str, x, y, { font, color, align = 'left', baseline = 'alphabetic' }) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

function wrap(ctx, str, maxW, font) {
  ctx.font = font;
  const out = [];
  for (const para of String(str || '').split(/\n+/)) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = word; }
      else line = test;
    }
    if (line) out.push(line);
  }
  return out;
}

function clampLines(ctx, lines, max, maxW) {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let last = kept[max - 1];
  while (ctx.measureText(last + '…').width > maxW && last.length) last = last.slice(0, -1);
  kept[max - 1] = last.replace(/\s+$/, '') + '…';
  return kept;
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function sparkle(ctx, x, y, r, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * .15, y - r * .15, x + r, y);
  ctx.quadraticCurveTo(x + r * .15, y + r * .15, x, y + r);
  ctx.quadraticCurveTo(x - r * .15, y + r * .15, x - r, y);
  ctx.quadraticCurveTo(x - r * .15, y - r * .15, x, y - r);
  ctx.fill();
  ctx.restore();
}

function emoList(emotions) {
  return Object.entries(emotions || {}).filter(([id, w]) => EMO[id] && w > 0).sort((a, b) => b[1] - a[1]);
}

// ---------- zemin ve süsler ----------

function background(ctx, w, h, theme, seed) {
  const r = rng(seed);
  if (theme === 'dark') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#140C33'); g.addColorStop(.55, '#1E1249'); g.addColorStop(1, '#120A2A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const glow = (x, y, rad, col) => { const rg = ctx.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h); };
    glow(w * .5, -h * .05, w * .9, 'rgba(98,60,180,0.75)');
    glow(0, h, w * .8, 'rgba(80,32,118,0.6)');
    glow(w, h * .9, w * .8, 'rgba(33,63,134,0.6)');
    for (let i = 0; i < 70; i++) {
      ctx.globalAlpha = .25 + r() * .6;
      ctx.fillStyle = '#FFF6DA';
      ctx.beginPath(); ctx.arc(r() * w, r() * h, .12 + r() * .3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 9; i++) sparkle(ctx, r() * w, r() * h, .8 + r() * 1.2, '#FFF1C8', .5 + r() * .4);
  } else {
    ctx.fillStyle = '#FFF9F1'; ctx.fillRect(0, 0, w, h);
    const glow = (x, y, rad, col) => { const rg = ctx.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h); };
    glow(0, 0, w * 1.1, 'rgba(236,224,255,0.9)');
    glow(w, h, w * .9, 'rgba(255,228,206,0.8)');
    for (let i = 0; i < 12; i++) sparkle(ctx, r() * w, r() * h, .7 + r() * 1.1, '#E8B954', .35 + r() * .35);
  }
}

async function vineStrip(ctx, w, season) {
  const img = await loadImg(svgURL(vineSVG(season)));
  if (!img) return;
  const th = 9, tw = th * 200 / 48;
  for (let x = -4; x < w; x += tw) ctx.drawImage(img, x, .5, tw, th);
}

async function corners(ctx, w, h, season) {
  const img = await loadImg(svgURL(flourishSVG(season)));
  if (!img) return;
  const fw = 30, fh = fw * 140 / 190;
  ctx.save(); ctx.translate(0, h); ctx.scale(1, -1); ctx.drawImage(img, -2, -2, fw, fh); ctx.restore();
  ctx.save(); ctx.translate(w, h); ctx.scale(-1, -1); ctx.drawImage(img, -2, -2, fw, fh); ctx.restore();
}

function footer(ctx, w, h, T, label) {
  text(ctx, label, w / 2, h - 4.2, { font: '800 2.1px Nunito', color: T.muted, align: 'center' });
}

// ---------- küre ----------

function drawOrb(ctx, x, y, r, emotions, { core = false, rot = 0, T, mode = 'fill' } = {}) {
  const em = emoList(emotions);
  if (!em.length) {
    ctx.save();
    if (mode === 'future') ctx.globalAlpha = .5;
    ctx.fillStyle = T.emptyFill;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = Math.max(.12, r * .08);
    ctx.strokeStyle = T.emptyLine;
    ctx.stroke();
    const hl = ctx.createRadialGradient(x - r * .35, y - r * .45, 0, x - r * .35, y - r * .45, r * .7);
    hl.addColorStop(0, 'rgba(255,255,255,0.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }
  const cols = em.map(([id]) => EMO[id].c);
  const sum = em.reduce((a, [, v]) => a + v, 0);
  ctx.save();
  // ışıma
  ctx.shadowColor = core ? 'rgba(255,214,110,0.9)' : cols[0] + 'CC';
  ctx.shadowBlur = r * (core ? 1.4 : .9) * ctx.px * T.glow;
  ctx.fillStyle = cols[0];
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  if (cols.length > 1 && ctx.createConicGradient) {
    const g = ctx.createConicGradient(rot * Math.PI / 180, x, y);
    g.addColorStop(0, cols[cols.length - 1]);
    let acc = 0;
    em.forEach(([id, v]) => { const sp = v / sum; g.addColorStop(Math.min(.999, acc + sp / 2), EMO[id].c); acc += sp; });
    g.addColorStop(1, cols[cols.length - 1]);
    ctx.fillStyle = g;
    ctx.filter = `blur(${(r * .14 * ctx.px).toFixed(1)}px)`;
  } else {
    const g = ctx.createRadialGradient(x, y + r * .25, 0, x, y, r);
    g.addColorStop(0, cols[0]); g.addColorStop(.6, cols[0]); g.addColorStop(1, cols[0] + 'B0');
    ctx.fillStyle = g;
  }
  ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
  ctx.filter = 'none';
  // küresel gölge
  const sh = ctx.createRadialGradient(x - r * .04, y - r * .08, r * .5, x, y, r * 1.02);
  sh.addColorStop(0, 'rgba(18,6,40,0)'); sh.addColorStop(1, 'rgba(18,6,40,0.5)');
  ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // alt kenar ışığı
  const rim = ctx.createRadialGradient(x + r * .32, y + r * .6, 0, x + r * .32, y + r * .6, r * .55);
  rim.addColorStop(0, 'rgba(255,255,255,0.42)'); rim.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rim; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // parlak yansıma
  const hl = ctx.createRadialGradient(x - r * .36, y - r * .52, 0, x - r * .36, y - r * .52, r * .5);
  hl.addColorStop(0, 'rgba(255,255,255,0.98)'); hl.addColorStop(.28, 'rgba(255,255,255,0.6)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  if (core) {
    ctx.save();
    ctx.lineWidth = Math.max(.25, r * .1);
    ctx.strokeStyle = '#FFF3C4';
    ctx.shadowColor = 'rgba(255,200,90,0.9)';
    ctx.shadowBlur = r * .6 * ctx.px;
    ctx.beginPath(); ctx.arc(x, y, r + ctx.lineWidth * .7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

function pedestal(ctx, x, y, w, T) {
  const g = ctx.createLinearGradient(0, y - 2, 0, y + 2);
  g.addColorStop(0, T.tray1); g.addColorStop(1, T.tray2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, w * .08, 0, 0, Math.PI * 2); ctx.fill();
  const s = ctx.createLinearGradient(0, y, 0, y + w * .22);
  s.addColorStop(0, T.tray2); s.addColorStop(1, T === THEMES.dark ? '#3B2470' : '#D9CCF2');
  ctx.fillStyle = s;
  ctx.beginPath();
  ctx.moveTo(x - w * .1, y + w * .05); ctx.lineTo(x + w * .1, y + w * .05);
  ctx.lineTo(x + w * .16, y + w * .24); ctx.lineTo(x - w * .16, y + w * .24); ctx.closePath(); ctx.fill();
}

function goldPill(ctx, label, x, y, align = 'right') {
  ctx.font = '800 2.5px Nunito';
  const tw = ctx.measureText(label).width + 5;
  const left = align === 'right' ? x - tw : (align === 'center' ? x - tw / 2 : x);
  const g = ctx.createLinearGradient(0, y - 2.5, 0, y + 2.5);
  g.addColorStop(0, '#FFE7A8'); g.addColorStop(1, '#E2A647');
  ctx.save();
  ctx.shadowColor = 'rgba(255,200,110,0.6)'; ctx.shadowBlur = 1.5 * ctx.px;
  ctx.fillStyle = g; rrect(ctx, left, y - 2.6, tw, 5.2, 2.6); ctx.fill();
  ctx.restore();
  text(ctx, label, left + tw / 2, y + .9, { font: '800 2.5px Nunito', color: '#3B2410', align: 'center' });
}

async function character(ctx, id, x, y, size) {
  const img = await loadImg(artURL(id));
  if (img) ctx.drawImage(img, x, y, size, size * 1.04);
}

async function photo(ctx, src, x, y, w, h) {
  const img = await loadImg(src);
  ctx.save();
  rrect(ctx, x, y, w, h, .4); ctx.clip();
  if (img) {
    const s = Math.max(w / img.width, h / img.height);
    const iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  } else { ctx.fillStyle = '#E9E0D2'; ctx.fillRect(x, y, w, h); }
  ctx.restore();
}

function linedArea(ctx, x, y, w, h, step, T) {
  ctx.save();
  ctx.strokeStyle = T.line; ctx.lineWidth = .18;
  for (let ly = y + step; ly <= y + h; ly += step) { ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + w, ly); ctx.stroke(); }
  ctx.restore();
}

function card(ctx, x, y, w, h, T, r = 3) {
  ctx.save();
  ctx.fillStyle = T.card; rrect(ctx, x, y, w, h, r); ctx.fill();
  ctx.strokeStyle = T.cardLine; ctx.lineWidth = .2; ctx.stroke();
  ctx.restore();
}

function totalsOf(entries) {
  const t = {};
  for (const e of entries) {
    const em = emoList(e.emotions); const s = em.reduce((a, [, v]) => a + v, 0);
    for (const [id, v] of em) t[id] = (t[id] || 0) + v / s;
  }
  const keys = Object.keys(t).sort((a, b) => t[b] - t[a]);
  const grand = keys.reduce((a, k) => a + t[k], 0) || 1;
  return keys.map(k => ({ id: k, share: t[k] / grand }));
}

function colorBar(ctx, x, y, w, h, list) {
  ctx.save();
  rrect(ctx, x, y, w, h, h / 2); ctx.clip();
  let cx = x;
  for (const it of list) { const bw = w * it.share; ctx.fillStyle = EMO[it.id].c; ctx.fillRect(cx, y, bw + .05, h); cx += bw; }
  if (!list.length) { ctx.fillStyle = 'rgba(160,140,190,0.25)'; ctx.fillRect(x, y, w, h); }
  ctx.restore();
}

const rotOf = date => (Number(String(date).slice(-2)) * 47) % 360;

// ---------- günlük sayfa (A6 yatay, web sayfası gibi iki panel) ----------

export async function renderDay({ date, entry, profile, theme = 'light', photoSrc, scale = 1 }) {
  await fontsReady();
  const T = THEMES[theme];
  const { c, ctx, w, h } = canvasFor('a6l', scale);
  const d = parse(date);
  const season = SEASON_OF_MONTH[d.getMonth()];
  background(ctx, w, h, theme, Number(date.replace(/-/g, '')));
  await vineStrip(ctx, w, season);
  await corners(ctx, w, h, season);

  const py = 11, ph = h - py - 8, pw = (w - 16) / 2;
  const L = 6, R = L + pw + 4;
  card(ctx, L, py, pw, ph, T, 3.5);
  card(ctx, R, py, pw, ph, T, 3.5);

  // sol panel: tarih, küre, duygular
  text(ctx, WEEKDAYS[(d.getDay() + 6) % 7], L + 5, py + 7.5, { font: '700 4px Caveat', color: T.accent });
  text(ctx, `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, L + 5, py + 13.5, { font: '600 5px Fraunces', color: T.text });
  if (entry.core) goldPill(ctx, 'Core Memory', L + pw - 4, py + 6.2);

  const ox = L + pw / 2, oy = py + 31, r = 10.5;
  pedestal(ctx, ox, oy + r + 2.4, 23, T);
  drawOrb(ctx, ox, oy, r, entry.emotions, { core: entry.core, rot: rotOf(date), T });

  const em = emoList(entry.emotions);
  const sum = em.reduce((a, [, v]) => a + v, 0) || 1;
  const shown = em.slice(0, 4);
  const iw = 15, startX = ox - (shown.length * iw) / 2, ey = py + 50;
  for (let i = 0; i < shown.length; i++) {
    const [id, v] = shown[i];
    const cx = startX + i * iw + iw / 2;
    await character(ctx, id, cx - 3.6, ey, 7.2);
    text(ctx, EMO[id].label, cx, ey + 10.4, { font: '800 2.1px Nunito', color: T.text, align: 'center' });
    text(ctx, '%' + Math.round(v / sum * 100), cx, ey + 13.2, { font: '700 1.9px Nunito', color: T.muted, align: 'center' });
  }
  const barY = py + ph - 9;
  text(ctx, 'Oranlar', L + 5, barY - 1.6, { font: '600 2.6px Fraunces', color: T.text });
  if (em.length > 4) text(ctx, `+${em.length - 4} duygu daha`, L + pw - 5, barY - 1.6, { font: '700 1.9px Nunito', color: T.muted, align: 'right' });
  colorBar(ctx, L + 5, barY, pw - 10, 2.2, em.map(([id, v]) => ({ id, share: v / sum })));

  // sağ panel: fotoğraf ve günlük
  let noteTop = py + 9;
  if (photoSrc) {
    const fw = 40, fh = 39, fx = R + (pw - fw) / 2, fy = py + 4;
    ctx.save();
    ctx.translate(fx + fw / 2, fy + fh / 2); ctx.rotate(-2.5 * Math.PI / 180); ctx.translate(-(fx + fw / 2), -(fy + fh / 2));
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 1.4 * ctx.px; ctx.shadowOffsetY = .5 * ctx.px;
    ctx.fillStyle = '#FFFDF8'; ctx.fillRect(fx, fy, fw, fh);
    ctx.shadowColor = 'transparent';
    await photo(ctx, photoSrc, fx + 2, fy + 2, fw - 4, (fw - 4) * .75);
    ctx.fillStyle = 'rgba(255,170,200,0.55)'; ctx.fillRect(fx + fw / 2 - 7, fy - 1.5, 14, 3.2);
    if (entry.caption) {
      const cap = clampLines(ctx, wrap(ctx, entry.caption, fw - 4, '700 3.2px Caveat'), 1, fw - 4);
      text(ctx, cap[0], fx + fw / 2, fy + fh - 2.4, { font: '700 3.2px Caveat', color: '#3A2649', align: 'center' });
    }
    ctx.restore();
    noteTop = fy + fh + 7;
  }
  text(ctx, 'Günlük', R + 5, noteTop - 1, { font: '600 3.2px Fraunces', color: T.text });
  const step = 4.6, nx = R + 5, nw = pw - 10, bottom = py + ph - 3.5;
  linedArea(ctx, nx, noteTop, nw, bottom - noteTop, step, T);
  if (entry.note) {
    const font = '700 3.6px Caveat';
    const maxLines = Math.max(1, Math.floor((bottom - noteTop) / step));
    const lines = clampLines(ctx, wrap(ctx, entry.note, nw - 1, font), maxLines, nw - 1);
    lines.forEach((ln, i) => text(ctx, ln, nx + .5, noteTop + step * (i + 1) - .9, { font, color: T.ink }));
  }
  footer(ctx, w, h, T, `Anı Küreleri · ${profile.name}`);
  return c;
}

// ---------- aylık özet (A5) ----------

export async function renderMonth({ year, month, entries, profile, theme = 'light', photoSrc = {}, scale = 1 }) {
  await fontsReady();
  const T = THEMES[theme];
  const { c, ctx, w, h } = canvasFor('a5', scale);
  const mi = month - 1;
  const season = SEASON_OF_MONTH[mi];
  const byDate = Object.fromEntries(entries.map(e => [e.date, e]));
  background(ctx, w, h, theme, year * 100 + month);
  await vineStrip(ctx, w, season);
  await corners(ctx, w, h, season);

  // başlık
  ctx.save();
  ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
  ctx.strokeStyle = T.accent; ctx.lineWidth = .35;
  ctx.shadowColor = 'rgba(255,200,110,0.45)'; ctx.shadowBlur = 2 * ctx.px;
  ctx.beginPath(); ctx.arc(19, 25, 8.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  const icon = await loadImg(artURL('m' + month));
  if (icon) ctx.drawImage(icon, 13, 19, 12, 12);
  text(ctx, `${MONTHS[mi]} ${year}`, 31, 25.5, { font: '600 8.4px Fraunces', color: T.text });
  const photos = entries.filter(e => e.photo).length, cores = entries.filter(e => e.core);
  text(ctx, `${entries.length} küre · ${photos} fotoğraf · ${cores.length} core memory`, 31, 31.5, { font: '700 2.8px Nunito', color: T.muted });
  text(ctx, profile.name, w - 10, 31.5, { font: '700 4px Caveat', color: T.accent, align: 'right' });

  // takvim
  const gx = 10, gw = w - 20, cw = gw / 7, ch = 13;
  let y = 41;
  WEEK_SHORT.forEach((wd, i) => text(ctx, wd.toLocaleUpperCase('tr'), gx + cw * i + cw / 2, y, { font: '800 2.2px Nunito', color: T.muted, align: 'center' }));
  y += 2.5;
  const lead = (new Date(year, mi, 1).getDay() + 6) % 7;
  const n = new Date(year, month, 0).getDate();
  const rows = Math.ceil((lead + n) / 7);
  for (let dd = 1; dd <= n; dd++) {
    const idx = lead + dd - 1, col = idx % 7, row = Math.floor(idx / 7);
    const x0 = gx + col * cw + .6, y0 = y + row * ch + .6;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    const e = byDate[date];
    card(ctx, x0, y0, cw - 1.2, ch - 1.2, T, 2);
    if (e && e.core) { ctx.save(); ctx.strokeStyle = '#E8B954'; ctx.lineWidth = .35; rrect(ctx, x0, y0, cw - 1.2, ch - 1.2, 2); ctx.stroke(); ctx.restore(); }
    text(ctx, String(dd), x0 + 1.4, y0 + 3, { font: '600 2.3px Fraunces', color: T.text });
    drawOrb(ctx, x0 + (cw - 1.2) / 2, y0 + (ch - 1.2) / 2 + 1.1, 3.9, e ? e.emotions : null, { core: e && e.core, rot: rotOf(date), T });
    if (e && e.photo) { ctx.fillStyle = T.accent; ctx.beginPath(); ctx.arc(x0 + cw - 3.2, y0 + ch - 3.2, .55, 0, Math.PI * 2); ctx.fill(); }
  }
  y += rows * ch + 5;

  // ayın duyguları
  text(ctx, 'Ayın duyguları', gx, y + 3, { font: '600 4.2px Fraunces', color: T.text });
  const tl = totalsOf(entries);
  colorBar(ctx, gx, y + 6, gw, 2.6, tl);
  const top4 = tl.slice(0, 4);
  for (let i = 0; i < top4.length; i++) {
    const cx = gx + i * (gw / 4);
    await character(ctx, top4[i].id, cx, y + 11, 8);
    text(ctx, EMO[top4[i].id].label, cx + 9.5, y + 15.4, { font: '800 2.6px Nunito', color: T.text });
    text(ctx, '%' + Math.round(top4[i].share * 100), cx + 9.5, y + 18.8, { font: '700 2.4px Nunito', color: T.muted });
  }
  if (!top4.length) text(ctx, 'Bu ay henüz küre yok.', gx, y + 15, { font: '700 2.6px Nunito', color: T.muted });
  y += 26;

  // core anlar
  text(ctx, 'Core anlar', gx, y + 3, { font: '600 4.2px Fraunces', color: T.text });
  y += 6;
  const avail = h - 10 - y;
  if (!cores.length) {
    text(ctx, 'Bu ay core memory işaretlenmedi.', gx, y + 5, { font: '700 2.6px Nunito', color: T.muted });
  } else {
    const shownCores = cores.slice(0, 3);
    const cwid = (gw - 2 * 3) / 3;
    for (let i = 0; i < shownCores.length; i++) {
      const e = shownCores[i];
      const x0 = gx + i * (cwid + 3), y0 = y, hh = Math.min(avail, 46);
      card(ctx, x0, y0, cwid, hh, T, 3);
      const src = photoSrc[e.date];
      if (src) await photo(ctx, src, x0 + 2.5, y0 + 2.5, cwid - 5, 17);
      else drawOrb(ctx, x0 + cwid / 2, y0 + 11, 7, e.emotions, { core: true, rot: rotOf(e.date), T });
      if (src) drawOrb(ctx, x0 + cwid - 5, y0 + 18.5, 3, e.emotions, { core: true, rot: rotOf(e.date), T });
      text(ctx, shortDate(e.date), x0 + 2.8, y0 + 24, { font: '800 2.5px Nunito', color: T.accent });
      const body = e.caption && e.note ? `${e.caption}. ${e.note}` : (e.note || e.caption || '');
      const lines = clampLines(ctx, wrap(ctx, body, cwid - 5, '700 3.3px Caveat'), Math.max(1, Math.floor((hh - 27) / 3.9)), cwid - 5);
      lines.forEach((ln, k) => text(ctx, ln, x0 + 2.8, y0 + 28.5 + k * 3.9, { font: '700 3.3px Caveat', color: T.ink }));
    }
    if (cores.length > 3) text(ctx, `+${cores.length - 3} core memory daha`, w - 10, y - 3, { font: '700 2.2px Nunito', color: T.muted, align: 'right' });
  }
  footer(ctx, w, h, T, `Anı Küreleri · ${MONTHS[mi]} ${year}`);
  return c;
}

// ---------- yıllık arşiv (A5) ----------

export async function renderYear({ year, entries, profile, theme = 'light', today, scale = 1 }) {
  await fontsReady();
  const T = THEMES[theme];
  const { c, ctx, w, h } = canvasFor('a5', scale);
  const byDate = Object.fromEntries(entries.map(e => [e.date, e]));
  background(ctx, w, h, theme, year);
  await vineStrip(ctx, w, 'spring');
  await corners(ctx, w, h, 'autumn');

  text(ctx, 'Anı arşivi', 10, 17, { font: '700 5px Caveat', color: T.accent });
  text(ctx, String(year), 10, 28, { font: '600 11px Fraunces', color: T.text });
  const photos = entries.filter(e => e.photo).length, cores = entries.filter(e => e.core).sort((a, b) => a.date.localeCompare(b.date));
  text(ctx, `${entries.length} küre · ${photos} fotoğraf · ${cores.length} core memory`, 10, 33.5, { font: '700 2.8px Nunito', color: T.muted });
  text(ctx, profile.name, w - 10, 28, { font: '700 5px Caveat', color: T.accent, align: 'right' });

  // kuleler
  const tw = 29, gap = (w - 20 - 4 * tw) / 3, capY = 42, COLS = 8;
  const colW = (tw - 6) / COLS, rowH = 4.5, monthGap = 1.4;
  for (let t = 0; t < 4; t++) {
    const x = 10 + t * (tw + gap);
    const bodyTop = capY + 1.5, bodyH = 12 * rowH + 2 * monthGap + 4;
    // gövde
    const bg = ctx.createLinearGradient(x, 0, x + tw, 0);
    bg.addColorStop(0, T.towerEdge); bg.addColorStop(.5, T.towerMid); bg.addColorStop(1, T.towerEdge);
    ctx.save();
    ctx.shadowColor = 'rgba(10,0,30,0.35)'; ctx.shadowBlur = 2 * ctx.px; ctx.shadowOffsetY = 1 * ctx.px;
    ctx.fillStyle = bg; ctx.fillRect(x, bodyTop, tw, bodyH);
    ctx.restore();
    ctx.fillStyle = T.towerSide; ctx.fillRect(x - .5, bodyTop, .9, bodyH); ctx.fillRect(x + tw - .4, bodyTop, .9, bodyH);
    // kapak
    const cap = ctx.createLinearGradient(0, capY - 2.2, 0, capY + 2.2);
    cap.addColorStop(0, T.cap1); cap.addColorStop(1, T.cap2);
    ctx.fillStyle = cap; ctx.beginPath(); ctx.ellipse(x + tw / 2, capY, tw / 2 + .5, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.font = '800 1.6px Nunito';
    const label = `${SHORT[t * 3]} – ${SHORT[t * 3 + 2]}`;
    const lw = ctx.measureText(label).width + 2.4;
    ctx.fillStyle = '#E6B866'; rrect(ctx, x + tw / 2 - lw / 2, capY - 1.1, lw, 2.2, 1.1); ctx.fill();
    text(ctx, label, x + tw / 2, capY + .55, { font: '800 1.6px Nunito', color: T.tagText, align: 'center' });
    // aylar
    let ry = bodyTop + 3;
    for (let k = 0; k < 3; k++) {
      const mi = t * 3 + k;
      const n = new Date(year, mi + 1, 0).getDate();
      ctx.save();
      ctx.translate(x + 1.9, ry + 2 * rowH); ctx.rotate(-Math.PI / 2);
      text(ctx, SHORT[mi], 0, .6, { font: '800 1.5px Nunito', color: T.accent, align: 'center' });
      ctx.restore();
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < COLS; col++) {
          const dd = row * COLS + col + 1;
          if (dd > n) continue;
          const date = `${year}-${String(mi + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
          const e = byDate[date];
          const f = .72 + .28 * Math.sin(Math.PI * (col + .5) / COLS);
          const rr = (e && e.core ? 1.45 : 1.18) * f;
          drawOrb(ctx, x + 4 + colW * (col + .5), ry + rowH * row + rowH - rr - .5, rr, e ? e.emotions : null, { core: e && e.core, rot: rotOf(date), T, mode: today && date > today ? 'future' : 'fill' });
        }
        const railY = ry + rowH * row + rowH - .2;
        const rg = ctx.createLinearGradient(x, 0, x + tw, 0);
        rg.addColorStop(0, T.railEdge); rg.addColorStop(.5, T.rail); rg.addColorStop(1, T.railEdge);
        ctx.fillStyle = rg; ctx.fillRect(x + 2.6, railY, tw - 4, .45);
      }
      ry += 4 * rowH + monthGap;
    }
    // kaide
    const pl = ctx.createLinearGradient(0, bodyTop + bodyH, 0, bodyTop + bodyH + 2.6);
    pl.addColorStop(0, T.cap2); pl.addColorStop(1, T.towerSide);
    ctx.fillStyle = pl; rrect(ctx, x - 1.5, bodyTop + bodyH - .3, tw + 3, 2.8, 1.2); ctx.fill();
  }

  // core memories kürsüsü
  let y = 120;
  text(ctx, 'Core Memories', w / 2, y, { font: '600 4.6px Fraunces', color: T.text, align: 'center' });
  const tray = { x: 16, w: w - 32, y: y + 9 };
  const trayG = ctx.createLinearGradient(0, tray.y - 2, 0, tray.y + 2);
  trayG.addColorStop(0, T.tray1); trayG.addColorStop(1, T.tray2);
  ctx.fillStyle = trayG; ctx.beginPath(); ctx.ellipse(w / 2, tray.y, tray.w / 2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  const shownCores = cores.slice(0, 10);
  const slot = tray.w / Math.max(shownCores.length, 3);
  if (shownCores.length) shownCores.forEach((e, i) => {
    const cx = tray.x + slot * (i + .5);
    drawOrb(ctx, cx, tray.y - 1.2, Math.min(3.6, slot * .32), e.emotions, { core: true, rot: rotOf(e.date), T });
  });
  else [0, 1, 2].forEach(i => drawOrb(ctx, tray.x + slot * (i + .5), tray.y - 1.2, 3.6, null, { T, mode: 'future' }));
  const front = ctx.createLinearGradient(0, tray.y, 0, tray.y + 4);
  front.addColorStop(0, theme === 'dark' ? 'rgba(196,170,255,0.6)' : 'rgba(239,230,255,0.85)'); front.addColorStop(1, T.tray2);
  ctx.fillStyle = front;
  ctx.beginPath(); ctx.moveTo(tray.x, tray.y); ctx.lineTo(tray.x + tray.w, tray.y);
  ctx.quadraticCurveTo(tray.x + tray.w, tray.y + 4.5, w / 2, tray.y + 4.5); ctx.quadraticCurveTo(tray.x, tray.y + 4.5, tray.x, tray.y); ctx.fill();
  shownCores.forEach((e, i) => text(ctx, shortDate(e.date), tray.x + slot * (i + .5), tray.y + 8.6, { font: '700 2.8px Caveat', color: T.muted, align: 'center' }));
  if (!shownCores.length) text(ctx, 'sıradaki core memory’ler burada parlayacak', w / 2, tray.y + 8.6, { font: '700 3px Caveat', color: T.muted, align: 'center' });

  // yılın renkleri
  y = 147;
  text(ctx, `${year}'in renkleri`, 10, y, { font: '600 4.2px Fraunces', color: T.text });
  const tl = totalsOf(entries);
  colorBar(ctx, 10, y + 3, w - 20, 2.8, tl);
  const legend = tl.slice(0, 8);
  for (let i = 0; i < legend.length; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const lx = 10 + col * ((w - 20) / 4), ly = y + 9 + row * 10;
    await character(ctx, legend[i].id, lx, ly, 6.6);
    text(ctx, EMO[legend[i].id].label, lx + 7.8, ly + 3.4, { font: '800 2.3px Nunito', color: T.text });
    text(ctx, '%' + Math.round(legend[i].share * 100), lx + 7.8, ly + 6.2, { font: '700 2.1px Nunito', color: T.muted });
  }
  if (!legend.length) text(ctx, 'Küreler biriktikçe yılın renkleri burada belirecek.', 10, y + 12, { font: '700 2.6px Nunito', color: T.muted });

  // core notları
  y = 183;
  const notes = cores.filter(e => e.caption || e.note).slice(0, 6);
  if (notes.length) {
    text(ctx, 'Yılın parlak anları', 10, y, { font: '600 3.6px Fraunces', color: T.text });
    notes.forEach((e, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const nx = 10 + col * ((w - 20) / 2), ny = y + 5 + row * 5;
      const label = `${shortDate(e.date)} — ${e.caption || e.note}`;
      const ln = clampLines(ctx, wrap(ctx, label, (w - 20) / 2 - 3, '700 3.2px Caveat'), 1, (w - 20) / 2 - 3);
      text(ctx, ln[0], nx, ny, { font: '700 3.2px Caveat', color: T.ink });
    });
  }
  footer(ctx, w, h, T, `Anı Küreleri · ${year}`);
  return c;
}

// ---------- çıktı ----------

let jspdfLoading = null;
function loadJsPDF() {
  if (window.jspdf) return Promise.resolve(window.jspdf);
  if (!jspdfLoading) jspdfLoading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => res(window.jspdf);
    s.onerror = () => { jspdfLoading = null; rej(new Error('PDF aracı yüklenemedi. İnternet bağlantını kontrol et.')); };
    document.head.append(s);
  });
  return jspdfLoading;
}

export async function toPDF(canvas, fmt) {
  const { jsPDF } = await loadJsPDF();
  const [w, h] = SIZES[fmt];
  const pdf = new jsPDF({ unit: 'mm', format: fmt === 'a6l' ? 'a6' : fmt, orientation: w > h ? 'landscape' : 'portrait', compress: true });
  pdf.addImage(canvas.toDataURL('image/jpeg', .93), 'JPEG', 0, 0, w, h, undefined, 'FAST');
  return pdf.output('blob');
}

export function toPNG(canvas) {
  return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('Resim oluşturulamadı')), 'image/png'));
}

export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
