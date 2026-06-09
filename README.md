# Yildiz Deva - Cam Balkon Sistemleri

Yildiz Deva Cam Balkon Sistemleri için modern web uygulaması.

## Özellikler

- 📱 Responsive web tasarımı
- 🖼️ Galeri yönetim sistemi
- 💰 Fiyat hesaplayıcı
- 🔐 Admin panel ile içerik yönetimi
- 📸 Fotoğraf yükleme
- 🗄️ SQLite veritabanı

## Kurulum (Local)

### Gereksinimler
- Node.js 14+
- npm veya yarn

### Adımlar

1. Depoyu klonlayın:
```bash
git clone https://github.com/yourusername/yildizdeva.git
cd yildizdeva/umut
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

4. Tarayıcınızda açın:
- Ana sayfa: http://localhost:3000
- Admin paneli: http://localhost:3000/yonetim

## Admin Paneline Giriş

Varsayılan admin anahtarı: `devadmin123`

> ⚠️ **ÖNEMLİ**: Üretim ortamında bunu **MUTLAKA** değiştirin!

## Render'da Dağıtım

### 1. GitHub'a Yükleyin

```bash
git add .
git commit -m "Render deployment ready"
git push origin main
```

### 2. Render Hesabı Oluşturun

1. https://render.com adresine gidin
2. GitHub hesabınızla bağlanın
3. Yeni "Web Service" oluşturun

### 3. Render Ayarları

- **Name**: yildiz-deva (veya tercihiniz)
- **Repository**: Bu depoyu seçin
- **Branch**: main
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (başlamak için)

### 4. Environment Variables Ayarlayın

Render dashboard'da "Environment" kısmında ekleyin:

| Anahtar | Değer | Gerekli |
|---------|-------|---------|
| `ADMIN_KEY` | Güçlü bir şifre (örn: rnd-alphanumeric-32) | ✅ |

Admin anahtarını güçlü tutun! Örnek:
- ✅ `rnd_a8f9j2k3l9m1n4o5p6q7r8s9t0u`
- ❌ `admin123`

### 5. Domain Bağlantısı

1. Render dashboard'da servisinizi açın
2. "Custom Domain" bölümüne gidin
3. Domain adınızı ekleyin
4. Render'ın verdiği DNS kayıtlarını güncelle

## API Endpoints

### Public
- `GET /` - Ana sayfa
- `GET /api/health` - Sunucu sağlığı
- `GET /api/products` - Tüm ürünler
- `GET /api/gallery` - Galeri fotoğrafları
- `GET /api/estimate` - Fiyat hesaplayıcı

### Admin (x-admin-key header gerekli)
- `POST /api/products` - Ürün ekle
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil
- `POST /api/gallery` - Fotoğraf yükle
- `DELETE /api/gallery/:id` - Fotoğraf sil

## Dosya Yapısı

```
umut/
├── app.js              # Ana uygulama
├── package.json        # Bağımlılıklar
├── render.yaml         # Render yapılandırması
├── .env.example        # Ortam değişkenleri örneği
├── .gitignore         # Git ignore kuralları
├── admin-panel.html   # Admin arayüzü
├── public/
│   ├── index.html     # Ana sayfa
│   └── uploads/       # Yüklenen fotoğraflar (runtime)
└── data.db            # SQLite veritabanı (runtime)
```

## Sorun Giderme

### Admin paneline giremiyorum
- `x-admin-key` header'ını kontrol edin
- `ADMIN_KEY` environment variable'ını kontrol edin
- Render logs'unda hataları kontrol edin

### Fotoğraflar kaydedilmiyor
- Render'ın ephemeral file system'ı olduğunu hatırlayın
- Yüklenen dosyalar sunucu yeniden başlatılırsa silinir
- Kalıcı depolama için AWS S3 vs. kullanabilirsiniz

### Database hatası
- `data.db` dosyasının yazma izni olduğundan emin olun
- Render logs'unda "database locked" hatası varsa instance restart edin

## Canlı Demo

Admin anahtarı: **Render dashboard'dan kontrol edin**

## Lisans

MIT

## İletişim

Yildiz Deva Cam Balkon Sistemleri
