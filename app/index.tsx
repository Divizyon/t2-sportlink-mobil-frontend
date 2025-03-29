import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import ThemeToggle from '../components/ThemeToggle';
import LoginForm from '../components/LoginForm';
import { useAuthStore, useThemeStore } from '../store';

export default function Index() {
  // Zustand store'larından state'leri al
  const { isAuthenticated, user } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // Harita sayfalarına yönlendirme
  const navigateToFacilities = () => {
    (router as any).push('/facilities');
  };

  const navigateToRoutes = () => {
    (router as any).push('/routes');
  };

  const navigateToMap = () => {
    (router as any).push('/map');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
        Sportlink Mobil Uygulaması
      </Text>
      
      <ThemeToggle />
      
      {isAuthenticated ? (
        <>
          {/* Harita özellikleri bölümü - sadece giriş yapmış kullanıcılara gösteriliyor */}
          <View style={styles.featuresContainer}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
              Harita Özellikleri
            </Text>
            
            <View style={styles.cardsContainer}>
              {/* Spor Tesisleri Kartı */}
              <TouchableOpacity 
                style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}
                onPress={navigateToFacilities}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.iconPlaceholder}>🏟️</Text>
                </View>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                  Spor Tesisleri
                </Text>
                <Text style={[styles.cardDescription, { color: isDarkMode ? '#ccc' : '#666' }]}>
                  Yakındaki spor tesislerini haritada görüntüleyin ve detaylı bilgi alın.
                </Text>
              </TouchableOpacity>
              
              {/* Spor Rotaları Kartı */}
              <TouchableOpacity 
                style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}
                onPress={navigateToRoutes}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.iconPlaceholder}>🏃</Text>
                </View>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                  Spor Rotaları
                </Text>
                <Text style={[styles.cardDescription, { color: isDarkMode ? '#ccc' : '#666' }]}>
                  Koşu, bisiklet ve yürüyüş rotalarını keşfedin veya kendi rotanızı oluşturun.
                </Text>
              </TouchableOpacity>
              
              {/* Genel Harita Kartı */}
              <TouchableOpacity 
                style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}
                onPress={navigateToMap}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.iconPlaceholder}>🗺️</Text>
                </View>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                  Genel Harita
                </Text>
                <Text style={[styles.cardDescription, { color: isDarkMode ? '#ccc' : '#666' }]}>
                  Genel harita görünümü ile çevrenizdeki tüm noktaları keşfedin.
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                React Native Maps Hakkında
              </Text>
              <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                React Native Maps, mobil uygulamalarda harita ve konum tabanlı özellikler sunmak için kullanılan güçlü bir kütüphanedir. Google Maps ve Apple Maps entegrasyonu sağlar.
              </Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <LoginForm />
          <View style={[styles.loginRequiredContainer, { backgroundColor: isDarkMode ? '#252525' : '#f0f0f0' }]}>
            <Text style={[styles.loginRequiredText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Harita özelliklerini kullanmak için lütfen giriş yapın.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeContainer: {
    backgroundColor: '#e6f7ff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuresContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconPlaceholder: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loginRequiredContainer: {
    marginTop: 40,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  loginRequiredText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
