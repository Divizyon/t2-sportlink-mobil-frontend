import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/appStore/themeStore';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  position?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

/**
 * Sayı göstergesi badge bileşeni (bildirim, mesaj sayısı vb.)
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'medium',
  color,
  position = { top: -6, right: -10 },
}) => {
  const { theme } = useThemeStore();
  
  // Badge gözükmesi için en az 1 öğe olmalı
  if (count <= 0) return null;
  
  // Badge boyutu seçilen size'a göre ayarlanır
  const badgeSize = {
    small: { width: 16, height: 16, fontSize: 8 },
    medium: { width: 18, height: 18, fontSize: 10 },
    large: { width: 24, height: 24, fontSize: 12 },
  };
  
  // 99'dan büyük sayılar kısaltılır
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <View 
      style={[
        styles.badgeContainer, 
        {
          width: badgeSize[size].width,
          height: badgeSize[size].height,
          backgroundColor: color || theme.colors.primary,
          ...position,
        }
      ]}
    >
      <Text 
        style={[
          styles.badgeText,
          { fontSize: badgeSize[size].fontSize }
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    minWidth: 18, // Minimum genişlik
    borderRadius: 9, // Yuvarlak badge için yarıçap
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 