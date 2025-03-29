import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store';

export default function HomeScreen() {
  const { isDarkMode } = useThemeStore();
  
  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
      ]}
    >
      <View style={styles.section}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
          Hoş Geldiniz
        </Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Sportlink uygulamasına hoş geldiniz. Bu uygulama ile spor etkinliklerinizi yönetebilir ve
          takımınızla iletişim kurabilirsiniz.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Yaklaşan Etkinlikler
        </Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Yakında burada etkinliklerinizi görebileceksiniz.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Takım Haberleri
        </Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Takımınızla ilgili en son haberler burada gösterilecek.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 