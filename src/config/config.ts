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
  apiBaseUrl: 'https://sportlink-api.onrender.com',
  // Test amaçlı Supabase değerleri
  supabaseUrl: 'https://project-example.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.l_0Md_QGp7jxgUAoQMr_qnCpbn8zMz1G-1dCQMHCpK8',
  cloudFrontUrl: 'https://sportlink-images.cloudfront.net',
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