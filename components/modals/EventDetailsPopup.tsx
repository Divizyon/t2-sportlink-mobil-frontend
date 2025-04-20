import React, { useState, useEffect } from 'react';
import { Modal, Dimensions, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  View,
  Text,
  ScrollView,
  Box,
  VStack,
  HStack,
  Badge,
  Pressable,
  Center,
} from '@gluestack-ui/themed';

// Event type definition
export interface Event {
  id: string | number;
  title: string;
  location: string;
  distance: string;
  date: string;
  participants?: string;
  participantCount?: number;
  maxParticipants?: number;
  sportType: string;
  creator?: string;
  creatorName?: string;
  // Harita için opsiyonel koordinatlar
  location_latitude?: number;
  location_longitude?: number;
  description?: string;
  time?: string;
}

interface EventDetailsPopupProps {
  event: Event | null;
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  showMap?: boolean;
  isJoined?: boolean; // Etkinliğe katılma durumu
  onJoin?: (eventId: string) => void; // Etkinliğe katılma olayı
  onLeave?: (eventId: string) => void; // Etkinlikten ayrılma olayı
}

/**
 * Etkinlik detaylarını gösteren popup bileşeni
 */
const EventDetailsPopup: React.FC<EventDetailsPopupProps> = ({
  event,
  visible,
  onClose,
  isDarkMode,
  showMap = false,
  isJoined = false,
  onJoin,
  onLeave,
}) => {
  const [localIsJoined, setLocalIsJoined] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // isJoined prop'u değiştiğinde localIsJoined state'ini güncelle
  useEffect(() => {
    setLocalIsJoined(isJoined);
  }, [isJoined]);

  // Katıl butonuna tıklandığında
  const handleJoin = () => {
    if (event) {
      // Dışarıdan gelen onJoin prop'unu kullan
      if (onJoin) {
        onJoin(event.id.toString());
      }

      setJoinSuccess(true);
      setLocalIsJoined(true);

      // Animasyon başlat
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 2 saniye sonra popup'ı kapat
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setJoinSuccess(false);
          onClose();
        });
      }, 2000);
    }
  };

  // Etkinlikten ayrılma butonuna tıklandığında
  const handleLeave = () => {
    if (event) {
      // Dışarıdan gelen onLeave prop'unu kullan
      if (onLeave) {
        onLeave(event.id.toString());
      }

      setLeaveSuccess(true);
      setLocalIsJoined(false);

      // Animasyon başlat
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 2 saniye sonra popup'ı kapat
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setLeaveSuccess(false);
          onClose();
        });
      }, 2000);
    }
  };

  if (!event) {
    return null;
  }

  // Katılımcı bilgisi gösterimi
  const participantsText =
    event.participants ||
    (event.participantCount !== undefined && event.maxParticipants !== undefined
      ? `${event.participantCount}/${event.maxParticipants}`
      : '0/0');

  // Etkinliği oluşturan kişi gösterimi
  const creatorText = event.creator || event.creatorName || 'Anonim';

  // Varsayılan konum (İstanbul merkezi)
  const defaultLocation = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Etkinlik konumu varsa onu kullan, yoksa varsayılan konumu kullan
  const eventLocation = {
    latitude: event.location_latitude || defaultLocation.latitude,
    longitude: event.location_longitude || defaultLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const { width, height } = Dimensions.get('window');

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: width * 0.85,
      borderRadius: 20,
      padding: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      maxHeight: height * 0.8,
      overflow: 'hidden',
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 10,
    },
    closeButton: {
      position: 'absolute',
      right: 15,
      top: 15,
      zIndex: 1,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 15,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    eventBadge: {
      alignSelf: 'flex-start',
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: COLORS.accent,
    },
    eventBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    eventTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    eventDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    eventDetailIcon: {
      marginRight: 10,
    },
    eventDetailText: {
      fontSize: 15,
    },
    eventDescriptionContainer: {
      marginTop: 6,
      marginBottom: 10,
      padding: 12,
      borderRadius: 10,
      marginHorizontal: -5,
    },
    eventDetailTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
    },
    eventDescription: {
      fontSize: 14,
      lineHeight: 20,
      paddingLeft: 28,
    },
    descriptionTouchable: {
      position: 'relative',
    },
    readMoreText: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '500',
      paddingLeft: 28,
      fontStyle: 'italic',
    },
    mapContainer: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 16,
      marginBottom: 20,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    markerContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.accent,
    },
    joinButton: {
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    joinButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    successContainer: {
      width: width * 0.8,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    successIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    successText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
  });

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {joinSuccess ? (
          <Animated.View
            style={[
              styles.successContainer,
              { opacity: fadeAnim },
              { backgroundColor: COLORS.success || '#4CAF50' },
            ]}
          >
            <Center style={styles.successIconContainer}>
              <Ionicons name="checkmark" size={32} color="white" />
            </Center>
            <Text style={styles.successText}>Başarıyla Katıldınız!</Text>
          </Animated.View>
        ) : leaveSuccess ? (
          <Animated.View
            style={[styles.successContainer, { opacity: fadeAnim }, { backgroundColor: '#FF5252' }]}
          >
            <Center style={styles.successIconContainer}>
              <Ionicons name="close" size={32} color="white" />
            </Center>
            <Text style={styles.successText}>Etkinlikten Ayrıldınız</Text>
          </Animated.View>
        ) : (
          <Pressable
            style={[
              styles.container,
              { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
            ]}
            onPress={e => e.stopPropagation()}
          >
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark}
              />
            </Pressable>

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
              alwaysBounceVertical={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Badge style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>{event.sportType}</Text>
              </Badge>

              <Text
                style={[
                  styles.eventTitle,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
              >
                {event.title}
              </Text>

              <HStack style={styles.eventDetailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.accent}
                  style={styles.eventDetailIcon}
                />
                <Text
                  style={[
                    styles.eventDetailText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  {event.date} {event.time ? event.time : ''}
                </Text>
              </HStack>

              <HStack style={styles.eventDetailRow}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.accent}
                  style={styles.eventDetailIcon}
                />
                <Text
                  style={[
                    styles.eventDetailText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  {event.location} • {event.distance}
                </Text>
              </HStack>

              <HStack style={styles.eventDetailRow}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={COLORS.accent}
                  style={styles.eventDetailIcon}
                />
                <Text
                  style={[
                    styles.eventDetailText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  Katılımcılar: {participantsText}
                </Text>
              </HStack>

              <HStack style={styles.eventDetailRow}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={COLORS.accent}
                  style={styles.eventDetailIcon}
                />
                <Text
                  style={[
                    styles.eventDetailText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  Oluşturan: {creatorText}
                </Text>
              </HStack>

              {/* Etkinlik Açıklaması */}
              {event.description && (
                <Box
                  style={[
                    styles.eventDescriptionContainer,
                    { backgroundColor: isDarkMode ? '#26364d' : 'rgba(0, 0, 0, 0.03)' },
                  ]}
                >
                  <HStack style={styles.eventDetailRow}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={COLORS.accent}
                      style={styles.eventDetailIcon}
                    />
                    <Text
                      style={[
                        styles.eventDetailTitle,
                        { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                      ]}
                    >
                      Etkinlik Açıklaması
                    </Text>
                  </HStack>
                  <Pressable
                    onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    style={styles.descriptionTouchable}
                  >
                    <Text
                      style={[
                        styles.eventDescription,
                        { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                      ]}
                      numberOfLines={isDescriptionExpanded ? undefined : 2}
                      ellipsizeMode="tail"
                    >
                      {event.description}
                    </Text>

                    {!isDescriptionExpanded && event.description.length > 70 && (
                      <Text style={[styles.readMoreText, { color: COLORS.accent }]}>
                        Devamını okumak için dokun
                      </Text>
                    )}
                  </Pressable>
                </Box>
              )}

              {/* Harita Görünümü */}
              {showMap && (
                <Box style={styles.mapContainer}>
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={eventLocation}
                  >
                    <Marker
                      coordinate={{
                        latitude: eventLocation.latitude,
                        longitude: eventLocation.longitude,
                      }}
                      title={event.title}
                      description={event.location}
                    >
                      <Center
                        style={[
                          styles.markerContainer,
                          { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
                        ]}
                      >
                        <Ionicons name="location" size={18} color={COLORS.accent} />
                      </Center>
                    </Marker>
                  </MapView>
                </Box>
              )}

              {/* Alt kısımdan yükseklik boşluğu */}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Alt buton (Katıl veya Ayrıl) */}
            <View
              style={[
                styles.buttonContainer,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white,
                  borderTopColor: isDarkMode ? '#334155' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              <Pressable
                style={[
                  styles.joinButton,
                  {
                    backgroundColor: localIsJoined ? '#FF5252' : COLORS.accent,
                  },
                ]}
                onPress={localIsJoined ? handleLeave : handleJoin}
              >
                <Text style={styles.joinButtonText}>
                  {localIsJoined ? 'Etkinlikten Ayrıl' : 'Etkinliğe Katıl'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
};

export default EventDetailsPopup;
