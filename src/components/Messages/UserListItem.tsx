import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  profile_picture?: string;
}

interface UserListItemProps {
  user: User;
  onSelect: () => void;
  isSelected: boolean;
}

export const UserListItem: React.FC<UserListItemProps> = ({ 
  user, 
  onSelect, 
  isSelected 
}) => {
  const { theme } = useThemeStore();
  
  // Avatar oluştur
  const renderAvatar = () => {
    if (user.profile_picture) {
      return (
        <Image
          source={{ uri: user.profile_picture }}
          style={styles.avatar}
        />
      );
    }
    
    // Profil resmi yoksa baş harfleri göster
    return (
      <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
        <Text style={styles.avatarInitial}>
          {user.first_name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isSelected ? `${theme.colors.accent}20` : theme.colors.cardBackground }
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {renderAvatar()}
      </View>
      
      {/* Kullanıcı Bilgileri */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user.first_name} {user.last_name}
        </Text>
        {user.username && (
          <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
            @{user.username}
          </Text>
        )}
      </View>
      
      {/* Seçim İşaretleyici */}
      <View style={styles.checkboxContainer}>
        {isSelected ? (
          <View style={[styles.checkbox, { backgroundColor: theme.colors.accent }]}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        ) : (
          <View style={[styles.checkbox, { borderColor: theme.colors.border }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 