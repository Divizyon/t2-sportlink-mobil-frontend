import { Dimensions } from 'react-native';

/**
 * Ekran boyutları ve ölçeklendirme için sabitler
 */
const { width, height } = Dimensions.get('window');

export const DIMENSIONS = {
  screenWidth: width,
  screenHeight: height,
  scale: Math.min(width, height) / 375, // Temel ölçeklendirme (tasarım genişliği: 375)
};

/**
 * Ekran boyutlarına göre ölçeklendirme yapar
 * @param size - Ölçeklendirilecek boyut
 * @returns Ölçeklendirilmiş boyut
 */
export const normalize = (size: number): number => {
  return Math.round(size * DIMENSIONS.scale);
}; 