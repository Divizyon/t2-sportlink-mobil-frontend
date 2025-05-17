import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSportPreference } from '../../store/userStore/profileStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { Sport } from '../../types/eventTypes/event.types';

interface SportPreferencesCardProps {
  sportPreferences: UserSportPreference[];
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
  onEditSports?: () => void;
  updateSportPreference?: (preference: UserSportPreference) => Promise<boolean>;
  removeSportPreference?: (sportId: string) => Promise<boolean>;
}

// Beceri seviyesi için yıldız sayısını belirle
const getSkillStars = (level: string): number => {
  switch (level) {
    case 'beginner': return 1.5;
    case 'intermediate': return 2.5;
    case 'advanced': return 3.5;
    case 'professional': return 4;
    default: return 1.5;
  }
};

// Beceri seviyesi için Türkçe karşılık
const getSkillLevelText = (level: string): string => {
  switch (level) {
    case 'beginner': return 'Başlangıç';
    case 'intermediate': return 'Orta';
    case 'advanced': return 'İleri';
    case 'professional': return 'Profesyonel';
    default: return 'Başlangıç';
  }
};

// Spor ikonu belirle
const getSportIcon = (sportName: string): any => {
  const sportLower = sportName.toLowerCase();
  
  if (sportLower.includes('futbol')) return 'football-outline';
  if (sportLower.includes('basketbol')) return 'basketball-outline';
  if (sportLower.includes('voleybol')) return 'baseball-outline';
  if (sportLower.includes('hentbol')) return 'baseball-outline';
  
  if (sportLower.includes('tenis')) return 'tennisball-outline';
  if (sportLower.includes('masa tenis')) return 'tennisball-outline';
  if (sportLower.includes('badminton')) return 'tennisball-outline';
  
  if (sportLower.includes('yüzme')) return 'water-outline';
  if (sportLower.includes('dalış')) return 'water-outline';
  if (sportLower.includes('yelken')) return 'boat-outline';
  if (sportLower.includes('sörf')) return 'boat-outline';
  
  if (sportLower.includes('koşu')) return 'walk-outline';
  if (sportLower.includes('bisiklet')) return 'bicycle-outline';
  if (sportLower.includes('fitness')) return 'barbell-outline';
  if (sportLower.includes('yoga')) return 'body-outline';
  if (sportLower.includes('pilates')) return 'body-outline';
  
  if (sportLower.includes('boks')) return 'hand-left-outline';
  if (sportLower.includes('güreş')) return 'people-outline';
  
  if (sportLower.includes('dağcılık')) return 'trending-up-outline';
  if (sportLower.includes('kayak')) return 'snow-outline';
  if (sportLower.includes('buz pateni')) return 'snow-outline';
  
  if (sportLower.includes('dans')) return 'musical-notes-outline';
  if (sportLower.includes('bowling')) return 'disc-outline';
  if (sportLower.includes('golf')) return 'golf-outline';
  if (sportLower.includes('okçuluk')) return 'arrow-forward-outline';
  if (sportLower.includes('satranç')) return 'grid-outline';
  if (sportLower.includes('e-spor') || sportLower.includes('espor')) return 'game-controller-outline';
  
  return 'body-outline';
};

