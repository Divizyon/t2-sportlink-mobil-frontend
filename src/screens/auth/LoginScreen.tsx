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
  ImageBackground
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

const { width } = Dimensions.get('window');

// Yaprak resmi URL'si
const leafImageUrl = "https://cdn.pixabay.com/photo/2018/05/17/14/53/plant-3408820_1280.png";

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
  }, []);
  
  // Eğer kullanıcı otantike olmuşsa, ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
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
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }
      
      // Backend entegrasyonu
      const loginSuccess = await login({ email, password });
      
      // Giriş başarılıysa cihaz token'ını kaydet
      if (loginSuccess) {
        try {
          await registerDeviceToken();
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
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Tekrar Hoşgeldiniz</Text>
            <Text style={styles.welcomeSubtitle}>Hesabınıza giriş yapın</Text>
            <ImageBackground 
              source={{ uri: leafImageUrl }} 
              style={styles.leaf}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <View style={[
              styles.inputContainer,
              validationErrors.email && styles.inputError
            ]}>
              <TextInput
                style={styles.input}
                placeholder="E-posta adresiniz"
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

            <Text style={styles.inputLabel}>Şifre</Text>
            <View style={[
              styles.inputContainer,
              validationErrors.password && styles.inputError
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Şifreniz"
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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  leaf: {
    position: 'absolute',
    width: 120,
    height: 120,
    right: -20,
    top: -20,
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
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
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: 'rgba(51, 134, 38, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
    marginLeft: 5,
  },
}); 