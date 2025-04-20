import apiClient from '../config';

// Veritabanındaki Events modeline göre etkinlik tipi
export interface Event {
  id: number | string;
  creator_id: number | string;
  sport_id: number | string;
  title: string;
  description: string;
  event_date: string | Date;
  start_time: string | Date;
  end_time: string | Date;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  status: string;
  sport_name?: string;
  creator_name?: string;
  current_participants?: number;
  distance?: string;
}

// API yanıt tipi
interface EventsResponse {
  success: boolean;
  message: string;
  data?: Event[];
  error?: string;
}

interface EventResponse {
  success: boolean;
  message: string;
  data?: Event;
  error?: string;
}

/**
 * Tüm etkinlikleri getirir
 * @returns API yanıtı
 */
export const getAllEvents = async (): Promise<EventsResponse> => {
  try {
    const response = await apiClient.get<EventsResponse>('/events');
    return response.data;
  } catch (error: any) {
    console.error('Get all events error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data as EventsResponse;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Etkinlikler alınırken bir hata oluştu',
      error: error.message
    };
  }
};

/**
 * Belirli bir spor dalına ait etkinlikleri getirir
 * @param sportId Spor dalı ID
 * @returns API yanıtı
 */
export const getEventsBySport = async (sportId: number | string): Promise<EventsResponse> => {
  try {
    const response = await apiClient.get<EventsResponse>(`/events/sport/${sportId}`);
    return response.data;
  } catch (error: any) {
    console.error('Get events by sport error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data as EventsResponse;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Spor etkinlikleri alınırken bir hata oluştu',
      error: error.message
    };
  }
};

/**
 * Yakındaki etkinlikleri getirir
 * @param latitude Enlem
 * @param longitude Boylam
 * @param maxDistance Maksimum mesafe (km)
 * @returns API yanıtı
 */
export const getNearbyEvents = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 5
): Promise<EventsResponse> => {
  try {
    const response = await apiClient.get<EventsResponse>('/events/nearby', {
      params: {
        latitude,
        longitude,
        maxDistance
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Get nearby events error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data as EventsResponse;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Yakındaki etkinlikler alınırken bir hata oluştu',
      error: error.message
    };
  }
};

/**
 * Belirli bir etkinliği getirir
 * @param eventId Etkinlik ID
 * @returns API yanıtı
 */
export const getEventById = async (eventId: number | string): Promise<EventResponse> => {
  try {
    const response = await apiClient.get<EventResponse>(`/events/${eventId}`);
    return response.data;
  } catch (error: any) {
    console.error('Get event by id error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data as EventResponse;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Etkinlik bilgileri alınırken bir hata oluştu',
      error: error.message
    };
  }
};

/**
 * Yeni bir etkinlik oluşturur
 * @param eventData Etkinlik verileri
 * @returns API yanıtı
 */
export const createEvent = async (eventData: Partial<Event>): Promise<EventResponse> => {
  try {
    const response = await apiClient.post<EventResponse>('/events', eventData);
    return response.data;
  } catch (error: any) {
    console.error('Create event error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data as EventResponse;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Etkinlik oluşturulurken bir hata oluştu',
      error: error.message
    };
  }
};

/**
 * Etkinliğe katılım işlemi
 * @param eventId Etkinlik ID
 * @returns API yanıtı
 */
export const joinEvent = async (eventId: number | string): Promise<any> => {
  try {
    const response = await apiClient.post(`/events/${eventId}/join`);
    return response.data;
  } catch (error: any) {
    console.error('Join event error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Etkinliğe katılırken bir hata oluştu',
      error: error.message
    };
  }
};

/**
 * Etkinlikten ayrılma işlemi
 * @param eventId Etkinlik ID
 * @returns API yanıtı
 */
export const leaveEvent = async (eventId: number | string): Promise<any> => {
  try {
    const response = await apiClient.post(`/events/${eventId}/leave`);
    return response.data;
  } catch (error: any) {
    console.error('Leave event error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Etkinlikten ayrılırken bir hata oluştu',
      error: error.message
    };
  }
};

// Tarih formatlama fonksiyonları
export const formatEventDate = (date: Date | string): string => {
  const eventDate = new Date(date);
  return eventDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatEventTime = (time: Date | string): string => {
  const eventTime = new Date(time);
  return eventTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}; 