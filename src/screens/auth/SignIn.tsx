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
import { Platform, ImageBackground, StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from '@gluestack-ui/themed';
import { FontAwesome } from '@expo/vector-icons';

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

  const handleSignIn = () => {
    // Her iki alanı da doğrula
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      // TODO: Implement sign-in logic
      console.log('Giriş başarılı', { email, password });
      // Giriş başarılı olduğunda doğrudan ana sayfaya yönlendir
      router.replace('/home' as any);
    }
  };

  const goBack = () => {
    router.back();
  };

  // Demo girişi için hızlı giriş fonksiyonu
  const handleDemoSignIn = () => {
    // Demo kullanıcı bilgileri ile doğrudan giriş yap
    console.log('Demo giriş yapıldı');
    router.replace('/home' as any);
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
          <Box flex={1} padding={24} justifyContent="center" paddingTop={0} paddingBottom={80}>
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
            <Box marginBottom={25} marginTop={-15}>
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
              alignSelf="center"
              width="100%"
              marginTop={10}
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
                      <FontAwesome 
                        name={showPassword ? "eye" : "eye-slash"} 
                        size={20} 
                        color="#AAA" 
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={styles.errorText}>
                      {passwordError}
                    </Text>
                  ) : null}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>
                    Şifremi Unuttum
                  </Text>
                </TouchableOpacity>
                
                {/* Sign In Button */}
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleSignIn}
                >
                  <Text style={styles.signInButtonText}>Giriş Yap</Text>
                </TouchableOpacity>

                {/* Demo Giriş Butonu */}
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoSignIn}
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
    top: 40,
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