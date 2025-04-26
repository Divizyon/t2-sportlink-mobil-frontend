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
import { registerSchema, validateWithSchema } from '../../utils/validators/yupValidators';

const { width } = Dimensions.get('window');

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
  
  const validateForm = async (): Promise<boolean> => {
    const validation = await validateWithSchema(registerSchema, { 
      username, 
      email, 
      password, 
      confirmPassword,
      firstName,
      lastName,
      phone 
    });
    setValidationErrors(validation.errors);
    setIsValid(validation.isValid);
    return validation.isValid;
  };

  const handleRegister = async () => {
    const isValid = await validateForm();
    if (!isValid) return;
    
    // Backend entegrasyonu
    try {
      setIsSubmitting(true);
      await register({ 
        username, 
        email, 
        password,
        first_name: firstName,
        last_name: lastName,
        phone
      });
      
      // Başarılı kayıt sonrası login sayfasına yönlendir
      Alert.alert(
        'Kayıt Başarılı',
        'Lütfen email adresinize gönderilen link ile hesabınızı doğrulayın.',
        [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      // Hata zaten store tarafından yönetiliyor
    } finally {
      setIsSubmitting(false);
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
                  SportLink
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Yeni hesap oluşturun
                </Text>
              </View>
              
              <View style={styles.formContainer}>
                <InputField
                  label="Kullanıcı Adı"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  error={validationErrors.username}
                />
                
                <InputField
                  label="E-posta"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={validationErrors.email}
                />
                
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <InputField
                      label="Ad"
                      placeholder="Adınızı girin"
                      value={firstName}
                      onChangeText={setFirstName}
                      error={validationErrors.firstName}
                    />
                  </View>
                  
                  <View style={styles.halfWidth}>
                    <InputField
                      label="Soyad"
                      placeholder="Soyadınızı girin"
                      value={lastName}
                      onChangeText={setLastName}
                      error={validationErrors.lastName}
                    />
                  </View>
                </View>
                
                <InputField
                  label="Telefon"
                  placeholder="Telefon numaranızı girin"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  error={validationErrors.phone}
                />
                
                <InputField
                  label="Şifre"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={validationErrors.password}
                />
                
                <InputField
                  label="Şifre Tekrar"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={validationErrors.confirmPassword}
                />
                
                <Button
                  title="Kayıt Ol"
                  onPress={handleRegister}
                  disabled={isSubmitting || !isValid || isRegistering}
                  style={[
                    styles.submitButton,
                    (isSubmitting || !isValid || isRegistering) && styles.disabledButton
                  ]}
                >
                  {isRegistering ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Kayıt Ol</Text>
                  )}
                </Button>
                
                <View style={styles.loginContainer}>
                  <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                    Zaten hesabınız var mı?
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
    marginBottom: 24,
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
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