import 'dotenv/config';

export default {
  expo: {
    name: 'DeepVision',
    slug: 'deepvision',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
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
      bundleIdentifier: 'com.deepvision.sportlink'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: "com.deepvision.sportlink",
      googleServicesFile: './google-services.json',
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'RECEIVE_BOOT_COMPLETED',
        'NOTIFICATIONS',
        'VIBRATE',
        'android.permission.INTERNET'
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_ANDROID_API_KEY'
        }
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      API_URL: process.env.API_URL || 'http://localhost:3000/api',
      API_TIMEOUT: process.env.API_TIMEOUT || 10000,
      ENVIRONMENT: process.env.ENVIRONMENT || 'development',
      SECURE_STORAGE_KEY: process.env.SECURE_STORAGE_KEY || 'deepvision_secure_storage',
      // Aynı API anahtarı hem Google Distance API hem de Places API için kullanılıyor
      // Google Cloud Console'da bu API anahtarı için hem Distance Matrix API hem de Places API etkinleştirilmeli
      GOOGLE_DISTANCE_API_KEY: "YAIzaSyAjnjZl3Cty3U1JB3PYBATBH6ujuHk5c3A",
      // Places API için aynı anahtarı kullanıyoruz (yedek olarak burada tutuyoruz)
      GOOGLE_PLACES_API_KEY: "AIzaSyD5kDRgkklpeTkz-dbaW8LHc6ZHvW2kSmA",
      eas: {
        projectId: "fd8f1dce-1f2c-4902-b19f-ed90c2e25ede"
      }
    },
    plugins: [
      'expo-font',
      'expo-router',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow the app to use your location.'
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#4CB944',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 24
          }
        }
      ]
    ],
    notification: {
      icon: './assets/notification-icon.png',
      color: '#4CB944',
      iosDisplayInForeground: true,
      androidMode: 'default',
      androidCollapsedTitle: '${title}',
    }
  },
};