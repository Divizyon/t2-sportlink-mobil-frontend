import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  source?: string | null;
  name: string;
  size?: number;
  borderColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 40,
  borderColor = 'white',
}) => {
  // İsmin baş harflerini alma
  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    return parts.length > 0
      ? `${parts[0][0] || ''}${parts.length > 1 ? parts[1][0] : ''}`
      : '';
  };

  // Rasgele arka plan rengi oluşturma (isim bazlı)
  const getColorFromName = (name: string): string => {
    const colors = [
      '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6', '#34495E',
      '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50',
      '#F1C40F', '#E67E22', '#E74C3C', '#ECF0F1', '#95A5A6',
      '#F39C12', '#D35400', '#C0392B', '#BDC3C7', '#7F8C8D',
      '#273C75', '#192A56', '#2F3640', '#353B48', '#487EB0'
    ];

    // İsimden basit bir hash değeri oluşturma
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Hash değerini renk dizisinin indeksine dönüştürme
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name).toUpperCase();
  const backgroundColor = getColorFromName(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          backgroundColor: source ? 'transparent' : backgroundColor,
        },
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: size * 0.4,
            },
          ]}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 