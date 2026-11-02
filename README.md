# Anı Küreleri

Her gün bir küre, her küre bir anı. Günün duygularını oranlarıyla seçip bir küreyi boyadığın, not ve fotoğraf eklediğin küçük, masalsı bir günlük.

- **Anı arşivi.** Bütün yıl tek ekranda: 365 cam küre, mevsim mevsim dört arşiv kulesinde. Ay takvimi ve günlük sayfası da aynı gece temasında.
- **On beş duygu karakteri ve kendi duyguların.** Birden fazla duygu seçip oranlarını ayarlayabilirsin. İstediğin kadar yeni duygu (isim, renk, yüz) ekleyebilirsin.
- **Core Memory.** Özel günler altın halkayla parlar ve ayrı bir rafta toplanır.
- **Not ve fotoğraf.** Fotoğraflar yüklenirken küçültülür.
- **Basılabilir sayfalar.** Günlük sayfa A6 (A5'in yarısı), ay özeti ve yıl arşivi A5 olarak PDF ya da PNG indirilebilir. Açık (baskı dostu) ya da koyu renk seçilebilir.
- **Dolu bir yıl örneği.** Hesap menüsünden, gerçek veriye dokunmadan 365 küresi dolu bir yılı gezebilirsin.
- **Birden fazla hesap ve "Birlikte" görünümü.** Her hesap kendi hayvan avatarını seçer. Aynı ayı yan yana görebilirsiniz.

Uygulama bu repodan GitHub Pages ile yayınlanır. Veriler (küreler, notlar, fotoğraflar) **aynı repoda, ayrı bir `veri` dalında** durur. Böylece her kayıt siteyi yeniden derletmez. Uygulama bu dala, senin oluşturduğun bir anahtarla doğrudan tarayıcıdan yazar. Sunucu, veritabanı ya da hesap ücreti yoktur.

> **Gizlilik:** Repo herkese açık (public) olduğu sürece `veri` dalındaki notlar ve fotoğraflar da herkese açıktır. Repoyu adını bilen herkes görebilir. Gizli tutmak istersen ya repoyu private yapıp GitHub Pro ile Pages'i kullan.

## Kurulum (bir kez)

### 1. Anahtar (fine-grained token)
1. GitHub › Settings › Developer settings › Personal access tokens › **Fine-grained tokens** › Generate new token
2. **Repository access:** *Only select repositories* › `DuyguMoodTracker`
3. **Permissions › Repository permissions › Contents:** *Read and write*
4. Oluşan `github_pat_…` anahtarını kopyala. Anahtar kodda durmaz, sadece senin tarayıcında saklanır.

### 2. GitHub Pages
Settings › Pages › Deploy from a branch › `main` / `(root)`. Uygulama `https://koloboros.github.io/DuyguMoodTracker/` adresinde açılır.

### 3. İlk giriş
Adresi aç, anahtarı gir ve hesabını oluştur. Uygulama verilerin hangi repoda olduğunu adresten kendisi anlar. `veri` dalı yoksa uygulama onu kendisi açar. Telefonda tarayıcının "Ana ekrana ekle" seçeneğiyle uygulama gibi açabilirsin.

## Yeni hesap
Sağ üstteki hesap menüsünden **Yeni hesap oluştur**. Aynı anahtarla girilir, bir isim ve hayvan seçilir. İki hesap olunca Ay görünümünde **Birlikte** seçeneği belirir.

## Veri düzeni (`veri` dalında)
```
profiles.json                       hesaplar
entries/<hesap>/<yıl>.json          günlük küreler, notlar
photos/<hesap>/<tarih>-<kod>.jpg    fotoğraflar
```
Her şey düz JSON ve JPEG. İstediğin zaman indirip yedekleyebilirsin.

## Geliştirme
Derleme adımı yok: `index.html`, `css/style.css`, `js/*.js`. Yerelde denemek için klasörde `python3 -m http.server` çalıştırıp `http://localhost:8000` adresini aç.
