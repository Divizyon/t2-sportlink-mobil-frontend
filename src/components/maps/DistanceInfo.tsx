import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { DistanceResult } from '../../api/maps/mapsApi';
import { themed } from '../../utils/themed';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type TransportMode = 'driving' | 'walking' | 'bicycling' | 'transit';

interface DistanceInfoProps {
  origin: string;
  destination: string;
  transportMode?: TransportMode;
  showDetails?: boolean;
  onCalculated?: (result: DistanceResult) => void;
  style?: object;
}

export const DistanceInfo: React.FC<DistanceInfoProps> = ({
  origin,
  destination,
  transportMode = 'driving',
  showDetails = true,
  onCalculated,
  style
}) => {
  // State hooks
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isManualRetry, setIsManualRetry] = useState<boolean>(false);
  
  // Store hooks
  const { 
    calculateDistance,
    isCalculatingDistance,
    distanceError,
    lastCalculatedDistance,
    googleApiKey
  } = useMapsStore();
  
  // Effect hook to calculate distance
  useEffect(() => {
    if (origin && destination) {
      handleCalculateDistance();
    } else {
      console.warn('DistanceInfo - origin veya destination değerleri eksik');
    }
  }, [origin, destination, transportMode]);
  
  // Effect to call onCalculated callback
  useEffect(() => {
    if (lastCalculatedDistance && onCalculated) {
      onCalculated(lastCalculatedDistance);
    }
  }, [lastCalculatedDistance, onCalculated]);

  // Effect for auto-retry on error
  useEffect(() => {
    // API anahtarı yoksa retry yapma
    if (!googleApiKey) {
      console.error('DistanceInfo - Google API anahtarı bulunamadı');
      return;
    }

    // Hata varsa ve otomatik retry limiti aşılmadıysa
    if (distanceError && retryCount < 2 && !isManualRetry) {
      const retryTimer = setTimeout(() => {
        handleCalculateDistance();
        setRetryCount(prev => prev + 1);
      }, 2000); // 2 saniye sonra tekrar dene
      
      return () => clearTimeout(retryTimer);
    }
  }, [distanceError, retryCount, isManualRetry]);
  
  // Handler for manual distance calculation
  const handleCalculateDistance = async () => {
    console.log('DistanceInfo - Mesafe hesaplanıyor:', { origin, destination, transportMode });
    console.log('API Anahtarı var mı:', !!googleApiKey);
    
    if (isManualRetry) {
      setRetryCount(0);
      setIsManualRetry(false);
    }
    
    await calculateDistance(origin, destination, transportMode);
    // Callback will be handled by the useEffect above
  };

  // Manual retry handler
  const handleRetry = () => {
    setIsManualRetry(true);
    handleCalculateDistance();
  };
  
  // Render loading state
  if (isCalculatingDistance) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color={themed.colors.primary} />
        <Text style={styles.loadingText}>Mesafe hesaplanıyor...</Text>
      </View>
    );
  }
  
  // Render error state
  if (distanceError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Ionicons name="alert-circle-outline" size={20} color={themed.colors.error} />
        <Text style={styles.errorText}>{distanceError}</Text>
        <Button 
          mode="text" 
          onPress={handleRetry}
          style={styles.retryButton}
        >
          Tekrar Dene
        </Button>
      </View>
    );
  }
  
  // Render no data state
  if (!lastCalculatedDistance) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noDataText}>Mesafe bilgisi yok</Text>
        <Button 
          mode="text" 
          onPress={handleCalculateDistance}
          style={styles.calculateButton}
        >
          Hesapla
        </Button>
      </View>
    );
  }
  
  // Render distance information
  return (
    <View style={[styles.container, style]}>
      <View style={styles.summaryRow}>
        <Ionicons 
          name={
            transportMode === 'driving' ? 'car-outline' :
            transportMode === 'walking' ? 'walk-outline' :
            transportMode === 'bicycling' ? 'bicycle-outline' : 'bus-outline'
          } 
          size={20} 
          color={themed.colors.primary} 
        />
        <Text style={styles.distanceText}>
          {lastCalculatedDistance.distance.text} ({lastCalculatedDistance.duration.text})
        </Text>
        {showDetails && (
          <Button 
            mode="text"
            compact 
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.detailsButton}
          >
            <Ionicons 
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} 
              size={16} 
              color={themed.colors.primary} 
            />
          </Button>
        )}
      </View>
      
      {showDetails && isExpanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mesafe:</Text>
            <Text style={styles.detailValue}>{lastCalculatedDistance.distance.text} ({lastCalculatedDistance.distance.value / 1000} km)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Süre:</Text>
            <Text style={styles.detailValue}>{lastCalculatedDistance.duration.text} ({Math.round(lastCalculatedDistance.duration.value / 60)} dk)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Başlangıç:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{lastCalculatedDistance.origin}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hedef:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{lastCalculatedDistance.destination}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: themed.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themed.colors.border,
    marginVertical: 8,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: themed.colors.errorContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themed.colors.error,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: themed.colors.onSurface,
    flex: 1,
  },
  loadingText: {
    marginLeft: 8,
    color: themed.colors.onSurfaceVariant,
  },
  errorText: {
    marginLeft: 8,
    color: themed.colors.error,
    flex: 1,
  },
  noDataText: {
    color: themed.colors.onSurfaceVariant,
  },
  detailsButton: {
    marginLeft: 'auto',
    marginRight: -8,
  },
  retryButton: {
    marginLeft: 'auto',
  },
  calculateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: themed.colors.outlineVariant,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 80,
    fontWeight: '500',
    color: themed.colors.onSurfaceVariant,
  },
  detailValue: {
    flex: 1,
    color: themed.colors.onSurface,
  },
}); 