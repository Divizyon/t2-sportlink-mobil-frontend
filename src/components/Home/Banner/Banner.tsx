import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';

interface BannerProps {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  userName?: string;
  userProfile?: string | null;
  onProfilePress?: () => void;
}

const Banner: React.FC<BannerProps> = ({ 
  title, 
  subtitle, 
  iconName = 'fitness-outline',
  userName,
  userProfile,
  onProfilePress
}) => {
  const { theme } = useThemeStore();
  
  const getInitials = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };
  
  return (
    <ImageBackground
      source={require('../../../../assets/images/sportlink-bg.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            {userName ? (
              <Text style={[styles.title, { color: theme.colors.white }]}>
                Merhaba, <Text style={styles.userName}>{userName}</Text>
              </Text>
            ) : (
              <Text style={[styles.title, { color: theme.colors.white }]}>{title}</Text>
            )}
            
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.colors.white }]}>{subtitle}</Text>
            )}
          </View>
          
          {onProfilePress && (
            <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
              {userProfile ? (
                <Image 
                  source={{ uri: userProfile }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: theme.colors.accent }]}>
                  <Text style={styles.profileInitial}>
                    {getInitials(userName)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.iconRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName} size={28} color={theme.colors.white} />
          </View>
          <Text style={styles.tagline}>Spor Tutkunu Bireylerle Buluş</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  banner: {
    width: width,
    height: 180,
    marginBottom: 20,
  },
  bannerImage: {
    borderRadius: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userName: {
    color: '#9dfd7e',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  profileButton: {
    marginLeft: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  profileInitial: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  }
});

export default Banner;