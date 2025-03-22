# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Code Quality and Formatting

Bu projede kod kalitesi ve formatlaması için ESLint ve Prettier kullanılmaktadır.

### Kullanılabilir Komutlar

Kod kalitesi ve formatlaması için aşağıdaki komutları kullanabilirsiniz:

```bash
# Kod linting kontrolü
npm run lint

# Otomatik lint düzeltmeleri
npm run lint:fix

# Kod formatı kontrolü
npm run format:check

# Otomatik kod formatlaması
npm run format

# Hem kod formatlaması hem de linting düzeltmeleri için
npm run code:fix

# Kod formatı ve linting kontrolü için
npm run code:check
```

### VSCode Entegrasyonu

VSCode kullanıyorsanız, `.vscode/settings.json` dosyası otomatik olarak ESLint ve Prettier entegrasyonunu sağlar. Dosyaları kaydederken otomatik olarak formatlama için aşağıdaki VSCode eklentilerini yüklemeniz önerilir:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
