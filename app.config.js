import 'dotenv/config';

export default {
  expo: {
    name: 'DeepVision',
    slug: 'deepvision',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.deepsight.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: "com.deepsight.app"
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      API_URL: process.env.API_URL || 'http://localhost:3000/api',
      API_TIMEOUT: process.env.API_TIMEOUT || 10000,
      ENVIRONMENT: process.env.ENVIRONMENT || 'development',
      SECURE_STORAGE_KEY: process.env.SECURE_STORAGE_KEY || 'deepvision_secure_storage',
      eas: {
        projectId: "fd8f1dce-1f2c-4902-b19f-ed90c2e25ede"
      }
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#4CB944',
          sounds: ['./assets/notification-sound.wav'],
        },
      ],
    ],
    notification: {
      icon: './assets/notification-icon.png',
      color: '#4CB944',
      iosDisplayInForeground: true,
      androidMode: 'default',
      androidCollapsedTitle: '${title}',
    }
  },
  newArchEnabled: true,
}; 