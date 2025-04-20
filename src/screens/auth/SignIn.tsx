import React, { useState } from 'react';
import {
  Button,
  ButtonText,
  Text,
  VStack,
  HStack,
  Box,
  Icon,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Center,
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { Platform, ImageBackground, StyleSheet, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from '@gluestack-ui/themed';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../api/config';

/**
 * Giriş yapma ekranı
 */
export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth store'dan giriş işlemleri ve durum bilgilerini al (artık direkt fetch kullanacağız)
  const { clearError } = useAuthStore();

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue) {
      setEmailError('E-posta adresi gereklidir');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(emailValue)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError('Şifre gereklidir');
      return false;
    } else if (passwordValue.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignIn = async () => {
    // Her iki alanı da doğrula
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      try {
        // Hata varsa temizle
        setError(null);
        setIsLoading(true);
        
        // API URL'i düzgün şekilde oluştur
        const apiBaseUrl = `${API_URL}/auth/login`;
        console.log(`Giriş isteği yapılıyor: ${apiBaseUrl}`);
        
        // Doğrudan API URL kullanarak istek gönder
        const response = await fetch(apiBaseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          }),
        });
        
        console.log("Giriş yanıtı status:", response.status);
        
        if (!response.ok) {
          // HTTP durum kodu hata ise
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Hata Kodu: ${response.status}`;
          } catch (e) {
            errorMessage = `Hata Kodu: ${response.status}`;
          }
          
          console.log("Giriş başarısız:", errorMessage);
          setError(errorMessage);
          return;
        }
        
        const data = await response.json();
        console.log("Giriş yanıtı data:", data);
        
        if (data.success) {
          console.log("Giriş başarılı, token kaydediliyor");
          
          // Token'ı AsyncStorage'a kaydet
          if (data.data?.token) {
            await AsyncStorage.setItem('authToken', data.data.token);
          }
          
          // Başarılı giriş durumunda ana sayfaya yönlendir
          router.replace('/(tabs)/home' as any);
        } else {
          // API'den dönen hata mesajını göster
          console.log("Giriş başarısız:", data.message);
          setError(data.message || 'Giriş sırasında bir hata oluştu');
        }
      } catch (err) {
        console.error('Giriş hatası:', err);
        // Hata detaylarını göster
        if (err instanceof Error) {
          // Network hatası durumunda
          let errorMsg = `${err.name}: ${err.message}`;
          
          if (err.message.includes('Network request failed')) {
            errorMsg = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve API_URL ayarının doğru olduğundan emin olun.';
            console.log("API URL:", API_URL);
          }
          
          Alert.alert("Bağlantı Hatası", errorMsg);
          console.log("Hata detayları:", err.stack);
        }
        setError('Sunucuya bağlanırken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goBack = () => {
    router.back();
  };

  // Demo girişi için hızlı giriş fonksiyonu
  const handleDemoSignIn = async () => {
    try {
      // Demo girişi için email ve şifre ayarla
      setEmail('demo@example.com');
      setPassword('password123');
      
      // Demo giriş, aslında bir test olduğu için doğrudan ana sayfaya yönlendir
      // Gerçek bir uygulama olsa API ile login olması gerekirdi
      Alert.alert(
        "Demo Giriş",
        "Demo hesabı ile giriş yapılıyor, API olmadığı için doğrudan ana sayfaya yönlendirileceksiniz.",
        [
          { 
            text: "Tamam", 
            onPress: async () => {
              // Demo token oluştur ve kaydet
              await AsyncStorage.setItem('authToken', 'demo-token-123');
              router.replace('/(tabs)/home' as any);
            }
          }
        ]
      );
    } catch (err) {
      console.error('Demo giriş hatası:', err);
      setError('Demo giriş sırasında bir hata oluştu');
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/sportlink-bg.png')}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Box flex={1} padding={24} justifyContent="flex-start" paddingTop={40}>
            {/* Back button */}
            <Pressable 
              onPress={goBack} 
              style={styles.backButton}
            >
              <Center 
                width={48} 
                height={48} 
                borderRadius={24} 
                backgroundColor="rgba(255,255,255,0.3)"
              >
                <Icon as={ArrowLeftIcon} color="white" size="lg" />
              </Center>
            </Pressable>
            
            {/* Header */}
            <Box marginTop={50} marginBottom={25}>
              <Text style={styles.title}>
                SportLink'e Giriş Yap
              </Text>
              <Text style={styles.subtitle}>
                Hesabınıza giriş yaparak etkinliklere katılabilirsiniz
              </Text>
            </Box>
            
            {/* Form Card */}
            <Box
              style={styles.formCard}
            >
              <VStack space="sm" width="100%">
                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>E-posta</Text>
                  <View style={[
                    styles.textInputContainer, 
                    emailError ? styles.inputError : null,
                    emailFocused ? styles.inputFocused : null
                  ]}>
                    <TextInput
                      placeholder="E-posta adresinizi girin"
                      placeholderTextColor="#AAA"
                      style={styles.textInput}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        // Her değişiklikte doğrulama yap
                        validateEmail(text);
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => {
                        setEmailFocused(false);
                        validateEmail(email);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.errorText}>
                      {emailError}
                    </Text>
                  ) : null}
                </View>

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Şifre</Text>
                  <View style={[
                    styles.textInputContainer, 
                    passwordError ? styles.inputError : null,
                    passwordFocused ? styles.inputFocused : null
                  ]}>
                    <TextInput
                      placeholder="Şifrenizi girin"
                      placeholderTextColor="#AAA"
                      style={styles.textInput}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        // Her değişiklikte doğrulama yap
                        validatePassword(text);
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        setPasswordFocused(false);
                        validatePassword(password);
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <Icon as={EyeIcon} size="lg" color="#AAA" />
                      ) : (
                        <Icon as={EyeOffIcon} size="lg" color="#AAA" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={styles.errorText}>
                      {passwordError}
                    </Text>
                  ) : null}
                </View>

                {/* Server Error */}
                {error ? (
                  <Text style={styles.serverErrorText}>
                    {error}
                  </Text>
                ) : null}

                {/* Forgot Password Button */}
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>
                    Şifremi Unuttum
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signInButtonText}>Giriş Yap</Text>
                  )}
                </TouchableOpacity>

                {/* Demo Giriş Butonu */}
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoSignIn}
                  disabled={isLoading}
                >
                  <Text style={styles.demoButtonText}>Demo Giriş</Text>
                </TouchableOpacity>

                {/* Sign Up Link - taşındı */}
                <Center marginTop={15}>
                  <HStack space="xs" alignItems="center">
                    <Text style={styles.signUpText2}>
                      Hesabınız yok mu?
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/signup' as any)}>
                      <Text style={styles.signUpLinkText2}>
                        Kayıt Ol
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </Center>
              </VStack>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'flex-start',
    marginRight: 0,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D2B4E',
    marginBottom: 6,
  },
  textInputContainer: {
    width: '100%',
    height: 48,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdecea',
  },
  inputFocused: {
    borderColor: '#44C26D',
    backgroundColor: '#f5f5f7',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1D2B4E',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  serverErrorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#44C26D',
    fontSize: 15,
    fontWeight: '500',
  },
  signInButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#44C26D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#3066BE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    color: 'white',
    fontSize: 15,
  },
  signUpLinkText: {
    color: '#44C26D',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 4,
  },
  signUpText2: {
    color: '#89939E',
    fontSize: 14,
  },
  signUpLinkText2: {
    color: '#3066BE',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 4,
  },
}); 