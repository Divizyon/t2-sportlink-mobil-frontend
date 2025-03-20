import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAuthStore, useThemeStore } from '../store';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, LoginFormData } from '../utils/validations/loginSchema';
import FormInput from './form/FormInput';
import FormButton from './form/FormButton';

const { width } = Dimensions.get('window');

/**
 * Giriş formu bileşeni
 * React Hook Form ve Yup kullanarak form doğrulama işlemlerini yönetir
 */
const LoginForm = () => {
  // Auth store'dan state ve aksiyonları al
  const { isLoading, error, login, clearError } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // React Hook Form yapılandırması
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Giriş işlemi
  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
    } catch (err) {
      // Hata durumu AuthStore içinde zaten yönetiliyor
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
    ]}>
      <View style={styles.headerContainer}>
        <Text style={[
          styles.title,
          { color: isDarkMode ? '#fff' : '#333' }
        ]}>
          Hoş Geldiniz
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDarkMode ? '#aaa' : '#666' }
        ]}>
          Hesabınıza giriş yapın
        </Text>
      </View>

      <View style={styles.formContainer}>
        <FormInput
          control={control}
          name="email"
          label="E-posta"
          placeholder="E-posta adresinizi girin"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        
        <FormInput
          control={control}
          name="password"
          label="Şifre"
          placeholder="Şifrenizi girin"
          secureTextEntry
          error={errors.password}
        />
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <FormButton
          title="Giriş Yap"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>

      <Text style={[
        styles.hint,
        { color: isDarkMode ? '#aaa' : '#666' }
      ]}>
        Test için: e-posta "test@example.com", şifre "password"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    height: 48,
    borderRadius: 24,
  },
  hint: {
    marginTop: 24,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default LoginForm;