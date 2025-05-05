import { createClient } from '@supabase/supabase-js';
import { getConfigValues } from '../config/config';

// Tek bir Supabase istemcisi oluştur
let supabaseInstance: any = null;

/**
 * Supabase istemcisi oluşturur
 */
export const createSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getConfigValues();
  const supabaseUrl = config.supabaseUrl;
  const supabaseAnonKey = config.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL veya anahtar bulunamadı. Lütfen yapılandırmayı kontrol edin.');
    throw new Error('Supabase yapılandırması bulunamadı');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}; 