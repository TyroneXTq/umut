# Render Deployment Checklist ✅

## Hazırlık (Local)
- [ ] `npm install` çalıştırıldı
- [ ] `npm start` ile local test edildi (http://localhost:3000)
- [ ] Admin paneli çalışıyor (http://localhost:3000/yonetim)
- [ ] `.env.example` dosyası kontrol edildi
- [ ] `.gitignore` data.db ve uploads'u hariç tutuyor

## GitHub'a Push
- [ ] `git add .` 
- [ ] `git commit -m "Render deployment ready"`
- [ ] `git push origin main`
- [ ] GitHub'da tüm dosyalar görünüyor (data.db YOK, uploads/.gitkeep VAR)

## Render Ayarları
- [ ] Render hesabı oluşturdu
- [ ] GitHub ile bağlantı kurdu
- [ ] Depo için Web Service oluşturdu
- [ ] Build/Start commands doğru:
  - Build: `npm install`
  - Start: `npm start`

## Environment Variables
- [ ] `ADMIN_KEY` ayarlandı (Render dashboard'da)
  - ⚠️ Varsayılan "devadmin123" KULLANMA!
  - Güçlü bir şey kullan: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`

## Kontrol
- [ ] Render logs'ta başlatma hatası yok
- [ ] https://your-service.onrender.com açılıyor
- [ ] Ana sayfa yükleniyor
- [ ] `/api/health` çalışıyor
- [ ] Admin paneli açılıyor ve login çalışıyor

## Domain Bağlantısı
- [ ] Custom domain eklendi (Render'da)
- [ ] DNS kayıtları güncellendi
- [ ] Domain üzerinden erişim kontrol edildi (5-10 dakika bekle)

## Sonrasında
- [ ] İçerik ekle (ürünler, fotoğraflar)
- [ ] Bir backup stratejisi belirle (SQLite dosyası kalıcı değil!)
- [ ] E-mail bildirimleri ayarla (isteğe bağlı)

## Render Free Plan Sınırlamalar
⚠️ Bilmen gerekenler:
- Sunucu 15 dakika inaktiviteden sonra uyuyor (ilk istek 30 saniye bekler)
- Bağlı depolama yok (yüklenen fotoğraflar silinebilir)
- Aylık 750 saatlik çalışma süreleri
- Başta veya küçük projeler için yeterli

## Gelişmiş Dağıtım (İlerde)
- [ ] Kalıcı depolama: AWS S3, Cloudinary, etc.
- [ ] Database: PostgreSQL (SQLite yerine)
- [ ] CDN: CloudFlare
- [ ] Monitoring: Sentry, New Relic
