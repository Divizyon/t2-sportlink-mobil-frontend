export const validateEmail = (email: string): string | null => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'E-posta zorunludur';
  if (!regex.test(email)) return 'Geçerli bir e-posta adresi girin';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Şifre zorunludur';
  if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Ad zorunludur';
  if (name.length < 2) return 'Ad en az 2 karakter olmalıdır';
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Şifre onayı zorunludur';
  if (password !== confirmPassword) return 'Şifreler eşleşmiyor';
  return null;
};

export interface LoginFormErrors {
  email: string | null;
  password: string | null;
  [key: string]: string | null;
}

export interface RegisterFormErrors {
  name: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
  [key: string]: string | null;
}

export const validateLoginForm = (email: string, password: string): LoginFormErrors => {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
};

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterFormErrors => {
  return {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  };
};

export const hasErrors = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).some((error) => error !== null);
}; 