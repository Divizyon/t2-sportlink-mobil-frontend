import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSportPreference } from '../../store/userStore/profileStore';

interface SportPreferencesCardProps {
  sportPreferences: UserSportPreference[];
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
  onEditSports?: () => void;
}

// Beceri seviyesi için yıldız sayısını belirle
const getSkillStars = (level: string): number => {
  switch (level) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    case 'professional': return 4;
    default: return 1;
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

export const SportPreferencesCard: React.FC<SportPreferencesCardProps> = ({
  sportPreferences,
  themeColors,
  onEditSports
}) => {
  if (!sportPreferences || sportPreferences.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: themeColors.text }]}>Spor Tercihlerim</Text>
          <TouchableOpacity onPress={onEditSports}>
            <Ionicons name="add-circle-outline" size={24} color={themeColors.accent} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          Henüz spor tercihi eklenmemiş. Tercihlerinizi eklemek için "+" simgesine tıklayın.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: themeColors.text }]}>Spor Tercihlerim</Text>
        <TouchableOpacity onPress={onEditSports}>
          <Ionicons name="create-outline" size={24} color={themeColors.accent} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={sportPreferences}
        keyExtractor={(item) => item.sportId}
        renderItem={({ item }) => (
          <View style={styles.sportItem}>
            <View style={styles.sportIconContainer}>
              <Ionicons 
                name={(item.icon as any) || "fitness-outline"} 
                size={24} 
                color={themeColors.accent} 
              />
            </View>
            <View style={styles.sportInfo}>
              <Text style={[styles.sportName, { color: themeColors.text }]}>
                {item.sportName}
              </Text>
              <View style={styles.skillContainer}>
                <Text style={[styles.skillLevel, { color: themeColors.textSecondary }]}>
                  {getSkillLevelText(item.skillLevel)}:
                </Text>
                <View style={styles.starsContainer}>
                  {[...Array(4)].map((_, i) => (
                    <Ionicons 
                      key={i}
                      name="star" 
                      size={14} 
                      color={i < getSkillStars(item.skillLevel) ? themeColors.accent : '#DDDDDD'} 
                      style={styles.star}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
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
  },
  sportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sportInfo: {
    flex: 1,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  skillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLevel: {
    fontSize: 14,
    marginRight: 6,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  }
}); 