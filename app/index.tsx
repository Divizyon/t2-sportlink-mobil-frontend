import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, Pressable } from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store';
import { Ionicons } from '@expo/vector-icons';

// Sabit değerler
const { width, height } = Dimensions.get('window');
const COLORS = {
  primary: '#44BD32',
  secondary: '#192A56',
  white: 'white',
  overlay: 'rgba(25, 42, 86, 0.25)',
  transparent: 'transparent',
  featureIcon: 'rgba(255, 255, 255, 0.2)',
  logoShadow: 'rgba(68, 189, 50, 0.8)',
  taglineShadow: 'rgba(0, 0, 0, 0.3)',
};

// Feature verileri
type IconName = 'people-outline' | 'location-outline' | 'calendar-outline';

const FEATURES: { icon: IconName; text: string }[] = [
  {
    icon: 'people-outline',
    text: 'Sevdiğin spor dalında arkadaş bul',
  },
  {
    icon: 'location-outline',
    text: 'Yakınındaki etkinlikleri keşfet',
  },
  {
    icon: 'calendar-outline',
    text: 'Kendi etkinliğini oluştur',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  const handleLogin = () => router.push('/login');
  const handleRegister = () => router.push('/register');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/images/sportlink-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.topSection}>
            <Text style={styles.logoText}>SPORTLINK</Text>
            <Text style={styles.tagline}>
              Spor arkadaşını bul. Aktivitelere katıl. Harekete geç.
            </Text>
          </View>

          <View style={styles.contentContainer}>
            {/* Özellikler Listesi */}
            <View style={styles.featureList}>
              {FEATURES.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name={feature.icon} size={16} color={COLORS.white} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Kayıt ve Giriş Butonları */}
            <View style={styles.buttonContainer}>
              <Button style={styles.registerButton} onPress={handleRegister}>
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="person-add-outline" size={18} color={COLORS.white} />
                </View>
                <ButtonText style={styles.buttonText}>
                  <Text>KAYIT OL</Text>
                </ButtonText>
              </Button>

              <Pressable style={styles.loginButton} onPress={handleLogin}>
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="log-in-outline" size={16} color={COLORS.white} />
                </View>
                <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
              </Pressable>
            </View>

            <Text style={styles.slogan}>Sportif Etkinliklerde Buluşmanın En Kolay Yolu</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height,
    width,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  buttonIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  container: {
    backgroundColor: COLORS.secondary,
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  featureIconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.featureIcon,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginRight: 8,
    width: 28,
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 6,
    paddingLeft: 35,
  },
  featureList: {
    marginBottom: 15,
    width: '100%',
  },
  featureText: {
    color: COLORS.white,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: COLORS.transparent,
    borderColor: COLORS.white,
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 25,
    paddingVertical: 8,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoText: {
    color: COLORS.white,
    fontSize: 50,
    fontStyle: 'italic',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: COLORS.logoShadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  overlay: {
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: 'space-between',
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 12,
    width: '80%',
  },
  slogan: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 10,
    opacity: 0.6,
    textAlign: 'center',
  },
  tagline: {
    color: COLORS.white,
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: COLORS.taglineShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topSection: {
    alignItems: 'center',
    marginTop: height * 0.12,
    paddingHorizontal: 20,
  },
});
