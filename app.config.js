import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: 'DeepVision',
  slug: 'deepvision',
  version: '1.0.0',
  owner: 'ebrartamer23',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  sdkVersion: '52.0.0',
  newArchEnabled: true,
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.deepsight.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.deepsight.app',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'RECEIVE_BOOT_COMPLETED',
      'NOTIFICATIONS',
      'VIBRATE',
      'android.permission.INTERNET'
    ]
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
      projectId: 'fd8f1dce-1f2c-4902-b19f-ed90c2e25ede'
    }
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#4CB944',
        sounds: ['./assets/sounds/notification.wav'] // Mevcut ses yoksa boş bırak
      }
    ]
  ],
  notification: {
    icon: './assets/notification-icon.png',
    color: '#4CB944',
    iosDisplayInForeground: true,
    androidMode: 'default',
    androidCollapsedTitle: '${title}'
  }
});
