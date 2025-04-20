import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HStack, Text, VStack, Badge, Button, Box } from '@gluestack-ui/themed';
import { COLORS } from '../../../src/constants';
import { Event } from '../types';
import useThemeStore from '../../../store/slices/themeSlice';

type EventCardProps = {
  event: Event;
  isJoined: boolean;
  onPress: (event: Event) => void;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
  horizontal?: boolean;
  showDetails?: boolean;
};

/**
 * Etkinlik Kartı Bileşeni
 * Hem yatay hem de dikey görünüm için kullanılabilir
 * @param {EventCardProps} props - Bileşen props'ları
 * @returns {React.ReactElement} Etkinlik kartı bileşeni
 */
const EventCard: React.FC<EventCardProps> = ({
  event,
  isJoined,
  onPress,
  onJoin,
  onLeave,
  horizontal = true,
  showDetails = true,
}) => {
  const { isDarkMode } = useThemeStore();

  const handleCardPress = () => {
    onPress(event);
  };

  const handleJoinLeave = () => {
    if (isJoined) {
      onLeave(event.id.toString());
    } else {
      onJoin(event.id.toString());
    }
  };

  if (horizontal) {
    // Yatay kart görünümü
    return (
      <Pressable
        style={[
          styles.eventCard,
          { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
        ]}
        onPress={handleCardPress}
      >
        <Badge style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>{event.sportType}</Text>
        </Badge>

        <Text
          style={[styles.eventTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {event.title}
        </Text>

        <HStack style={[styles.eventDetailRow, { marginTop: -6, marginBottom: 4 }]}>
          <Ionicons
            name="person-outline"
            size={16}
            color={COLORS.accent}
            style={styles.eventDetailIcon}
          />
          <Text
            style={[
              styles.eventDetailText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {(event as any).creatorName || 'Anonim'}
          </Text>
        </HStack>

        <HStack style={styles.eventDetailRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.accent}
            style={styles.eventDetailIcon}
          />
          <Text
            style={[
              styles.eventDetailText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
          >
            {event.date}
          </Text>
        </HStack>

        <HStack style={styles.eventDetailRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={COLORS.accent}
            style={styles.eventDetailIcon}
          />
          <Text
            style={[
              styles.eventDetailText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {event.location} • {event.distance}
          </Text>
        </HStack>

        {(event as any).description && (
          <Text
            style={[
              styles.descriptionText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {(event as any).description}
          </Text>
        )}

        <HStack style={styles.eventFooter}>
          <HStack style={styles.eventParticipants}>
            <Ionicons
              name="people-outline"
              size={16}
              color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark}
            />
            <Text
              style={[
                styles.eventParticipantsText,
                { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
              ]}
            >
              {event.participantCount}/{event.maxParticipants}
            </Text>
          </HStack>

          {showDetails && (
            <Button
              size="xs"
              style={{
                backgroundColor: isJoined ? '#FF7043' : COLORS.accent,
                borderRadius: 12,
                paddingHorizontal: 8,
                height: 24,
              }}
              onPress={handleJoinLeave}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>{isJoined ? 'Ayrıl' : 'Katıl'}</Text>
            </Button>
          )}
        </HStack>
      </Pressable>
    );
  } else {
    // Dikey kart görünümü (Tümünü Gör sayfası için)
    return (
      <Pressable
        style={[
          styles.verticalEventCard,
          { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
        ]}
        onPress={handleCardPress}
      >
        <HStack style={styles.verticalEventHeader}>
          <Badge style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{event.sportType}</Text>
          </Badge>
          <Text
            style={[
              styles.eventDistance,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
          >
            {event.distance}
          </Text>
        </HStack>

        <Text
          style={[
            styles.verticalEventTitle,
            { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
          ]}
        >
          {event.title}
        </Text>

        <HStack style={styles.eventDetailRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.accent}
            style={styles.eventDetailIcon}
          />
          <Text
            style={[
              styles.eventDetailText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
          >
            {event.date}
          </Text>
        </HStack>

        <HStack style={styles.eventDetailRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={COLORS.accent}
            style={styles.eventDetailIcon}
          />
          <Text
            style={[
              styles.eventDetailText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
          >
            {event.location}
          </Text>
        </HStack>

        <HStack style={styles.eventDetailRow}>
          <Ionicons
            name="people-outline"
            size={16}
            color={COLORS.accent}
            style={styles.eventDetailIcon}
          />
          <Text
            style={[
              styles.eventDetailText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
          >
            {event.participantCount}/{event.maxParticipants}
          </Text>
        </HStack>

        <HStack style={styles.eventDetailRow}>
          <Ionicons
            name="person-outline"
            size={16}
            color={COLORS.accent}
            style={styles.eventDetailIcon}
          />
          <Text
            style={[
              styles.eventDetailText,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
          >
            {event.creatorName}
          </Text>
        </HStack>

        {showDetails && (
          <Box style={{ marginTop: 12 }}>
            <Button
              size="sm"
              style={{
                backgroundColor: isJoined ? '#FF7043' : COLORS.accent,
                borderRadius: 12,
              }}
              onPress={handleJoinLeave}
            >
              <Text style={{ color: 'white', fontSize: 14 }}>
                {isJoined ? 'Etkinlikten Ayrıl' : 'Etkinliğe Katıl'}
              </Text>
            </Button>
          </Box>
        )}
      </Pressable>
    );
  }
};

const styles = StyleSheet.create({
  eventCard: {
    width: 240,
    height: 260,
    minHeight: 260,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  sportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-start',
    marginBottom: 0,
  },
  sportBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: -4,
    height: 45,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailIcon: {
    marginRight: 6,
  },
  eventDetailText: {
    fontSize: 13,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  eventParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventParticipantsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  eventCreator: {
    fontSize: 12,
  },
  verticalEventCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verticalEventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
  },
  eventDistance: {
    fontSize: 12,
  },
  descriptionText: {
    fontSize: 12,
    marginTop: -4,
    marginBottom: 5,
    fontStyle: 'italic',
    paddingLeft: 2,
  },
});

export default EventCard;
