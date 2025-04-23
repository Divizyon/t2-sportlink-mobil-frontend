import React, { useState } from 'react';
import {
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
import {
  Platform,
  ImageBackground,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { ArrowLeftIcon, ChevronDownIcon } from '@gluestack-ui/themed';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../../../store';
import { API_URL } from '../../../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Kayıt olma ekranı
 */
export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Focus durumlarını takip etmek için state'ler
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // E-posta uzantıları için state'ler
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);

  // Popüler e-posta uzantıları listesi
  const emailDomains = [
    '@gmail.com',
    '@hotmail.com',
    '@outlook.com',
    '@yahoo.com',
    '@icloud.com',
    '@yandex.com',
    '@protonmail.com',
  ];

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth store'dan kayıt işlemleri ve durum bilgilerini al (artık direkt fetch kullanacağız)
  const { clearError } = useAuthStore();

  const validateName = (nameValue: string): boolean => {
    if (!nameValue.trim()) {
      setNameError('Ad soyad gereklidir');
      return false;
    }
    setNameError('');
    return true;
  };

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

  // E-posta uzantısı seçildiğinde çağrılacak fonksiyon
  const handleDomainSelect = (domain: string) => {
    // Kullanıcının girdiği e-postada @ işareti varsa, @ işaretine kadar olan kısmı al
    // Yoksa olduğu gibi kullan
    const username = email.includes('@') ? email.split('@')[0] : email;
    setEmail(username + domain);
    setShowEmailDropdown(false);
    validateEmail(username + domain);
  };

  const handleSignUp = async () => {
    // Her alanı doğrula
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isNameValid && isEmailValid && isPasswordValid) {
      try {
        // Hata varsa temizle
        setError(null);
        setIsLoading(true);

        // Ad soyad alanını first_name ve last_name olarak ayırma
        let first_name = name;
        let last_name = '';

        // Eğer ad soyad içinde boşluk varsa ayır
        if (name.includes(' ')) {
          const nameArray = name.split(' ');
          first_name = nameArray[0]; // İlk kelime first_name
          last_name = nameArray.slice(1).join(' '); // Geri kalan kelimeler last_name
        }

        // Email'den kullanıcı adını ayıklama (@ öncesi)
        const username = email.split('@')[0];

        // API URL'i düzgün şekilde oluştur
        const apiBaseUrl = `${API_URL}/auth/register`;
        console.log(`Kayıt isteği yapılıyor: ${apiBaseUrl}`);

        // Doğrudan API URL kullanarak istek gönder
        const response = await fetch(apiBaseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            first_name, // Adı ayrı gönderiyoruz
            last_name, // Soyadı ayrı gönderiyoruz
            email,
            username, // @ öncesini kullanıcı adı olarak kullanıyoruz
            password,
            phone: '00000000000', // Telefon değerini 00000000000 olarak gönderiyoruz
          }),
        });

        console.log('Kayıt yanıtı status:', response.status);

        if (!response.ok) {
          // HTTP durum kodu hata ise
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Hata Kodu: ${response.status}`;
          } catch (e) {
            errorMessage = `Hata Kodu: ${response.status}`;
          }

          console.log('Kayıt başarısız1:', errorMessage);
          setError(errorMessage);
          return;
        }

        const data = await response.json();
        console.log('Kayıt yanıtı data:', data);

        if (data.success) {
          console.log('Kayıt başarılı');

          // Kullanıcı bilgilerini kaydet
          if (data.data?.token) {
            // Token'ı AsyncStorage'a kaydet
            await AsyncStorage.setItem('authToken', data.data.token).catch(err => {
              console.error('Token kaydedilirken hata oluştu:', err);
            });

            // Kullanıcı adını kaydet
            await AsyncStorage.setItem('userName', first_name).catch(err => {
              console.error('Kullanıcı adı kaydedilirken hata oluştu:', err);
            });

            // Tam adı kaydet (karşılama mesajı için)
            await AsyncStorage.setItem('fullName', name).catch(err => {
              console.error('Tam ad kaydedilirken hata oluştu:', err);
            });

            // Kayıt olunduğunu göster ve kullanıcıya geri bildirim ver
            await AsyncStorage.setItem('isNewUser', 'true').catch(err => {
              console.error('Yeni kullanıcı bilgisi kaydedilirken hata oluştu:', err);
            });
          }

          // Başarılı mesajı göster ve onay sonrası yönlendir
          Alert.alert(
            'Kayıt Başarılı',
            `Hoş geldiniz, ${first_name}! Hesabınız başarıyla oluşturuldu.`,
            [
              {
                text: 'Tamam',
                onPress: () => {
                  // Ana sayfaya yönlendir
                  router.replace('/(tabs)/home' as any);
                },
              },
            ],
          );
        } else {
          // API'den dönen hata mesajını göster
          console.log('Kayıt başarısız:', data.message);
          setError(data.message || 'Kayıt sırasında bir hata oluştu');
        }
      } catch (err) {
        console.error('Kayıt hatası:', err);
        // Hata detaylarını göster
        if (err instanceof Error) {
          // Network hatası durumunda
          let errorMsg = `${err.name}: ${err.message}`;

          if (err.message.includes('Network request failed')) {
            errorMsg =
              'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve API_URL ayarının doğru olduğundan emin olun.';
            console.log('API URL:', API_URL);
          }

          Alert.alert('Bağlantı Hatası', errorMsg);
          console.log('Hata detayları:', err.stack);
        }
        setError('Sunucuya bağlanırken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Demo giriş için doğrudan giriş sayfasına yönlendir
  const handleDemoSignUp = async () => {
    router.push('/auth/signin' as any);
  };

  const goBack = () => {
    router.back();
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Box flex={1} padding={24} justifyContent="flex-start" paddingTop={40}>
            {/* Back button */}
            <Pressable onPress={goBack} style={styles.backButton}>
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
            <Box marginTop={65} marginBottom={25}>
              <Text style={styles.title}>SportLink&apos;e Kayıt Ol</Text>
              <Text style={styles.subtitle}>
                Hesap oluşturarak tüm etkinliklere katılabilirsiniz
              </Text>
            </Box>

            {/* Form Card */}
            <Box style={styles.formCard}>
              <VStack space="sm" width="100%">
                {/* Name Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Ad Soyad</Text>
                  <View
                    style={[
                      styles.textInputContainer,
                      nameError ? styles.inputError : null,
                      nameFocused ? styles.inputFocused : null,
                    ]}
                  >
                    <TextInput
                      placeholder="Adınız ve soyadınız"
                      placeholderTextColor="#AAA"
                      style={styles.textInput}
                      value={name}
                      onChangeText={text => {
                        setName(text);
                        validateName(text);
                      }}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => {
                        setNameFocused(false);
                        validateName(name);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                  {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                </View>

                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>E-posta</Text>
                  <View
                    style={[
                      styles.textInputContainer,
                      emailError ? styles.inputError : null,
                      emailFocused ? styles.inputFocused : null,
                    ]}
                  >
                    <TextInput
                      placeholder="E-posta adresiniz"
                      placeholderTextColor="#AAA"
                      style={styles.textInput}
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
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
                    <TouchableOpacity
                      onPress={() => setShowEmailDropdown(!showEmailDropdown)}
                      style={styles.domainButton}
                    >
                      <Text style={styles.domainButtonText}>@gmail.com</Text>
                      <Icon as={ChevronDownIcon} size="sm" color="#AAA" marginLeft={4} />
                    </TouchableOpacity>
                  </View>
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                  {/* E-posta Uzantıları Dropdown */}
                  {showEmailDropdown && (
                    <View style={styles.dropdownContainer}>
                      {emailDomains.map(item => (
                        <TouchableOpacity
                          key={item}
                          style={styles.dropdownItem}
                          onPress={() => handleDomainSelect(item)}
                        >
                          <Text style={styles.dropdownText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Şifre</Text>
                  <View
                    style={[
                      styles.textInputContainer,
                      passwordError ? styles.inputError : null,
                      passwordFocused ? styles.inputFocused : null,
                    ]}
                  >
                    <TextInput
                      placeholder="Şifreniz"
                      placeholderTextColor="#AAA"
                      style={[styles.textInput, { paddingRight: 40 }]}
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
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
                      <FontAwesome
                        name={showPassword ? 'eye' : 'eye-slash'}
                        size={20}
                        color="#AAA"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                {/* Server Error */}
                {error ? <Text style={styles.serverErrorText}>{error}</Text> : null}

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Kayıt Ol</Text>
                  )}
                </TouchableOpacity>

                {/* Demo Kayıt Butonu */}
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoSignUp}
                  disabled={isLoading}
                >
                  <Text style={styles.demoButtonText}>Demo Giriş</Text>
                </TouchableOpacity>

                {/* Sign In Link - taşındı */}
                <Center marginTop={15}>
                  <HStack space="xs" alignItems="center">
                    <Text style={styles.signInText2}>Zaten hesabınız var mı?</Text>
                    <TouchableOpacity onPress={() => router.push('/auth/signin' as any)}>
                      <Text style={styles.signInLinkText2}>Giriş Yap</Text>
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
  backButton: {
    left: 20,
    position: 'absolute',
    top: 55,
    zIndex: 1,
  },
  backgroundImage: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  demoButton: {
    alignItems: 'center',
    backgroundColor: '#3066BE',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  domainButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderLeftColor: '#e5e5e5',
    borderLeftWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    marginRight: 0,
    paddingHorizontal: 8,
    position: 'absolute',
    right: 0,
  },
  domainButtonText: {
    color: '#8c8c8c',
    fontSize: 13,
    fontWeight: '400',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e8e8e8',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    maxHeight: 200,
    position: 'absolute',
    right: 0,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 77, // Input'un altında konumlandır
    width: '100%',
    zIndex: 1000,
  },
  dropdownItem: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    padding: 12,
  },
  dropdownText: {
    color: '#1D2B4E',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  eyeIcon: {
    padding: 8,
  },
  formCard: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 0,
    padding: 20,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 12,
    width: '100%',
  },
  inputError: {
    backgroundColor: '#fdecea',
    borderColor: '#e74c3c',
  },
  inputFocused: {
    backgroundColor: '#f5f5f7',
    borderColor: '#44C26D',
  },
  inputLabel: {
    color: '#1D2B4E',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  serverErrorText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 5,
    textAlign: 'center',
  },
  signInLinkText: {
    color: '#44C26D',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 4,
  },
  signInLinkText2: {
    color: '#3066BE',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 4,
  },
  signInText: {
    color: 'white',
    fontSize: 15,
  },
  signInText2: {
    color: '#89939E',
    fontSize: 14,
  },
  signUpButton: {
    alignItems: 'center',
    backgroundColor: '#44C26D',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  textInput: {
    color: '#1D2B4E',
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingRight: 110, // @gmail.com ve ok için boşluk
  },
  textInputContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 16,
    width: '100%',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
