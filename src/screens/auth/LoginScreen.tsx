import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuthStore } from '../../store/userStore/authStore';
import { useDeviceStore } from '../../store/userStore/deviceStore';
import { loginSchema, validateWithSchema } from '../../utils/validators/yupValidators';
import { getConfigValues } from '../../store/appStore/configStore';
import { Ionicons } from '@expo/vector-icons';

// Route paramları için tip tanımlaması
type LoginScreenParams = {
  registeredEmail?: string;
};

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { login, isLoading, isAuthenticated, error, message, clearMessages } = useAuthStore();
  const { registerDeviceToken, generateDeviceToken } = useDeviceStore();
  
  // Route'dan gelen email parametresini al
  const params = route.params as LoginScreenParams | undefined;
  const [email, setEmail] = useState(params?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Uygulama başladığında cihaz token'ını oluştur
  useEffect(() => {
    const initDeviceToken = async () => {
      await generateDeviceToken();
    };
    
    initDeviceToken();
  }, []);
  
  // Route parametresi değiştiğinde email'i güncelle
  useEffect(() => {
    if (params?.registeredEmail) {
      setEmail(params.registeredEmail);
    }
  }, [params?.registeredEmail]);
  
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
      
      // Email doğrulama hatası kontrolü
      if (error.includes('doğrulanmamış') || 
          error.includes('verify') || 
          error.includes('verification') || 
          error.includes('activate')) {
        
        Alert.alert(
          'E-posta Doğrulanmamış',
          'Hesabınız henüz doğrulanmamış. Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.',
          [
            { 
              text: 'Tamam'
            },
            {
              text: 'Yeniden Gönder',
              onPress: () => {
                Alert.alert('Bilgi', 'Doğrulama e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin.');
              }
            }
          ]
        );
      } else {
        // Diğer hata mesajları için standart uyarı
        Alert.alert('Hata', error);
      }
      
      clearMessages();
    }
    
    if (message) {
      console.log('Login Mesajı:', message);
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
      
      // Giriş başarılıysa cihaz token'ını kaydet
      if (loginSuccess) {
        try {
          await registerDeviceToken();
          console.log('Cihaz token\'ı başarıyla kaydedildi');
        } catch (tokenError) {
          console.error('Cihaz token kaydı sırasında hata:', tokenError);
        }
      } else if (!error) {
        Alert.alert(
          'Giriş Başarısız',
          'Giriş bilgilerinizi kontrol edip tekrar deneyiniz.'
        );
      }
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
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.title}>E-posta</Text>
            <View style={[
              styles.inputContainer,
              validationErrors.email && styles.inputError
            ]}>
              <TextInput
                style={styles.input}
                placeholder="E-posta adresinizi girin"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}

            <Text style={styles.title}>Şifre</Text>
            <View style={[
              styles.inputContainer,
              validationErrors.password && styles.inputError
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi girin"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={togglePasswordVisibility}
              >
                <Ionicons 
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#777" 
                />
              </TouchableOpacity>
            </View>
            {validationErrors.password && (
              <Text style={styles.errorText}>{validationErrors.password}</Text>
            )}

            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={navigateToForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>Or Login with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Hesabınız yok mu?</Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.registerLink}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 8,
  },
  inputError: {
    borderWidth: 1,
    borderColor: 'red',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#338626',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#338626',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#338626',
    marginLeft: 5,
  },
}); 