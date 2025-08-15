import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
  onSessionHistory: () => void;
  onHelp: () => void;
  onTermsOfService: () => void;
  onPrivacyPolicy: () => void;
  onLogout: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  themeColors,
  isDarkMode,
  onToggleTheme,
  onEditProfile,
  onManageNotifications,
  onSessionHistory,
  onHelp,
  onTermsOfService,
  onPrivacyPolicy,
  onLogout
}) => {
  return (
    <View style={styles.container}>
      
      <View style={styles.actionList}>
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onEditProfile}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="person-outline" size={22} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.text }]}>Profili Düzenle</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onManageNotifications}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="notifications-outline" size={22} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.text }]}>Bildirimler</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onSessionHistory}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="time-outline" size={22} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.text }]}>Giriş Yapılan Yerler</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        {/* Koyu tema yakında aktif olacak */}
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onTermsOfService}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="document-text-outline" size={22} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.text }]}>Kullanım Şartları</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onPrivacyPolicy}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="shield-checkmark-outline" size={22} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.text }]}>Gizlilik Politikası</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onHelp}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="help-circle-outline" size={22} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.text }]}>Yardım</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={22} color={themeColors.error} />
        <Text style={[styles.logoutText, { color: themeColors.error }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Banner image below logout */}
      {/* <View style={styles.bannerContainer}>
        <Image 
          source={require('../../../assets/images/banner.png')} 
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  actionList: {
    backgroundColor: '#fff',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  actionTextContainer: {
    marginLeft: 12,
  },
  actionSubtext: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 12,
  },
  bannerContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  bannerImage: {
    width: 120,
    height: 60,
  },
});