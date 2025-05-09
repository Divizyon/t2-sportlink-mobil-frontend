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
  Dimensions,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuthStore } from '../../store/userStore/authStore';
import { useDeviceStore } from '../../store/userStore/deviceStore';
import { loginSchema, validateWithSchema } from '../../utils/validators/yupValidators';
import { getConfigValues } from '../../store/appStore/configStore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors/colors';

// Route paramları için tip tanımlaması
type LoginScreenParams = {
  registeredEmail?: string;
};

const { width, height } = Dimensions.get('window');

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
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
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
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                <Text style={{color: colors.primary}}>SPORT</Text>
                <Text style={{color: colors.accent}}>LINK</Text>
              </Text>
            </View>
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
            <Text style={styles.welcomeSubtitle}>Hesabınıza giriş yapın</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <View style={[
                styles.inputContainer,
                isEmailFocused && styles.inputFocused,
                validationErrors.email && styles.inputError
              ]}>
                <Ionicons name="mail-outline" size={20} color={isEmailFocused ? colors.accent : colors.dark} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresinizi girin"
                  placeholderTextColor={colors.dark}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
              {validationErrors.email && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle-outline" size={14} color={colors.error} /> {validationErrors.email}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={[
                styles.inputContainer,
                isPasswordFocused && styles.inputFocused,
                validationErrors.password && styles.inputError
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? colors.accent : colors.dark} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi girin"
                  placeholderTextColor={colors.dark}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons 
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color={colors.dark}
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle-outline" size={14} color={colors.error} /> {validationErrors.password}
                </Text>
              )}
            </View>

            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={navigateToForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={20} color={colors.white} style={styles.loadingIcon} />
                  <Text style={styles.loginButtonText}>Giriş Yapılıyor...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Hesabınız yok mu?</Text>
              <TouchableOpacity onPress={navigateToRegister} style={styles.registerLinkContainer}>
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
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.silver,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // To compensate for the back button and center the logo
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.silver,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 55,
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}10`, // 10% opacity
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}10`, // 10% opacity
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loginButtonDisabled: {
    backgroundColor: colors.dark,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  registerLinkContainer: {
    marginLeft: 5,
    padding: 5, // Larger touch area
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.accent,
  },
}); 