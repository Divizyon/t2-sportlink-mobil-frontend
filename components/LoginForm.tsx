import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore, useThemeStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, LoginFormData } from '../utils/validations/loginSchema';
import { TextInput } from 'react-native';
import { router } from 'expo-router';

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Giriş işlemi
  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
    } catch (err) {
      // Hata durumu AuthStore içinde zaten yönetiliyor
      console.error('Login hatası:', err);
    }
  };

  // Kayıt sayfasına yönlendirme
  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Giriş Yap</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
                borderColor: isDarkMode ? '#444' : '#ddd',
              },
            ]}
            placeholder="E-posta"
            placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
            value={value}
            onChangeText={text => {
              onChange(text);
              if (error) clearError();
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
                borderColor: isDarkMode ? '#444' : '#ddd',
              },
            ]}
            placeholder="Şifre"
            placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
            value={value}
            onChangeText={text => {
              onChange(text);
              if (error) clearError();
            }}
            secureTextEntry
            autoComplete="password"
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isLoading ? '#aaa' : '#007bff' }]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Giriş Yap</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.registerText}>Hesabınız yok mu? Kayıt olun</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Test için: e-posta "test@example.com", şifre "password"</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    elevation: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
    maxWidth: 400,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 12,
    fontSize: 12,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  input: {
    borderRadius: 4,
    borderWidth: 1,
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    color: '#007bff',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default LoginForm;
