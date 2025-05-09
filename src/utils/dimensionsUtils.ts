import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

// Ekran boyutları
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Temel boyut değerlerini belirle 
// iPhone 12/13 (375x812) referans olarak alındı
const baseWidth = 375;
const baseHeight = 812;

// Ölçeklendirme oranları
export const widthScale = SCREEN_WIDTH / baseWidth;
export const heightScale = SCREEN_HEIGHT / baseHeight;

// En küçük ölçek değeri (hem width hem height'tan daha tutarlı ölçeklendirme sağlar)
export const scale = Math.min(widthScale, heightScale);

/**
 * Yatay eksende responsive boyutlandırma
 * @param size Piksel olarak boyut
 */
export const horizontalScale = (size: number): number => {
  return Math.round(size * widthScale);
};

/**
 * Dikey eksende responsive boyutlandırma
 * @param size Piksel olarak boyut
 */
export const verticalScale = (size: number): number => {
  return Math.round(size * heightScale);
};

/**
 * Metin boyutları için responsive ölçeklendirme
 * @param size Piksel olarak boyut
 * @param factor Ölçeklendirme faktörü (varsayılan: 0.5)
 */
export const fontScale = (size: number, factor: number = 0.5): number => {
  return Math.round(size + (scale - 1) * size * factor);
};

/**
 * Platform'a bağlı olarak StatusBar yüksekliğini hesaplar
 */
export const getStatusBarHeight = (): number => {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
};

/**
 * Bottom bar için güvenli alan yüksekliğini hesaplar (özellikle iPhone X ve üstü için)
 */
export const getBottomSpace = (): number => {
  // iPhone X ve üzeri cihazlarda alt kısımda ekstra boşluk var
  return Platform.OS === 'ios' && SCREEN_HEIGHT >= 812 ? 34 : 0;
};

/**
 * Responsive padding değerleri
 */
export const padding = {
  xs: horizontalScale(4),
  sm: horizontalScale(8),
  md: horizontalScale(16),
  lg: horizontalScale(24),
  xl: horizontalScale(32),
  xxl: horizontalScale(48),
};

/**
 * Responsive margin değerleri
 */
export const margin = {
  xs: horizontalScale(4),
  sm: horizontalScale(8),
  md: horizontalScale(16),
  lg: horizontalScale(24),
  xl: horizontalScale(32),
  xxl: horizontalScale(48),
};

/**
 * Responsive font boyutları
 */
export const fontSize = {
  xs: fontScale(12),
  sm: fontScale(14),
  md: fontScale(16),
  lg: fontScale(18),
  xl: fontScale(20),
  xxl: fontScale(24),
  h1: fontScale(30),
  h2: fontScale(26),
  h3: fontScale(22),
};

/**
 * Responsive border radius değerleri
 */
export const borderRadius = {
  xs: horizontalScale(4),
  sm: horizontalScale(8),
  md: horizontalScale(12),
  lg: horizontalScale(16),
  xl: horizontalScale(24),
  round: 9999,
};

/**
 * Ekranın boyutu değiştiğinde dinleyici ekler
 * @param callback Boyut değiştiğinde çalışacak fonksiyon
 */
export const listenToScreenSize = (callback: (width: number, height: number) => void) => {
  return Dimensions.addEventListener('change', ({ window }) => {
    callback(window.width, window.height);
  });
}; 