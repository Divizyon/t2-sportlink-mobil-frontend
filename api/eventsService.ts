import * as Location from 'expo-location';

// Veritabanındaki Events modeline göre dummy etkinlikler oluşturuyoruz
// Backend entegrasyonu için hazırlık
export interface Event {
  id: number;
  creator_id: number;
  sport_id: number;
  title: string;
  description: string;
  event_date: Date;
  start_time: Date;
  end_time: Date;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  status: string;
  sport_name?: string; // Spor adı (Sports tablosundan)
  creator_name?: string; // Oluşturan kullanıcı adı (Users tablosundan)
  current_participants?: number; // Şu anki katılımcı sayısı (Event_Participants tablosundan hesaplanabilir)
  distance?: string; // Kullanıcının konumuna göre hesaplanacak
}

// Dummy spor dalları
const sports = [
  { id: 1, name: 'Futbol' },
  { id: 2, name: 'Basketbol' },
  { id: 3, name: 'Tenis' },
  { id: 4, name: 'Voleybol' },
  { id: 5, name: 'Yüzme' },
  { id: 6, name: 'Koşu' },
  { id: 7, name: 'Bisiklet' },
  { id: 8, name: 'Yoga' },
];

// Dummy kullanıcılar
const users = [
  { id: 1, name: 'Ahmet Yılmaz' },
  { id: 2, name: 'Ayşe Kaya' },
  { id: 3, name: 'Mehmet Demir' },
  { id: 4, name: 'Zeynep Şahin' },
];

// Dummy etkinlik verileri
const dummyEvents: Event[] = [
  {
    id: 1,
    creator_id: 1,
    sport_id: 1,
    title: 'Halı Saha Maçı',
    description: 'Dostlar arasında keyifli bir halı saha maçı. Herkes davetlidir.',
    event_date: new Date(Date.now() + 86400000), // Yarın
    start_time: new Date(Date.now() + 86400000 + 36000000), // Yarın saat 10:00
    end_time: new Date(Date.now() + 86400000 + 43200000), // Yarın saat 12:00
    location_name: 'Beşiktaş Halı Saha',
    location_latitude: 41.042633,
    location_longitude: 29.006542,
    max_participants: 14,
    status: 'active',
    sport_name: 'Futbol',
    creator_name: 'Ahmet Yılmaz',
    current_participants: 8,
  },
  {
    id: 2,
    creator_id: 2,
    sport_id: 2,
    title: 'Sokak Basketbolu',
    description: 'Sokak basketbolu etkinliği. 3x3 turnuva düzenleyeceğiz.',
    event_date: new Date(Date.now() + 172800000), // 2 gün sonra
    start_time: new Date(Date.now() + 172800000 + 54000000), // 2 gün sonra saat 15:00
    end_time: new Date(Date.now() + 172800000 + 61200000), // 2 gün sonra saat 17:00
    location_name: 'Kadıköy Basketbol Sahası',
    location_latitude: 40.990738,
    location_longitude: 29.030375,
    max_participants: 12,
    status: 'active',
    sport_name: 'Basketbol',
    creator_name: 'Ayşe Kaya',
    current_participants: 5,
  },
  {
    id: 3,
    creator_id: 3,
    sport_id: 3,
    title: 'Tenis Etkinliği',
    description: 'Çiftler tenis turnuvası düzenliyoruz. Katılım için mesaj atın.',
    event_date: new Date(Date.now() + 259200000), // 3 gün sonra
    start_time: new Date(Date.now() + 259200000 + 32400000), // 3 gün sonra saat 09:00
    end_time: new Date(Date.now() + 259200000 + 43200000), // 3 gün sonra saat 12:00
    location_name: 'İstanbul Tenis Kulübü',
    location_latitude: 41.079668,
    location_longitude: 29.033573,
    max_participants: 8,
    status: 'active',
    sport_name: 'Tenis',
    creator_name: 'Mehmet Demir',
    current_participants: 4,
  },
  {
    id: 4,
    creator_id: 4,
    sport_id: 6,
    title: 'Sabah Koşusu',
    description: 'Haftasonu sabah koşusu yapacağız. Herkes katılabilir!',
    event_date: new Date(Date.now() + 345600000), // 4 gün sonra
    start_time: new Date(Date.now() + 345600000 + 25200000), // 4 gün sonra saat 07:00
    end_time: new Date(Date.now() + 345600000 + 32400000), // 4 gün sonra saat 09:00
    location_name: 'Caddebostan Sahili',
    location_latitude: 40.962445,
    location_longitude: 29.056582,
    max_participants: 20,
    status: 'active',
    sport_name: 'Koşu',
    creator_name: 'Zeynep Şahin',
    current_participants: 7,
  },
  {
    id: 5,
    creator_id: 1,
    sport_id: 4,
    title: 'Plaj Voleybolu',
    description: 'Hafta sonu plajda voleybol oynamak için toplanıyoruz.',
    event_date: new Date(Date.now() + 432000000), // 5 gün sonra
    start_time: new Date(Date.now() + 432000000 + 54000000), // 5 gün sonra saat 15:00
    end_time: new Date(Date.now() + 432000000 + 64800000), // 5 gün sonra saat 18:00
    location_name: 'Kilyos Plajı',
    location_latitude: 41.250000,
    location_longitude: 29.010833,
    max_participants: 12,
    status: 'active',
    sport_name: 'Voleybol',
    creator_name: 'Ahmet Yılmaz',
    current_participants: 8,
  },
];

