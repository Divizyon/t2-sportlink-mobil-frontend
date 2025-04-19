import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  VStack,
  FormControl,
  Input,
  InputField,
  Button,
  ButtonText,
  Text,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { COLORS } from '@/src/constants';

export interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Giriş formu bileşeni
 * Email ve şifre ile giriş yapmayı sağlar
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, error = null }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Basit doğrulama
    if (!username.trim() || !password.trim()) {
      // Form doğrulamasını component içinde yapabiliriz ya da
      // bunu üst component'e bırakabiliriz. Burada basit bir kontrol yapıyoruz.
      return;
    }

    onSubmit(username, password);
  };

  return (
    <VStack space="md" width="100%">
      <FormControl isRequired isInvalid={!!error}>
        <FormControl.Label>
          <Text color={COLORS.primary}>E-posta</Text>
        </FormControl.Label>
        <Input>
          <InputField
            placeholder="E-posta adresinizi giriniz"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </Input>
      </FormControl>

      <FormControl isRequired isInvalid={!!error}>
        <FormControl.Label>
          <Text color={COLORS.primary}>Şifre</Text>
        </FormControl.Label>
        <Input>
          <InputField
            placeholder="Şifrenizi giriniz"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Input>
        {error && (
          <FormControlError>
            <FormControlErrorText>{error}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      <Button
        onPress={handleSubmit}
        isDisabled={isLoading}
        backgroundColor={COLORS.accent}
        borderRadius={30}
        height={50}
        marginTop={5}
      >
        <ButtonText>
          {isLoading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
        </ButtonText>
      </Button>
    </VStack>
  );
};

export default LoginForm; 