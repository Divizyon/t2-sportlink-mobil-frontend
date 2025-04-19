import * as Location from 'expo-location';

// Tesis tipi
export interface Facility {
  id: number;
  name: string;
  address: string;
  type: string; // Halı saha, spor salonu, basketbol sahası, vb.
  location_latitude: number;
  location_longitude: number;
  rating?: number; // 1-5 yıldız
  image?: string; // Görsel URL'si
  distance?: string; // Kullanıcıya olan mesafe (formatlanmış şekilde)
  opening_hours?: string; // Açılış-kapanış saatleri
  price_range?: string; // Fiyat aralığı (₺, ₺₺, ₺₺₺)
  contact?: string; // İletişim bilgisi
}

// Dummy tesis verileri
const dummyFacilities: Facility[] = [
  {
    id: 1,
    name: 'Beşiktaş Spor Kompleksi',
    address: 'Beşiktaş, İstanbul',
    type: 'Spor Kompleksi',
    location_latitude: 41.042633,
    location_longitude: 29.006542,
    rating: 4.5,
    image: 'https://picsum.photos/600/400',
    opening_hours: '09:00 - 23:00',
    price_range: '₺₺',
    contact: '0212 123 45 67'
  },
  {
    id: 2,
    name: 'Kadıköy Halı Saha',
    address: 'Kadıköy, İstanbul',
    type: 'Halı Saha',
    location_latitude: 40.990738,
    location_longitude: 29.030375,
    rating: 4.2,
    image: 'https://picsum.photos/600/400',
    opening_hours: '10:00 - 00:00',
    price_range: '₺₺',
    contact: '0216 123 45 67'
  },
  {
    id: 3,
    name: 'Fenerbahçe Spor Salonu',
    address: 'Fenerbahçe, İstanbul',
    type: 'Spor Salonu',
    location_latitude: 40.988634,
    location_longitude: 29.036608,
    rating: 4.8,
    image: 'https://picsum.photos/600/400',
    opening_hours: '08:00 - 22:00',
    price_range: '₺₺₺',
    contact: '0216 987 65 43'
  },
  {
    id: 4,
    name: 'Ataşehir Basketbol Sahası',
    address: 'Ataşehir, İstanbul',
    type: 'Basketbol Sahası',
    location_latitude: 40.982539,
    location_longitude: 29.117203,
    rating: 3.9,
    image: 'https://picsum.photos/600/400',
    opening_hours: '08:00 - 21:00',
    price_range: '₺',
    contact: '0216 456 78 90'
  },
  {
    id: 5,
    name: 'Şişli Fitness Center',
    address: 'Şişli, İstanbul',
    type: 'Fitness Salonu',
    location_latitude: 41.058064,
    location_longitude: 28.987838,
    rating: 4.6,
    image: 'https://picsum.photos/600/400',
    opening_hours: '07:00 - 23:00',
    price_range: '₺₺',
    contact: '0212 345 67 89'
  },
  {
    id: 6,
    name: 'Levent Tennis Club',
    address: 'Levent, İstanbul',
    type: 'Tenis Kortu',
    location_latitude: 41.082933,
    location_longitude: 29.011708,
    rating: 4.7,
    image: 'https://picsum.photos/600/400',
    opening_hours: '08:00 - 22:00',
    price_range: '₺₺₺',
    contact: '0212 567 89 01'
  },
  {
    id: 7,
    name: 'Üsküdar Yüzme Havuzu',
    address: 'Üsküdar, İstanbul',
    type: 'Yüzme Havuzu',
    location_latitude: 41.026642,
    location_longitude: 29.034788,
    rating: 4.3,
    image: 'https://picsum.photos/600/400',
    opening_hours: '09:00 - 21:00',
    price_range: '₺₺',
    contact: '0216 234 56 78'
  }
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

// Kullanıcı konumuna göre tesisleri getir
export const getFacilitiesWithDistance = async (): Promise<Facility[]> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return dummyFacilities; // İzin verilmezse sadece tesisleri döndür
    }
    
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    // Tesislere mesafe bilgisi ekle
    return dummyFacilities.map(facility => {
      const distance = calculateDistance(
        latitude,
        longitude,
        facility.location_latitude,
        facility.location_longitude
      );
      
      return {
        ...facility,
        distance: formatDistance(distance)
      };
    }).sort((a, b) => {
      // Mesafeye göre sırala (yakın olan önce)
      const distanceA = parseFloat(a.distance?.replace(' km', '').replace(' m', '') || '0');
      const distanceB = parseFloat(b.distance?.replace(' km', '').replace(' m', '') || '0');
      
      return distanceA - distanceB;
    });
    
  } catch (error) {
    console.error('Konum alınamadı:', error);
    return dummyFacilities; // Hata durumunda sadece tesisleri döndür
  }
};

// Tüm tesisleri getir
export const getAllFacilities = async (): Promise<Facility[]> => {
  return getFacilitiesWithDistance();
};

// Belirli bir türdeki tesisleri getir
export const getFacilitiesByType = async (type: string): Promise<Facility[]> => {
  const allFacilities = await getFacilitiesWithDistance();
  return allFacilities.filter(facility => facility.type.toLowerCase().includes(type.toLowerCase()));
};

// Yakındaki tesisleri getir (belirli bir mesafe içinde)
export const getNearbyFacilities = async (maxDistance: number = 5): Promise<Facility[]> => {
  const allFacilities = await getFacilitiesWithDistance();
  return allFacilities.filter(facility => {
    if (!facility.distance) return false;
    
    // "X km" veya "X m" formatını sayıya çevir
    let distanceValue = 0;
    if (facility.distance.includes('km')) {
      distanceValue = parseFloat(facility.distance.replace(' km', ''));
    } else {
      distanceValue = parseFloat(facility.distance.replace(' m', '')) / 1000;
    }
    
    return distanceValue <= maxDistance;
  });
};

// Belirli bir tesisi getir
export const getFacilityById = async (facilityId: number): Promise<Facility | null> => {
  const allFacilities = await getFacilitiesWithDistance();
  return allFacilities.find(facility => facility.id === facilityId) || null;
}; 