import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { useProfileStore, UserSportPreference } from '../../store/userStore/profileStore';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore } from '../../store/eventStore/eventStore';

// Beceri seviyesi için tip
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

// Beceri seviyesi için Türkçe karşılıkları
const skillLevelTranslations: Record<SkillLevel, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
  professional: 'Profesyonel'
};

// Beceri seviyesi renkleri
const skillLevelColors: Record<SkillLevel, string> = {
  beginner: '#4CAF50', // Yeşil
  intermediate: '#2196F3', // Mavi
  advanced: '#FF9800', // Turuncu
  professional: '#F44336' // Kırmızı
};

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const EditSportPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useThemeStore();
  
  // ProfileStore'dan verileri al
  const { 
    sportPreferences,
    updateSportPreference,
    removeSportPreference,
    isUpdating,
    error,
    clearErrors
  } = useProfileStore();
  
  // EventStore'dan tüm spor dallarını al
  const { sports, fetchSports, isLoading: isLoadingSports } = useEventStore();
  
  // Seçilen spor ve beceri seviyesi için state tanımla
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel>('intermediate');
  const [showSportPicker, setShowSportPicker] = useState(false);
  
  // Bileşen yüklendiğinde spor dallarını getir
  useEffect(() => {
    if (sports.length === 0) {
      fetchSports();
    }
    
    // Hata mesajlarını temizle
    return () => clearErrors();
  }, []);
  
  // Hata durumunda kullanıcıya göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearErrors();
    }
  }, [error]);
  
  // Spor tercihi ekleme
  const handleAddSportPreference = async () => {
    if (!selectedSport) {
      Alert.alert('Hata', 'Lütfen bir spor dalı seçin');
      return;
    }
    
    // Seçilen spor dalının adını bul
    const sport = sports.find(s => s.id === selectedSport);
    if (!sport) {
      Alert.alert('Hata', 'Seçilen spor dalı bulunamadı');
      return;
    }
    
    // Mevcut spor tercihleri arasında bu spor var mı kontrol et
    const existingPreference = sportPreferences.find(p => p.sportId === selectedSport);
    if (existingPreference) {
      Alert.alert('Bilgi', 'Bu spor dalı zaten tercihleriniz arasında');
      return;
    }
    
    // Yeni tercihi ekle
    const success = await updateSportPreference({
      sportId: selectedSport,
      sportName: sport.name,
      skillLevel: selectedSkillLevel,
      icon: sport.icon
    });
    
    if (success) {
      // Başarılı olursa formu sıfırla
      setSelectedSport(null);
      setSelectedSkillLevel('intermediate');
      setShowSportPicker(false);
      Alert.alert('Başarılı', 'Spor tercihi başarıyla eklendi');
    }
  };
  
  // Spor tercihi silme
  const handleRemoveSportPreference = async (sportId: string) => {
    Alert.alert(
      'Tercihi Sil',
      'Bu spor dalını tercihlerinizden kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            const success = await removeSportPreference(sportId);
            if (success) {
              Alert.alert('Başarılı', 'Spor tercihi başarıyla kaldırıldı');
            }
          }
        }
      ]
    );
  };
  
  // Spor dalı seçme
  const handleSelectSport = (sportId: string) => {
    setSelectedSport(sportId);
    setShowSportPicker(false);
  };
  
  // Beceri seviyesi seçme
  const handleSelectSkillLevel = (level: SkillLevel) => {
    setSelectedSkillLevel(level);
  };
  
  // Spor dalları yüklenirken göster
  if (isLoadingSports) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Spor dalları yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mevcut Spor Tercihleri */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Mevcut Spor Tercihleriniz
          </Text>
          
          {sportPreferences.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="fitness-outline" size={36} color={theme.colors.primary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Henüz bir spor tercihi eklenmemiş
              </Text>
            </View>
          ) : (
            <FlatList
              data={sportPreferences}
              keyExtractor={(item) => item.sportId}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.sportCard, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.sportInfo}>
                    <View style={styles.sportNameContainer}>
                      <Text style={[styles.sportName, { color: theme.colors.text }]}>
                        {item.sportName}
                      </Text>
                      <View 
                        style={[
                          styles.skillLevelBadge, 
                          { backgroundColor: skillLevelColors[item.skillLevel] + '20' }
                        ]}
                      >
                        <Text 
                          style={[
                            styles.skillLevelText, 
                            { color: skillLevelColors[item.skillLevel] }
                          ]}
                        >
                          {skillLevelTranslations[item.skillLevel]}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveSportPreference(item.sportId)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
        
        {/* Yeni Spor Tercihi Ekleme */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Yeni Spor Tercihi Ekle
          </Text>
          
          {/* Spor Dalı Seçimi */}
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowSportPicker(!showSportPicker)}
          >
            <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
              {selectedSport 
                ? sports.find(s => s.id === selectedSport)?.name || 'Spor Dalı Seçin'
                : 'Spor Dalı Seçin'
              }
            </Text>
            <Ionicons 
              name={showSportPicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
          
          {/* Spor Dalları Listesi */}
          {showSportPicker && (
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                {sports.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.pickerItem,
                      selectedSport === sport.id && { backgroundColor: theme.colors.primary + '20' }
                    ]}
                    onPress={() => handleSelectSport(sport.id)}
                  >
                    <Text 
                      style={[
                        styles.pickerItemText, 
                        { color: theme.colors.text },
                        selectedSport === sport.id && { color: theme.colors.primary, fontWeight: 'bold' }
                      ]}
                    >
                      {sport.name}
                    </Text>
                    
                    {selectedSport === sport.id && (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Beceri Seviyesi Seçimi */}
          <Text style={[styles.fieldLabel, { color: theme.colors.text, marginTop: 16 }]}>
            Beceri Seviyesi
          </Text>
          
          <View style={styles.skillLevelContainer}>
            {(Object.keys(skillLevelTranslations) as SkillLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.skillLevelButton,
                  { 
                    backgroundColor: selectedSkillLevel === level 
                      ? skillLevelColors[level]
                      : theme.colors.card 
                  }
                ]}
                onPress={() => handleSelectSkillLevel(level)}
              >
                <Text 
                  style={[
                    styles.skillLevelButtonText, 
                    { 
                      color: selectedSkillLevel === level 
                        ? 'white'
                        : theme.colors.text 
                    }
                  ]}
                >
                  {skillLevelTranslations[level]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Ekle Butonu */}
          <TouchableOpacity
            style={[
              styles.addButton, 
              { backgroundColor: theme.colors.primary },
              (!selectedSport || isUpdating) && { opacity: 0.6 }
            ]}
            onPress={handleAddSportPreference}
            disabled={!selectedSport || isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Spor Tercihini Ekle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  sportCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  sportInfo: {
    flex: 1,
  },
  sportNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  skillLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  skillLevelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 200,
  },
  pickerScrollView: {
    padding: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  skillLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillLevelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
