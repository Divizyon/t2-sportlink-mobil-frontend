import 'dotenv/config';

export default {
  name: 'DeepVision',
  version: '1.0.0',
  extra: {
    API_URL: process.env.API_URL || 'http://localhost:3000/api',
    API_TIMEOUT: process.env.API_TIMEOUT || 10000,
    ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    SECURE_STORAGE_KEY: process.env.SECURE_STORAGE_KEY || 'deepvision_secure_storage',
  },
}; 