import * as yup from 'yup';

export const registerSchema = yup.object({
  fullName: yup
    .string()
    .required('Ad Soyad zorunludur')
    .min(3, 'Ad Soyad en az 3 karakter olmalıdır'),
  email: yup
    .string()
    .required('E-posta adresi zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: yup
    .string()
    .required('Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: yup
    .string()
    .required('Şifre tekrarı zorunludur')
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Kullanım koşullarını kabul etmelisiniz')
});

export type RegisterFormData = yup.InferType<typeof registerSchema>; 