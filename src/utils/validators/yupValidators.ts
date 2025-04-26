import * as yup from 'yup';

// Form doğrulama sonucu için tip
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Giriş formu şeması
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('E-posta adresi gerekli')
    .email('Geçerli bir e-posta adresi girin'),
  password: yup
    .string()
    .required('Şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
});

// Kayıt formu şeması
export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('Kullanıcı adı gerekli')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(20, 'Kullanıcı adı en fazla 20 karakter olmalıdır')
    .matches(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  email: yup
    .string()
    .required('E-posta adresi gerekli')
    .email('Geçerli bir e-posta adresi girin'),
  password: yup
    .string()
    .required('Şifre gerekli')
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
    ),
  confirmPassword: yup
    .string()
    .required('Şifre tekrarı gerekli')
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor'),
  firstName: yup
    .string()
    .required('Ad gerekli'),
  lastName: yup
    .string()
    .required('Soyad gerekli'),
  phone: yup
    .string()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Geçerli bir telefon numarası girin')
    .notRequired()
});

// Şifre yenileme şeması
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Şifre gerekli')
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
    ),
  confirmPassword: yup
    .string()
    .required('Şifre tekrarı gerekli')
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
});

// Profil güncelleme şeması
export const profileUpdateSchema = yup.object().shape({
  username: yup
    .string()
    .required('Kullanıcı adı gerekli')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
  firstName: yup
    .string()
    .required('Ad gerekli'),
  lastName: yup
    .string()
    .required('Soyad gerekli'),
  phone: yup
    .string()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Geçerli bir telefon numarası girin')
    .notRequired(),
  bio: yup
    .string()
    .max(200, 'Biyo en fazla 200 karakter olabilir')
    .notRequired()
});

// Şema ile doğrulama yapan yardımcı fonksiyon
export const validateWithSchema = async (schema: yup.AnyObjectSchema, values: any): Promise<ValidationResult> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { form: 'Doğrulama hatası' } };
  }
};
