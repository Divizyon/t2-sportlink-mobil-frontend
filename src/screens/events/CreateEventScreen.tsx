import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  SafeAreaView,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { InputField } from '../../components/InputField/InputField';
import { LocationPicker } from '../../components/LocationPicker/LocationPicker';
import { EventCreateRequest, EventStatus, Sport } from '../../types/eventTypes/event.types';
import { eventService } from '../../api/events/eventApi';

// Tarih ve saat işlemleri için yardımcı fonksiyonlar
const dateTimeHelpers = {
  // Tarihi YYYY-MM-DD formatına dönüştürür
  formatDateToYYYYMMDD: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },
  
  // Tarih ve saati birleştirerek ISO formatında döndürür
  combineDateTime: (date: Date, time: Date): string => {
    const newDate = new Date(date);
    newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return newDate.toISOString();
  },
  
  // Saati HH:MM formatında gösterir
  formatTimeDisplay: (time: Date): string => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  
  // Tarihi yerel formatta gösterir (15 Nisan 2023)
  formatLocalDate: (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  },
  
  // Zamanı 15 dakikalık dilimlere yuvarlar
  roundTimeToNearest15Min: (date: Date): Date => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    const newDate = new Date(date);
    
    if (roundedMinutes === 60) {
      newDate.setHours(date.getHours() + 1, 0, 0, 0);
    } else {
      newDate.setMinutes(roundedMinutes, 0, 0);
    }
    
    return newDate;
  },
  
  // "2023/05/20" formatındaki stringi Date objesine çevirir
  parseModernDateString: (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  },
  
  // "HH:mm" formatındaki stringi zaman olarak kullanılacak Date objesine çevirir
  parseTimeString: (timeString: string): Date => {
    if (!timeString) return new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  },
  
  // Date objesini modern-datepicker formatına çevirir (YYYY/MM/DD)
  formatToModernDateString: (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
};

// İkon-isim eşleştirmesi fonksiyonu
const getSportIcon = (sportName: string = '') => {
  const lowerName = sportName.toLowerCase();
  if (lowerName.includes('futbol')) return 'football-outline';
  if (lowerName.includes('basketbol')) return 'basketball-outline';
  if (lowerName.includes('voleybol')) return 'baseball-outline';
  if (lowerName.includes('tenis')) return 'tennisball-outline';
  if (lowerName.includes('yüzme')) return 'water-outline';
  if (lowerName.includes('koşu') || lowerName.includes('kosu')) return 'walk-outline';
  if (lowerName.includes('bisiklet')) return 'bicycle-outline';
  if (lowerName.includes('e-spor') || lowerName.includes('espor')) return 'game-controller-outline';
  if (lowerName.includes('masa tenisi')) return 'tennisball-outline';
  return 'fitness-outline'; // Varsayılan
};

// SportCategories bileşenini düzenle
interface SportCategoriesRowProps {
  sports: Sport[];
  selectedSport: string | null;
  onSelectSport: (sportId: string) => void;
  theme: {
    colors: {
      accent: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      background: string;
      cardBackground: string;
    };
    mode: 'light' | 'dark';
  };
}

const SportCategoriesRow: React.FC<SportCategoriesRowProps> = ({ 
  sports, 
  selectedSport, 
  onSelectSport, 
  theme 
}) => {
  const renderSportItem = ({ item }: { item: Sport }) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.sportCategoryButton,
          { 
            backgroundColor: selectedSport === item.id 
              ? theme.colors.accent 
              : theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
          }
        ]}
        onPress={() => onSelectSport(item.id)}
      >
        <Ionicons 
          name={getSportIcon(item.name)} 
          size={24} 
          color={selectedSport === item.id ? 'white' : theme.colors.text} 
        />
        <Text 
          style={[
            styles.sportCategoryText, 
            { color: selectedSport === item.id ? 'white' : theme.colors.text }
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sportCategoriesContainer}>
      <FlatList
        data={sports}
        renderItem={renderSportItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportCategoriesFlatListContent}
      />
    </View>
  );
};

