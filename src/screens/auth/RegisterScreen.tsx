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
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InputField } from '../../components/InputField/InputField';
import { Button } from '../../components/Button/Button';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { registerSchema, validateWithSchema } from '../../utils/validators/yupValidators';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const { register, error, message, clearMessages, isRegistering } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#ccc'
  });
  
  // Dinamik input validasyonu
  const [formErrors, setFormErrors] = useState<Record<string, string>>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: ''
  });

  // Hata veya mesaj değiştiğinde göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearMessages();
    }
    
    if (message) {
      Alert.alert('Bilgi', message);
      clearMessages();
    }
  }, [error, message, clearMessages]);

  // Kullanıcı adı kontrolü
  const validateUsername = (text: string) => {
    // Sadece harf, rakam ve alt çizgiye izin ver
    if (text && !/^[a-zA-Z0-9_]+$/.test(text)) {
      setFormErrors({...formErrors, username: 'Sadece harf, rakam ve alt çizgi (_) kullanabilirsiniz'});
    } else if (text && text.length < 3) {
      setFormErrors({...formErrors, username: 'En az 3 karakter gereklidir'});
    } else {
      setFormErrors({...formErrors, username: ''});
    }
    
    setUsername(text);
  };

  // Email kontrolü
  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (text && !emailRegex.test(text)) {
      setFormErrors({...formErrors, email: 'Geçerli bir e-posta adresi girin'});
    } else {
      setFormErrors({...formErrors, email: ''});
    }
    
    setEmail(text);
  };

  // İsim kontrolü
  const validateName = (text: string, field: 'firstName' | 'lastName') => {
    // Sadece harf ve boşluklara izin ver
    const onlyLetters = text.replace(/[^a-zA-ZğüşöçıİĞÜŞÖÇ\s]/g, '');
    
    if (text !== onlyLetters) {
      setFormErrors({...formErrors, [field]: 'Sadece harf kullanabilirsiniz'});
    } else if (text && text.length < 2) {
      setFormErrors({...formErrors, [field]: 'En az 2 karakter gereklidir'});
    } else {
      setFormErrors({...formErrors, [field]: ''});
    }
    
    if (field === 'firstName') {
      setFirstName(onlyLetters);
    } else {
      setLastName(onlyLetters);
    }
  };

  // Telefon numarası formatını düzenle
  const validatePhone = (text: string) => {
    // Sadece sayıların kalmasını sağla
    const numbersOnly = text.replace(/\D/g, '').substring(0, 10);
    
    if (numbersOnly && numbersOnly.length < 10) {
      setFormErrors({...formErrors, phone: 'Telefon numarası 10 haneli olmalıdır'});
    } else {
      setFormErrors({...formErrors, phone: ''});
    }
    
    setPhone(numbersOnly);
  };
  
  // Şifre gücünü kontrol et
  const checkPasswordStrength = (pass: string) => {
    // Şifre boşsa gösterme
    if (!pass) {
      setPasswordStrength({ score: 0, message: '', color: '#ccc' });
      setFormErrors({...formErrors, password: ''});
      return;
    }
    
    let score = 0;
    let message = '';
    let color = '#ccc';
    let error = '';
    
    // En az 8 karakter
    if (pass.length >= 8) score += 1;
    else error = 'En az 8 karakter gereklidir';
    
    // Büyük harf içeriyor
    if (/[A-Z]/.test(pass)) score += 1;
    else if (!error) error = 'En az 1 büyük harf gereklidir';
    
    // Küçük harf içeriyor
    if (/[a-z]/.test(pass)) score += 1;
    else if (!error) error = 'En az 1 küçük harf gereklidir';
    
    // Rakam içeriyor
    if (/\d/.test(pass)) score += 1;
    else if (!error) error = 'En az 1 rakam gereklidir';
    
    // Özel karakter içeriyor
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    // Puana göre mesaj ve renk belirle
    if (score <= 2) {
      message = 'Zayıf';
      color = '#FF3B30';
    } else if (score <= 3) {
      message = 'Orta';
      color = '#FF9500';
    } else {
      message = 'Güçlü';
      color = '#34C759';
      error = '';
    }
    
    setPasswordStrength({ score, message, color });
    setFormErrors({...formErrors, password: error});
    setPassword(pass);
  };
  
  const validateForm = async (): Promise<boolean> => {
    // Önce dinamik hatalar var mı kontrol et
    const hasErrors = Object.values(formErrors).some(error => error !== '');
    
    if (hasErrors) {
      return false;
    }
    
    // Sonra Yup şeması ile kontrol et
    const validation = await validateWithSchema(registerSchema, { 
      username, 
      email, 
      password,
      firstName,
      lastName,
      phone: phone 
    });
    
    setValidationErrors(validation.errors);
    setIsValid(validation.isValid);
    return validation.isValid;
  };

  const handleRegister = async () => {
    console.log('RegisterScreen - handleRegister fonksiyonu çağrıldı');
    console.log('Form verileri:', { username, email, password, firstName, lastName, phone });
    
    try {
      const isValid = await validateForm();
      console.log('Form doğrulama sonucu:', isValid);
      
      if (!isValid) {
        // Form hatalarını göster
        if (Object.values(formErrors).some(err => err !== '')) {
          console.log('Form hataları var:', formErrors);
          Alert.alert('Form Hataları', 'Lütfen form alanlarındaki hataları düzeltin.');
          return;
        }
        
        console.log('Yup validasyon hataları:', validationErrors);
        return;
      }
      
      // Backend entegrasyonu
      console.log('Form geçerli, kayıt işlemi başlatılıyor...');
      setIsSubmitting(true);
      
      // API'nin beklediği format: RegisterRequest
      const registerData = { 
        username, 
        email, 
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone ? `+90${phone}` : ''
      };
      
      console.log('Gönderilecek kayıt verileri:', registerData);
      
      const result = await register(registerData);
      console.log('Kayıt işlemi sonucu:', { result, error, message });
      
      if (result) {
        // Başarılı kayıt sonrası login sayfasına yönlendir
        console.log('Kayıt başarılı, login sayfasına yönlendiriliyor');
        Alert.alert(
          'Kayıt Başarılı',
          'Kayıt işleminiz başarıyla tamamlandı! Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin. E-posta kutunuzu (spam klasörünü de) kontrol etmeyi unutmayın.',
          [{ 
            text: 'Tamam', 
            onPress: () => navigation.navigate('Login', { registeredEmail: email }) 
          }]
        );
      } else {
        // Register fonksiyonu false döndüyse ve store'da error varsa, onu göster
        if (error) {
          console.error('Kayıt sırasında hata oluştu:', error);
          Alert.alert('Kayıt Hatası', error);
        } else {
          // Beklenmedik bir durum
          console.error('Kayıt başarısız oldu ancak özel bir hata mesajı yok');
          Alert.alert('Kayıt Hatası', 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    } catch (error) {
      // Fonksiyon içinde yakalanan beklenmedik hatalar
      console.error('Kayıt işlemi sırasında beklenmedik hata:', error);
      Alert.alert(
        'Beklenmedik Hata',
        'Kayıt işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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
            <View style={styles.topBar}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.navigate('Welcome')}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Yeni Hesap Oluştur</Text>
            </View>
            
            <View style={styles.headerContainer}>
              <Text style={styles.headerSubtitle}>
                SportLink'e kayıt ol ve spor etkinliklerine katıl
              </Text>
            </View>
            
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
                <View style={[
                  styles.inputContainer, 
                  (formErrors.username || validationErrors.username) ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Kullanıcı adınızı girin"
                    value={username}
                    onChangeText={validateUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
                {formErrors.username ? (
                  <Text style={styles.errorText}>{formErrors.username}</Text>
                ) : validationErrors.username ? (
                  <Text style={styles.errorText}>{validationErrors.username}</Text>
                ) : null}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <View style={[
                  styles.inputContainer, 
                  (formErrors.email || validationErrors.email) ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="E-posta adresinizi girin"
                    value={email}
                    onChangeText={validateEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
                {formErrors.email ? (
                  <Text style={styles.errorText}>{formErrors.email}</Text>
                ) : validationErrors.email ? (
                  <Text style={styles.errorText}>{validationErrors.email}</Text>
                ) : null}
              </View>
              
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Ad</Text>
                  <View style={[
                    styles.inputContainer, 
                    (formErrors.firstName || validationErrors.firstName) ? styles.inputError : null
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Adınız"
                      value={firstName}
                      onChangeText={(text) => validateName(text, 'firstName')}
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                  {formErrors.firstName ? (
                    <Text style={styles.errorText}>{formErrors.firstName}</Text>
                  ) : validationErrors.firstName ? (
                    <Text style={styles.errorText}>{validationErrors.firstName}</Text>
                  ) : null}
                </View>
                
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Soyad</Text>
                  <View style={[
                    styles.inputContainer, 
                    (formErrors.lastName || validationErrors.lastName) ? styles.inputError : null
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Soyadınız"
                      value={lastName}
                      onChangeText={(text) => validateName(text, 'lastName')}
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                  {formErrors.lastName ? (
                    <Text style={styles.errorText}>{formErrors.lastName}</Text>
                  ) : validationErrors.lastName ? (
                    <Text style={styles.errorText}>{validationErrors.lastName}</Text>
                  ) : null}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefon</Text>
                <View style={[
                  styles.phoneInputContainer, 
                  (formErrors.phone || validationErrors.phone) ? styles.inputError : null
                ]}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>+90</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="5XX XXX XXXX"
                    value={phone}
                    onChangeText={validatePhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
                {formErrors.phone ? (
                  <Text style={styles.errorText}>{formErrors.phone}</Text>
                ) : validationErrors.phone ? (
                  <Text style={styles.errorText}>{validationErrors.phone}</Text>
                ) : null}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <View style={[
                  styles.inputContainer, 
                  (formErrors.password || validationErrors.password) ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChangeText={checkPasswordStrength}
                    secureTextEntry={!isPasswordVisible}
                    placeholderTextColor="#A0A0A0"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color="#A0A0A0"
                    />
                  </TouchableOpacity>
                </View>
                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={[styles.passwordStrengthBar, { width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }]} />
                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>{passwordStrength.message}</Text>
                  </View>
                )}
                {formErrors.password ? (
                  <Text style={styles.errorText}>{formErrors.password}</Text>
                ) : validationErrors.password ? (
                  <Text style={styles.errorText}>{validationErrors.password}</Text>
                ) : null}
                <Text style={styles.passwordHint}>
                  En az 8 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.registerButton,
                  (isSubmitting || Object.values(formErrors).some(err => err !== '') || isRegistering) && styles.disabledButton
                ]}
                onPress={handleRegister}
                disabled={isSubmitting || Object.values(formErrors).some(err => err !== '') || isRegistering}
                activeOpacity={0.8}
              >
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Kayıt Ol</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Zaten hesabınız var mı?
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.loginLink}>Giriş Yap</Text>
                </TouchableOpacity>
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
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
  },
  headerContainer: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 12,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    height: 50,
    overflow: 'hidden',
  },
  inputError: {
    borderWidth: 1,
    borderColor: 'red',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    paddingHorizontal: 8,
  },
  inputTip: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginLeft: 2,
  },
  passwordHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginLeft: 2,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthBar: {
    height: '100%',
    width: '0%',
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  registerButton: {
    backgroundColor: '#44BD32',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#44BD32',
    marginLeft: 4,
  },
  phonePrefix: {
    backgroundColor: '#E8E8E8',
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  phonePrefixText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
}); 