import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '../../config/appConfig';

// Yapılandırma tipleri
export interface ConfigValues {
  apiBaseUrl: string;
  apiTimeout: number;
  appName: string;
  appVersion: string;
  isDebugMode: boolean;
}

// Ortam tabanlı yapılandırma değerleri
const developmentConfig: ConfigValues = {
  apiBaseUrl: 'http://10.11.20.44:3000/api',
  apiTimeout: 10000,
  appName: 'SportVision',
  appVersion: '1.0.0',
  isDebugMode: true,
};

const productionConfig: ConfigValues = {
  apiBaseUrl: 'https://api.sportvision.com/api',
  
  apiTimeout: 30000,
  appName: 'SportVision',
  appVersion: '1.0.0',
  isDebugMode: false,
};

// Ortamı belirle
const isProduction = process.env.NODE_ENV === 'production';

// Mevcut yapılandırmayı al
export const getConfigValues = (): ConfigValues => {
  return isProduction ? productionConfig : developmentConfig;
};

interface ConfigState {
  values: ConfigValues;
  updateValues: (newValues: Partial<ConfigValues>) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  values: getConfigValues(),
  updateValues: (newValues) => {
    set((state) => ({
      values: {
        ...state.values,
        ...newValues,
      },
    }));
  },
}));

// Config değerlerini dışa aktar
export const getConfigValuesFromStore = () => {
  const { apiBaseUrl, apiTimeout, appName, appVersion, isDebugMode } = useConfigStore.getState().values;
  return {
    apiBaseUrl,
    apiTimeout,
    appName,
    appVersion,
    isDebugMode
  };
}; 