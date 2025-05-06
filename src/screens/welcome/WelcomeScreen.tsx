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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { colors } from '../../constants/colors/colors';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.titleContainer}>
            <Text style={[styles.sportlinkText, { color: colors.accent }]}>
              SPORT
            </Text>
            <Text style={[styles.sportlinkText, { color: colors.primary }]}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
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
    color: '#666666',
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
    borderColor: colors.accent,
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  registerText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
  },
});

export default WelcomeScreen; 