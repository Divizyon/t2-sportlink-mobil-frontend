import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserLocation } from '../../store/userStore/profileStore';
import * as Location from 'expo-location';

interface LocationCardProps {
  location: UserLocation | null;
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
  onEditLocation?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  themeColors,
  onEditLocation
}) => {
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Konum verilerinden adres bilgisini çözümle
  useEffect(() => {
    const getAddressFromCoordinates = async () => {
      if (!location) return;
      
      // Eğer anlamlı bir konum adı zaten varsa ve "Kullanıcı Konumu" değilse, onu kullan
      if (location.locationName && location.locationName !== 'Kullanıcı Konumu' && location.locationName !== 'Belirtilmemiş') {
        setDisplayAddress(location.locationName);
        return;
      }
      
      setIsLoadingAddress(true);
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude
        });
        
        if (addressResponse && addressResponse.length > 0) {
          const address = addressResponse[0];
          
          // Anlamlı adres parçalarını birleştir
          const addressParts = [
            address.name,
            address.street,
            address.district,
            address.city,
            address.region
          ].filter(Boolean);
          
          const formattedAddress = addressParts.length > 0 
            ? addressParts.join(', ')
            : 'Belirtilmemiş Konum';
            
          setDisplayAddress(formattedAddress);
        } else {
          setDisplayAddress(location.locationName || 'Belirtilmemiş Konum');
        }
      } catch (error) {
        console.error('Adres çözümleme hatası:', error);
        setDisplayAddress(location.locationName || 'Belirtilmemiş Konum');
      } finally {
        setIsLoadingAddress(false);
      }
    };
    
    getAddressFromCoordinates();
  }, [location]);

  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: themeColors.text }]}>Konum Bilgim</Text>
          <TouchableOpacity onPress={onEditLocation}>
            <Ionicons name="add-circle-outline" size={24} color={themeColors.accent} />
          </TouchableOpacity>
        </View>
       
      </View>
    );
  }

};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    alignSelf: 'center',
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  }
}); 