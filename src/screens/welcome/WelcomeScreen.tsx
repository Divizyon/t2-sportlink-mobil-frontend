import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { colors } from '../../constants/colors/colors';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

// Görsel kaynağını sabit olarak tanımla
const BACKGROUND_IMAGE = require('../../../assets/images/welcome-bg.jpg');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan rengi (görsel yüklenene kadar gösterilir) */}
      <View style={styles.backgroundPlaceholder} />
      
      <ImageBackground 
        source={BACKGROUND_IMAGE} 
        style={[styles.backgroundImage, imageLoaded ? styles.visible : styles.hidden]}
        resizeMode="cover"
        onLoadStart={() => setImageLoaded(false)}
        onLoad={() => setImageLoaded(true)}
        fadeDuration={250}
      >
        <SafeAreaView style={styles.innerContainer}>
          <View style={styles.overlay} />
          <View style={styles.content}>
            <View style={styles.logoSection}>
              <View style={styles.titleContainer}>
                <Text style={[styles.sportlinkText, { color: '#FFFFFF' }]}>
                  SPORT
                </Text>
                <Text style={[styles.sportlinkText, { color: colors.accent }]}>
                  LINK
                </Text>
              </View>
              <Text style={styles.tagline}>
                Spor tutkunlarını buluşturan platform
              </Text>
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginText}>Giriş Yap</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={handleRegister}
              >
                <Text style={styles.registerText}>Kayıt Ol</Text>
              </TouchableOpacity>
              
              <Text style={styles.versionText}>version 0.0.1</Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
      
      {/* Yükleme göstergesi */}
      {!imageLoaded && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#192A56', // Görsel yüklenene kadar görünecek arka plan rengi
  },
  backgroundPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#192A56', // Koyu mavi arka plan (görsel yüklenene kadar)
  },
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Koyu overlay ekliyoruz
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportlinkText: {
    fontSize: 52,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 8,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonSection: {
    width: '100%',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 30,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default WelcomeScreen; 