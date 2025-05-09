import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecommendationReason as RecommendationReasonType } from '../../../types/eventTypes/event.types';
import { useThemeStore } from '../../../store/appStore/themeStore';

interface RecommendationReasonProps {
  reason: RecommendationReasonType;
}

const RecommendationReason: React.FC<RecommendationReasonProps> = ({ reason }) => {
  const { theme } = useThemeStore();
  
  // Eğer veri yoksa gösterme
  if (!reason) return null;
  
  // Spor tercihi için gösterim
  const renderSportPreference = (sportReason: RecommendationReasonType) => {
    return (
      <View style={styles.reasonContainer}>
        <Ionicons name="fitness-outline" size={14} color={theme.colors.success} />
        <Text style={[styles.reasonText, { color: theme.colors.text, fontWeight: '500' }]}>
          <Text style={{ fontWeight: 'bold' }}>{sportReason.sport_name || 'Spor'}</Text> tercihin için öneriliyor
        </Text>
      </View>
    );
  };
  
  // Arkadaş katılımı için gösterim
  const renderFriendParticipation = (friendReason: RecommendationReasonType) => {
    // Arkadaş sayısı bilgisini al
    const friendCount = friendReason.friend_count || 0;
    
    if (friendCount === 0) return null;
    
    // Arkadaş isimlerini al (en fazla 2 isim göster)
    const friends = friendReason.friends || [];
    const friendNames = friends.map(friend => 
      `${friend.first_name || ''} ${friend.last_name || ''}`.trim() || friend.username
    ).filter(name => name).slice(0, 2);
    
    // Mesaj metni oluştur
    let message = '';
    if (friendNames.length === 1) {
      message = `${friendNames[0]} katılıyor`;
    } else if (friendNames.length === 2) {
      message = `${friendNames[0]} ve ${friendNames[1]} katılıyor`;
    } else if (friendCount > 2) {
      message = `${friendNames[0]}, ${friendNames[1]} ve ${friendCount - 2} kişi daha katılıyor`;
    }
    
    return (
      <View style={styles.reasonContainer}>
        <Ionicons name="people-outline" size={14} color={theme.colors.primary} />
        <Text style={[styles.reasonText, { color: theme.colors.text, fontWeight: '500' }]}>
          {message}
        </Text>
      </View>
    );
  };
  
  // Hangi tür öneri olduğuna göre ilgili komponenti göster
  switch (reason.type) {
    case 'sport_preference':
      return renderSportPreference(reason);
      
    case 'friend_participation':
      return renderFriendParticipation(reason);
      
    case 'both': {
      // Her iki nedeni de göster
      return (
        <>
          {reason.sport_preference && renderSportPreference(reason.sport_preference)}
          {reason.friend_participation && renderFriendParticipation(reason.friend_participation)}
        </>
      );
    }
    
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  reasonText: {
    fontSize: 12,
    flex: 1,
  }
});

export default RecommendationReason; 