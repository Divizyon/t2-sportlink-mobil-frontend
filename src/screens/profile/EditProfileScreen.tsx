import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useThemeStore } from '../../store/appStore/themeStore';
import * as Location from 'expo-location';

type EditProfileScreenProps = {
  navigation: any;
  route: any;
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const { userInfo, defaultLocation, updateUserInfo, updateUserLocation, isUpdating, error, successMessage, clearErrors, clearMessages, fetchUserProfile } = useProfileStore();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
  });

  // Konum bilgileri
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
  });
  
  // Konum alma işlemi durumu
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
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
    
    // Konum bilgilerini doldur
    if (defaultLocation) {
      setLocationData({
        latitude: String(defaultLocation.latitude),
        longitude: String(defaultLocation.longitude),
      });
    }
  }, [userInfo, defaultLocation]);

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

  // Konum değerlerini güncelle
  const handleLocationChange = (field: string, value: string) => {
    setLocationData(prev => ({
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
    
    if (defaultLocation) {
      setLocationData({
        latitude: String(defaultLocation.latitude),
        longitude: String(defaultLocation.longitude),
      });
    } else {
      setLocationData({
        latitude: '',
        longitude: '',
      });
    }
    
    setValidationErrors({});
  };

  // Mevcut konumu al
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Konum izni iste
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli', 
          'Konumunuzu almak için izin vermeniz gerekiyor.',
          [{ text: 'Tamam' }]
        );
        setIsLoadingLocation(false);
        return;
      }
      
      // Mevcut konum bilgisini al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      // Konum bilgilerini güncelle
      setLocationData({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
      
      Alert.alert(
        'Konum Alındı', 
        'Mevcut konumunuz başarıyla alındı.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      Alert.alert(
        'Hata', 
        'Konum alınırken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
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
    
    // Konum doğrulama
    if (locationData.latitude && !isValidCoordinate(parseFloat(locationData.latitude), true)) {
      errors.latitude = 'Geçerli bir enlem değeri giriniz (-90 ile 90 arası)';
    }
    
    if (locationData.longitude && !isValidCoordinate(parseFloat(locationData.longitude), false)) {
      errors.longitude = 'Geçerli bir boylam değeri giriniz (-180 ile 180 arası)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Koordinat doğrulama yardımcı fonksiyonu
  const isValidCoordinate = (value: number, isLatitude: boolean): boolean => {
    if (isNaN(value)) return false;
    return isLatitude 
      ? value >= -90 && value <= 90 
      : value >= -180 && value <= 180;
  };

  // Değişiklikleri kaydet
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Sadece değişen profil verilerini gönder
    const changedData: Partial<typeof formData> = {};
    
    if (userInfo?.firstName !== formData.firstName) changedData.firstName = formData.firstName;
    if (userInfo?.lastName !== formData.lastName) changedData.lastName = formData.lastName;
    if (userInfo?.phone !== formData.phone) changedData.phone = formData.phone;
    
    // Profil bilgilerini güncelle
    const success = await updateUserInfo(changedData);
    
    // Konum bilgilerini kontrol et ve güncelle
    const hasLatitude = locationData.latitude.trim() !== '';
    const hasLongitude = locationData.longitude.trim() !== '';
    
    if (hasLatitude && hasLongitude) {
      const lat = parseFloat(locationData.latitude);
      const lng = parseFloat(locationData.longitude);
      
      // Eğer konum bilgileri değiştiyse veya ilk kez ekleniyorsa güncelle
      const locationChanged = 
        !defaultLocation || 
        defaultLocation.latitude !== lat || 
        defaultLocation.longitude !== lng;
      
      if (locationChanged) {
        const locationSuccess = await updateUserLocation({
          latitude: lat,
          longitude: lng,
          locationName: "Kullanıcı Konumu"
        });
        
        if (!locationSuccess && success) {
          Alert.alert(
            'Kısmi Başarı',
            'Profil bilgileriniz güncellendi fakat konum bilgisi güncellenemedi.'
          );
          return;
        }
      }
    }
    
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
          
          {/* Konum Bilgileri */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Konum Bilgileri</Text>
            <TouchableOpacity 
              style={[styles.locationButton, { backgroundColor: theme.colors.accent }]}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.locationButtonText}>Mevcut Konumu Al</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Enlem */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Enlem (Latitude)</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: validationErrors.latitude ? theme.colors.error : theme.colors.border 
                }
              ]}
              placeholder="Örn: 41.0082"
              placeholderTextColor={theme.colors.textSecondary}
              value={locationData.latitude}
              onChangeText={(text) => handleLocationChange('latitude', text)}
              keyboardType="numeric"
            />
            {validationErrors.latitude ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {validationErrors.latitude}
              </Text>
            ) : null}
          </View>
          
          {/* Boylam */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Boylam (Longitude)</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: validationErrors.longitude ? theme.colors.error : theme.colors.border 
                }
              ]}
              placeholder="Örn: 28.9784"
              placeholderTextColor={theme.colors.textSecondary}
              value={locationData.longitude}
              onChangeText={(text) => handleLocationChange('longitude', text)}
              keyboardType="numeric"
            />
            {validationErrors.longitude ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {validationErrors.longitude}
              </Text>
            ) : null}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
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