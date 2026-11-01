// Veri katmanı: GitHub Contents API ile repodaki ayrı bir veri dalında ("veri") saklanır.
// Veriler sitenin yayınlandığı main dalından ayrı durur, böylece her kayıt siteyi yeniden derletmez.
//
// profiles.json                      → { profiles: [{ id, name, animal, createdAt }] }
// entries/<profilId>/<yıl>.json      → { "2026-11-12": { emotions, note, core, photo, caption, updatedAt } }
// photos/<profilId>/<tarih>-<ts>.jpg → küçültülmüş fotoğraflar

const API = 'https://api.github.com';
export const DATA_BRANCH = 'veri';

function b64encodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64decodeUtf8(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
const encPath = p => p.split('/').map(encodeURIComponent).join('/');

export class GitHubError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export class Repo {
  constructor(token, repo, branch = DATA_BRANCH) {
    this.token = token;
    this.repo = repo;
    this.branch = branch;
  }

  async req(path, { method = 'GET', body, accept } = {}) {
    const headers = {
      Authorization: `Bearer ${this.token}`,
      Accept: accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (body) headers['Content-Type'] = 'application/json';
    let res;
    try {
      res = await fetch(`${API}/repos/${this.repo}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    } catch (e) {
      throw new GitHubError('GitHub\'a ulaşılamadı. İnternet bağlantını kontrol et.', 0);
    }
    return res;
  }

  async check() {
    const res = await this.req('');
    if (res.status === 401) throw new GitHubError('Anahtar geçersiz ya da süresi dolmuş.', 401);
    if (res.status === 404) throw new GitHubError('Repo bulunamadı ya da bu anahtarın o repoya erişimi yok.', 404);
    if (!res.ok) throw new GitHubError('GitHub beklenmedik bir yanıt verdi (' + res.status + ').', res.status);
    const info = await res.json();
    if (info.permissions && !info.permissions.push) throw new GitHubError('Bu anahtar repoyu okuyabiliyor ama yazamıyor. Contents iznini "Read and write" yap.', 403);
    await this.ensureBranch(info.default_branch || 'main');
    return info;
  }

  // Veri dalı yoksa varsayılan daldan oluşturur
  async ensureBranch(base) {
    const b = await this.req(`/branches/${encodeURIComponent(this.branch)}`);
    if (b.ok) return;
    if (b.status !== 404) throw new GitHubError('Veri dalı kontrol edilemedi (' + b.status + ').', b.status);
    const ref = await this.req(`/git/ref/heads/${encodeURIComponent(base)}`);
    if (!ref.ok) throw new GitHubError('Repoda henüz hiç commit yok; önce bir README ekle.', ref.status);
    const { object } = await ref.json();
    const res = await this.req('/git/refs', { method: 'POST', body: { ref: `refs/heads/${this.branch}`, sha: object.sha } });
    if (!res.ok && res.status !== 422) throw new GitHubError('Veri dalı oluşturulamadı (' + res.status + ').', res.status);
  }

  async getJSON(path) {
    const res = await this.req(`/contents/${encPath(path)}?ref=${encodeURIComponent(this.branch)}`);
    if (res.status === 404) return { data: null, sha: null };
    if (!res.ok) throw new GitHubError('Veri okunamadı (' + res.status + ').', res.status);
    const j = await res.json();
    return { data: JSON.parse(b64decodeUtf8(j.content)), sha: j.sha };
  }

  async putRaw(path, b64, sha, message) {
    const body = { message, content: b64, branch: this.branch };
    if (sha) body.sha = sha;
    const res = await this.req(`/contents/${encPath(path)}`, { method: 'PUT', body });
    if (res.status === 409 || res.status === 422) throw new GitHubError('conflict', 409);
    if (!res.ok) throw new GitHubError('Kaydedilemedi (' + res.status + ').', res.status);
    const j = await res.json();
    return j.content.sha;
  }

  putJSON(path, data, sha, message) {
    return this.putRaw(path, b64encodeUtf8(JSON.stringify(data, null, 1) + '\n'), sha, message);
  }

  async getBlob(path) {
    const res = await this.req(`/contents/${encPath(path)}?ref=${encodeURIComponent(this.branch)}`, { accept: 'application/vnd.github.raw' });
    if (!res.ok) throw new GitHubError('Fotoğraf yüklenemedi (' + res.status + ').', res.status);
    return res.blob();
  }

  async remove(path, message) {
    const meta = await this.req(`/contents/${encPath(path)}?ref=${encodeURIComponent(this.branch)}`);
    if (!meta.ok) return;
    const { sha } = await meta.json();
    await this.req(`/contents/${encPath(path)}`, { method: 'DELETE', body: { message, sha, branch: this.branch } });
  }
}

// Okuma-değiştirme-yazma; başka bir cihaz arada yazdıysa bir kez taze veriyle yeniden dener.
async function update(repo, path, mutate, message) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, sha } = await repo.getJSON(path);
    const next = mutate(data);
    try {
      const newSha = await repo.putJSON(path, next, sha, message);
      return { data: next, sha: newSha };
    } catch (e) {
      if (e.status === 409 && attempt < 2) continue;
      throw e;
    }
  }
}

export class Store {
  constructor(repo) {
    this.repo = repo;
    this.profiles = [];
    this.years = new Map();   // "pid|yıl" → { data }
    this.photos = new Map();  // yol → objectURL
  }

  async loadProfiles() {
    const { data } = await this.repo.getJSON('profiles.json');
    this.profiles = (data && data.profiles) || [];
    return this.profiles;
  }

  async addProfile({ name, animal }) {
    const base = name.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'profil';
    const id = base + '-' + Math.random().toString(36).slice(2, 6);
    const profile = { id, name: name.trim(), animal, createdAt: new Date().toISOString() };
    const { data } = await update(this.repo, 'profiles.json', d => {
      const list = (d && d.profiles) || [];
      return { profiles: [...list, profile] };
    }, `Yeni hesap: ${profile.name}`);
    this.profiles = data.profiles;
    return profile;
  }

  async updateProfile(id, patch) {
    const { data } = await update(this.repo, 'profiles.json', d => ({
      profiles: ((d && d.profiles) || []).map(p => p.id === id ? { ...p, ...patch } : p)
    }), 'Hesap güncellendi');
    this.profiles = data.profiles;
  }

  async loadYear(pid, year, { force = false } = {}) {
    const key = pid + '|' + year;
    if (!force && this.years.has(key)) return this.years.get(key);
    const { data } = await this.repo.getJSON(`entries/${pid}/${year}.json`);
    const val = data || {};
    this.years.set(key, val);
    return val;
  }

  cachedYear(pid, year) {
    return this.years.get(pid + '|' + year);
  }

  async saveDay(pid, date, entry) {
    const year = date.slice(0, 4);
    const { data } = await update(this.repo, `entries/${pid}/${year}.json`, d => {
      const next = { ...(d || {}) };
      if (entry) next[date] = { ...entry, updatedAt: new Date().toISOString() };
      else delete next[date];
      return next;
    }, `${date} küresi`);
    this.years.set(pid + '|' + year, data);
    return data;
  }

  async uploadPhoto(pid, date, blob) {
    const b64 = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result).split(',')[1]);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    const path = `photos/${pid}/${date}-${Date.now().toString(36)}.jpg`;
    await this.repo.putRaw(path, b64, null, `${date} fotoğrafı`);
    this.photos.set(path, URL.createObjectURL(blob));
    return path;
  }

  async deletePhoto(path) {
    try { await this.repo.remove(path, 'Fotoğraf kaldırıldı'); } catch (e) { /* dosya zaten yoksa sorun değil */ }
    this.photos.delete(path);
  }

  async photoURL(path) {
    if (this.photos.has(path)) return this.photos.get(path);
    const blob = await this.repo.getBlob(path);
    const url = URL.createObjectURL(blob);
    this.photos.set(path, url);
    return url;
  }
}

// Fotoğrafı en uzun kenarı 1280 px olacak şekilde küçültüp JPEG'e çevirir (~150–350 KB).
export async function shrinkPhoto(file, max = 1280, quality = 0.82) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  cv.getContext('2d').drawImage(bmp, 0, 0, w, h);
  bmp.close && bmp.close();
  return new Promise((resolve, reject) => cv.toBlob(b => b ? resolve(b) : reject(new Error('Fotoğraf işlenemedi')), 'image/jpeg', quality));
}