// İkon kullanımları için özel bir yardımcı bileşen tanımlayalım
const SportIcon: React.FC<{
  sportName: string;
  size: number;
  color: string;
}> = ({ sportName, size, color }) => {
  // Spor adına göre ikonu belirle
  const getIconName = (sportName: string): any => {
    const sportLower = sportName.toLowerCase();
    
    if (sportLower.includes('futbol')) return 'football-outline';
    if (sportLower.includes('basketbol')) return 'basketball-outline';
    if (sportLower.includes('voleybol')) return 'baseball-outline';
    if (sportLower.includes('hentbol')) return 'baseball-outline';
    
    if (sportLower.includes('tenis')) return 'tennisball-outline';
    if (sportLower.includes('masa tenis')) return 'tennisball-outline';
    if (sportLower.includes('badminton')) return 'tennisball-outline';
    
    if (sportLower.includes('yüzme')) return 'water-outline';
    if (sportLower.includes('dalış')) return 'water-outline';
    if (sportLower.includes('yelken')) return 'boat-outline';
    if (sportLower.includes('sörf')) return 'boat-outline';
    
    if (sportLower.includes('koşu')) return 'walk-outline';
    if (sportLower.includes('bisiklet')) return 'bicycle-outline';
    if (sportLower.includes('fitness')) return 'barbell-outline';
    if (sportLower.includes('yoga')) return 'body-outline';
    if (sportLower.includes('pilates')) return 'body-outline';
    
    if (sportLower.includes('boks')) return 'hand-left-outline';
    if (sportLower.includes('güreş')) return 'people-outline';
    
    if (sportLower.includes('dağcılık')) return 'trending-up-outline';
    if (sportLower.includes('kayak')) return 'snow-outline';
    if (sportLower.includes('buz pateni')) return 'snow-outline';
    
    if (sportLower.includes('dans')) return 'musical-notes-outline';
    if (sportLower.includes('bowling')) return 'disc-outline';
    if (sportLower.includes('golf')) return 'golf-outline';
    if (sportLower.includes('okçuluk')) return 'arrow-forward-outline';
    if (sportLower.includes('satranç')) return 'grid-outline';
    if (sportLower.includes('e-spor') || sportLower.includes('espor')) return 'game-controller-outline';
    
    return 'body-outline';
  };
  
  // İkon adını al
  const iconName = getIconName(sportName);
  
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color + '20',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Ionicons name={iconName as any} size={size * 0.6} color={color} />
    </View>
  );
};

// Maksimum izin verilen spor tercihi sayısı
const MAX_SPORT_PREFERENCES = 5;

// Spor Kategorisi Seçim Modalı
interface SportSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  sports: Sport[];
  onSelectSport: (sport: Sport) => void;
  tempPreferences: UserSportPreference[];
  onRemoveSport: (sportId: string) => void;
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
}

