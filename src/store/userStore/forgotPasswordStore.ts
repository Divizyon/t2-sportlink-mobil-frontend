import { create } from 'zustand';
import { authService } from '../../api/auth';
import { useApiStore } from '../appStore/apiStore';

interface ForgotPasswordState {
  isLoading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
  
  // Eylemler
  resetPassword: (email: string) => Promise<boolean>;
  setNewPassword: (token: string, newPassword: string) => Promise<boolean>;
  clearState: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>((set) => ({
  isLoading: false,
  success: false,
  error: null,
  message: null,
  
  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null, message: null, success: false });
      
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        set({
          isLoading: false,
          success: true,
          message: response.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
          error: null
        });
        return true;
      } else {
        set({
          isLoading: false,
          success: false,
          error: response.error || 'Şifre sıfırlama işlemi sırasında bir hata oluştu.',
          message: null
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Şifre sıfırlama işlemi sırasında bir hata oluştu.';
      
      set({
        isLoading: false,
        success: false,
        error: errorMessage,
        message: null
      });
      
      // API Store'da hata mesajını güncelle 
      useApiStore.getState().setGlobalError(errorMessage);
      
      return false;
    }
  },
  
  setNewPassword: async (token: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null, message: null, success: false });
      
      const response = await authService.resetPassword(token, newPassword);
      
      if (response.success) {
        set({
          isLoading: false,
          success: true,
          message: response.message || 'Şifreniz başarıyla değiştirildi.',
          error: null
        });
        return true;
      } else {
        set({
          isLoading: false,
          success: false,
          error: response.error || 'Şifre değiştirme işlemi sırasında bir hata oluştu.',
          message: null
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Şifre değiştirme işlemi sırasında bir hata oluştu.';
      
      set({
        isLoading: false, 
        success: false,
        error: errorMessage,
        message: null
      });
      
      // API Store'da hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      
      return false;
    }
  },
  
  clearState: () => {
    set({
      isLoading: false,
      success: false, 
      error: null,
      message: null
    });
  }
})); 