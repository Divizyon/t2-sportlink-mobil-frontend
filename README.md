# DeepSight Mobile App

DeepSight, React Native ve Expo ile geliştirilmiş mobil bir uygulamadır. Bu uygulama, Cursor Rules'ta belirtilen en iyi uygulamaları ve kodlama standartlarını takip eder.

## Özellikler

- TypeScript ile tip güvenliği
- Zustand ile durum yönetimi
- React Navigation ile rota yönetimi
- Tema desteği (açık/koyu)
- Form doğrulama
- SecureStore ile güvenli token saklama
- Hata yönetimi
- Responsive tasarım

## Proje Yapısı

```
/src
  /assets               # Medya dosyaları (görüntüler, yazı tipleri, simgeler)
  /components           # Yeniden kullanılabilir UI bileşenleri
  /constants            # Statik sabitler (renkler, metinler, sayılar)
  /navigation           # Navigasyon kurulum dosyaları
  /screens              # Uygulama ekranları
  /store                # Durum yönetimi (Zustand)
  /types                # TypeScript tipleri
  /utils                # Yardımcı fonksiyonlar
  /api                  # API ile ilgili kodlar ve servisler
  /services             # İş mantığı ve servisler
  /config               # Yapılandırma dosyaları
  /themes               # Tema yönetimi
```

## Başlarken

### Ön Koşullar

- [Node.js](https://nodejs.org/) (v14 veya daha yenisi)
- [npm](https://www.npmjs.com/) (v6 veya daha yenisi)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS için Xcode (sadece macOS) veya Android için Android Studio

### Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/yourusername/deepsight-app.git
   cd deepsight-app
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Uygulamayı çalıştırın:
   ```bash
   npm start
   ```

   Alternatif olarak şunları da kullanabilirsiniz:
   ```bash
   npm run ios     # iOS simulatörü başlatır
   npm run android # Android emülatörü başlatır
   npm run web     # Web tarayıcısında başlatır
   ```

## Kullanılan Teknolojiler ve Paketler

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zustand](https://github.com/pmndrs/zustand) - State yönetimi
- [React Navigation](https://reactnavigation.org/) - Navigasyon
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) - Güvenli depolama
- [ESLint](https://eslint.org/) - Kod linting
- [Prettier](https://prettier.io/) - Kod formatı

## Kodlama Standartları

Bu proje aşağıdaki kodlama standartlarını takip eder:

- **TypeScript**: Tip güvenliği için tüm kodlarda TypeScript kullanıldı
- **Fonksiyonel Bileşenler**: React Hooks ile fonksiyonel bileşenler kullanıldı
- **ES6+ Özellikleri**: Modern JavaScript özellikleri (async/await, destructuring, optional chaining)
- **Özel Kancalar**: Yeniden kullanılabilir mantık için özel kancalar
- **Hata Yönetimi**: Düzgün hata işleme
- **Stil İlkeleri**: İsimlendirilmiş sabitler ve anlamlı değişken isimleri

## Test Hesabı

Test için aşağıdaki bilgileri kullanabilirsiniz:
- **E-posta**: test@example.com
- **Şifre**: password123 