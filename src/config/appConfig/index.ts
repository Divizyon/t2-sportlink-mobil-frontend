import Constants from 'expo-constants';

// Çevre değişkenlerini al
const env = Constants.expoConfig?.extra || {};

// Uygulama yapılandırması
const appConfig = {
  api: {
    baseURL: env.API_URL as string || 'http://localhost:5000',
    timeout: Number(env.API_TIMEOUT) || 10000,
    version: 'v1',
    requestRetryCount: 3, // İstek yeniden deneme sayısı
    requestRetryDelay: 1000, // ms cinsinden yeniden deneme aralığı
    security: {
      csrfEnabled: true,
      tokenRefreshThreshold: 300, // Saniye cinsinden token yenileme eşiği (5 dk)
      tokenRefreshMaxRetries: 3, // Token yenileme maksimum deneme sayısı
      sessionTimeout: 30 * 60 * 1000, // ms cinsinden oturum zaman aşımı (30 dk)
      apiRateLimit: { // API istek limiti (rate limiting)
        windowMs: 60 * 1000, // ms cinsinden pencere süresi (1 dk)
        maxRequests: 60, // Bu süre içindeki maksimum istek sayısı
      },
    }
  },
  storage: {
    secureKey: env.SECURE_STORAGE_KEY as string || 'deepvision_secure_storage',
    persistence: {
      enabled: true,
      storageKey: 'app_state',
    }
  },
  environment: env.ENVIRONMENT as string || 'development',
  isProduction: (env.ENVIRONMENT as string) === 'production',
  isDevelopment: (env.ENVIRONMENT as string) === 'development',
  isTest: (env.ENVIRONMENT as string) === 'test',
  analytics: {
    enabled: (env.ENVIRONMENT as string) === 'production',
    errorReporting: true,
  },
  features: {
    offlineMode: true,
    debugLogging: (env.ENVIRONMENT as string) !== 'production',
  }
};

export default appConfig; 