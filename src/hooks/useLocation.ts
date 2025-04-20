import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { requestLocationPermission } from '@/src/utils/permissions';
import { Point } from '@/src/utils/calculations';

/**
 * Konum bilgisini yöneten custom hook
 * @returns Konum bilgisi, yükleme durumu ve hata
 */
export const useLocation = () => {
  const [location, setLocation] = useState<Point | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const getLocation = async () => {
      try {
        setLoading(true);
        const hasPermission = await requestLocationPermission();
        
        if (!hasPermission) {
          setError('Konum izni verilmedi');
          setLoading(false);
          return;
        }
        
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        if (isMounted) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Konum alınamadı');
          console.error('Konum alınamadı:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Konumu yeniden yükle
   */
  const refreshLocation = async () => {
    try {
      setLoading(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setError(null);
    } catch (err) {
      setError('Konum güncellenemedi');
      console.error('Konum güncellenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  return { location, error, loading, refreshLocation };
}; 