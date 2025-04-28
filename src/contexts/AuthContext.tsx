import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // API çağrısı burada yapılacak
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Giriş yapılırken bir hata oluştu');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // API çağrısı burada yapılacak
      setIsAuthenticated(false);
    } catch (error) {
      throw new Error('Çıkış yapılırken bir hata oluştu');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}; 