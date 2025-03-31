# Metrader Pro - Binance Order Book Tracker

Binance Order Book Tracker, büyük alım-satım emirlerini gerçek zamanlı olarak takip eden ve kullanıcıları Telegram üzerinden bilgilendiren profesyonel bir trading aracıdır.

## Özellikler

- 🚀 Gerçek zamanlı order book takibi
- 📊 Büyük emirlerin anlık tespiti
- 💬 Telegram entegrasyonu
- 🔐 Firebase Authentication ile güvenli giriş
- 📱 Responsive tasarım
- 🌓 Koyu tema

## Kurulum

1. Firebase Projesi Oluşturma:
   - [Firebase Console](https://console.firebase.google.com)'a gidin
   - Yeni proje oluşturun
   - Authentication ve Realtime Database'i etkinleştirin
   - Firebase konfigürasyon bilgilerini `firebase-config.js` dosyasına ekleyin

2. Telegram Bot Kurulumu:
   - [@BotFather](https://t.me/botfather) ile yeni bir bot oluşturun
   - Bot token'ını alın
   - Bot token'ını uygulama ayarlarına ekleyin

3. Projeyi Çalıştırma:
   ```bash
   # Projeyi klonlayın
   git clone https://github.com/kullaniciadi/binance-orderbook-tracker.git
   
   # Proje dizinine gidin
   cd binance-orderbook-tracker
   
   # Bir HTTP sunucusu başlatın (örnek: Python)
   python3 -m http.server 8080
   ```

4. Tarayıcıda açın:
   - `http://localhost:8080` adresine gidin
   - Kayıt olun veya giriş yapın
   - Referans kodu: `LURL4r`

## Firebase Yapılandırması

1. Firebase Console'dan alacağınız yapılandırma bilgilerini `firebase-config.js` dosyasına ekleyin:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID",
    databaseURL: "YOUR_DATABASE_URL"
};
```

2. Firebase Realtime Database Kuralları:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "referralCodes": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Telegram Bot Entegrasyonu

1. Bot token'ını uygulama ayarlarına ekleyin
2. Telegram kanalınızı oluşturun
3. Botu kanal yöneticisi yapın
4. Kanal ID'sini ayarlara ekleyin

## Canlıya Alma

1. Firebase Hosting ile Deploy:
```bash
# Firebase CLI'yi yükleyin
npm install -g firebase-tools

# Firebase'e giriş yapın
firebase login

# Projeyi initialize edin
firebase init

# Deploy edin
firebase deploy
```

## Güvenlik Kontrolleri

- [ ] Firebase Authentication aktif
- [ ] Database kuralları doğru yapılandırıldı
- Gerçek zamanlı order book verileri
- Alım ve satım emirlerini ayrı sekmelerde görüntüleme
- Kullanıcı tarafından belirlenebilen eşik değeri
- Belirlenen eşik değerinin üzerindeki emirler için otomatik uyarı
- Kullanıcı dostu arayüz

## Kullanım

1. `index.html` dosyasını bir web tarayıcısında açın
2. İstediğiniz kripto para sembolünü girin (varsayılan: BTCUSDT)
3. Takip etmek istediğiniz eşik değerini USDT cinsinden girin (varsayılan: 10,000,000 USDT)
4. "Başlat" düğmesine tıklayın
5. Büyük emirler tespit edildiğinde otomatik olarak uyarı alacaksınız

## Teknik Detaylar

- Uygulama Binance API'sini ve WebSocket bağlantısını kullanır
- Order book derinliği 100 seviye olarak ayarlanmıştır
- Uyarılar, fiyat, miktar ve toplam değer bilgilerini içerir
- Uyarılar 10 saniye sonra otomatik olarak kaybolur

## Güvenlik Notu

Bu uygulama API anahtarlarınızı istemci tarafında kullanmaktadır. Gerçek bir üretim ortamında, API anahtarlarının sunucu tarafında saklanması ve işlemlerin sunucu üzerinden yapılması önerilir. Bu demo sürümü sadece eğitim amaçlıdır. 