import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('E-posta adresi zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: yup
    .string()
    .required('Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>; 