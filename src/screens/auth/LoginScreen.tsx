import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InputField } from '../../components/InputField/InputField';
import { Button } from '../../components/Button/Button';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { loginSchema, validateWithSchema } from '../../utils/validators/yupValidators';
import { getConfigValues } from '../../store/appStore/configStore';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const { login, isLoading, isAuthenticated, error, message, clearMessages } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Bağlantı ayarlarını göster
  useEffect(() => {
    const configValues = getConfigValues();
    console.log('Bağlantı Ayarları:', configValues);
  }, []);
  
  // Eğer kullanıcı otantike olmuşsa, ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Kullanıcı doğrulandı, ana sayfaya yönlendiriliyor');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [isAuthenticated, navigation]);
  
  // Hata veya mesaj değiştiğinde göster
  useEffect(() => {
    if (error) {
      console.error('Login Hatası:', error);
      Alert.alert('Hata', error);
      clearMessages();
    }
    
    if (message) {
      console.log('Login Mesajı:', message);
      
      // Sadece mesajı göster, ana sayfaya yönlendirme otomatik olacak
      Alert.alert('Bilgi', message);
      clearMessages();
    }
  }, [error, message, clearMessages]);
  
  const validateForm = async (): Promise<boolean> => {
    const validation = await validateWithSchema(loginSchema, { email, password });
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleLogin = async () => {
    try {
      console.log('Login deneniyor:', { email, password });
      const isValid = await validateForm();
      if (!isValid) {
        console.log('Form doğrulama hatası:', validationErrors);
        return;
      }
      
      // Backend entegrasyonu
      const loginSuccess = await login({ email, password });
      console.log('Login işlemi tamamlandı, sonuç:', loginSuccess ? 'Başarılı' : 'Başarısız');
      
      // Giriş başarısız olduysa ve mesaj yoksa varsayılan mesaj göster
      if (!loginSuccess && !error) {
        Alert.alert(
          'Giriş Başarısız',
          'Giriş bilgilerinizi kontrol edip tekrar deneyiniz.'
        );
      }
      
      // useEffect isAuthenticated değişikliğini izleyerek yönlendirme yapacak
    } catch (error) {
      console.error('Login işlemi sırasında bir hata oluştu:', error);
      Alert.alert(
        'Giriş Hatası',
        'Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin.'
      );
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
                  SportLink
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Hesabınıza giriş yapın
                </Text>
              </View>
              
              <View style={styles.formContainer}>
                <InputField
                  label="E-posta"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={validationErrors.email}
                />
                
                <InputField
                  label="Şifre"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={validationErrors.password}
                />
                
                <TouchableOpacity 
                  onPress={navigateToForgotPassword}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={[styles.forgotPasswordText, { color: theme.colors.accent }]}>
                    Şifremi Unuttum
                  </Text>
                </TouchableOpacity>
                
                <Button
                  title="Giriş Yap"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  buttonStyle={styles.loginButton}
                />
                
                <View style={styles.registerContainer}>
                  <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
                    Hesabınız yok mu?
                  </Text>
                  <Button
                    title="Kayıt Ol"
                    onPress={navigateToRegister}
                    variant="outline"
                    size="small"
                    textStyle={{ color: theme.colors.accent }}
                    buttonStyle={{ borderColor: theme.colors.accent }}
                  />
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 12,
  },
  registerText: {
    fontSize: 14,
  },
}); 