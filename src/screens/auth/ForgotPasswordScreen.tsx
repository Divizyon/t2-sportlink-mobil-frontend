import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InputField } from '../../components/InputField/InputField';
import { Button } from '../../components/Button/Button';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useForgotPasswordStore } from '../../store/userStore/forgotPasswordStore';

const { width } = Dimensions.get('window');

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const { resetPassword, isLoading, success, error, message, clearState } = useForgotPasswordStore();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  
  // Hata veya mesaj değiştiğinde göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearState();
    }
    
    if (message) {
      Alert.alert('Bilgi', message);
      if (success) {
        navigation.navigate('Login');
      }
      clearState();
    }
  }, [error, message, clearState, success, navigation]);
  
  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      setEmailError('E-posta adresi gerekli');
      return false;
    }
    
    if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      return false;
    }
    
    setEmailError(undefined);
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    
    try {
      await resetPassword(email);
    } catch (error) {
      // Hata zaten store tarafından yönetiliyor
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/sportlink-bg.png')} 
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Şifremi Unuttum
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Şifre sıfırlama bağlantısı için e-posta adresinizi girin
                </Text>
              </View>
              
              <View style={styles.formContainer}>
                <InputField
                  label="E-posta"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError(undefined);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={emailError}
                />
                
                <Button
                  title="Şifre Sıfırlama Bağlantısı Gönder"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  buttonStyle={styles.resetButton}
                  variant="accent"
                />
                
                <View style={styles.loginContainer}>
                  <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                    Şifrenizi hatırladınız mı?
                  </Text>
                  <TouchableOpacity onPress={navigateToLogin}>
                    <Text style={[styles.loginLink, { color: theme.colors.accent }]}>
                      Giriş Yap
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: width > 600 ? 500 : '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  resetButton: {
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 