export const CreateEventScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const { createEvent, isLoading, error, message, clearError, clearMessage, fetchSports, sports } = useEventStore();

  // Tarih ve saat için başlangıç değerleri
  const now = new Date();
  const roundedNow = dateTimeHelpers.roundTimeToNearest15Min(now);
  const roundedEndTime = new Date(roundedNow);
  roundedEndTime.setHours(roundedNow.getHours() + 2);
  
  // Tarih ve saat görüntüleme için state'ler
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [selectedStartTime, setSelectedStartTime] = useState<Date>(roundedNow);
  const [selectedEndTime, setSelectedEndTime] = useState<Date>(roundedEndTime);
  
  // Ekranda gösterilecek zaman formatları
  const [startTimeDisplay, setStartTimeDisplay] = useState<string>(
    dateTimeHelpers.formatTimeDisplay(roundedNow)
  );
  const [endTimeDisplay, setEndTimeDisplay] = useState<string>(
    dateTimeHelpers.formatTimeDisplay(roundedEndTime)
  );

  // Form durumu
  const [formData, setFormData] = useState<EventCreateRequest>(() => {
    return {
      sport_id: '',
      title: '',
      description: '',
      event_date: dateTimeHelpers.formatDateToYYYYMMDD(now),
      start_time: roundedNow.toISOString(),
      end_time: roundedEndTime.toISOString(),
      location_name: '',
      location_latitude: 39.9334,  // Türkiye orta koordinatları
      location_longitude: 32.8597,
      max_participants: 10,
      status: 'active' as EventStatus,
      is_private: false,
      invitation_code: ''
    };
  });

  // UI için ekstra state'ler
  const [isPrivate, setIsPrivate] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string>('');
  
  // Modal görünürlük durumları
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startTimeModalVisible, setStartTimeModalVisible] = useState(false);
  const [endTimeModalVisible, setEndTimeModalVisible] = useState(false);
  
  // Form hatalar
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Seçili spor kategorisi
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  // Component mount edildiğinde spor kategorilerini getir
  const [sportsLoaded, setSportsLoaded] = useState(false);
  
  useEffect(() => {
    // Güvenli bir şekilde sports'un var olup olmadığını kontrol et
    if (!sportsLoaded && (!sports || sports.length === 0)) {
      setSportsLoaded(true);
      
      // Asenkron olarak spor dallarını getir
      const loadSports = async () => {
        try {
          await fetchSports();
        } catch (error) {
          console.error('Spor dalları yüklenirken hata:', error);
        }
      };
      
      loadSports();
    }
    
    // Cleanup function to prevent unwanted API calls
    return () => {
      // This will help break the loop of API calls when leaving the screen
      clearError();
    };
  }, [sports, clearError]); // sports değiştiğinde tekrar kontrol et

  // Hata ve mesaj durumlarını izle
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }

    if (message) {
      Alert.alert('Başarılı', message, [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
      clearMessage();
    }
  }, [error, message]);

  // Tarih seçimi yapıldığında
  const handleDateChange = (dateStr: string) => {
    // Modern date picker formatı: YYYY/MM/DD
    const date = dateTimeHelpers.parseModernDateString(dateStr);
    setSelectedDate(date);
    
    // Format tarihi YYYY-MM-DD şeklinde form için
    const formattedDate = dateTimeHelpers.formatDateToYYYYMMDD(date);
    console.log('Selected date:', formattedDate);
    
    // Form verisini güncelle
    setFormData(prev => {
      // Tarih güncellendikten sonra başlangıç ve bitiş zamanlarını da güncelle
      const newStartTime = dateTimeHelpers.combineDateTime(date, selectedStartTime);
      const newEndTime = dateTimeHelpers.combineDateTime(date, selectedEndTime);
      
      return {
        ...prev,
        event_date: formattedDate,
        start_time: newStartTime,
        end_time: newEndTime
      };
    });
    
    setFormErrors(prev => ({ ...prev, event_date: '' }));
    
    // Modal'ı kapat
    setTimeout(() => {
      setDateModalVisible(false);
    }, 500);
  };

  // Başlangıç saati seçimi yapıldığında
  const handleStartTimeChange = (timeStr: string) => {
    // Parse time: HH:mm
    const time = dateTimeHelpers.parseTimeString(timeStr);
    setSelectedStartTime(time);
    
    // Birleştirilmiş tarih-saat için ISO string
    const isoStartTime = dateTimeHelpers.combineDateTime(selectedDate, time);
    
    // Ekranda gösterilecek saat formatı
    const timeDisplayString = dateTimeHelpers.formatTimeDisplay(time);
    
    console.log('Selected start time:', timeDisplayString);
    console.log('ISO start time:', isoStartTime);
    
    setFormData(prev => ({ ...prev, start_time: isoStartTime }));
    setStartTimeDisplay(timeDisplayString);
    setFormErrors(prev => ({ ...prev, start_time: '' }));
    
    // Modal'ı kapat
    setTimeout(() => {
      setStartTimeModalVisible(false);
    }, 500);
  };

  // Bitiş saati seçimi yapıldığında
  const handleEndTimeChange = (timeStr: string) => {
    // Parse time: HH:mm
    const time = dateTimeHelpers.parseTimeString(timeStr);
    setSelectedEndTime(time);
    
    // Birleştirilmiş tarih-saat için ISO string
    const isoEndTime = dateTimeHelpers.combineDateTime(selectedDate, time);
    
    // Ekranda gösterilecek saat formatı
    const timeDisplayString = dateTimeHelpers.formatTimeDisplay(time);
    
    console.log('Selected end time:', timeDisplayString);
    console.log('ISO end time:', isoEndTime);
    
    setFormData(prev => ({ ...prev, end_time: isoEndTime }));
    setEndTimeDisplay(timeDisplayString);
    setFormErrors(prev => ({ ...prev, end_time: '' }));
    
    // Modal'ı kapat
    setTimeout(() => {
      setEndTimeModalVisible(false);
    }, 500);
  };

  // Form alanlarını güncelleme
  const handleChange = (name: keyof EventCreateRequest, value: string | number | boolean) => {
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  // Özel etkinlik durumu değişikliğini izle
  const handlePrivateToggle = () => {
    const newIsPrivate = !isPrivate;
    setIsPrivate(newIsPrivate);
    
    // Eğer özel etkinlik kapatılırsa invitation_code'u varsayılan değere ayarla
    if (!newIsPrivate) {
      setInvitationCode('0000');
      setFormData(prev => ({ ...prev, is_private: false, invitation_code: '0000' }));
    } else {
      setFormData(prev => ({ ...prev, is_private: true, invitation_code: '' }));
    }
  };

  // Davet kodu değişikliği
  const handleInvitationCodeChange = (text: string) => {
    setInvitationCode(text);
    setFormData(prev => ({ ...prev, invitation_code: text }));
    setFormErrors({ ...formErrors, invitation_code: '' });
  };

  // Spor kategorisi seçme
  const handleSelectSport = (sportId: string) => {
    setSelectedSport(sportId);
    setFormData({ ...formData, sport_id: sportId });
    setFormErrors({ ...formErrors, sport_id: '' });
  };

  // Form doğrulama
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.sport_id) errors.sport_id = 'Spor türü seçmelisiniz';
    if (!formData.title.trim()) errors.title = 'Başlık girmelisiniz';
    
    // Açıklama için minimum 10 karakter kontrolü
    if (!formData.description.trim()) {
      errors.description = 'Açıklama girmelisiniz';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Açıklama en az 10 karakter olmalıdır';
    }
    
    if (!formData.event_date) errors.event_date = 'Tarih seçmelisiniz';
    if (!formData.location_name.trim()) errors.location_name = 'Konum adı girmelisiniz';
    if (formData.max_participants <= 0) errors.max_participants = 'Geçerli bir katılımcı sayısı girmelisiniz';

    // Özel etkinlik için davet kodu kontrolü
    if (formData.is_private) {
      if (!formData.invitation_code?.trim()) {
        errors.invitation_code = 'Özel etkinlik için davet kodu girmelisiniz';
      } else if (formData.invitation_code.trim().length < 4) {
        errors.invitation_code = 'Davet kodu en az 4 karakter olmalıdır';
      }
    }

    // Parse time from ISO format for comparison
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);

    if (startTime >= endTime) {
      errors.end_time = 'Bitiş saati başlangıç saatinden sonra olmalıdır';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Etkinlik oluşturma
  const handleCreateEvent = async () => {
    if (isLoading) return; // Prevent multiple submissions while loading
    
    if (validateForm()) {
      try {
        // API için formu hazırla - doğru formatta veri oluştur
        const apiRequestData: EventCreateRequest = { ...formData };
        
        // Özel etkinlik değilse invitation_code'a varsayılan değer ata
        // API minimum 4 karakter bekliyor
        if (!apiRequestData.is_private) {
          apiRequestData.invitation_code = "0000"; // Varsayılan kod
        }
        
        // Log the request data for debugging
        console.log('Sending event data to API:', JSON.stringify(apiRequestData, null, 2));
        
        // API'den gelen yanıtı daha detaylı görmek için try-catch içinde manuel olarak çağırma yap
        try {
          const apiResponse = await eventService.createEvent(apiRequestData);
          console.log('API response:', JSON.stringify(apiResponse, null, 2));
          
          if (apiResponse.success) {
            Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu.', [
              { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
          } else {
            Alert.alert('Hata', apiResponse.message || 'Etkinlik oluşturulurken bir hata oluştu');
          }
          return true;
        } catch (apiError: any) {
          // API hata yanıtını detaylı inceleme
          console.error('API Error Details:', JSON.stringify(apiError.response?.data, null, 2));
          console.error('API Error Status:', apiError.response?.status);
          
          // Eğer API özel bir hata mesajı döndürdüyse onu göster
          const errorMessage = apiError.response?.data?.message || 
                              'Etkinlik oluşturulurken bir hata oluştu. Lütfen tüm alanları kontrol edip tekrar deneyin.';
          
          Alert.alert('Hata', errorMessage);
          return false;
        }
      } catch (error) {
        console.error('Etkinlik oluşturulurken hata:', error);
        Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu. Lütfen tüm alanları kontrol edip tekrar deneyin.');
        return false;
      }
    } else {
      // Hata olan alanlar hakkında kullanıcıyı bilgilendir
      const errorMessages = Object.values(formErrors).join('\n');
      Alert.alert('Form Hataları', `Lütfen aşağıdaki hataları düzeltin:\n${errorMessages}`);
      return false;
    }
  };

  // Geri gitme
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Tarih formatını düzenler: 2023-04-15 -> 15 Nisan 2023
  const formatDate = (dateString: string) => {
    return dateTimeHelpers.formatLocalDate(dateString);
  };

  // Render time picker buttons
  const renderTimePickerButton = (label: string, value: string, onPress: () => void, error?: string) => {
    return (
      <View style={styles.timePickerWrapper}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
        <TouchableOpacity 
          style={[
            styles.timePickerButton,
            { 
              borderColor: error ? theme.colors.error : theme.colors.border,
              backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white', 
            }
          ]}
          onPress={onPress}
        >
          <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.timePickerText, { color: theme.colors.text }]}>
            {value}
          </Text>
        </TouchableOpacity>
        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </View>
    );
  };

  // Özel etkinlik toggle bileşeni
  const renderPrivateEventToggle = () => {
    return (
      <View style={styles.privateEventContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Etkinlik Türü
        </Text>
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Özel Etkinlik
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              { 
                backgroundColor: isPrivate ? theme.colors.accent : '#E0E0E0',
                borderWidth: 1,
                borderColor: isPrivate ? theme.colors.accent : '#CCCCCC'
              }
            ]}
            onPress={handlePrivateToggle}
          >
            <View style={[
              styles.toggleIndicator, 
              { 
                backgroundColor: isPrivate ? 'white' : '#999999',
                transform: [{ translateX: isPrivate ? 20 : 0 }] 
              }
            ]} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
          {isPrivate 
            ? 'Sadece davet kodunu bilen katılımcılar etkinliğe katılabilir' 
            : 'Herkes etkinliğe katılabilir'}
        </Text>
        
        {isPrivate && (
          <InputField
            label="Davet Kodu"
            placeholder="Özel etkinlik için davet kodu girin"
            value={invitationCode}
            onChangeText={handleInvitationCodeChange}
            error={formErrors.invitation_code}
          />
        )}
      </View>
    );
  };

  const renderFormItem = () => {
    return (
      <View style={styles.formContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Spor Türü
        </Text>
        <SportCategoriesRow 
          sports={sports} 
          selectedSport={selectedSport}
          onSelectSport={handleSelectSport}
          theme={theme}
        />
        
        <InputField
          label="Etkinlik Başlığı"
          placeholder="Örn: Haftalık Basketbol Maçı"
          value={formData.title}
          onChangeText={(text) => handleChange('title', text)}
          error={formErrors.title}
        />
        
        <InputField
          label="Açıklama"
          placeholder="Etkinlik hakkında detaylı bilgi verin"
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={formErrors.description}
        />
        
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
          Etkinlik Tarihi
        </Text>
        <TouchableOpacity 
          style={[
            styles.datePickerButton,
            { 
              borderColor: formErrors.event_date ? theme.colors.error : theme.colors.border,
              backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            }
          ]}
          onPress={() => setDateModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.datePickerText, { color: theme.colors.text }]}>
            {formatDate(formData.event_date)}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.timePickersContainer}>
          {renderTimePickerButton(
            'Başlangıç Saati', 
            startTimeDisplay, 
            () => setStartTimeModalVisible(true),
            formErrors.start_time
          )}
          
          {renderTimePickerButton(
            'Bitiş Saati', 
            endTimeDisplay, 
            () => setEndTimeModalVisible(true),
            formErrors.end_time
          )}
        </View>
        
        <LocationPicker
          onLocationSelect={(location) => {
            setFormData({
              ...formData,
              location_name: location.name,
              location_latitude: location.latitude,
              location_longitude: location.longitude
            });
            setFormErrors({ ...formErrors, location_name: '' });
          }}
          theme={theme}
          error={formErrors.location_name}
          initialLocation={
            formData.location_name ? {
              name: formData.location_name,
              latitude: formData.location_latitude,
              longitude: formData.location_longitude
            } : null
          }
        />
        
        <InputField
          label="Maksimum Katılımcı Sayısı"
          placeholder="Örn: 10"
          value={formData.max_participants.toString()}
          onChangeText={(text) => handleChange('max_participants', parseInt(text) || 0)}
          keyboardType="numeric"
          error={formErrors.max_participants}
        />
        
        {renderPrivateEventToggle()}
        
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.accent },
            isLoading && styles.disabledButton
          ]}
          onPress={handleCreateEvent}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.createButtonText}>Etkinlik Oluştur</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Tarih seçici modal
  const renderDatePickerModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={dateModalVisible}
        onRequestClose={() => setDateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDateModalVisible(false)}
        >
          <View style={[styles.modalView, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <DatePicker
              mode="calendar"
              minimumDate={dateTimeHelpers.formatToModernDateString(new Date())}
              selected={dateTimeHelpers.formatToModernDateString(selectedDate)}
              onDateChange={handleDateChange}
              options={{
                backgroundColor: theme.colors.cardBackground,
                textHeaderColor: theme.colors.accent,
                textDefaultColor: theme.colors.text,
                selectedTextColor: '#fff',
                mainColor: theme.colors.accent,
                textSecondaryColor: theme.colors.textSecondary,
                borderColor: 'rgba(122, 146, 165, 0.1)',
              }}
              style={{ borderRadius: 10 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Başlangıç saati seçici modal
  const renderStartTimePickerModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={startTimeModalVisible}
        onRequestClose={() => setStartTimeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStartTimeModalVisible(false)}
        >
          <View style={[styles.modalView, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Başlangıç Saati Seçin</Text>
              <TouchableOpacity onPress={() => setStartTimeModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <DatePicker
              mode="time"
              minuteInterval={15}
              onTimeChange={handleStartTimeChange}
              options={{
                backgroundColor: theme.colors.cardBackground,
                textHeaderColor: theme.colors.accent,
                textDefaultColor: theme.colors.text,
                selectedTextColor: '#fff',
                mainColor: theme.colors.accent,
                textSecondaryColor: theme.colors.textSecondary,
                borderColor: 'rgba(122, 146, 165, 0.1)',
              }}
              style={{ borderRadius: 10 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Bitiş saati seçici modal
  const renderEndTimePickerModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={endTimeModalVisible}
        onRequestClose={() => setEndTimeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEndTimeModalVisible(false)}
        >
          <View style={[styles.modalView, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Bitiş Saati Seçin</Text>
              <TouchableOpacity onPress={() => setEndTimeModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <DatePicker
              mode="time"
              minuteInterval={15}
              onTimeChange={handleEndTimeChange}
              options={{
                backgroundColor: theme.colors.cardBackground,
                textHeaderColor: theme.colors.accent,
                textDefaultColor: theme.colors.text,
                selectedTextColor: '#fff',
                mainColor: theme.colors.accent,
                textSecondaryColor: theme.colors.textSecondary,
                borderColor: 'rgba(122, 146, 165, 0.1)',
              }}
              style={{ borderRadius: 10 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Yeni Etkinlik Oluştur
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <FlatList
          data={[{ key: 'form' }]}
          renderItem={renderFormItem}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
      
      {renderDatePickerModal()}
      {renderStartTimePickerModal()}
      {renderEndTimePickerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sportCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  sportCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
  },
  sportCategoryText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  datePickerText: {
    marginLeft: 12,
    fontSize: 16,
  },
  timePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timePickerWrapper: {
    width: '47%',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  timePickerText: {
    marginLeft: 12,
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  privateEventContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  toggleDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  locationPickerContainer: {
    marginBottom: 16,
    zIndex: 2, // Önerilerin diğer elementlerin üzerinde görünmesi için
  },
  locationInputWrapper: {
    position: 'relative',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  suggestionText: {
    fontSize: 14,
    flex: 1,
  },
  locationIcon: {
    marginRight: 8,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sportCategoriesFlatListContent: {
    padding: 10,
  },
});