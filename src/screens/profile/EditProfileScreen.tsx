import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useMapsStore } from '../../store/appStore/mapsStore';
import * as Location from 'expo-location';

type EditProfileScreenProps = {
  navigation: any;
  route: any;
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const { userInfo, defaultLocation, updateUserInfo, updateUserLocation, isUpdating, error, successMessage, clearErrors, clearMessages, fetchUserProfile } = useProfileStore();
  const { setLastLocation } = useMapsStore();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
  });

  // Konum bilgileri
  const [locationData, setLocationData] = useState<{
    latitude: string;
    longitude: string;
    displayAddress: string;
  }>({
    latitude: '',
    longitude: '',
    displayAddress: 'Konum bilgisi yok'
  });
  
  // Konum alma işlemi durumu
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Konum izni durumu
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  
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
      const fetchAddressFromCoordinates = async () => {
        try {
          const lat = defaultLocation.latitude;
          const lng = defaultLocation.longitude;
          
          let displayAddress = defaultLocation.locationName || 'Konum bilgisi';
          
          // Eğer locationName (adres bilgisi) yoksa veya varsayılan ise, gerçek adresi al
          if (!defaultLocation.locationName || defaultLocation.locationName === 'Kullanıcı Konumu') {
            try {
              // Koordinatlardan adres bilgisini al
              const addressResponse = await Location.reverseGeocodeAsync({
                latitude: lat,
                longitude: lng
              });
              
              if (addressResponse && addressResponse.length > 0) {
                const address = addressResponse[0];
                
                // Anlamlı adres parçalarını birleştir
                const addressParts = [
                  address.name,
                  address.street,
                  address.district,
                  address.city,
                  address.region
                ].filter(Boolean);
                
                // Adres birleştirme
                if (addressParts.length > 0) {
                  displayAddress = addressParts.join(', ');
                  
                  // Maps store'u güncelle
                  setLastLocation(lat, lng, displayAddress);
                }
              }
            } catch (error) {
              console.error('Adres bilgisi alınamadı:', error);
            }
          }
          
          setLocationData({
            latitude: String(lat),
            longitude: String(lng),
            displayAddress
          });
        } catch (error) {
          console.error('Konum verilerini işlerken hata:', error);
          setLocationData({
            latitude: defaultLocation.latitude ? String(defaultLocation.latitude) : '',
            longitude: defaultLocation.longitude ? String(defaultLocation.longitude) : '',
            displayAddress: 'Konum bilgisi'
          });
        }
      };
      
      fetchAddressFromCoordinates();
    } else {
      setLocationData({
        latitude: '',
        longitude: '',
        displayAddress: 'Konum bilgisi yok'
      });
    }
    
    // Konum izinlerini kontrol et
    checkLocationPermissions();
  }, [userInfo, defaultLocation, setLastLocation]);

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

  // Konum izinlerini kontrol et
  const checkLocationPermissions = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationPermission(status);
  };

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
    
    if (defaultLocation) {
      setLocationData({
        latitude: String(defaultLocation.latitude),
        longitude: String(defaultLocation.longitude),
        displayAddress: defaultLocation.locationName || 'Konum bilgisi'
      });
    } else {
      setLocationData({
        latitude: '',
        longitude: '',
        displayAddress: 'Konum bilgisi yok'
      });
    }
    
    setValidationErrors({});
  };

  // Uygulama ayarlarını aç
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Mevcut konumu al
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Konum izni kontrol et
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni Gerekli', 
          'Konumunuzu almak için izin vermeniz gerekiyor. Ayarlar sayfasından konum izni verebilirsiniz.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarları Aç', onPress: openAppSettings }
          ]
        );
        setIsLoadingLocation(false);
        return;
      }
      
      // Mevcut konum bilgisini al (daha yüksek doğruluk ve zaman aşımı ile)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000,
        mayShowUserSettingsDialog: true
      });
      
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      
      // Adres bilgisini al
      let displayAddress = 'Konum alındı';
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng
        });
        
        if (addressResponse && addressResponse.length > 0) {
          const address = addressResponse[0];
          const addressParts = [
            address.name,
            address.street,
            address.district,
            address.city,
            address.region
          ].filter(Boolean);
          
          displayAddress = addressParts.length > 0 
            ? addressParts.join(', ')
            : 'Konum alındı';
        }
      } catch (error) {
        console.error('Adres alınamadı:', error);
      }
      
      // Konum bilgilerini güncelle
      setLocationData({
        latitude: String(lat),
        longitude: String(lng),
        displayAddress
      });
      
      Alert.alert(
        'Konum Alındı', 
        `Konumunuz başarıyla alındı: ${displayAddress}`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Konum alma hatası:', errorMessage);
      
      Alert.alert(
        'Konum Alınamadı', 
        'Konumunuz alınırken bir hata oluştu. Lütfen konum servislerinin açık olduğundan emin olun.',
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
    
    // Konum doğrulama - artık manuel giriş olmadığı için kaldırılabilir

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
        try {
          // Konum bilgisini güncelle
          const locationSuccess = await updateUserLocation({
            latitude: lat,
            longitude: lng,
            locationName: locationData.displayAddress
          });
          
          // Maps store'daki konum bilgisini de güncelle
          if (locationSuccess) {
            setLastLocation(lat, lng, locationData.displayAddress);
          } else if (success) {
            Alert.alert(
              'Kısmi Başarı',
              'Profil bilgileriniz güncellendi fakat konum bilgisi güncellenemedi.'
            );
            return;
          }
        } catch (error) {
          console.error('Konum güncelleme hatası:', error);
          if (success) {
            Alert.alert(
              'Kısmi Başarı',
              'Profil bilgileriniz güncellendi fakat konum bilgisi güncellenemedi.'
            );
            return;
          }
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
          </View>
          
          {/* Konum Kartı */}
          <View style={[styles.locationCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={24} color={theme.colors.accent} />
              <View style={styles.locationDetails}>
                <Text style={[styles.locationText, { color: theme.colors.text }]}>
                  {locationData.displayAddress}
                </Text>
                {locationData.latitude && locationData.longitude ? (
                  <Text style={[styles.locationCoords, { color: theme.colors.textSecondary }]}>
                    {locationData.latitude.substring(0, 7)}, {locationData.longitude.substring(0, 7)}
                  </Text>
                ) : null}
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.locationButton, { backgroundColor: theme.colors.accent }]}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="navigate" size={16} color="white" style={styles.buttonIcon} />
                  <Text style={styles.locationButtonText}>Konumumu Kullan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Konum izin durumu mesajı */}
          {locationPermission !== 'granted' && (
            <TouchableOpacity 
              style={[styles.permissionAlert, { backgroundColor: '#FFF3F3' }]}
              onPress={openAppSettings}
            >
              <Ionicons name="warning-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.permissionText, { color: theme.colors.error }]}>
                Konum izni verilmedi. Konumunuzu almak için izin verin.
              </Text>
            </TouchableOpacity>
          )}
          
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
  locationCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 14,
  },
  locationButton: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  permissionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  permissionText: {
    marginLeft: 8,
    flex: 1,
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