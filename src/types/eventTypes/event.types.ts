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
 * Kullanıcı tipi (minimal)
 */
export interface EventCreator {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
}

/**
 * Etkinlik katılımcısı tipi
 */
export interface EventParticipant {
  event_id: string;
  user_id: string;
  joined_at: string;
  role: string;
  user?: {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string | null;
  };
}

/**
 * Etkinlik önerme nedenleri için tipler
 */
export type RecommendationReasonType = 'sport_preference' | 'friend_participation' | 'both';

/**
 * Etkinlik önerme nedeni
 */
export interface RecommendationReason {
  type: RecommendationReasonType;
  sport_id?: string;
  sport_name?: string;
  skill_level?: string;
  friend_count?: number;
  friends?: Array<{
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    profile_picture: string | null;
  }>;
  sport_preference?: RecommendationReason;
  friend_participation?: RecommendationReason;
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
  creator?: EventCreator; // Etkinlik oluşturucu bilgisi
  image_url?: string;  // Etkinlik görseli
  created_at: string;
  updated_at: string;
  average_rating?: number;
  is_joined?: boolean;
  is_creator?: boolean;
  is_private?: boolean; // Özel etkinlik mi?
  invitation_code?: string; // Davet kodu (özel etkinlikler için)
  sport?: Sport;
  participant_count?: number;
  participants?: EventParticipant[]; // Etkinlik katılımcıları
  recommendation_reason?: RecommendationReason; // Etkinliğin neden önerildiği bilgisi
  distance?: number; // Kullanıcıya mesafe bilgisi
  distance_info?: {
    distance: number;
    duration: number;
    distance_text: string;
    duration_text: string;
  }; // Mesafe hesaplama API'sinden gelen detaylı mesafe bilgisi
}

/**
 * Etkinlik yanıtı - Tek bir etkinlik için API yanıtı
 */
export interface EventResponse {
  success: boolean;
  data: Event;
  message?: string;
}

/**
 * Etkinlik listesi yanıtı - Birden fazla etkinlik için API yanıtı
 */
export interface EventsListResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination?: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
  message?: string;
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