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
 * Kayıt olma ekranı
 */
export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  
  // Focus durumlarını takip etmek için state'ler
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

  const validateConfirmPassword = (confirmValue: string): boolean => {
    if (!confirmValue) {
      setConfirmPasswordError('Şifrenizi tekrar giriniz');
      return false;
    } else if (confirmValue !== password) {
      setConfirmPasswordError('Şifreler eşleşmiyor');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignUp = () => {
    // Tüm alanları doğrula
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      // TODO: Implement sign-up logic
      console.log('Kayıt başarılı', { name, email, password });
      // Kayıt başarılı olduğunda ana sayfaya yönlendir
      router.replace('/home' as any);
    }
  };

  // Demo kayıt için hızlı işlem
  const handleDemoSignUp = () => {
    console.log('Demo kayıt işlemi gerçekleştirildi');
    router.replace('/home' as any);
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
                SportLink'e Kayıt Ol
              </Text>
              <Text style={styles.subtitle}>
                Hesap oluşturarak tüm etkinliklere katılabilirsiniz
              </Text>
            </Box>
            
            {/* Form Card */}
            <Box
              style={styles.formCard}
            >
              <VStack space="sm" width="100%">
                {/* Name Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Ad Soyad</Text>
                  <View style={[
                    styles.textInputContainer,
                    nameError ? styles.inputError : null,
                    nameFocused ? styles.inputFocused : null
                  ]}>
                    <TextInput
                      placeholder="Adınızı ve soyadınızı girin"
                      placeholderTextColor="#AAA"
                      style={styles.textInput}
                      value={name}
                      onChangeText={(text) => {
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
                  {nameError ? (
                    <Text style={styles.errorText}>
                      {nameError}
                    </Text>
                  ) : null}
                </View>

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
                      placeholder="Şifrenizi oluşturun"
                      placeholderTextColor="#AAA"
                      style={styles.textInput}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        validatePassword(text);
                        // Şifre değiştiğinde, eğer onay şifresi dolu ise onay şifresini de doğrula
                        if (confirmPassword) {
                          validateConfirmPassword(confirmPassword);
                        }
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

                {/* Confirm Password Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                  <View style={[
                    styles.textInputContainer,
                    confirmPasswordError ? styles.inputError : null,
                    confirmPasswordFocused ? styles.inputFocused : null
                  ]}>
                    <TextInput
                      placeholder="Şifrenizi tekrar girin"
                      placeholderTextColor="#AAA"
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        validateConfirmPassword(text);
                      }}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => {
                        setConfirmPasswordFocused(false);
                        validateConfirmPassword(confirmPassword);
                      }}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <FontAwesome 
                        name={showConfirmPassword ? "eye" : "eye-slash"} 
                        size={20} 
                        color="#AAA" 
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>
                      {confirmPasswordError}
                    </Text>
                  ) : null}
                </View>
                
                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                >
                  <Text style={styles.signUpButtonText}>Kayıt Ol</Text>
                </TouchableOpacity>

                {/* Demo Kayıt Butonu */}
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoSignUp}
                >
                  <Text style={styles.demoButtonText}>Demo Kayıt</Text>
                </TouchableOpacity>
                
                {/* Sign In Link - taşındı */}
                <Center marginTop={15}>
                  <HStack space="xs" alignItems="center">
                    <Text style={styles.signInText2}>
                      Zaten hesabınız var mı?
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/signin' as any)}>
                      <Text style={styles.signInLinkText2}>
                        Giriş Yap
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
  signUpButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#44C26D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpButtonText: {
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
  signInText: {
    color: 'white',
    fontSize: 15,
  },
  signInLinkText: {
    color: '#44C26D',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 4,
  },
  signInText2: {
    color: '#89939E',
    fontSize: 14,
  },
  signInLinkText2: {
    color: '#3066BE',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 4,
  },
}); 