import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileActionsProps {
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
  };
  isDarkMode: boolean; 
  onToggleTheme: () => void;
  onEditProfile: () => void;
  onManageNotifications: () => void;
  onPrivacySettings: () => void;
  onHelp: () => void;
  onLogout: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  themeColors,
  isDarkMode,
  onToggleTheme,
  onEditProfile,
  onManageNotifications,
  onPrivacySettings,
  onHelp,
  onLogout
}) => {
  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Ayarlar</Text>
      
      <View style={styles.actionList}>
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onEditProfile}
        >
          <View style={[styles.actionIcon, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="person-outline" size={20} color="white" />
          </View>
          <Text style={[styles.actionText, { color: themeColors.text }]}>Profili Düzenle</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onManageNotifications}
        >
          <View style={[styles.actionIcon, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="notifications-outline" size={20} color="white" />
          </View>
          <Text style={[styles.actionText, { color: themeColors.text }]}>Bildirimler</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onPrivacySettings}
        >
          <View style={[styles.actionIcon, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="shield-outline" size={20} color="white" />
          </View>
          <Text style={[styles.actionText, { color: themeColors.text }]}>Gizlilik Ayarları</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onToggleTheme}
        >
          <View style={[styles.actionIcon, { backgroundColor: themeColors.accent }]}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={20} color="white" />
          </View>
          <Text style={[styles.actionText, { color: themeColors.text }]}>
            {isDarkMode ? "Açık Tema" : "Koyu Tema"}
          </Text>
          <View style={styles.toggleContainer}>
            <View style={[
              styles.toggleBg, 
              { backgroundColor: isDarkMode ? themeColors.accent : '#DDDDDD' }
            ]}>
              <View style={[
                styles.toggleIndicator, 
                { 
                  backgroundColor: 'white',
                  transform: [{ translateX: isDarkMode ? 20 : 0 }]
                }
              ]} />
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onHelp}
        >
          <View style={[styles.actionIcon, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="help-circle-outline" size={20} color="white" />
          </View>
          <Text style={[styles.actionText, { color: themeColors.text }]}>Yardım</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: themeColors.error }]} 
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionList: {
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
  },
  toggleContainer: {
    marginLeft: 8,
  },
  toggleBg: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
}); 