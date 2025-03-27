import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Button } from 'react-native';
import { useAuthStore, useThemeStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, LoginFormData } from '../utils/validations/loginSchema';
import { TextInput } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={value}
            onChangeText={(text) => {
              onChange(text);
              if (error) clearError();
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        )}
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>

      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={value}
            onChangeText={(text) => {
              onChange(text);
              if (error) clearError();
            }}
            secureTextEntry
            autoComplete="password"
          />
        )}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />
      ) : (
        <Button 
          title="Giriş Yapp" 
          onPress={handleSubmit(onSubmit)} 
          disabled={isLoading} 
        />
      )}

      <Text style={styles.hint}>Test için: e-posta "test@example.com", şifre "password"</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 4,
    borderWidth: 1,
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  loader: {
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default LoginForm;

