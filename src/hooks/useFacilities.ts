import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { 
  getAllFacilities, 
  getFacilitiesByType, 
  getNearbyFacilities, 
  getFacilityById,
  Facility
} from '../../api/facilitiesService';

interface UseFacilitiesProps {
  initialType?: string;
  maxDistance?: number;
  refreshOnFocus?: boolean;
  autoLoad?: boolean;
}

export const useFacilities = ({
  initialType,
  maxDistance = 10,
  refreshOnFocus = true,
  autoLoad = true
}: UseFacilitiesProps = {}) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedType, setSelectedType] = useState<string | undefined>(initialType);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  // Kullanıcı konumunu alma
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni',
          'Yakınındaki tesisleri görmek için konum izni vermeniz gerekiyor.',
          [{ text: 'Tamam', style: 'default' }]
        );
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      return location.coords;
    } catch (error) {
      console.error('Konum alınamadı:', error);
      setError('Konum alınamadı');
      return null;
    }
  };

  // Tüm tesisleri getir
  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const facilitiesData = await getAllFacilities();
      setFacilities(facilitiesData);
      
      // Filtreleme işlemi
      if (selectedType) {
        const filtered = facilitiesData.filter(facility => 
          facility.type.toLowerCase().includes(selectedType.toLowerCase())
        );
        setFilteredFacilities(filtered);
      } else if (maxDistance) {
        // Mesafeye göre filtrele
        const nearbyFacilities = facilitiesData.filter(facility => {
          if (!facility.distance) return true;
          
          let distanceValue = 0;
          if (facility.distance.includes('km')) {
            distanceValue = parseFloat(facility.distance.replace(' km', ''));
          } else {
            distanceValue = parseFloat(facility.distance.replace(' m', '')) / 1000;
          }
          
          return distanceValue <= maxDistance;
        });
        
        setFilteredFacilities(nearbyFacilities);
      } else {
        setFilteredFacilities(facilitiesData);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Tesisler yüklenirken hata oluştu:', error);
      setError('Tesisler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, maxDistance]);

  // Belirli bir türdeki tesisleri getir
  const filterByType = useCallback((type: string | undefined) => {
    setSelectedType(type);
    
    if (!type) {
      setFilteredFacilities(facilities);
      return;
    }
    
    setFilteredFacilities(
      facilities.filter(facility => facility.type.toLowerCase().includes(type.toLowerCase()))
    );
  }, [facilities]);

  // Belirli bir tesisi seç
  const selectFacility = useCallback(async (facilityId: number) => {
    setIsLoading(true);
    
    try {
      const facility = await getFacilityById(facilityId);
      setSelectedFacility(facility);
    } catch (error) {
      console.error('Tesis detayları yüklenirken hata oluştu:', error);
      setError('Tesis detayları yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tesisleri yenile
  const refreshFacilities = useCallback(async () => {
    setIsLoading(true);
    await fetchFacilities();
    setIsLoading(false);
  }, [fetchFacilities]);

  // İlk yükleme
  useEffect(() => {
    if (autoLoad) {
      const initialize = async () => {
        await getUserLocation();
        await fetchFacilities();
      };
      
      initialize();
    }
  }, [autoLoad, fetchFacilities]);

  // Ekran her odaklandığında yenile
  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus && isInitialized) {
        refreshFacilities();
      }
    }, [refreshOnFocus, refreshFacilities, isInitialized])
  );

  return {
    facilities,
    filteredFacilities,
    selectedFacility,
    isLoading,
    isInitialized,
    error,
    userLocation,
    selectFacility,
    filterByType,
    refreshFacilities,
    getUserLocation,
    fetchFacilities
  };
}; 