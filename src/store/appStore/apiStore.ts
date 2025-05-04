import { create } from 'zustand';

interface ApiRequest {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  error?: string;
}

interface ApiState {
  pendingRequests: ApiRequest[];
  requestHistory: ApiRequest[];
  globalError: string | null;
  authError: string | null;
  isLoading: boolean;
  isOffline: boolean;
  
  // API durum yönetimi
  addRequest: (request: Omit<ApiRequest, 'id' | 'startTime'>) => string;
  completeRequest: (id: string, status: number) => void;
  failRequest: (id: string, error: string) => void;
  setGlobalError: (error: string | null) => void;
  setAuthError: (error: string | null) => void;
  clearHistory: () => void;
  setOfflineStatus: (isOffline: boolean) => void;
}

export const useApiStore = create<ApiState>((set, get) => ({
  pendingRequests: [],
  requestHistory: [],
  globalError: null,
  authError: null,
  isLoading: false,
  isOffline: false,
  
  addRequest: (request) => {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newRequest: ApiRequest = {
      ...request,
      id,
      startTime: Date.now(),
    };
    
    set((state) => ({
      pendingRequests: [...state.pendingRequests, newRequest],
      isLoading: true
    }));
    
    return id;
  },
  
  completeRequest: (id, status) => {
    const { pendingRequests, requestHistory } = get();
    const request = pendingRequests.find((req) => req.id === id);
    
    if (!request) return;
    
    const updatedRequest: ApiRequest = {
      ...request,
      endTime: Date.now(),
      status
    };
    
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((req) => req.id !== id),
      requestHistory: [updatedRequest, ...state.requestHistory.slice(0, 19)], // Son 20 isteği sakla
      isLoading: state.pendingRequests.length > 1 // Hala bekleyen istekler varsa loading durumunu koru
    }));
  },
  
  failRequest: (id, error) => {
    const { pendingRequests, requestHistory } = get();
    const request = pendingRequests.find((req) => req.id === id);
    
    if (!request) return;
    
    const failedRequest: ApiRequest = {
      ...request,
      endTime: Date.now(),
      error
    };
    
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((req) => req.id !== id),
      requestHistory: [failedRequest, ...state.requestHistory.slice(0, 19)],
      isLoading: state.pendingRequests.length > 1,
      globalError: error // Global hata mesajını güncelle
    }));
  },
  
  setGlobalError: (error) => {
    set({ globalError: error });
  },
  
  setAuthError: (error) => {
    set({ authError: error });
  },
  
  clearHistory: () => {
    set({ requestHistory: [] });
  },
  
  setOfflineStatus: (isOffline) => {
    set({ isOffline });
  }
})); 