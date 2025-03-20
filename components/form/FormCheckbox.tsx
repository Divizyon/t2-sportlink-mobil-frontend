import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { useThemeStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: FieldError;
}

function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  error,
}: FormCheckboxProps<T>) {
  const { isDarkMode } = useThemeStore();

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View style={styles.checkboxContainer}>
            <Pressable
              onPress={() => onChange(!value)}
              style={[
                styles.checkbox,
                { 
                  backgroundColor: isDarkMode ? '#333' : '#fff',
                  borderColor: error ? '#ff0000' : isDarkMode ? '#555' : '#ddd' 
                }
              ]}
            >
              {value && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color={isDarkMode ? '#fff' : '#000'} 
                />
              )}
            </Pressable>
            <Text 
              style={[
                styles.label, 
                { color: isDarkMode ? '#fff' : '#333' }
              ]}
              onPress={() => onChange(!value)}
            >
              {label}
            </Text>
          </View>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 32,
  },
});

export default FormCheckbox; 