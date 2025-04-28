import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useThemeStore } from '../../store/appStore/themeStore';

type EditProfileScreenProps = {
  navigation: any;
  route: any;
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const { userInfo, updateUserInfo, isUpdating, error, successMessage, clearErrors, clearMessages, fetchUserProfile } = useProfileStore();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // İlk yüklemede form verilerini doldur
  useEffect(() => {
    if (userInfo) {
      setFormData({
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        username: userInfo.username || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
      });
    }
  }, [userInfo]);

  // Başarı durumunda
  useEffect(() => {
    if (successMessage) {
      Alert.alert('Başarılı', successMessage, [
        { text: 'Tamam', onPress: () => {
          clearMessages();
          navigation.goBack();
        }}
      ]);
    }
  }, [successMessage, navigation, clearMessages]);

  // Hata durumunda
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error, [
        { text: 'Tamam', onPress: () => clearErrors() }
      ]);
    }
  }, [error, clearErrors]);

  // Form değerlerini güncelle
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // İlgili hatayı temizle
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Formu sıfırla
  const handleReset = () => {
    if (userInfo) {
      setFormData({
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        username: userInfo.username || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
      });
    }
    setValidationErrors({});
  };

  // Form doğrulama
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'İsim alanı zorunludur';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Soyisim alanı zorunludur';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Değişiklikleri kaydet
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Sadece değişen alanları gönder
    const changedData: Partial<typeof formData> = {};
    
    if (userInfo?.firstName !== formData.firstName) changedData.firstName = formData.firstName;
    if (userInfo?.lastName !== formData.lastName) changedData.lastName = formData.lastName;
    if (userInfo?.phone !== formData.phone) changedData.phone = formData.phone;
    
    // Profili güncelle
    const success = await updateUserInfo(changedData);
    
    if (success) {
      // Profil verilerini yeniden getir
      await fetchUserProfile();
      
      // Başarı mesajını göster ve önceki sayfaya dön
      Alert.alert(
        'Başarılı',
        'Profil bilgileriniz başarıyla güncellendi.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
     
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* İsim */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>İsim</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: validationErrors.firstName ? theme.colors.error : theme.colors.border 
                }
              ]}
              placeholder="İsminizi girin"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
            />
            {validationErrors.firstName ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {validationErrors.firstName}
              </Text>
            ) : null}
          </View>
          
          {/* Soyad */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Soyad</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: validationErrors.lastName ? theme.colors.error : theme.colors.border 
                }
              ]}
              placeholder="Soyadınızı girin"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
            />
            {validationErrors.lastName ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {validationErrors.lastName}
              </Text>
            ) : null}
          </View>
          
          {/* Kullanıcı Adı */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Kullanıcı Adı</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  opacity: 0.7 
                }
              ]}
              placeholder="Kullanıcı adınız"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.username}
              editable={false}
            />
          </View>
          
          {/* E-posta */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>E-posta</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  opacity: 0.7 
                }
              ]}
              placeholder="E-posta adresiniz"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.email}
              editable={false}
              keyboardType="email-address"
            />
          </View>
          
          {/* Telefon */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Telefon</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border 
                }
              ]}
              placeholder="Telefon numaranız"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType="phone-pad"
            />
          </View>
          
          {/* Butonlar */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.cancelButton, 
                { 
                  borderColor: theme.colors.border,
                  backgroundColor: 'transparent' 
                }
              ]}
              onPress={() => navigation.goBack()}
              disabled={isUpdating}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                İptal
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { backgroundColor: theme.colors.accent }
              ]}
              onPress={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default EditProfileScreen; 