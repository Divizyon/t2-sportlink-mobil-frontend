import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';

/**
 * Harita ekranı bileşeni
 * Bu bileşen, kullanıcıya interaktif bir harita gösterir
 */
export default function MapScreen() {
  // Varsayılan konum (İstanbul)
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Örnek marker konumları
  const markers = [
    {
      id: 1,
      coordinate: { latitude: 41.0082, longitude: 28.9784 },
      title: 'İstanbul',
      description: 'Türkiye\'nin en büyük şehri',
    },
    {
      id: 2,
      coordinate: { latitude: 39.9334, longitude: 32.8597 },
      title: 'Ankara',
      description: 'Türkiye\'nin başkenti',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Sportlink Harita</Text>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mapContainer: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    width: '100%',
    height: '100%',
  },
}); 