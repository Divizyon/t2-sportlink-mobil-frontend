import React, { useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  View,
  Text,
  Button,
  Box,
  VStack,
  FormControl,
  Input,
  InputField,
  HStack,
  Pressable,
  EyeIcon,
  EyeOffIcon,
  ButtonText,
  ButtonSpinner,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store';
import { ChevronLeftIcon } from '@gluestack-ui/themed';

// Sabit değerler
const { width, height } = Dimensions.get('window');
const COLORS = {
  primary: '#44BD32',
  secondary: '#192A56',
  white: 'white',
  background: '#F5F5F5',
  overlay: 'rgba(25, 42, 86, 0.25)', // Filigramı şeffaflaştırdım
  error: '#ef4444',
  input: {
    background: '#F5F7FA',
    text: '#192A56',
  },
  text: {
    primary: '#192A56',
    secondary: '#6B7280',
    inverse: 'white',
    muted: '#d1d5db',
  },
  transparent: 'transparent',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('E-posta adresi gereklidir');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Şifre gereklidir');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    clearError();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      await login(email, password);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    // /forgot-password route olmadığı için ana sayfaya yönlendiriyoruz
    router.push('/');
  };

  const handleBackToWelcome = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/sportlink-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Pressable style={styles.backButton} onPress={handleBackToWelcome}>
              <ChevronLeftIcon style={styles.backIcon} />
            </Pressable>

            <VStack style={styles.headerContainer}>
              <Text style={styles.title}>SportLink&apos;e Giriş Yap</Text>
              <Text style={styles.subtitle}>
                Hesabınıza giriş yaparak etkinliklere katılabilirsiniz
              </Text>
            </VStack>

            <Box style={styles.formContainer}>
              <VStack style={styles.formContent}>
                <FormControl isInvalid={!!emailError}>
                  <FormControl.Label>
                    <Text style={styles.inputLabel}>E-posta</Text>
                  </FormControl.Label>
                  <Input style={styles.input}>
                    <InputField
                      style={styles.inputText}
                      placeholder="E-posta adresinizi girin"
                      value={email}
                      onChangeText={(text: string) => {
                        setEmail(text);
                        validateEmail(text);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </Input>
                  {emailError ? (
                    <FormControlError>
                      <FormControlErrorText>{emailError}</FormControlErrorText>
                    </FormControlError>
                  ) : null}
                </FormControl>

                <FormControl isInvalid={!!passwordError}>
                  <FormControl.Label>
                    <Text style={styles.inputLabel}>Şifre</Text>
                  </FormControl.Label>
                  <Input style={styles.input}>
                    <InputField
                      style={styles.inputText}
                      placeholder="Şifrenizi girin"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChangeText={(text: string) => {
                        setPassword(text);
                        validatePassword(text);
                      }}
                      autoCapitalize="none"
                    />
                    <View style={styles.passwordIconContainer}>
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.passwordIcon}
                      >
                        {showPassword ? (
                          <EyeIcon style={styles.eyeIcon} />
                        ) : (
                          <EyeOffIcon style={styles.eyeIcon} />
                        )}
                      </Pressable>
                    </View>
                  </Input>
                  {passwordError ? (
                    <FormControlError>
                      <FormControlErrorText>{passwordError}</FormControlErrorText>
                    </FormControlError>
                  ) : null}
                </FormControl>

                <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                  <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                </Pressable>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                  {isLoading ? (
                    <ButtonSpinner />
                  ) : (
                    <ButtonText style={styles.loginButtonText}>
                      <Text style={styles.buttonTextInner}>Giriş Yap</Text>
                    </ButtonText>
                  )}
                </Button>

                <HStack style={styles.registerContainer}>
                  <Text style={styles.registerHint}>Hesabınız yok mu? </Text>
                  <Pressable onPress={handleRegister}>
                    <Text style={styles.registerText}>Kayıt Ol</Text>
                  </Pressable>
                </HStack>
              </VStack>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: COLORS.transparent,
    borderRadius: 20,
    left: 24,
    padding: 5,
    position: 'absolute',
    top: 48,
    zIndex: 10,
  },
  backIcon: {
    color: COLORS.white,
    height: 24,
    width: 24,
  },
  backgroundImage: {
    height: height,
    width: width,
  },
  buttonTextInner: {
    textAlign: 'center',
    width: '100%',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  eyeIcon: {
    color: COLORS.input.text,
    height: 20,
    width: 20,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  formContent: {
    gap: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: COLORS.input.background,
    borderRadius: 8,
    borderWidth: 0,
    position: 'relative',
  },
  inputLabel: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  inputText: {
    color: COLORS.input.text,
    paddingRight: 40, // Şifre iconuna yer açmak için
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  overlay: {
    backgroundColor: COLORS.overlay,
    flex: 1,
  },
  passwordIcon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  passwordIconContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  registerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerHint: {
    color: COLORS.text.secondary,
  },
  registerText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    color: COLORS.text.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: 'bold',
  },
});
