// Mesafe formatı standardizasyonu

/**
 * Mesafe bilgisini standart formatta biçimlendirir
 * @param distanceInMeters Metre cinsinden mesafe değeri
 * @returns Formatlanmış mesafe metni (örn. "5.2 km" veya "450 m")
 */
export const formatDistance = (distanceInMeters: number): string => {
  if (isNaN(distanceInMeters)) {
    console.warn('formatDistance: Geçersiz mesafe değeri (NaN)');
    return 'Belirtilmemiş';
  }
  
  if (distanceInMeters < 1000) {
    const formatted = `${Math.round(distanceInMeters)} m`;
    console.log(`Mesafe formatlandı: ${distanceInMeters} → ${formatted}`);
    return formatted;
  }
  
  const formatted = `${(distanceInMeters / 1000).toFixed(1)} km`;
  console.log(`Mesafe formatlandı: ${distanceInMeters} → ${formatted}`);
  return formatted;
};

/**
 * Süre bilgisini standart formatta biçimlendirir
 * @param durationInSeconds Saniye cinsinden süre değeri
 * @returns Formatlanmış süre metni (örn. "15 dk" veya "1 sa 30 dk")
 */
export const formatDuration = (durationInSeconds: number): string => {
  if (isNaN(durationInSeconds)) {
    console.warn('formatDuration: Geçersiz süre değeri (NaN)');
    return 'Belirtilmemiş';
  }
  
  let formatted = '';
  
  if (durationInSeconds < 60) {
    formatted = `${Math.round(durationInSeconds)} sn`;
  } else if (durationInSeconds < 3600) {
    formatted = `${Math.floor(durationInSeconds / 60)} dk`;
  } else {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    
    if (minutes === 0) {
      formatted = `${hours} sa`;
    } else {
      formatted = `${hours} sa ${minutes} dk`;
    }
  }
  
  console.log(`Süre formatlandı: ${durationInSeconds} saniye → ${formatted}`);
  return formatted;
};

/**
 * Mesafe bilgisini hızlı okunan bir formata dönüştürür
 * @param event Etkinlik objesi (distance_info alanı içermelidir)
 * @returns Okunaklı mesafe metni (örn. "5.2 km (10 dk)" veya "450 m (5 dk)")
 */
export const formatDistanceInfo = (event: any): string => {
  if (!event) {
    console.warn('formatDistanceInfo: Geçersiz etkinlik objesi (null/undefined)');
    return 'Mesafe bilgisi yok';
  }
  
  if (!event.distance_info) {
    // Event için distance_info yoksa veya event null ise
    if (typeof event.distance === 'number') {
      // Eğer doğrudan distance alanı varsa onu kullan (örn: eski API yanıtları için)
      console.log(`Eski format mesafe değeri kullanılıyor: ${event.distance}`);
      return formatDistance(event.distance);
    }
    console.warn('formatDistanceInfo: Etkinlikte distance_info veya distance alanı yok', event);
    return 'Mesafe bilgisi yok';
  }
  
  const { distance, duration } = event.distance_info;
  
  console.log('Mesafe bilgisi formatlanıyor:', { distance, duration });
  
  if (distance && duration) {
    const formatted = `${formatDistance(distance)} (${formatDuration(duration)})`;
    console.log(`Tam mesafe bilgisi: ${formatted}`);
    return formatted;
  } else if (distance) {
    const formatted = formatDistance(distance);
    console.log(`Sadece mesafe bilgisi: ${formatted}`);
    return formatted;
  }
  
  console.warn('formatDistanceInfo: distance_info içinde geçerli değer bulunamadı');
  return 'Mesafe bilgisi yok';
};

/**
 * Etkinliğin mesafesine göre renk kodu döndürür
 * @param event Etkinlik objesi (distance_info alanı içermelidir)
 * @returns Renk kodu (örn. "#4CAF50" - yakın etkinlikler için yeşil, uzak etkinlikler için kırmızıya doğru)
 */
export const getDistanceColor = (event: any): string => {
  if (!event || !event.distance_info) {
    console.warn('getDistanceColor: Mesafe bilgisi olmayan etkinlik için varsayılan renk');
    return '#CCCCCC'; // Gri - mesafe bilgisi olmayan etkinlikler için
  }
  
  const distance = event.distance_info.distance;
  
  if (!distance) {
    console.warn('getDistanceColor: distance_info var ama distance değeri yok');
    return '#CCCCCC';
  }
  
  let color = '';
  
  // Mesafeye göre renk kodları (0-1km: yeşil, 1-3km: sarı, 3-5km: turuncu, 5km+: kırmızı)
  if (distance < 1000) {
    color = '#4CAF50'; // Yeşil - çok yakın
  } else if (distance < 3000) {
    color = '#8BC34A'; // Açık yeşil - yakın
  } else if (distance < 5000) {
    color = '#FFC107'; // Sarı - orta mesafe
  } else if (distance < 10000) {
    color = '#FF9800'; // Turuncu - uzak
  } else {
    color = '#F44336'; // Kırmızı - çok uzak
  }
  
  console.log(`Mesafe rengi belirlendi: ${distance}m → ${color}`);
  return color;
}; 