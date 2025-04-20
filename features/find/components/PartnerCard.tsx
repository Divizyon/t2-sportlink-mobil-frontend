import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HStack, Text, VStack, Center, Box, Image } from '@gluestack-ui/themed';
import { COLORS } from '../../../src/constants';
import { Partner } from '../types/index';
import useThemeStore from '../../../store/slices/themeSlice';
import { getSportIcon } from '../../../src/utils';

type PartnerCardProps = {
  partner: Partner;
  isConnected: boolean;
  onPress: (partner: Partner) => void;
  onConnect: (partnerId: string) => void;
  horizontal?: boolean;
};

/**
 * Spor Arkadaşı Kartı Bileşeni
 * Hem yatay hem de dikey görünüm için kullanılabilir
 * @param {PartnerCardProps} props - Bileşen props'ları
 * @returns {React.ReactElement} Spor arkadaşı kartı bileşeni
 */
const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  isConnected,
  onPress,
  onConnect,
  horizontal = true,
}) => {
  const { isDarkMode } = useThemeStore();

  const handleCardPress = () => {
    onPress(partner);
  };

  const handleConnect = () => {
    onConnect(partner.id);
  };

  // Kişinin baş harflerini göster (avatar olmadığında)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  const renderPreferredSports = (partner: Partner, isHorizontal: boolean = false) => {
    const maxDisplay = isHorizontal ? 2 : 2;

    if (!partner.preferredSports || partner.preferredSports.length === 0) {
      return null;
    }

    const sportTagStyle = {
      bg: isDarkMode ? '#334155' : 'gray.100',
      borderRadius: 10,
      px: 5,
      py: 2,
      mr: 3,
      mb: 2,
    };

    const sportTextStyle = {
      fontSize: 10,
      fontWeight: 'medium',
      color: isDarkMode ? COLORS.neutral.light : '#666',
    };

    if (isHorizontal) {
      // Yatay kart için etiketleri yan yana sıralayan bir görünüm
      return (
        <HStack width="100%" flexWrap="nowrap" justifyContent="center" mt={2}>
          {partner.preferredSports.slice(0, maxDisplay).map((sport, index) => (
            <HStack key={index} alignItems="center" {...sportTagStyle} maxWidth="42%">
              <Ionicons
                name={getSportIcon(sport) as any}
                size={11}
                color={isDarkMode ? COLORS.neutral.light : '#666'}
                style={{ marginRight: 2 }}
              />
              <Text {...sportTextStyle} numberOfLines={1} ellipsizeMode="tail">
                {sport}
              </Text>
            </HStack>
          ))}

          {partner.preferredSports.length > maxDisplay && (
            <HStack alignItems="center" {...sportTagStyle} width="auto">
              <Text {...sportTextStyle}>+{partner.preferredSports.length - maxDisplay}</Text>
            </HStack>
          )}
        </HStack>
      );
    }

    // Yatay olmayan kartlar için normal görünüm
    return (
      <HStack flexWrap="wrap" mt={2}>
        {partner.preferredSports.slice(0, maxDisplay).map((sport, index) => (
          <HStack key={index} alignItems="center" {...sportTagStyle}>
            <Ionicons
              name={getSportIcon(sport) as any}
              size={11}
              color={isDarkMode ? COLORS.neutral.light : '#666'}
              style={{ marginRight: 2 }}
            />
            <Text {...sportTextStyle}>{sport}</Text>
          </HStack>
        ))}

        {partner.preferredSports.length > maxDisplay && (
          <HStack alignItems="center" {...sportTagStyle}>
            <Text {...sportTextStyle}>+{partner.preferredSports.length - maxDisplay}</Text>
          </HStack>
        )}
      </HStack>
    );
  };

  // Yatay (dikdörtgen) kart
  if (!horizontal) {
    return (
      <Box
        style={[
          styles.horizontalCard,
          { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
        ]}
      >
        <HStack width="100%" mb={6}>
          {/* Profil Fotoğrafı - Sol Taraf */}
          <Box mr={8}>
            {partner.avatar ? (
              <Box style={styles.avatarContainer}>
                <Image source={{ uri: partner.avatar }} style={styles.avatar} alt={partner.name} />
              </Box>
            ) : (
              <Center style={[styles.avatarPlaceholder, { backgroundColor: COLORS.accent }]}>
                <Text style={styles.avatarText}>{getInitials(partner.name)}</Text>
              </Center>
            )}
          </Box>

          {/* Bilgiler - Sağ Taraf */}
          <VStack flex={1} justifyContent="flex-start">
            <HStack alignItems="center" mb={2}>
              <Text
                style={[
                  styles.nameText,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {partner.name}
              </Text>
              <Box bg={isDarkMode ? '#334155' : 'gray.100'} borderRadius={12} px={6} py={1} ml={6}>
                <Text
                  style={[
                    styles.ageText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  {partner.age} yaş
                </Text>
              </Box>
            </HStack>

            <HStack alignItems="center" mb={2}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.accent}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.distanceText, { color: COLORS.accent }]}>
                {partner.distance} uzaklıkta
              </Text>
            </HStack>

            {/* Spor İlgi Alanları */}
            {renderPreferredSports(partner, false)}
          </VStack>
        </HStack>

        {/* Ekle/Geri Çek Butonu */}
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: isConnected ? '#E53935' : COLORS.accent },
          ]}
          onPress={handleConnect}
        >
          <Ionicons
            name={isConnected ? 'close' : 'add'}
            size={16}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>{isConnected ? 'Geri Çek' : 'Ekle'}</Text>
        </Pressable>
      </Box>
    );
  }

  // Ana sayfadaki yatay kaydırmalı kartlar için
  return (
    <Pressable
      style={[
        styles.verticalCard,
        { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
      ]}
      onPress={handleCardPress}
    >
      <Box style={styles.avatarContainerVertical}>
        {partner.avatar ? (
          <Image
            source={{ uri: partner.avatar }}
            style={styles.avatarVertical}
            alt={partner.name}
          />
        ) : (
          <Center style={[styles.avatarPlaceholderVertical, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.avatarTextVertical}>{getInitials(partner.name)}</Text>
          </Center>
        )}
      </Box>

      <Text
        style={[
          styles.nameTextVertical,
          { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
        ]}
      >
        {partner.name}
      </Text>

      <Text
        style={[
          styles.detailTextVertical,
          { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
        ]}
      >
        {partner.age} yaş
      </Text>

      <Text style={styles.distanceTextVertical}>{partner.distance}</Text>

      {renderPreferredSports(partner, true)}

      {isConnected ? (
        <Pressable
          style={[styles.actionButtonVertical, { backgroundColor: '#E53935' }]}
          onPress={handleConnect}
        >
          <Ionicons name="close" size={14} color="white" style={{ marginRight: 4 }} />
          <Text style={styles.buttonTextVertical}>Geri Çek</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.actionButtonVertical, { backgroundColor: COLORS.accent }]}
          onPress={handleConnect}
        >
          <Ionicons name="add" size={14} color="white" style={{ marginRight: 4 }} />
          <Text style={styles.buttonTextVertical}>Ekle</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Yatay (dikdörtgen) kart stilleri
  horizontalCard: {
    width: '100%',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ageText: {
    fontSize: 13,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Dikey (kare) kart stilleri - Ana ekran için
  verticalCard: {
    width: 170,
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  avatarContainerVertical: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 6,
  },
  avatarVertical: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholderVertical: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextVertical: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameTextVertical: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  detailTextVertical: {
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'center',
  },
  distanceTextVertical: {
    fontSize: 11,
    marginBottom: 6,
    textAlign: 'center',
    color: COLORS.accent,
  },
  actionButtonVertical: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: 80,
    marginTop: 6,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonTextVertical: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PartnerCard;
