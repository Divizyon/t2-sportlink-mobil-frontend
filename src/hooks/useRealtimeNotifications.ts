import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../store/userStore/authStore';

// Supabase client yapılandırması - .env dosyasından alınacak
// Bu değerler ileride .env dosyasından alınacak şekilde düzenlenebilir
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase Realtime ile bildirim değişikliklerini dinleyen hook
 * @param onNewNotification Yeni bildirim geldiğinde çalıştırılacak callback
 */
export const useRealtimeNotifications = (
  onNewNotification: (payload: any) => void
) => {
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (!user || !supabaseUrl || !supabaseKey) return;
    
    // Supabase client oluştur
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Supabase kanalına abone ol
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'realtime_notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log('Yeni bildirim alındı:', payload);
        
        // Callback fonksiyonu çağır
        onNewNotification(payload);
      })
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel hatası:', error);
        }
        if (status === 'TIMED_OUT') {
          console.error('Realtime bağlantı zaman aşımına uğradı');
        }
      });
    
    // Temizlik işlemi
    return () => {
      channel.unsubscribe();
    };
  }, [user, onNewNotification]);
  
  return null;
}; 