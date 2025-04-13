import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useThemeStore } from '../../store';

interface FormButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

function FormButton({
  title,
  isLoading = false,
  variant = 'primary',
  ...rest
}: FormButtonProps) {
  const { isDarkMode } = useThemeStore();

  // Varyasyona göre stil tanımlamaları
  const getBackgroundColor = () => {
    if (variant === 'primary') return isDarkMode ? '#4C8BF5' : '#2196F3';
    if (variant === 'secondary') return isDarkMode ? '#555' : '#9E9E9E';
    return 'transparent';
  };

  const getBorderColor = () => {
    if (variant === 'outline') return isDarkMode ? '#4C8BF5' : '#2196F3';
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'outline') return isDarkMode ? '#4C8BF5' : '#2196F3';
    return '#fff';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: rest.disabled ? 0.6 : 1
        }
      ]}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FormButton; 