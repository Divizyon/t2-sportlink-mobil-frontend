/**
 * Tarihi formatlama fonksiyonu
 * @param dateString ISO tarih formatındaki string
 * @returns Formatlanmış tarih (ör: "01 Ocak 2023")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Türkçe ay isimleri
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Saat aralığını formatlama fonksiyonu
 * @param startTime Başlangıç zamanı (ISO formatında)
 * @param endTime Bitiş zamanı (ISO formatında)
 * @returns Formatlanmış saat aralığı (ör: "14:00 - 16:00")
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const startHour = start.getHours().toString().padStart(2, '0');
  const startMinute = start.getMinutes().toString().padStart(2, '0');
  
  const endHour = end.getHours().toString().padStart(2, '0');
  const endMinute = end.getMinutes().toString().padStart(2, '0');
  
  return `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
};

/**
 * Tarih ve saati birlikte formatla
 * @param dateTimeString ISO formatında tarih-saat
 * @returns Formatlanmış tarih ve saat (ör: "01 Ocak 2023, 14:00")
 */
export const formatDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  
  const formattedDate = formatDate(dateTimeString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${formattedDate}, ${hours}:${minutes}`;
};

/**
 * Bir tarihin bugün, dün veya yarın olup olmadığını kontrol eder
 * @param dateString ISO formatında tarih
 * @returns "Bugün", "Dün", "Yarın" veya formatlanmış tarih
 */
export const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  
  // Tarih bilgilerini sıfırla (sadece gün/ay/yıl karşılaştırması yapmak için)
  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Milisaniye cinsinden fark
  const diffTime = dateWithoutTime.getTime() - todayWithoutTime.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays === 0) {
    return 'Bugün';
  } else if (diffDays === 1) {
    return 'Yarın';
  } else if (diffDays === -1) {
    return 'Dün';
  }
  
  return formatDate(dateString);
}; 