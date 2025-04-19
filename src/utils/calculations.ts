/**
 * Hesaplama işlemlerini içeren yardımcı fonksiyonlar
 */

// Konum noktası tipi
export interface Point {
  latitude: number;
  longitude: number;
}

/**
 * İki nokta arasındaki mesafeyi Haversine formülü ile hesaplar (km cinsinden)
 * @param point1 - Birinci nokta
 * @param point2 - İkinci nokta
 * @returns Kilometre cinsinden mesafe
 */
export const calculateDistance = (point1: Point, point2: Point): number => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // İki ondalık basamağa yuvarla
};

/**
 * Bir rota boyunca toplam mesafeyi hesaplar
 * @param points - Rota noktaları
 * @returns Toplam mesafe (km)
 */
export const calculateTotalDistance = (points: Point[]): number => {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(points[i], points[i + 1]);
  }
  
  return Math.round(totalDistance * 10) / 10; // Bir ondalık basamağa yuvarla
};

/**
 * Ortalama hız ve mesafeye göre tahmini süreyi hesaplar
 * @param distance - Kilometre cinsinden mesafe
 * @param activityType - Aktivite tipi (yürüyüş, koşu, bisiklet)
 * @returns Dakika cinsinden tahmini süre
 */
export const calculateEstimatedDuration = (
  distance: number, 
  activityType: 'walking' | 'running' | 'cycling'
): number => {
  const speeds = {
    walking: 5, // km/saat
    running: 10, // km/saat
    cycling: 20, // km/saat
  };
  
  const hoursTaken = distance / speeds[activityType];
  const minutesTaken = Math.round(hoursTaken * 60);
  
  return minutesTaken;
}; 