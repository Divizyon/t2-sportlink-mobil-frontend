import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Platform, 
  Modal,
  ScrollView,
  Text,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors';
import useThemeStore from '../../../store/slices/themeSlice';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: any) => void;
}

// Backend'e gönderilecek etkinlik verisi tipi
interface EventData {
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  sport_id: number;
}

// Spor türleri ve ID'leri
const sportTypes = [
  { id: 1, name: "Futbol" },
  { id: 2, name: "Basketbol" },
  { id: 3, name: "Voleybol" },
  { id: 4, name: "Tenis" },
  { id: 5, name: "Yüzme" },
  { id: 6, name: "Koşu" },
  { id: 7, name: "Bisiklet" },
  { id: 8, name: "Yoga" },
  { id: 9, name: "Fitness" },
  { id: 10, name: "Diğer" }
];

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

// Tarih formatını günler ve aylar için iki basamaklı hale getirir (01, 02, vb.)
const formatDateForDisplay = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Tarih formatını backend için biçimlendirir (YYYY-MM-DD)
const formatDateForBackend = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

// Saat formatını backend için biçimlendirir (HH:MM)
const formatTimeForDisplay = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({ visible, onClose, onCreateEvent }) => {
  const { isDarkMode } = useThemeStore();
  
  // Form state'leri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 2))); // Başlangıçtan 2 saat sonrası
  const [locationName, setLocationName] = useState('');
  const [locationLatitude, setLocationLatitude] = useState('41.0082');
  const [locationLongitude, setLocationLongitude] = useState('28.9784');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [sportId, setSportId] = useState<number | null>(null);
  const [selectedSportName, setSelectedSportName] = useState('');
  
  // DateTimePicker modalları için state'ler
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Sport picker için state'ler
  const [showSportPicker, setShowSportPicker] = useState(false);
  
  // Formu temizle
  const resetForm = () => {
    setTitle('');
    setDescription('');
    
    const now = new Date();
    setEventDate(now);
    
    setStartTime(now);
    
    // Bitiş saati, başlangıç saatinden 1 saat sonra olacak
    const defaultEndTime = new Date(now);
    defaultEndTime.setHours(now.getHours() + 1);
    setEndTime(defaultEndTime);
    
    setLocationName('');
    setLocationLatitude('41.0082');
    setLocationLongitude('28.9784');
    setMaxParticipants('');
    setSportId(null);
    setSelectedSportName('');
  };
  
  // Modal kapatıldığında
  const handleClose = () => {
    console.log('Modal kapatılıyor');
    resetForm();
    onClose();
  };
  
  // Tarih değişimi
  const onDateChange = (event: any, selectedDate?: Date) => {
    // Picker'ı hemen kapat
    setShowDatePicker(false);
    
    // Eğer tarih seçildiyse, state'i güncelle
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };
  
  // Başlangıç saati değişimi
  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    // Picker'ı hemen kapat
    setShowStartTimePicker(false);
    
    // Eğer saat seçildiyse, state'i güncelle
    if (selectedDate) {
      setStartTime(selectedDate);
      
      // Bitiş saatinin başlangıç saatinden önce olmadığından emin ol
      const startHours = selectedDate.getHours();
      const startMinutes = selectedDate.getMinutes();
      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();
      
      if (endHours < startHours || 
         (endHours === startHours && endMinutes <= startMinutes)) {
        // Eğer bitiş saati yeni başlangıç saatinden önceyse veya aynıysa
        console.log('Bitiş saati otomatik olarak güncellendi');
        // Başlangıç saatinden 1 saat sonrasını ayarla
        const newEndTime = new Date(selectedDate);
        newEndTime.setHours(selectedDate.getHours() + 1);
        setEndTime(newEndTime);
      }
    }
  };
  
  // Bitiş saati değişimi
  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    // Picker'ı hemen kapat
    setShowEndTimePicker(false);
    
    // Eğer saat seçildiyse, state'i güncelle
    if (selectedDate) {
      // Seçilen bitiş saati başlangıç saatinden önce mi kontrol et
      // Sadece saat ve dakika karşılaştırması için yeni Date objesi oluştur
      const endTimeHours = selectedDate.getHours();
      const endTimeMinutes = selectedDate.getMinutes();
      const startTimeHours = startTime.getHours();
      const startTimeMinutes = startTime.getMinutes();
      
      if (endTimeHours < startTimeHours || 
         (endTimeHours === startTimeHours && endTimeMinutes <= startTimeMinutes)) {
        // Eğer bitiş saati başlangıç saatinden önceyse veya aynıysa
        console.log('Bitiş saati başlangıç saatinden sonra olmalı!');
        
        // Kullanıcıya uyarı göster
        Alert.alert(
          "Geçersiz Bitiş Saati",
          "Bitiş saati başlangıç saatinden sonra olmalıdır. Bitiş saati otomatik olarak başlangıç saatinden 1 saat sonraya ayarlandı.",
          [{ text: "Tamam", onPress: () => console.log("Uyarı anlaşıldı") }]
        );
        
        // Başlangıç saatinden 1 saat sonrasını ayarla
        const newEndTime = new Date(startTime);
        newEndTime.setHours(startTime.getHours() + 1);
        setEndTime(newEndTime);
      } else {
        // Bitiş saati başlangıç saatinden sonraysa, normal şekilde ayarla
        setEndTime(selectedDate);
      }
    }
  };
  
  // Spor türü seçimi
  const handleSportSelect = (id: number, name: string) => {
    setSportId(id);
    setSelectedSportName(name);
    setShowSportPicker(false);
  };
  
  // Etkinlik oluşturma
  const handleCreateEvent = () => {
    try {
      if (!sportId) {
        console.error('Spor türü seçilmedi');
        return;
      }

      // ISO formatında tarih ve saat stringleri oluştur
      const isoDate = formatDateForBackend(eventDate);
      const formattedStartTime = formatTimeForDisplay(startTime);
      const formattedEndTime = formatTimeForDisplay(endTime);
      
      const isoStartTime = `${isoDate}T${formattedStartTime}:00`;
      const isoEndTime = `${isoDate}T${formattedEndTime}:00`;
      
      const eventData: EventData = {
        title,
        description,
        event_date: isoDate,
        start_time: isoStartTime,
        end_time: isoEndTime,
        location_name: locationName,
        location_latitude: parseFloat(locationLatitude) || 41.0082,
        location_longitude: parseFloat(locationLongitude) || 28.9784,
        max_participants: parseInt(maxParticipants) || 10,
        sport_id: sportId
      };
      
      onCreateEvent(eventData);
      handleClose();
    } catch (error) {
      console.error('Etkinlik oluşturulurken hata oluştu:', error);
    }
  };

  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{flex: 1}}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={{flex: 1}} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContent}>
            {/* Header - Klavye açıldığında da erişilebilir olması için */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Yeni Etkinlik Oluştur</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Body */}
            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={{paddingBottom: 20}}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Form */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Etkinlik Adı *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Etkinlik adını girin"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              
              {/* Spor Türü */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Spor Türü *</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => {
                    setShowStartTimePicker(false);
                    setShowEndTimePicker(false);
                    setShowDatePicker(false);
                    setShowSportPicker(!showSportPicker);
                  }}
                >
                  <Text style={selectedSportName ? styles.pickerText : styles.placeholderText}>
                    {selectedSportName || "Spor türünü seçin"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.accent} />
                </TouchableOpacity>
                
                {showSportPicker && (
                  <View style={[styles.pickerContainer, { zIndex: 1000 }]}>
                    <ScrollView style={{ maxHeight: 180 }}>
                      {sportTypes.map(sport => (
                        <TouchableOpacity
                          key={sport.id}
                          style={styles.pickerItem}
                          onPress={() => handleSportSelect(sport.id, sport.name)}
                        >
                          <Text style={styles.pickerItemText}>{sport.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              {/* Tarih */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tarih *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => {
                    setShowStartTimePicker(false);
                    setShowEndTimePicker(false);
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.pickerText}>
                    {formatDateForDisplay(eventDate)}
                  </Text>
                  <Ionicons name="calendar" size={20} color={COLORS.accent} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="datePicker"
                    value={eventDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
              
              {/* Saatler */}
              {/* Başlangıç Saati */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Başlangıç Saati *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => {
                    setShowEndTimePicker(false); // Bitiş saati seçiciyi kapat
                    setShowStartTimePicker(true);
                  }}
                >
                  <Text style={styles.pickerText}>
                    {formatTimeForDisplay(startTime)}
                  </Text>
                  <Ionicons name="time" size={20} color={COLORS.accent} />
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    testID="startTimePicker"
                    value={startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onStartTimeChange}
                    is24Hour={true}
                  />
                )}
              </View>
              
              {/* Bitiş Saati */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bitiş Saati *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => {
                    setShowStartTimePicker(false); // Başlangıç saati seçiciyi kapat
                    setShowEndTimePicker(true);
                  }}
                >
                  <Text style={styles.pickerText}>
                    {formatTimeForDisplay(endTime)}
                  </Text>
                  <Ionicons name="time" size={20} color={COLORS.accent} />
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    testID="endTimePicker"
                    value={endTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onEndTimeChange}
                    is24Hour={true}
                  />
                )}
              </View>
              
              {/* Konum Adı */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Konum Adı *</Text>
                <TextInput
                  style={styles.input}
                  value={locationName}
                  onChangeText={setLocationName}
                  placeholder="Konum adını girin"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              
              {/* Koordinatlar */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Enlem</Text>
                  <TextInput
                    style={styles.input}
                    value={locationLatitude}
                    onChangeText={setLocationLatitude}
                    placeholder="41.0082"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Boylam</Text>
                  <TextInput
                    style={styles.input}
                    value={locationLongitude}
                    onChangeText={setLocationLongitude}
                    placeholder="28.9784"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              {/* Açıklama */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Açıklama *</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Etkinlik açıklamasını girin"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="next"
                />
              </View>
              
              {/* Maksimum Katılımcı */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Maksimum Katılımcı Sayısı *</Text>
                <TextInput
                  style={styles.input}
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                  placeholder="Maksimum katılımcı sayısını girin"
                  keyboardType="numeric"
                />
              </View>
              
              {/* Butonlar */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text style={styles.createButtonText}>Etkinlik Oluştur</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Ionicons name="close-circle-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    width: windowWidth,
    height: windowHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 10, // Android için
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 'auto',
    maxHeight: windowHeight * 0.9,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    ...Platform.select({
      android: {
        elevation: 20,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: COLORS.accent,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  formGroup: {
    marginBottom: 10,
    padding: 12,
  },
  formRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textarea: {
    height: 100,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  pickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    maxHeight: 180,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 2000,
    position: 'absolute',
    left: 12,
    right: 12,
    top: 80,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginLeft: 8,
    maxWidth: 120,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 6,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginRight: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 6,
  },
});

export default CreateEventModal; 