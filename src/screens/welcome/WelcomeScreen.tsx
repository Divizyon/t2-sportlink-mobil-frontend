import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { colors } from '../../constants/colors/colors';
import { Ionicons } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

// Arka plan resmi URL'si - yaprak desenli yeşil arka plan
const backgroundImageUrl = "https://images.unsplash.com/photo-1691320017860-b35e16f5e3fc?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground 
      source={{ uri: backgroundImageUrl }} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.topSection}>
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoTitle}>
                    <Text style={styles.sportText}>Sport</Text><Text style={styles.linkText}>Link</Text>
                  </Text>
                  <Text style={styles.tagline}>sporun sosyal hali</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={handleRegister}
              >
                <Text style={styles.signUpText}>Kayıt Ol</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginText}>Giriş Yap</Text>
              </TouchableOpacity>
              
              <View style={styles.footerContainer}>
                <Text style={styles.versionText}>versiyon 0.0.1</Text>
                <Text style={styles.copyrightText}>© 2025 SportLink</Text>
                <Text style={styles.developedByText}>Developed by Divizyon</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Biraz daha koyu arka plan karartması
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 10,
    width: '100%',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    lineHeight: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sportText: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  linkText: {
    color: colors.silver,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  titleContainer: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 20,
  },
  slogansContainer: {
    marginTop: 10,
  },
  slogan: {
    fontSize: 16,
    color: '#E0E0E0',
    marginVertical: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  buttonSection: {
    width: '100%',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  signUpButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  signUpText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    marginBottom: Platform.OS === 'ios' ? 10 : 5,
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  copyrightText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  developedByText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  }
});

export default WelcomeScreen; 