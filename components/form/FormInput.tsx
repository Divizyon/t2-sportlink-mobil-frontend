import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { useThemeStore } from '../../store';

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: FieldError;
  secureTextEntry?: boolean;
}

function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  error,
  secureTextEntry,
  ...rest
}: FormInputProps<T>) {
  const { isDarkMode } = useThemeStore();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#333' }]}>
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDarkMode ? '#333' : '#fff',
                borderColor: error ? '#ff0000' : isDarkMode ? '#555' : '#ddd',
                color: isDarkMode ? '#fff' : '#333',
              }
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value as string}
            secureTextEntry={secureTextEntry}
            placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
            {...rest}
          />
        )}
      />
      {error && (
        <Text style={styles.errorText}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginTop: 4,
  },
});

export default FormInput; 