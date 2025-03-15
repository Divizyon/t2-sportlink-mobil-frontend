import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store';

/**
 * Giriş formu bileşeni
 * Zustand auth store kullanarak giriş işlemlerini yönetir
 */
const LoginForm = () => {
  // Form state'i
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Auth store'dan state ve aksiyonları al
  const { isLoading, error, login, clearError } = useAuthStore();

  // Giriş işlemi
  const handleLogin = async () => {
    if (username.trim() && password.trim()) {
      await login(username, password);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          if (error) clearError();
        }}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error) clearError();
        }}
        secureTextEntry
      />
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {isLoading ? (
        <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />
      ) : (
        <Button title="Giriş Yap" onPress={handleLogin} disabled={!username || !password} />
      )}
      
      <Text style={styles.hint}>
        Test için: kullanıcı adı "test", şifre "password"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 12,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoginForm; 