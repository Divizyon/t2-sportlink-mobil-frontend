import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConfigValuesFromStore } from '../store/appStore/configStore';

// Supabase bağlantı bilgileri burada config store'dan alınır
// Gerçek uygulamada .env dosyasından veya config servisinden alınır
const { apiBaseUrl } = getConfigValuesFromStore();

// Supabase URL ve API anahtarı (Bu değerler varsayılan olarak verildi, gerçek değerlerle değiştirilmeli)
const supabaseUrl = apiBaseUrl || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-anon-key';

// Postgres değişiklik tipleri için kendi tipimizi tanımlıyoruz
type PostgresChangesPayload<T> = {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: null | string[];
};

// Supabase'in desteklediği event tipleri
type SupabaseEventTypes = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Temel veri tipleri
interface Notification {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  created_by: string;
}

interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseKey, {
  localStorage: AsyncStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  // SSL güvenli bağlantı ayarı
  headers: {
    'X-Client-Info': 'sportLink-mobile',
  },
});

// Güvenli realtime bağlantı için özel kanal oluşturma
export const createSecureRealtimeChannel = <T>(channelName: string, userId: string) => {
  const subscription = supabase
    .from(`${channelName}:user_id=eq.${userId}`)
    .on('*', (payload: PostgresChangesPayload<T>) => {
      console.log('Değişiklik:', payload);
      return payload;
    });
  
  return subscription;
};

// Realtime kanal oluşturma yardımcı fonksiyonu
export const createRealtimeChannel = <T>(channelName: string) => {
  const subscription = supabase
    .from(channelName)
    .on('*', (payload: PostgresChangesPayload<T>) => {
      console.log('Değişiklik:', payload);
      return payload;
    });
  
  return subscription;
};

// Bildirim tablosunu dinlemek için fonksiyon
export const subscribeToNotifications = (userId: string, callback: (payload: PostgresChangesPayload<Notification>) => void) => {
  const subscription = supabase
    .from('notifications')
    .on('INSERT', (payload: PostgresChangesPayload<Notification>) => {
      if (payload.new && payload.new.user_id === userId) {
        callback(payload);
      }
    })
    .subscribe();
  
  return subscription;
};

// Belirli bir etkinliği dinlemek için fonksiyon
export const subscribeToEvent = (eventId: string, callback: (payload: PostgresChangesPayload<Event>) => void) => {
  const subscription = supabase
    .from('events')
    .on('*', (payload: PostgresChangesPayload<Event>) => {
      if (payload.new && payload.new.id === eventId) {
        callback(payload);
      }
    })
    .subscribe();
  
  return subscription;
};

// Mesajlaşma için fonksiyon
export const subscribeToConversation = (conversationId: string, callback: (payload: PostgresChangesPayload<Message>) => void) => {
  const subscription = supabase
    .from('messages')
    .on('INSERT', (payload: PostgresChangesPayload<Message>) => {
      if (payload.new && payload.new.conversation_id === conversationId) {
        callback(payload);
      }
    })
    .subscribe();
  
  return subscription;
};

// Broadcast kanalı oluşturma (genel bildirimler için)
export const createBroadcastChannel = <T>(channelName: string, eventName: SupabaseEventTypes, callback: (payload: PostgresChangesPayload<T>) => void) => {
  const subscription = supabase
    .from(channelName)
    .on(eventName, (payload: PostgresChangesPayload<T>) => {
      callback(payload);
    })
    .subscribe((status: string) => {
      console.log(`Broadcast aboneliği durumu: ${status}`);
    });
  
  return subscription;
}; 