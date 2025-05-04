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
  ActivityIndicator,
  TextInput,
  PixelRatio,
  useWindowDimensions,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { InputField } from '../../components/InputField/InputField';
import { Button } from '../../components/Button/Button';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { useDeviceStore } from '../../store/userStore/deviceStore';
import { loginSchema, validateWithSchema } from '../../utils/validators/yupValidators';
import { getConfigValues } from '../../store/appStore/configStore';
import { Ionicons } from '@expo/vector-icons';

// Route paramları için tip tanımlaması
type LoginScreenParams = {
  registeredEmail?: string;
};

// Responsive tasarım için yardımcı fonksiyonlar
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // iPhone 8 genişliği baz alınarak 

const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } 
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

export const LoginScreen: React.FC = () => {
  // Ekran boyutu değiştiğinde güncellemek için useWindowDimensions kullanıyoruz
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 410;
  const isLargeScreen = width >= 410;
  
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { theme } = useThemeStore();
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
          'Hesabınız henüz doğrulanmamış. Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin. E-posta kutunuzu ve spam klasörünü kontrol etmeyi unutmayın.',
          [
            { 
              text: 'Tamam'
            },
            {
              text: 'Yeniden Gönder',
              onPress: () => {
                // Burada e-posta doğrulama linkini yeniden gönderme API'si çağrılabilir
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
      
      // Giriş başarılıysa cihaz token'ını kaydet
      if (loginSuccess) {
        try {
          await registerDeviceToken();
          console.log('Cihaz token\'ı başarıyla kaydedildi');
        } catch (tokenError) {
          console.error('Cihaz token kaydı sırasında hata:', tokenError);
          // Token kaydı başarısız olsa bile giriş işlemi tamamlandı sayılır
        }
      } else if (!error) {
        // Giriş başarısız olduysa ve mesaj yoksa varsayılan mesaj göster
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
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.silver }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContainer,
              isSmallScreen && { padding: 12 }
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity 
              style={[
                styles.backButton,
                isSmallScreen && { width: 36, height: 36 }
              ]}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Ionicons name="arrow-back" size={isSmallScreen ? 20 : 24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.headerContainer}>
              <Text style={[
                styles.headerTitle,
                { color: theme.colors.primary },
                isSmallScreen && { fontSize: normalize(22) }
              ]}>SportLink'e Giriş Yap</Text>
              <Text style={[
                styles.headerSubtitle,
                { color: theme.colors.primary },
                isSmallScreen && { fontSize: normalize(14) }
              ]}>
                Hesabınıza giriş yaparak etkinliklere katılabilirsiniz
              </Text>
            </View>
            
            <View style={[
              styles.card, 
              isSmallScreen && { padding: 14 }
            ]}>
              <View style={styles.inputGroup}>
                <Text style={[
                  styles.inputLabel,
                  isSmallScreen && { fontSize: normalize(14) }
                ]}>E-posta</Text>
                <View style={[
                  styles.inputContainer,
                  validationErrors.email ? styles.inputError : null,
                  isSmallScreen && { height: 45 }
                ]}>
                  <TextInput
                    style={[
                      styles.input,
                      isSmallScreen && { fontSize: normalize(14) }
                    ]}
                    placeholder="E-posta adresinizi girin"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
                {validationErrors.email && (
                  <Text style={[
                    styles.errorText,
                    isSmallScreen && { fontSize: normalize(10) }
                  ]}>{validationErrors.email}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[
                  styles.inputLabel,
                  isSmallScreen && { fontSize: normalize(14) }
                ]}>Şifre</Text>
                <View style={[
                  styles.inputContainer,
                  validationErrors.password ? styles.inputError : null,
                  isSmallScreen && { height: 45 }
                ]}>
                  <TextInput
                    style={[
                      styles.input,
                      isSmallScreen && { fontSize: normalize(14) }
                    ]}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    placeholderTextColor="#A0A0A0"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={isSmallScreen ? 20 : 24}
                      color="#A0A0A0"
                    />
                  </TouchableOpacity>
                </View>
                {validationErrors.password && (
                  <Text style={[
                    styles.errorText,
                    isSmallScreen && { fontSize: normalize(10) }
                  ]}>{validationErrors.password}</Text>
                )}
              </View>
              
              <TouchableOpacity 
                onPress={navigateToForgotPassword}
                style={styles.forgotPasswordContainer}
              >
                <Text style={[
                  styles.forgotPasswordText,
                  isSmallScreen && { fontSize: normalize(13) }
                ]}>
                  Şifremi Unuttum
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  isSmallScreen && { height: 45 }
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[
                    styles.buttonText,
                    isSmallScreen && { fontSize: normalize(15) }
                  ]}>Giriş Yap</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.registerContainer}>
                <Text style={[
                  styles.registerText,
                  isSmallScreen && { fontSize: normalize(13) }
                ]}>
                  Hesabınız yok mu? 
                </Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text style={[
                    styles.registerLink,
                    isSmallScreen && { fontSize: normalize(13) }
                  ]}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
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
    marginTop: 5,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
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
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D68C4',
    marginLeft: 4,
  },
}); 