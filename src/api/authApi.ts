import { authService } from './auth';

// Geriye dönük uyumluluk için authService'i authApi olarak ihraç ediyoruz
export const authApi = authService; 