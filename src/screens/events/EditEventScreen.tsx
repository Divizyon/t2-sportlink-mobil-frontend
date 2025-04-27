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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { InputField } from '../../components/InputField/InputField';
import { EventUpdateRequest, EventStatus, Sport } from '../../types/eventTypes/event.types';

// Route param tipini tanımla
type EditEventRouteParams = {
  EditEvent: {
    eventId: string;
  };
};

export const EditEventScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<EditEventRouteParams, 'EditEvent'>>();
  const { eventId } = route.params;
  
  const { 
    updateEvent, 
    isLoading, 
    error, 
    message, 
    clearError, 
    clearMessage, 
    fetchEventDetail, 
    currentEvent,
    fetchSports, 
    sports,
    resetEventDetail
  } = useEventStore();

  // Form durumu
  const [formData, setFormData] = useState<EventUpdateRequest>({
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
  });

  // UI için ekstra state'ler
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

  // Etkinlik durumu seçenekleri
  const statusOptions = [
    { id: 'active', name: 'Aktif' },
    { id: 'canceled', name: 'İptal Edildi' },
    { id: 'completed', name: 'Tamamlandı' },
  ];

  // Seçili etkinlik durumu
  const [selectedStatus, setSelectedStatus] = useState<string>('active');

  // Component mount edildiğinde etkinlik detayını ve spor kategorilerini getir
  useEffect(() => {
    const loadEventDetails = async () => {
      await fetchEventDetail(eventId);
      
      if (!sports || sports.length === 0) {
        await fetchSports();
      }
    };
    
    loadEventDetails();
    
    // Component unmount olduğunda currentEvent'i temizle
    return () => {
      resetEventDetail();
      clearError();
    };
  }, [eventId]);
  
  // Etkinlik detayı geldiğinde form alanlarını doldur
  useEffect(() => {
    if (currentEvent) {
      // Form alanlarını mevcut etkinlik bilgileriyle doldur
      setFormData({
        title: currentEvent.title,
        description: currentEvent.description,
        event_date: currentEvent.event_date,
        start_time: currentEvent.start_time,
        end_time: currentEvent.end_time,
        location_name: currentEvent.location_name,
        location_latitude: currentEvent.location_latitude,
        location_longitude: currentEvent.location_longitude,
        max_participants: currentEvent.max_participants,
        status: currentEvent.status as EventStatus,
      });
      
      // Tarih ve saat görüntülemelerini ayarla
      setSelectedDate(new Date(currentEvent.event_date));
      
      const startTime = new Date(currentEvent.start_time);
      const endTime = new Date(currentEvent.end_time);
      
      setSelectedStartTime(startTime);
      setSelectedEndTime(endTime);
      
      // Saat görüntülemelerini ayarla
      const startHours = startTime.getHours().toString().padStart(2, '0');
      const startMinutes = startTime.getMinutes().toString().padStart(2, '0');
      setStartTimeDisplay(`${startHours}:${startMinutes}`);
      
      const endHours = endTime.getHours().toString().padStart(2, '0');
      const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
      setEndTimeDisplay(`${endHours}:${endMinutes}`);
      
      // Etkinlik durumunu ayarla
      setSelectedStatus(currentEvent.status);
    }
  }, [currentEvent]);

  // Hata ve mesaj durumlarını izle
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }

    if (message) {
      Alert.alert('Başarılı', message, [
        { 
          text: 'Tamam', 
          onPress: () => {
            clearMessage();
            // Başarılı güncelleme sonrası önce detay sayfasına, oradan da etkinlikler sayfasına dön
            navigation.goBack();
          }
        }
      ]);
    }
  }, [error, message]);

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
  const handleChange = (name: keyof EventUpdateRequest, value: string | number | boolean) => {
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  // Etkinlik durumu seçme
  const handleSelectStatus = (statusId: string) => {
    setSelectedStatus(statusId);
    setFormData({ ...formData, status: statusId as EventStatus });
    setFormErrors({ ...formErrors, status: '' });
  };

  // Form doğrulama
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) errors.title = 'Başlık girmelisiniz';
    if (!formData.description?.trim()) errors.description = 'Açıklama girmelisiniz';
    if (!formData.event_date) errors.event_date = 'Tarih seçmelisiniz';
    if (!formData.location_name?.trim()) errors.location_name = 'Konum adı girmelisiniz';
    if (formData.max_participants && formData.max_participants <= 0) {
      errors.max_participants = 'Geçerli bir katılımcı sayısı girmelisiniz';
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

  // Etkinliği güncelleme
  const handleUpdateEvent = async () => {
    if (isLoading) return; // Prevent multiple submissions while loading
    
    if (validateForm()) {
      try {
        // Create a copy of formData without UI-specific fields
        const apiRequestData = { ...formData };
        
        // Remove any UI-specific properties before sending to API
        delete (apiRequestData as any)._startTimeDisplay;
        delete (apiRequestData as any)._endTimeDisplay;
        
        const success = await updateEvent(eventId, apiRequestData);
        
        if (success) {
          // Success is handled by the useEffect monitoring message
        }
      } catch (error) {
        Alert.alert('Hata', 'Etkinlik güncellenirken bir hata oluştu.');
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

  // Etkinlik durumlarını render et
  const renderStatusOptions = () => {
    return (
      <View style={styles.statusContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Etkinlik Durumu
        </Text>
        <View style={styles.statusOptionsContainer}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status.id}
              style={[
                styles.statusButton,
                { 
                  backgroundColor: selectedStatus === status.id 
                    ? getStatusColor(status.id) 
                    : theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
                }
              ]}
              onPress={() => handleSelectStatus(status.id)}
            >
              <Text 
                style={[
                  styles.statusText, 
                  { 
                    color: selectedStatus === status.id 
                      ? 'white' 
                      : theme.colors.text 
                  }
                ]}
              >
                {status.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {formErrors.status && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {formErrors.status}
          </Text>
        )}
      </View>
    );
  };

  // Etkinlik durumuna göre renk
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'canceled':
        return theme.colors.error;
      case 'completed':
        return theme.colors.info;
      default:
        return theme.colors.secondary;
    }
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

  // İçerik yükleniyorsa
  if (isLoading && !currentEvent) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Etkinlik bilgileri yükleniyor...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Etkinliği Düzenle
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
          
          {/* Etkinlik Durumu */}
          {renderStatusOptions()}
          
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
            value={formData.max_participants?.toString() || ""}
            onChangeText={(text) => handleChange('max_participants', parseInt(text) || 0)}
            keyboardType="numeric"
            error={formErrors.max_participants}
          />
          
          {/* Güncelle Butonu */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              { backgroundColor: theme.colors.accent },
              isLoading && styles.disabledButton
            ]}
            onPress={handleUpdateEvent}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text style={styles.updateButtonText}>Değişiklikleri Kaydet</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
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
  statusContainer: {
    marginBottom: 16,
  },
  statusOptionsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  statusText: {
    fontWeight: '500',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  updateButtonText: {
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
});