const SportSelectionModal: React.FC<SportSelectionModalProps> = ({
  visible,
  onClose,
  sports,
  onSelectSport,
  tempPreferences,
  onRemoveSport,
  themeColors
}) => {
  // Limit durumunu kontrol et
  const isLimitReached = tempPreferences.length >= MAX_SPORT_PREFERENCES;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={[styles.bottomModalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]} 
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[styles.bottomModalContent, { backgroundColor: themeColors.cardBackground }]} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
         
          
          <View style={styles.modalDragIndicator} />
          
          <ScrollView style={styles.sportsList}>
            <View style={styles.selectedSportsContainer}>
              {tempPreferences.length > 0 && (
                <>
                  <Text style={[styles.selectedSportsTitle, { color: themeColors.text }]}>
                    Seçilen Sporlar: {tempPreferences.length}/{MAX_SPORT_PREFERENCES}
                  </Text>
                  {tempPreferences.map((pref) => (
                    <View key={pref.sportId} style={styles.selectedSportItem}>
                      <TouchableOpacity 
                        style={[styles.removeButton, {right: -5, top: -5}]} 
                        onPress={() => onRemoveSport(pref.sportId)}
                      >
                        <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
                      </TouchableOpacity>
                      <View style={[styles.sportIconContainer, { backgroundColor: themeColors.accent + '20' }]}>
                        <SportIcon 
                          sportName={pref.sportName}
                          size={24} 
                          color={themeColors.accent}
                        />
                      </View>
                      <View style={styles.sportInfo}>
                        <Text style={[styles.selectedSportName, { color: themeColors.text }]}>
                          {pref.sportName}
                        </Text>
                        <View style={{...styles.skillContainer, marginTop: 2}}>
                          <Text style={[styles.skillLevel, { color: themeColors.textSecondary, width: 'auto', marginRight: 4, fontSize: 12 }]}>
                            {getSkillLevelText(pref.skillLevel)}:
                          </Text>
                          <View style={[styles.starsContainer, {justifyContent: 'flex-start'}]}>
                            {renderStars(getSkillStars(pref.skillLevel), 12, themeColors.accent, '#DDDDDD')}
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                  <View style={styles.divider} />
                </>
              )}
            </View>
            
            {isLimitReached && (
              <View style={[styles.limitWarning, { backgroundColor: themeColors.accent + '15', borderColor: themeColors.accent + '30' }]}>
                <Ionicons name="information-circle" size={20} color={themeColors.accent} style={{marginRight: 6}} />
                <Text style={{ color: themeColors.text, fontSize: 14 }}>
                  Maksimum {MAX_SPORT_PREFERENCES} spor seçebilirsiniz. Yeni bir spor eklemek için önce bir sporu kaldırın.
                </Text>
              </View>
            )}
            
            <Text style={[styles.categoriesTitle, { color: themeColors.text }]}>
              Tüm Kategoriler:
            </Text>
            
            {sports.map((sport) => {
              const isSelected = tempPreferences.some(p => p.sportId === sport.id);
              const selectedLevel = isSelected 
                ? tempPreferences.find(p => p.sportId === sport.id)?.skillLevel 
                : null;
              
              // Bu spor zaten seçilmişse veya limit dolmuşsa özelliklerini ayarla
              const isDisabled = isLimitReached && !isSelected;
              
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportListItem, 
                    { 
                      borderBottomColor: themeColors.textSecondary + '30',
                      backgroundColor: isSelected 
                        ? themeColors.accent + '15' 
                        : isDisabled 
                          ? themeColors.textSecondary + '10' 
                          : 'transparent',
                      opacity: isDisabled ? 0.6 : 1
                    }
                  ]}
                  onPress={() => {
                    if (!isDisabled || isSelected) {
                      onSelectSport(sport);
                    }
                  }}
                  activeOpacity={isDisabled && !isSelected ? 0.9 : 0.7}
                  disabled={isDisabled && !isSelected}
                >
                  <View style={[styles.sportIconContainer, { backgroundColor: themeColors.accent + '20' }]}>
                    <SportIcon 
                      sportName={sport.name}
                      size={28} 
                      color={isDisabled && !isSelected ? themeColors.textSecondary : themeColors.accent}
                    />
                  </View>
                  <Text style={[
                    styles.sportListItemText, 
                    { 
                      color: isDisabled && !isSelected ? themeColors.textSecondary : themeColors.text 
                    }
                  ]}>
                    {sport.name}
                  </Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {isSelected && selectedLevel && (
                      <View style={[styles.selectedItemBadge, { backgroundColor: themeColors.accent + '30' }]}>
                        <Text style={[styles.selectedItemText, { color: themeColors.accent }]}>
                          {getSkillLevelText(selectedLevel)}
                        </Text>
                        {renderStars(getSkillStars(selectedLevel), 10, themeColors.accent, themeColors.accent + '40')}
                      </View>
                    )}
                    <Ionicons 
                      name={isSelected ? "checkmark-circle" : isDisabled ? "lock-closed" : "chevron-forward"} 
                      size={22} 
                      color={isSelected 
                        ? themeColors.accent 
                        : isDisabled 
                          ? themeColors.textSecondary 
                          : themeColors.textSecondary} 
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <TouchableOpacity
            style={[
              styles.saveButton, 
              { backgroundColor: themeColors.accent }
            ]}
            onPress={onClose}
          >
            <Text style={styles.saveButtonText}>Kapat</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Beceri Seviyesi Seçim Modalı
interface SkillLevelSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSkill: (level: string) => void;
  initialLevel?: string;
  sportName: string;
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
}

const SkillLevelSelectionModal: React.FC<SkillLevelSelectionModalProps> = ({
  visible,
  onClose,
  onSelectSkill,
  initialLevel = 'beginner',
  sportName,
  themeColors
}) => {
  
  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevel);
  const [selectedStars, setSelectedStars] = useState<number>(getSkillStars(initialLevel));

  useEffect(() => {
    if (visible) {
      // Modal açıldığında seviyeyi başlangıç değerine ayarla
      setSelectedLevel(initialLevel);
      setSelectedStars(getSkillStars(initialLevel));
    }
  }, [visible, initialLevel]);

  // Yıldız sayısına göre beceri seviyesini belirle
  const getLevelFromStars = (stars: number): string => {
    if (stars <= 1) return 'beginner';
    if (stars <= 2) return 'intermediate';
    if (stars <= 3) return 'advanced';
    return 'professional';
  };

  // Yıldız seçildiğinde
  const handleStarPress = (starCount: number) => {
    setSelectedStars(starCount);
    setSelectedLevel(getLevelFromStars(starCount));
  };

  const handleSave = () => {
    onSelectSkill(selectedLevel);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={[styles.bottomModalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]} 
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[styles.bottomModalContent, { backgroundColor: themeColors.cardBackground }]} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {sportName} - Beceri Seviyesi
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalDragIndicator} />
          
          <View style={styles.skillSelectContainer}>
            <Text style={[styles.skillLevelText, { color: themeColors.text }]}>
              {getSkillLevelText(selectedLevel)}
            </Text>
            
            <View style={styles.starSelectContainer}>
              {[1, 2, 3, 4].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  style={styles.starButton}
                >
                  <Ionicons 
                    name={star <= selectedStars ? "star" : "star-outline"} 
                    size={36} 
                    color={star <= selectedStars ? themeColors.accent : themeColors.textSecondary} 
                    style={styles.star}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.skillDescription, { color: themeColors.textSecondary }]}>
              {selectedLevel === 'beginner' && "Yeni başladım, temel becerileri öğreniyorum."}
              {selectedLevel === 'intermediate' && "Temel becerilere sahibim, gelişmeye devam ediyorum."}
              {selectedLevel === 'advanced' && "İyi seviyedeyim, taktiksel becerilerim var."}
              {selectedLevel === 'professional' && "Bu sporda uzmanım, yüksek seviyede tecrübem var."}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: themeColors.accent }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Seç</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Yıldızları render etme fonksiyonu (tam ve yarım yıldızları hesaplar)
