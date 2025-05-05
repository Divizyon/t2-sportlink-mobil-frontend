/**
 * Uygulama yapılandırma değerleri
 */
interface ConfigValues {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  cloudFrontUrl: string;
  environment: 'development' | 'production' | 'test';
}

// Varsayılan değerler - bu değerler daha sonra .env dosyasından veya bir uzak API'den alınabilir
let CONFIG: ConfigValues = {
  apiBaseUrl: 'https://sportlink-api.example.com',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key',
  cloudFrontUrl: 'https://your-media.cloudfront.net',
  environment: 'development'
};

/**
 * Yapılandırma değerlerini günceller
 */
export const updateConfigValues = (newValues: Partial<ConfigValues>) => {
  CONFIG = { ...CONFIG, ...newValues };
};

/**
 * Yapılandırma değerlerini alır
 */
export const getConfigValues = (): ConfigValues => {
  return CONFIG;
}; 