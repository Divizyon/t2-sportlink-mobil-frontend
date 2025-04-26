/**
 * Etkinlik durumu
 */
export type EventStatus = 'active' | 'canceled' | 'completed' | 'draft';

/**
 * Spor dalı tipi
 */
export interface Sport {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

/**
 * Etkinlik tipi
 */
export interface Event {
  id: string;
  sport_id: string;
  category?: string;  // Spor kategorisi/türü
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  current_participants: number;
  status: EventStatus;
  creator_id: string;
  creator_name?: string;
  creator_avatar?: string;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  is_joined?: boolean;
  is_creator?: boolean;
  is_private?: boolean; // Özel etkinlik mi?
  invitation_code?: string; // Davet kodu (özel etkinlikler için)
}

/**
 * Etkinlik oluşturma isteği
 */
export interface EventCreateRequest {
  sport_id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  status?: EventStatus;
  is_private?: boolean; // Özel etkinlik mi?
  invitation_code?: string; // Davet kodu (özel etkinlikler için)
}

/**
 * Etkinlik güncelleme isteği
 */
export interface EventUpdateRequest {
  title?: string;
  description?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  location_name?: string;
  location_latitude?: number;
  location_longitude?: number;
  max_participants?: number;
  status?: EventStatus;
}

/**
 * Etkinlik değerlendirme isteği
 */
export interface EventRatingRequest {
  rating: number;
  review?: string;
}

/**
 * Etkinlik değerlendirme yanıtı
 */
export interface EventRating {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}