// İki konum arasındaki mesafeyi hesaplamak için yardımcı fonksiyon
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Dünya yarıçapı km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // km cinsinden mesafe
  return distance;
};

// Mesafeyi formatla
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

// Kullanıcı konumuna göre etkinlikleri getir
export const getEventsWithDistance = async (): Promise<Event[]> => {
  // Kullanıcının mevcut konumunu al
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return dummyEvents; // İzin verilmezse sadece etkinlikleri döndür
    }
    
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    // Etkinliklere mesafe bilgisi ekle
    return dummyEvents.map(event => {
      const distance = calculateDistance(
        latitude,
        longitude,
        event.location_latitude,
        event.location_longitude
      );
      
      return {
        ...event,
        distance: formatDistance(distance)
      };
    }).sort((a, b) => {
      // Tarih ve mesafeye göre sırala
      const now = new Date();
      const aIsToday = new Date(a.event_date).toDateString() === now.toDateString();
      const bIsToday = new Date(b.event_date).toDateString() === now.toDateString();
      
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      
      // Mesafeye göre sırala (yakın olan önce)
      const distanceA = parseFloat(a.distance?.replace(' km', '').replace(' m', '') || '0');
      const distanceB = parseFloat(b.distance?.replace(' km', '').replace(' m', '') || '0');
      
      return distanceA - distanceB;
    });
    
  } catch (error) {
    console.error('Konum alınamadı:', error);
    return dummyEvents; // Hata durumunda sadece etkinlikleri döndür
  }
};

// Tüm etkinlikleri getir
export const getAllEvents = async (): Promise<Event[]> => {
  return getEventsWithDistance();
};

// Belirli bir spor için etkinlikleri getir
export const getEventsBySport = async (sportId: number): Promise<Event[]> => {
  const allEvents = await getEventsWithDistance();
  return allEvents.filter(event => event.sport_id === sportId);
};

// Yakındaki etkinlikleri getir (belirli bir mesafe içinde)
export const getNearbyEvents = async (maxDistance: number = 5): Promise<Event[]> => {
  const allEvents = await getEventsWithDistance();
  return allEvents.filter(event => {
    if (!event.distance) return false;
    
    // "X km" veya "X m" formatını sayıya çevir
    let distanceValue = 0;
    if (event.distance.includes('km')) {
      distanceValue = parseFloat(event.distance.replace(' km', ''));
    } else {
      distanceValue = parseFloat(event.distance.replace(' m', '')) / 1000;
    }
    
    return distanceValue <= maxDistance;
  });
};

// Belirli bir etkinliği getir
export const getEventById = async (eventId: number): Promise<Event | null> => {
  const allEvents = await getEventsWithDistance();
  return allEvents.find(event => event.id === eventId) || null;
};

// Tarihi formatlama fonksiyonu (UI'da kullanılabilir)
export const formatEventDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long'
  };
  return date.toLocaleDateString('tr-TR', options);
};

// Saati formatlama fonksiyonu (UI'da kullanılabilir)
export const formatEventTime = (time: Date): string => {
  return time.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}; 