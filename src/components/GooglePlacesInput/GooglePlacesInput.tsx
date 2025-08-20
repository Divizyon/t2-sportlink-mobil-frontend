import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';

interface GooglePlacesInputProps {
  onLocationSelect: (data: { name: string; latitude: number; longitude: number }) => void;
  theme: any;
  error?: string;
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  onLocationSelect,
  theme,
  error
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Konum
      </Text>
      <GooglePlacesAutocomplete
        placeholder="Etkinliğin yapılacağı yeri ara"
        onPress={async (data, details = null) => {
          try {
            if (details?.geometry?.location) {
              onLocationSelect({
                name: data.description,
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng
              });
              return;
            }

            if (data.place_id) {
              const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${data.place_id}&fields=geometry,name,formatted_address&key=AIzaSyBF7lIsGMdoDsaIg2SVdUHbdVv7SOUruYQ`;
              const resp = await fetch(url);
              const json = await resp.json();
              const loc = json?.result?.geometry?.location;
              if (loc) {
                onLocationSelect({
                  name: data.description || json?.result?.name || 'Seçilen Konum',
                  latitude: loc.lat,
                  longitude: loc.lng,
                });
                return;
              }
            }

            onLocationSelect({ name: data.description || 'Seçilen Konum', latitude: 0, longitude: 0 });
          } catch (e) {
            console.error('GooglePlacesInput onPress error:', e);
          }
        }}
        query={{
          key: 'AIzaSyBF7lIsGMdoDsaIg2SVdUHbdVv7SOUruYQ',
          language: 'tr',
          components: 'country:tr',
          types: ['establishment', 'geocode'],
          location: '39.0,35.0', // Türkiye'nin merkez noktası
          radius: '10000', // 10km yarıçap (tüm Türkiye'yi kapsar)
          strictbounds: true, // Sadece belirtilen sınırlar içinde arama yapar
        }}
        fetchDetails={true}
        GooglePlacesDetailsQuery={{ fields: 'geometry,name,formatted_address' }}
        enablePoweredByContainer={false}
        minLength={2}
        debounce={300}
        nearbyPlacesAPI="GooglePlacesSearch"
        styles={{
          container: {
            flex: 0,
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
          },
          listView: {
            backgroundColor: theme.colors.cardBackground || theme.colors.card,
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
            backgroundColor: theme.colors.cardBackground || theme.colors.card,
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
        }}
        renderRow={(rowData) => {
          const title = rowData.structured_formatting?.main_text || '';
          const address = rowData.structured_formatting?.secondary_text || '';
          
          return (
            <View style={styles.rowContainer}>
              <Ionicons 
                name="location-outline" 
                size={24} 
                color={theme.colors.accent}
                style={styles.locationIcon}
              />
              <View style={styles.rowTextContainer}>
                <Text style={[styles.mainText, { color: theme.colors.text }]}>
                  {title}
                </Text>
                {address ? (
                  <Text style={[styles.secondaryText, { color: theme.colors.textSecondary }]}>
                    {address}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
        textInputProps={{
          placeholderTextColor: theme.colors.textSecondary,
          autoCorrect: false,
          returnKeyType: "search",
        }}
        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3', 'sublocality', 'postal_code']}
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 10, // Daha yüksek zIndex listenin diğer elementlerin üzerinde gösterilmesini sağlar
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  locationIcon: {
    marginRight: 12,
  },
  rowTextContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 14,
  },
}); 