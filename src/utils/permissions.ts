import * as Location from 'expo-location';

/**
 * İzin işlemlerini yöneten yardımcı fonksiyonlar
 */

/**
 * Konum izni iste ve durumu kontrol et
 * @returns İzin verildi mi (true/false)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Konum izni alınamadı:', error);
    return false;
  }
};

/**
 * Mevcut konum izin durumunu kontrol et
 * @returns İzin durumu
 */
export const checkLocationPermission = async (): Promise<string> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Konum izin durumu alınamadı:', error);
    return 'error';
  }
}; 