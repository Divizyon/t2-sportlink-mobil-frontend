export interface User {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
  role: 'user' | 'admin' | 'superadmin';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
} 