const renderStars = (rating: number, size: number, activeColor: string, inactiveColor: string) => {
  const totalStars = 4;
  const starElements = [];
  
  for (let i = 1; i <= totalStars; i++) {
    if (i <= Math.floor(rating)) {
      // Tam yıldız
      starElements.push(
        <Ionicons key={`star-${i}`} name="star" size={size} color={activeColor} />
      );
    } else if (i - 0.5 === Math.floor(rating + 0.5)) {
      // Yarım yıldız
      starElements.push(
        <Ionicons key={`star-half-${i}`} name="star-half" size={size} color={activeColor} />
      );
    } else {
      // Boş yıldız
      starElements.push(
        <Ionicons key={`star-outline-${i}`} name="star-outline" size={size} color={inactiveColor} />
      );
    }
  }
  
  return starElements;
};

export const SportPreferencesCard: React.FC<SportPreferencesCardProps> = ({
  sportPreferences,
  themeColors,
  updateSportPreference,
  removeSportPreference
}) => {
  const { sports, fetchSports } = useEventStore();
  
  // Modal kontrolü için state'ler
  const [sportModalVisible, setSportModalVisible] = useState(false);
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  
  // Doğrudan state'e atanacak tercihler
  const [preferences, setPreferences] = useState<UserSportPreference[]>([]);
  const [tempPreferences, setTempPreferences] = useState<UserSportPreference[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Her render işleminde modal durumunu loglayalım

  // Başlangıçta verileri yükle
  useEffect(() => {
    if (!sports || sports.length === 0) {
      fetchSports();
    }
    
    if (sportPreferences && sportPreferences.length > 0) {
      // Gelen tercihleri logla
      
      // Tercihleri state'e ata
      setPreferences([...sportPreferences]);
      setTempPreferences([...sportPreferences]);
    } else {
      setPreferences([]);
      setTempPreferences([]);
    }
  }, [sportPreferences]);
  
  // Spor tercihini kaldır
  const handleRemoveSport = (sportId: string) => {
    
    // Önce UI'dan kaldır
    const updatedPreferences = preferences.filter(pref => pref.sportId !== sportId);
    setPreferences(updatedPreferences);
    
    // API'ye silme isteği gönder
    if (removeSportPreference) {
      removeSportPreference(sportId).then(success => {
        if (success) {
        } else {
          console.error("Spor tercihi kaldırılırken bir hata oluştu");
          // Hata durumunda eski tercihleri geri yükle
          setPreferences(preferences);
        }
      });
    }
  };
  
  // Spor modalını aç
  const handleOpenSportModal = () => {
    setTempPreferences([...preferences]); // Geçici tercihleri sıfırla
    setHasChanges(false);
    setSportModalVisible(true);
  };
  
  // Spor seçildiğinde
  const handleSelectSport = (sport: Sport) => {
    console.log(`Seçilen spor: ${sport.name}, ID: ${sport.id}`);
    
    // Maksimum sayıyı kontrol et
    if (tempPreferences.length >= MAX_SPORT_PREFERENCES && !tempPreferences.some(p => p.sportId === sport.id)) {
      // Bu kısım aslında UI tarafında engellendiği için buraya gelmemeli
      console.log(`Maksimum spor sayısına ulaşıldı: ${MAX_SPORT_PREFERENCES}`);
      return;
    }
    
    // Önce modali kapat, sonra sporu seç ve beceri modalini aç
    // Bu, iki modal arasındaki geçişte oluşabilecek problemleri önler
    setSportModalVisible(false);
    
    // Kısa bir süre sonra beceri modalini açalım
    setTimeout(() => {
      setSelectedSport(sport);
      console.log(`Beceri seviyesi modalı açılacak: Sport=${sport.name}`);
      setSkillModalVisible(true);
    }, 300);
  };

  // Beceri seviyesi seçildiğinde
  const handleSelectSkill = (level: string) => {
    if (selectedSport) {
      console.log(`Beceri seviyesi seçildi: ${level} - ${getSkillLevelText(level)} (Spor: ${selectedSport.name})`);
      
      // Seçilen spor ve seviyeden tercih objesi oluştur
      const sportPreference: UserSportPreference = {
        sportId: selectedSport.id,
        sportName: selectedSport.name,
        skillLevel: level as UserSportPreference['skillLevel'],
        icon: selectedSport.icon || getSportIcon(selectedSport.name)
      };
      
      // Bu spor zaten eklenmiş mi kontrol et
      const exists = tempPreferences.some(pref => pref.sportId === selectedSport.id);
      let updatedPreferences = [...tempPreferences];
      
      if (exists) {
        // Mevcut sporu güncelle
        updatedPreferences = tempPreferences.map(pref => 
          pref.sportId === selectedSport.id ? sportPreference : pref
        );
      } else {
        // Yeni spor ekle
        updatedPreferences = [...tempPreferences, sportPreference];
      }
      
      // Ekle veya güncelle
      if (updateSportPreference) {
        updateSportPreference(sportPreference).then(success => {
          if (success) {
          } else {
            console.error("Spor tercihi eklenirken/güncellenirken bir hata oluştu");
          }
        });
      }
      
      // UI'ı güncelle
      setTempPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      setHasChanges(true);
    }
    
    // Beceri modalını kapat, spor modalını aç
    setSkillModalVisible(false);
    
    // Kısa bir gecikme ile spor modalını açalım
    setTimeout(() => {
      // Spor modalını tekrar aç
      setSportModalVisible(true);
    }, 300);
  };

  // Skill modal kapatıldığında
  const handleCloseSkillModal = () => {
    setSkillModalVisible(false);
    
    // Tekrar spor modalını aç
    setTimeout(() => {
      setSportModalVisible(true);
    }, 300);
  };
  
  // Modal değişiklikleri kaydet
  const handleSaveChanges = () => {
    setPreferences([...tempPreferences]);
    
    // API'ye göndermek için doğru formatta veri hazırla - backend sadece sportId ve skillLevel bekliyor
    const backendPreferences = tempPreferences.map(pref => ({
      sportId: pref.sportId,
      skillLevel: pref.skillLevel,
      // Arayüz için ihtiyaç duyulan diğer alanlar frontend'de eklenecek
      sportName: pref.sportName,
      icon: pref.icon
    }));
    
    
    // API'ye güncelleme gönder
    if (updateSportPreference) {
      backendPreferences.forEach(pref => updateSportPreference(pref));
    }
    
    setSportModalVisible(false);
    setHasChanges(false);
  };

  if (!preferences || preferences.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: themeColors.text }]}>Spor Tercihlerim</Text>
          <TouchableOpacity onPress={handleOpenSportModal}>
            <Ionicons name="add-circle-outline" size={24} color={themeColors.accent} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          Henüz spor tercihi eklenmemiş. Tercihlerinizi eklemek için "+" simgesine tıklayın.
        </Text>
        
        {/* Spor Seçim Modalı */}
        <SportSelectionModal
          visible={sportModalVisible}
          onClose={() => setSportModalVisible(false)}
          sports={sports || []}
          onSelectSport={handleSelectSport}
          tempPreferences={tempPreferences}
          onRemoveSport={(sportId) => {
            const updatedPrefs = tempPreferences.filter(p => p.sportId !== sportId);
            setTempPreferences(updatedPrefs);
            setHasChanges(true);
          }}
          themeColors={themeColors}
        />
        
        {/* Beceri Seviyesi Seçim Modalı */}
        {selectedSport && (
          <SkillLevelSelectionModal
            visible={skillModalVisible}
            onClose={handleCloseSkillModal}
            onSelectSkill={handleSelectSkill}
            initialLevel={tempPreferences.find(pref => pref.sportId === selectedSport.id)?.skillLevel || "beginner"}
            sportName={selectedSport.name}
            themeColors={themeColors}
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: themeColors.text }]}>Spor Tercihlerim</Text>
        <TouchableOpacity onPress={handleOpenSportModal}>
          <Ionicons name="add-circle-outline" size={24} color={themeColors.accent} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={preferences}
        keyExtractor={(item) => item.sportId}
        renderItem={({ item }) => {
          return (
            <View style={styles.sportItem}>
              <View style={styles.sportIconContainer}>
                <SportIcon 
                  sportName={item.sportName || "Bilinmeyen Spor"}
                  size={26} 
                  color={themeColors.accent}
                />
              </View>
              <View style={styles.sportInfo}>
                <Text style={[styles.sportName, { color: themeColors.text }]}>
                  {item.sportName || "Bilinmeyen Spor"}
                </Text>
                <View style={styles.skillContainer}>
                  <Text style={[styles.skillLevel, { color: themeColors.textSecondary }]}>
                    {getSkillLevelText(item.skillLevel)}:
                  </Text>
                  <View style={styles.starsContainer}>
                    {renderStars(getSkillStars(item.skillLevel), 14, themeColors.accent, '#DDDDDD')}
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        scrollEnabled={false}
      />
      
      {/* Spor Seçim Modalı */}
      <SportSelectionModal
        visible={sportModalVisible}
        onClose={() => setSportModalVisible(false)}
        sports={sports || []}
        onSelectSport={handleSelectSport}
        tempPreferences={tempPreferences}
        onRemoveSport={(sportId) => {
          const updatedPrefs = tempPreferences.filter(p => p.sportId !== sportId);
          setTempPreferences(updatedPrefs);
          setHasChanges(true);
        }}
        themeColors={themeColors}
      />
      
      {/* Beceri Seviyesi Seçim Modalı */}
      {selectedSport && (
        <SkillLevelSelectionModal
          visible={skillModalVisible}
          onClose={handleCloseSkillModal}
          onSelectSkill={handleSelectSkill}
          initialLevel={tempPreferences.find(pref => pref.sportId === selectedSport.id)?.skillLevel || "beginner"}
          sportName={selectedSport.name}
          themeColors={themeColors}
        />
      )}
    </View>
  );
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
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    position: 'relative',
  },
  sportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E920',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sportInfo: {
    flex: 1,
    width: '100%',
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  skillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  skillLevel: {
    fontSize: 14,
    marginRight: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  // Modal stilleri
  bottomModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomModalContent: {
    width: '100%',
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalDragIndicator: {
    margin: 10,
    width: 40,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sportsList: {
    maxHeight: 500,
    marginBottom: 10,
  },
  sportListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  sportListItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  // Beceri seviyesi modal stilleri
  skillSelectContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  skillLevelText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  starSelectContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    justifyContent: 'center',
  },
  starButton: {
    padding: 8,
  },
  skillDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 20,
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Seçilen sporlar bölümü
  selectedSportsContainer: {
    marginBottom: 16,
  },
  selectedSportsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  selectedSportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 15,
    position: 'relative',
  },
  selectedSportName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 8,
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectedItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    flexDirection: 'row', 
    alignItems: 'center'
  },
  selectedItemText: {
    fontSize: 12,
    fontWeight: '500'
  },
  limitWarning: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
}); 