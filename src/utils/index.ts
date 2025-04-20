/**
 * Tüm yardımcı fonksiyonları dışa aktaran barrel file
 */
export * from './formatters';
export * from './permissions';
export * from './calculations';

/**
 * Spor tipine göre uygun Ionicons ikonunu döndürür
 * @param {string} sport - Spor adı
 * @returns {string} İkon adı
 */
export const getSportIcon = (sport: string): string => {
  switch (sport.toLowerCase()) {
    case 'futbol':
      return 'football';
    case 'basketbol':
      return 'basketball';
    case 'tenis':
      return 'tennisball';
    case 'voleybol':
      return 'baseball';
    case 'koşu':
    case 'kosu':
      return 'walk';
    case 'bisiklet':
      return 'bicycle';
    case 'yüzme':
    case 'yuzme':
      return 'water';
    case 'yoga':
      return 'body';
    case 'fitness':
      return 'fitness';
    case 'pilates':
      return 'body-outline';
    case 'kickboks':
      return 'hand-right';
    default:
      return 'fitness';
  }
};
