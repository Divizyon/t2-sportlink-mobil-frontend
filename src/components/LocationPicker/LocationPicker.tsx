import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Alert, Image } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface LocationPickerProps {
  onLocationSelect: (data: { name: string; latitude: number; longitude: number }) => void;
  theme: {
    colors: {
      accent: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      background: string;
      cardBackground: string;
    };
    mode: 'light' | 'dark';
  };
  error?: string;
  initialLocation?: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  theme, 
  error,
  initialLocation = null
}) => {
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(initialLocation);
  
  // Konum input değeri için state
  const [locationInputText, setLocationInputText] = useState<string>(initialLocation?.name || '');
  
  // initialLocation değiştiğinde input değerini güncelle
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setLocationInputText(initialLocation.name);
    }
  }, [initialLocation]);
  
  // Google Static Maps API URL oluştur
  const getMapImageUrl = (lat: number, lng: number): string => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=AIzaSyBF7lIsGMdoDsaIg2SVdUHbdVv7SOUruYQ`;
  };

  // Mevcut konumu almak için fonksiyon
  const getCurrentLocation = async () => {
    setIsLoadingCurrentLocation(true);
    
    try {
      // Konum izni iste
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni Gerekli', 
          'Mevcut konumunuzu kullanmak için konum iznine ihtiyacımız var.',
          [{ text: 'Tamam' }]
        );
        setIsLoadingCurrentLocation(false);
        return;
      }
      
      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Konum adını almak için ters geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationName = [
          address.street, 
          address.district,
          address.city,
          address.country
        ].filter(Boolean).join(', ');
        
        const locationData = {
          name: locationName,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        setSelectedLocation(locationData);
        setLocationInputText(locationName);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Konum alınırken hata:', error);
      Alert.alert('Hata', 'Konumunuz alınamadı. Lütfen manuel olarak konum seçin.');
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };

  // Konum temizleme işlemi
  const clearLocation = () => {
    setSelectedLocation(null);
    setLocationInputText('');
    onLocationSelect({ name: '', latitude: 0, longitude: 0 });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Konum
      </Text>
      
      <View style={styles.locationInputContainer}>
        <GooglePlacesAutocomplete
          placeholder="Etkinliğin yapılacağı yeri ara"
          onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null = null) => {
            if (details) {
              const locationData = {
                name: data.description,
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng
              };
              
             console.log('Seçilen konum:', JSON.stringify(locationData, null, 2));
              setSelectedLocation(locationData);
              setLocationInputText(data.description);
              onLocationSelect(locationData);
            }
          }}
          query={{
            key: "AIzaSyBF7lIsGMdoDsaIg2SVdUHbdVv7SOUruYQ",
            language: 'tr',
            components: 'country:tr',
            types: ['establishment', 'geocode'],
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          minLength={2}
          textInputProps={{
            placeholderTextColor: theme.colors.textSecondary,
            autoCorrect: false,
            value: locationInputText,
            onChangeText: (text) => {
              setLocationInputText(text);
              if (text.length === 0 && selectedLocation) {
                clearLocation();
              }
            }
          }}
          styles={{
            container: {
              flex: 0,
              width: '100%',
            },
            textInput: {
              height: 50,
              borderWidth: 1,
              borderColor: error ? theme.colors.error : theme.colors.border,
              borderRadius: 8,
              backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
              color: theme.colors.text,
              fontSize: 16,
              paddingHorizontal: 12,
              paddingRight: 80, // Sağ taraftaki butonlar için yer aç
            },
            listView: {
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 8,
              marginTop: 8,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              position: 'absolute',
              top: 50,
              left: 0,
              right: 0,
              zIndex: 1000,
            },
            row: {
              backgroundColor: theme.colors.cardBackground,
              padding: 13,
              height: 'auto',
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
            },
            description: {
              color: theme.colors.text,
              fontSize: 14,
            },
            separator: {
              height: 1,
              backgroundColor: theme.colors.border,
            },
            poweredContainer: {
              display: 'none',
            },
          }}
          renderRow={(rowData) => {
            const title = rowData.structured_formatting?.main_text || '';
            const address = rowData.structured_formatting?.secondary_text || '';
            
            return (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
              }}>
                <Ionicons 
                  name="location-outline" 
                  size={24} 
                  color={theme.colors.accent}
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: '500',
                  }}>
                    {title}
                  </Text>
                  {address ? (
                    <Text style={{
                      color: theme.colors.textSecondary,
                      fontSize: 14,
                      marginTop: 2,
                    }}>
                      {address}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          }}
          renderRightButton={() => (
            <View style={styles.rightButtonsContainer}>
              {selectedLocation && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearLocation}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.currentLocationButton}
                onPress={getCurrentLocation}
                disabled={isLoadingCurrentLocation}
              >
                {isLoadingCurrentLocation ? (
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                ) : (
                  <Ionicons 
                    name="locate" 
                    size={24} 
                    color={theme.colors.accent} 
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
          debounce={300}
          timeout={10000}
          filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
          keyboardShouldPersistTaps="handled"
        />
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      
      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <View style={styles.locationHeader}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
            <Text style={[styles.selectedLocationText, { color: theme.colors.text }]}>
              Seçilen Konum
            </Text>
          </View>
          
          <View style={[styles.mapContainer, { borderColor: theme.colors.border }]}>
            <Image
              source={{ uri: getMapImageUrl(selectedLocation.latitude, selectedLocation.longitude) }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={[styles.locationDetails, { backgroundColor: theme.colors.cardBackground }]}>
              <Ionicons name="location" size={18} color={theme.colors.accent} />
              <Text style={[styles.locationName, { color: theme.colors.text }]} numberOfLines={2}>
                {selectedLocation.name}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  locationInputContainer: {
    position: 'relative',
    zIndex: 1,
  },
  rightButtonsContainer: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLocationButton: {
    padding: 8,
    marginLeft: 4,
  },
  clearButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  selectedLocationContainer: {
    marginTop: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedLocationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  mapImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  locationName: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
}); 