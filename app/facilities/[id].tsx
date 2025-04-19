import { useLocalSearchParams } from 'expo-router';
import FacilityDetailScreen from '@/src/screens/facilities/FacilityDetail';
import { View, Text } from 'react-native';

/**
 * Tesis detay sayfası
 * URL parametresi olarak tesis ID'sini alır
 */
export default function FacilityDetailPage() {
  // URL parametrelerini al
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // ID yoksa hata mesajı gösterelim
  if (!id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Geçersiz tesis ID'si</Text>
      </View>
    );
  }
  
  return <FacilityDetailScreen id={id} />;
} 