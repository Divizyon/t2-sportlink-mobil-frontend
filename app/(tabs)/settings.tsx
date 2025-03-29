import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeStore } from '../../store';
import ThemeToggle from '../../components/ThemeToggle';

export default function SettingsScreen() {
  const { isDarkMode } = useThemeStore();
  
  const [notifications, setNotifications] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(false);
  const [dataSync, setDataSync] = React.useState(true);
  
  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
      ]}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Görünüm
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
            Karanlık Mod
          </Text>
          <ThemeToggle />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Bildirimler
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
            Uygulama Bildirimleri
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#0078d7' }}
            thumbColor="#f4f3f4"
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
            E-posta Güncellemeleri
          </Text>
          <Switch
            value={emailUpdates}
            onValueChange={setEmailUpdates}
            trackColor={{ false: '#767577', true: '#0078d7' }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Veri Yönetimi
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
            Otomatik Senkronizasyon
          </Text>
          <Switch
            value={dataSync}
            onValueChange={setDataSync}
            trackColor={{ false: '#767577', true: '#0078d7' }}
            thumbColor="#f4f3f4"
          />
        </View>
        <TouchableOpacity 
          style={[
            styles.button, 
            { backgroundColor: isDarkMode ? '#333' : '#eee' }
          ]}
        >
          <Text style={[styles.buttonText, { color: isDarkMode ? '#fff' : '#333' }]}>
            Önbelleği Temizle
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Uygulama Hakkında
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Versiyon:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Yapı:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>2023.05.01</Text>
        </View>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={{ color: '#0078d7' }}>Gizlilik Politikası</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={{ color: '#0078d7' }}>Kullanım Şartları</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingLabel: {
    fontSize: 16,
  },
  button: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
  },
  linkButton: {
    paddingVertical: 12,
    marginTop: 4,
  },
}); 