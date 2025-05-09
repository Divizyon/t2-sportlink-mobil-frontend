import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { EventParticipant } from '../../types/eventTypes/event.types';

interface EventParticipantItemProps {
  participant: EventParticipant;
  isCurrentUser?: boolean;
  onPress?: (participant: EventParticipant) => void;
}

export const EventParticipantItem: React.FC<EventParticipantItemProps> = ({ 
  participant,
  isCurrentUser = false,
  onPress
}) => {
  const { theme } = useThemeStore();
  
  // Katılımcıya basma işlemi
  const handlePress = () => {
    if (onPress) {
      onPress(participant);
    }
  };
  
  // Profil resmi veya varsayılan avatar
  const renderAvatar = () => {
    if (participant.profile_picture) {
      return (
        <Image 
          source={{ uri: participant.profile_picture }}
          style={styles.avatar}
          resizeMode="cover"
        />
      );
    }
    
    // Varsayılan avatar
    return (
      <View
        style={[
          styles.avatarPlaceholder,
          { backgroundColor: theme.colors.primary + '30' }
        ]}
      >
        <Ionicons 
          name="person"
          size={16} 
          color={theme.colors.primary}
        />
      </View>
    );
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: theme.colors.card }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      {renderAvatar()}
      
      {/* İsim ve Kullanıcı Adı */}
      <View style={styles.infoContainer}>
        <Text 
          style={[
            styles.name, 
            { color: theme.colors.text }
          ]}
          numberOfLines={1}
        >
          {participant.first_name} {participant.last_name}
          {isCurrentUser && <Text style={styles.currentUser}> (Siz)</Text>}
        </Text>
        
        <Text 
          style={[
            styles.username, 
            { color: theme.colors.textDim }
          ]}
          numberOfLines={1}
        >
          @{participant.username}
        </Text>
      </View>
      
      {/* Etkinlik oluşturucu rozeti */}
      {participant.is_creator && (
        <View
          style={[
            styles.creatorBadge,
            { backgroundColor: theme.colors.accent + '20' }
          ]}
        >
          <Text
            style={[
              styles.creatorBadgeText,
              { color: theme.colors.accent }
            ]}
          >
            Oluşturucu
          </Text>
        </View>
      )}
      
      {/* Sağ ok */}
      <Ionicons 
        name="chevron-forward"
        size={20} 
        color={theme.colors.textDim}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
  },
  currentUser: {
    fontStyle: 'italic',
    fontWeight: '400',
  },
  creatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  creatorBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  }
}); 