# Anı Küreleri

Her gün bir küre, her küre bir anı. Günün duygularını oranlarıyla seçip bir küreyi boyadığın, not ve fotoğraf eklediğin küçük, masalsı bir günlük.

- **Yıl, ay ve gün görünümleri.** Yıl rafları, takvim ve açık bir günlük sayfası.
- **On beş duygu karakteri ve kendi duyguların.** Birden fazla duygu seçip oranlarını ayarlayabilirsin. İstediğin kadar yeni duygu (isim, renk, yüz) ekleyebilirsin.
- **Core Memory.** Özel günler altın halkayla parlar ve ayrı bir rafta toplanır.
- **Not ve fotoğraf.** Fotoğraflar yüklenirken küçültülür.
- **Dolu bir yıl örneği.** Giriş ekranından ya da menüden, gerçek veriye dokunmadan 365 küresi dolu bir yılı gezebilirsin.
- **Birden fazla hesap ve "Birlikte" görünümü.** Her hesap kendi hayvan avatarını seçer. Aynı ayı yan yana görebilirsiniz.

Uygulama bu repodan GitHub Pages ile yayınlanır. Veriler (küreler, notlar, fotoğraflar) **ayrı ve gizli bir repoda** durur. Uygulama o repoya, senin oluşturduğun bir anahtarla doğrudan tarayıcıdan yazar. Sunucu, veritabanı ya da hesap ücreti yoktur.

## Kurulum (bir kez)

### 1. Gizli veri reposu
GitHub'da yeni bir repo aç: `ani-kureleri-veri`. **Private** seç ve "Add a README file" kutusunu işaretle.

### 2. Anahtar (fine-grained token)
1. GitHub › Settings › Developer settings › Personal access tokens › **Fine-grained tokens** › Generate new token
2. **Expiration:** istediğin süre (dolunca yenisini girmen yeterli)
3. **Repository access:** *Only select repositories* › `ani-kureleri-veri`
4. **Permissions › Repository permissions › Contents:** *Read and write*
5. Oluşan `github_pat_…` anahtarını kopyala.

Bu anahtar yalnızca veri reposuna erişebilir. Uygulamanın kodu bu açık repoda olsa da anahtar kodda durmaz, sadece senin tarayıcında saklanır.

### 3. GitHub Pages
Bu repoda: Settings › Pages › *Build and deployment* › Source: **Deploy from a branch** › Branch: `main` / `(root)` › Save.

Bir iki dakika sonra uygulama `https://koloboros.github.io/DuyguMoodTracker/` adresinde açılır.

### 4. İlk giriş
Adresi aç, anahtarı ve veri reposunu (`koloboros/ani-kureleri-veri`) gir, sonra hesabını oluştur. Telefonda da aynı adımları bir kez yapman yeterli. Telefonda tarayıcının "Ana ekrana ekle" seçeneğiyle uygulama gibi açabilirsin.

## Yeni hesap
Sağ üstteki hesap menüsünden **Yeni hesap oluştur**. Aynı anahtarla girilir, bir isim ve hayvan seçilir. İki hesap olunca Ay görünümünde **Birlikte** seçeneği belirir.

## Veri düzeni (gizli repoda)
```
profiles.json                       hesaplar
entries/<hesap>/<yıl>.json          günlük küreler, notlar
photos/<hesap>/<tarih>-<kod>.jpg    fotoğraflar
```
Her şey düz JSON ve JPEG. İstediğin zaman indirip yedekleyebilirsin.

## Geliştirme
Derleme adımı yok: `index.html`, `css/style.css`, `js/*.js`. Yerelde denemek için klasörde `python3 -m http.server` çalıştırıp `http://localhost:8000` adresini aç.
