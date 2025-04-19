/**
 * Tarih ve veri formatlama fonksiyonları
 */

/**
 * Tarih biçimlendirme
 * @param date - Biçimlendirilecek tarih
 * @returns Biçimlendirilmiş tarih stringi
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Kısa tarih biçimlendirme
 * @param date - Biçimlendirilecek tarih
 * @returns Kısa biçimlendirilmiş tarih (gg/aa/yyyy)
 */
export const formatShortDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('tr-TR');
};

/**
 * Mesafe biçimlendirme
 * @param distance - Kilometre cinsinden mesafe
 * @returns Biçimlendirilmiş mesafe (1000m veya 2.5km gibi)
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

/**
 * Süre biçimlendirme
 * @param minutes - Dakika cinsinden süre
 * @returns Biçimlendirilmiş süre (1s 30dk veya 30dk gibi)
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} dk`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} s`;
  }
  
  return `${hours} s ${remainingMinutes} dk`;
}; 