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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { InputField } from '../../components/InputField/InputField';
import { EventCreateRequest, EventStatus, Sport } from '../../types/eventTypes/event.types';

export const CreateEventScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const { createEvent, isLoading, error, message, clearError, clearMessage, fetchSports, sports } = useEventStore();

  // Form durumu
  const [formData, setFormData] = useState<EventCreateRequest>({
    sport_id: '',
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    location_name: '',
    location_latitude: 37.8716,  // Konya koordinatları
    location_longitude: 32.4846,
    max_participants: 10,
    status: 'active' as EventStatus,
    is_private: false,
    invitation_code: ''
  });

  // UI için ekstra state'ler
  const [isPrivate, setIsPrivate] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [startTimeDisplay, setStartTimeDisplay] = useState('18:00');
  const [endTimeDisplay, setEndTimeDisplay] = useState('20:00');

  // Tarih ve saat seçicileri için durum
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 saat sonrası
  
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

  // Tarih seçimi yapıldığında
  const onDateChange = (event: any, selectedDate?: Date) => {
    setDateModalVisible(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      
      // Format tarihi YYYY-MM-DD şeklinde
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, event_date: formattedDate });
      setFormErrors({ ...formErrors, event_date: '' });
    }
  };

  // Başlangıç saati seçimi yapıldığında
  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setStartTimeModalVisible(false);
    if (selectedTime) {
      setSelectedStartTime(selectedTime);
      
      // Combine the selected date with the selected time
      const combinedDateTime = new Date(formData.event_date);
      combinedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
      
      // Format the start time as ISO string
      const isoStartTime = combinedDateTime.toISOString();
      
      // For display we'll use HH:MM format
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      
      setFormData({ ...formData, start_time: isoStartTime });
      setStartTimeDisplay(`${hours}:${minutes}`);
      setFormErrors({ ...formErrors, start_time: '' });
    }
  };

  // Bitiş saati seçimi yapıldığında
  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setEndTimeModalVisible(false);
    if (selectedTime) {
      setSelectedEndTime(selectedTime);
      
      // Combine the selected date with the selected time
      const combinedDateTime = new Date(formData.event_date);
      combinedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
      
      // Format the end time as ISO string
      const isoEndTime = combinedDateTime.toISOString();
      
      // For display we'll use HH:MM format
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      
      setFormData({ ...formData, end_time: isoEndTime });
      setEndTimeDisplay(`${hours}:${minutes}`);
      setFormErrors({ ...formErrors, end_time: '' });
    }
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
    setFormData({ ...formData, is_private: newIsPrivate });
    
    // Eğer özel etkinlik kapatılırsa invitation_code'u temizle
    if (!newIsPrivate) {
      setInvitationCode('');
      setFormData(prev => ({ ...prev, invitation_code: '' }));
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
    if (!formData.description.trim()) errors.description = 'Açıklama girmelisiniz';
    if (!formData.event_date) errors.event_date = 'Tarih seçmelisiniz';
    if (!formData.location_name.trim()) errors.location_name = 'Konum adı girmelisiniz';
    if (formData.max_participants <= 0) errors.max_participants = 'Geçerli bir katılımcı sayısı girmelisiniz';

    // Özel etkinlik için davet kodu kontrolü
    if (formData.is_private && !formData.invitation_code.trim() ) {
      errors.invitation_code = 'Özel etkinlik için davet kodu girmelisiniz';
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
        // Create a copy of formData without UI-specific fields
        const apiRequestData = { ...formData };
        
        // Remove any UI-specific properties before sending to API
        delete (apiRequestData as any)._startTimeDisplay;
        delete (apiRequestData as any)._endTimeDisplay;
        
        const success = await createEvent(apiRequestData);
        
        if (success) {
          // Success is handled by the useEffect monitoring message
        }
      } catch (error) {
        Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu.');
      }
    } else {
      Alert.alert('Hata', 'Lütfen form alanlarını doğru şekilde doldurun');
    }
  };

  // Geri gitme
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Tarih formatını düzenler: 2023-04-15 -> 15 Nisan 2023
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
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
            
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              minimumDate={new Date()}
              style={{ width: '100%' }}
            />
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => {
                onDateChange(null, selectedDate);
                setDateModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Onayla</Text>
            </TouchableOpacity>
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
            
            <DateTimePicker
              value={selectedStartTime}
              mode="time"
              display="spinner"
              onChange={onStartTimeChange}
              style={{ width: '100%' }}
            />
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => {
                onStartTimeChange(null, selectedStartTime);
                setStartTimeModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Onayla</Text>
            </TouchableOpacity>
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
            
            <DateTimePicker
              value={selectedEndTime}
              mode="time"
              display="spinner"
              onChange={onEndTimeChange}
              style={{ width: '100%' }}
            />
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => {
                onEndTimeChange(null, selectedEndTime);
                setEndTimeModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Onayla</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Spor kategorilerini render et
  const renderSportCategories = () => {
    // API'den gelen spor dallarını kullan, yoksa varsayılan spor dallarını göster
    const defaultSports = [
      { id: 'football', name: 'Futbol' },
      { id: 'basketball', name: 'Basketbol' },
      { id: 'tennis', name: 'Tenis' },
      { id: 'running', name: 'Koşu' },
      { id: 'cycling', name: 'Bisiklet' },
      { id: 'swimming', name: 'Yüzme' },
      { id: 'tabletennis', name: 'Masa Tenisi' },
      { id: 'esports', name: 'E-Spor' },
      { id: 'other', name: 'Diğer' },
    ];
    
    // Null-check ile sports'un var olduğundan emin oluyoruz
    const sportsToDisplay = sports && sports.length > 0 
      ? sports 
      : defaultSports;

    return (
      <View style={styles.sportCategoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportCategoriesScroll}>
          {sportsToDisplay.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportCategoryButton,
                { 
                  backgroundColor: selectedSport === sport.id 
                    ? theme.colors.accent 
                    : theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
                }
              ]}
              onPress={() => handleSelectSport(sport.id)}
            >
              <Ionicons 
                name={getSportIcon(sport.name)} 
                size={24} 
                color={selectedSport === sport.id ? 'white' : theme.colors.text} 
              />
              <Text 
                style={[
                  styles.sportCategoryText, 
                  { color: selectedSport === sport.id ? 'white' : theme.colors.text }
                ]}
              >
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {formErrors.sport_id && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {formErrors.sport_id}
          </Text>
        )}
      </View>
    );
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Spor Kategorileri */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Spor Türü
          </Text>
          {renderSportCategories()}
          
          {/* Etkinlik Başlığı */}
          <InputField
            label="Etkinlik Başlığı"
            placeholder="Örn: Haftalık Basketbol Maçı"
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
            error={formErrors.title}
          />
          
          {/* Etkinlik Açıklaması */}
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
          
          {/* Etkinlik Tarihi */}
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Etkinlik Tarihi
          </Text>
          <TouchableOpacity 
            style={[
              styles.datePickerButton,
              { 
                borderColor: formErrors.event_date 
                  ? theme.colors.error 
                  : theme.colors.border,
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
          {formErrors.event_date && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {formErrors.event_date}
            </Text>
          )}
          
          {/* Saat Seçiciler */}
          <View style={styles.timePickersContainer}>
            {/* Başlangıç Saati */}
            {renderTimePickerButton(
              'Başlangıç Saati', 
              startTimeDisplay, 
              () => setStartTimeModalVisible(true),
              formErrors.start_time
            )}
            
            {/* Bitiş Saati */}
            {renderTimePickerButton(
              'Bitiş Saati', 
              endTimeDisplay, 
              () => setEndTimeModalVisible(true),
              formErrors.end_time
            )}
          </View>
          
          {/* Konum */}
          <InputField
            label="Konum"
            placeholder="Etkinliğin yapılacağı yer"
            value={formData.location_name}
            onChangeText={(text) => handleChange('location_name', text)}
            error={formErrors.location_name}
          />
          
          {/* Katılımcı Sayısı */}
          <InputField
            label="Maksimum Katılımcı Sayısı"
            placeholder="Örn: 10"
            value={formData.max_participants.toString()}
            onChangeText={(text) => handleChange('max_participants', parseInt(text) || 0)}
            keyboardType="numeric"
            error={formErrors.max_participants}
          />
          
          {/* Özel Etkinlik Toggle */}
          {renderPrivateEventToggle()}
          
          {/* Oluştur Butonu */}
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
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* DatePickers Modals */}
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
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 20,
  },
  sportCategoriesScroll: {
    paddingVertical: 8,
    paddingHorizontal: 4,
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
});