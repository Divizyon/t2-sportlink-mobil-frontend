import { createClient } from '@supabase/supabase-js';
import { getConfigValues } from '../config/config';

// Tek bir Supabase istemcisi oluştur
let supabaseInstance: any = null;

/**
 * Supabase istemcisi oluşturur
 */
export const createSupabaseClient = () => {
  // Zaten bir örnek varsa onu döndür
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    const config = getConfigValues();
    const supabaseUrl = config.supabaseUrl;
    const supabaseAnonKey = config.supabaseAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL veya anahtar bulunamadı. Lütfen yapılandırmayı kontrol edin.');
      throw new Error('Supabase yapılandırması bulunamadı');
    }

    // Supabase client oluştur
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client başarıyla oluşturuldu');
    
    return supabaseInstance;
  } catch (error) {
    console.error('Supabase client oluşturulurken hata:', error);
    
    // Yedek bir client döndür (sınırlı işlevsellik ile)
    const mockClient = {
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
      }),
      removeChannel: () => {},
      // Diğer gerekli metodlar burada eklenebilir
    };
    
    // Mock client'ı önbelleğe al
    supabaseInstance = mockClient;
    return mockClient;
  }
}; 