import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema, RegisterFormData } from '../utils/validations/registerSchema';
import FormInput from './form/FormInput';
import FormCheckbox from './form/FormCheckbox';
import FormButton from './form/FormButton';
import { useThemeStore } from '../store';

interface RegisterFormProps {
  onRegister: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

/**
 * Kayıt formu bileşeni
 * React Hook Form ve Yup kullanarak form doğrulama işlemlerini yönetir
 */
const RegisterForm = ({ onRegister, isLoading, error }: RegisterFormProps) => {
  const { isDarkMode } = useThemeStore();

  // React Hook Form yapılandırması
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver<RegisterFormData>(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  });

  // Kayıt işlemi
  const onSubmit: SubmitHandler<RegisterFormData> = async data => {
    try {
      await onRegister(data);
    } catch (err) {
      // Hata durumu dışarıdan yönetiliyor
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Hesap Oluştur</Text>

      <FormInput
        control={control}
        name="fullName"
        label="Ad Soyad"
        placeholder="Ad ve soyadınızı girin"
        autoCapitalize="words"
        error={errors.fullName}
      />

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

      <FormCheckbox
        control={control}
        name="acceptTerms"
        label="Kullanım koşullarını kabul ediyorum"
        error={errors.acceptTerms}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FormButton
        title="Kayıt Ol"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
  container: {
    borderRadius: 8,
    elevation: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default RegisterForm;
