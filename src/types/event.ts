// Etkinlik türü için enum
export enum EventType {
  SPORT = 'SPORT',
  SOCIAL = 'SOCIAL',
  EDUCATIONAL = 'EDUCATIONAL',
  CULTURAL = 'CULTURAL',
  OTHER = 'OTHER'
}

// Etkinliğin durumu için enum
export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Katılım türü için enum
export enum ParticipationType {
  GOING = 'GOING',
  MAYBE = 'MAYBE',
  INVITED = 'INVITED',
  REQUESTED = 'REQUESTED',
  REJECTED = 'REJECTED',
  LEFT = 'LEFT'
}

// Etkinlik yeri (adres ve konum bilgisi)
export interface EventLocation {
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}

// Katılım için arayüz
export interface Participant {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipationType;
  username: string;
  fullName?: string;
  profileImage?: string;
  joinedAt: Date | string;
  rating?: number;
  comment?: string;
}

// Etkinlik için arayüz
export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  sportType?: string;
  status: EventStatus;
  startDate: Date | string;
  endDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Konum bilgileri
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  
  // İlişkili veriler
  creatorId: string;
  creatorName?: string;
  creatorImage?: string;
  participantCount: number;
  maxParticipants?: number;
  
  // Güvenlik ve gizlilik
  isPrivate: boolean;
  inviteCode?: string;
  
  // Ek bilgiler
  price?: number;
  currency?: string;
  imageUrl?: string;
  rating?: number;
  distance?: number; // km cinsinden mesafe
  
  // İlişkisel veriler (Opsiyonel - API yanıtında bulunabilir)
  participants?: Participant[];
  isUserParticipating?: boolean;
  userParticipationStatus?: ParticipationType;
}

// Etkinlik oluşturmak için gerekli arayüz
export interface CreateEventRequest {
  title: string;
  description?: string;
  eventType: EventType;
  sportType?: string;
  startDate: Date | string;
  endDate?: Date | string;
  
  // Konum bilgileri
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  
  // Ek bilgiler
  maxParticipants?: number;
  isPrivate?: boolean;
  price?: number;
  currency?: string;
  imageUrl?: string;
}

// Etkinlik güncellemek için arayüz
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventType?: EventType;
  sportType?: string;
  status?: EventStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  
  // Konum bilgileri
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  
  // Ek bilgiler
  maxParticipants?: number;
  isPrivate?: boolean;
  price?: number;
  currency?: string;
  imageUrl?: string;
} 