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
  Image,
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
import { colors } from '../../constants/colors/colors';

const { width } = Dimensions.get('window');

// Yaprak resmi URL'si
const leafImageUrl = "https://cdn.pixabay.com/photo/2018/01/06/23/25/nature-3016292_1280.jpg";

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const { register, error, message, clearMessages, isRegistering } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
    // Şifre değerini güncelle
    setPassword(pass);
    
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
  };
  
  const validateForm = async (): Promise<boolean> => {
    // Önce dinamik hatalar var mı kontrol et
    const hasErrors = Object.values(formErrors).some(error => error !== '');
    
    if (hasErrors) {
      console.log('Form validasyon hataları tespit edildi:', formErrors);
      return false;
    }
    
    // Şifre ve onay şifresi eşleşiyor mu kontrol et
    if (password !== confirmPassword) {
      setValidationErrors({
        ...validationErrors,
        confirmPassword: 'Şifreler eşleşmiyor'
      });
      console.log('Şifreler eşleşmiyor');
      return false;
    }
    
    // Tüm gerekli alanların doldurulduğunu kontrol et
    if (!username || !email || !password || !firstName || !lastName) {
      const missingFields = [];
      if (!username) missingFields.push('Kullanıcı Adı');
      if (!email) missingFields.push('E-posta');
      if (!password) missingFields.push('Şifre');
      if (!firstName) missingFields.push('Ad');
      if (!lastName) missingFields.push('Soyad');
      
      Alert.alert('Eksik Bilgi', `Lütfen tüm zorunlu alanları doldurun: ${missingFields.join(', ')}`);
      console.log('Eksik alanlar:', missingFields);
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
          'Hesabınız başarıyla oluşturuldu! Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin. E-posta kutunuzu ve spam klasörünüzü kontrol etmeyi unutmayın.',
          [{ 
            text: 'Tamam', 
            onPress: () => navigation.navigate('Login', { registeredEmail: email }) 
          }]
        );
      } else {
        // Register fonksiyonu false döndüyse ve store'da error varsa, onu göster
        if (error) {
          console.error('Kayıt sırasında hata oluştu:', error);
          
          // Spesifik hata türlerine göre özelleştirilmiş mesajlar
          if (error.includes('already exists') || error.includes('zaten kullanılıyor')) {
            Alert.alert('Kayıt Hatası', 'Bu e-posta adresi veya kullanıcı adı zaten kullanılmaktadır. Lütfen farklı bir e-posta veya kullanıcı adı deneyin.');
          } else if (error.includes('password') || error.includes('şifre')) {
            Alert.alert('Kayıt Hatası', 'Şifreniz gerekli güvenlik kriterlerini karşılamıyor. Lütfen daha güçlü bir şifre belirleyin.');
          } else {
            Alert.alert('Kayıt Hatası', error);
          }
        } else {
          // Beklenmedik bir durum
          console.error('Kayıt başarısız oldu ancak özel bir hata mesajı yok');
          Alert.alert('Kayıt Hatası', 'Kayıt işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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
  
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleTermsOfService = () => {
    navigation.navigate('TermsOfService');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerBackButton}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.divizyonContainer}>
            <Image 
              source={require('../../../assets/images/divizyon.png')} 
              style={styles.divizyonLogo}
              resizeMode="contain"
            />
            <Text style={styles.divizyonText}>Powered by Divizyon</Text>
          </View>
        </View>
        
        <View style={styles.registerHeader}>
          <Text style={styles.registerTitle}>Kayıt Ol</Text>
          <Text style={styles.registerSubtitle}>Yeni hesap oluştur</Text>
          <ImageBackground 
            source={{ uri: leafImageUrl }} 
            style={styles.leafDecoration}
            resizeMode="contain"
          />
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Ad ve Soyad yan yana */}
            <View style={styles.rowContainer}>
              <View style={styles.largerInputGroup}>
                <Text style={styles.inputLabel}>Ad</Text>
                <View style={[
                  styles.inputContainer, 
                  (formErrors.firstName || validationErrors.firstName) ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Adın"
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
              
              <View style={styles.smallerInputGroup}>
                <Text style={styles.inputLabel}>Soyad</Text>
                <View style={[
                  styles.inputContainer, 
                  (formErrors.lastName || validationErrors.lastName) ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Soyadın"
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
            
            {/* Kullanıcı Adı ve Telefon yan yana */}
            <View style={styles.rowContainer}>
              <View style={styles.smallerInputGroup}>
                <Text style={styles.smallInputLabel}>Kullanıcı Adı</Text>
                <View style={[
                  styles.inputContainer, 
                  (formErrors.username || validationErrors.username) ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Kullanıcı adın"
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
              
              <View style={styles.largerInputGroup}>
                <Text style={styles.inputLabel}>Telefon</Text>
                <View style={[
                  styles.inputContainer, 
                  (formErrors.phone || validationErrors.phone) ? styles.inputError : null
                ]}>
                  <Text style={styles.phonePrefix}>+90</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Telefon numaran"
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
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <View style={[
                styles.inputContainer, 
                (formErrors.email || validationErrors.email) ? styles.inputError : null
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresin"
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
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={[
                styles.inputContainer, 
                (formErrors.password || validationErrors.password) ? styles.inputError : null
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Şifren"
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
                </View>
              )}
              {formErrors.password ? (
                <Text style={styles.errorText}>{formErrors.password}</Text>
              ) : validationErrors.password ? (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifreyi Doğrula</Text>
              <View style={[
                styles.inputContainer, 
                (formErrors.confirmPassword || validationErrors.confirmPassword) ? styles.inputError : null
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Şifreni tekrar gir"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                  placeholderTextColor="#A0A0A0"
                />
                <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
                  <Ionicons
                    name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#A0A0A0"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.confirmPassword ? (
                <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
              ) : validationErrors.confirmPassword ? (
                <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
              ) : null}
            </View>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Kayıt olarak <Text style={styles.termsLink} onPress={handleTermsOfService}>Kullanım Şartları</Text>{' '}
                ve <Text style={styles.termsLink} onPress={handlePrivacyPolicy}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.signUpButton,
                (isSubmitting || Object.values(formErrors).some(err => err !== '') || isRegistering) && styles.disabledButton
              ]}
              onPress={handleRegister}
              disabled={isSubmitting || Object.values(formErrors).some(err => err !== '') || isRegistering}
              activeOpacity={0.8}
            >
              {isRegistering ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginQuestion}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerBackButton: {
    marginTop: 10,
    paddingVertical: 15,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerHeader: {
    marginVertical: 5,
    position: 'relative',
  },
  registerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 8,
  },
  registerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  leafDecoration: {
    position: 'absolute',
    width: 60,
    height: 60,
    right: 0,
    top: 5,
    opacity: 0.8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
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
    justifyContent: 'flex-start',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
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
  termsContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.accent,
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: colors.accent,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: 'rgba(51, 134, 38, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginQuestion: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
    marginLeft: 5,
  },
  formSectionHeader: {
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  phonePrefix: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  testButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  largerInputGroup: {
    flex: 0.58,
  },
  smallerInputGroup: {
    flex: 0.41,
  },
  smallInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  divizyonContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 10,
    paddingTop: 8,
  },
  divizyonLogo: {
    width: 28,
    height: 28,
    marginBottom: 4,
  },
  divizyonText: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'right',
    maxWidth: 120,
    lineHeight: 12,
  },
}); 