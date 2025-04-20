import { useLocalSearchParams } from 'expo-router';
import RouteDetailScreen from '@/src/screens/maps/RouteDetail';

/**
 * Rota detay sayfası
 * URL parametresi olarak rota ID'sini alır
 */
export default function RouteDetailPage() {
  // URL parametrelerini al
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return <RouteDetailScreen id={id || ''} />;
} 