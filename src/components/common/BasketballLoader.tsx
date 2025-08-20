import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ImageStyle, StyleProp } from 'react-native';

type BasketballLoaderProps = {
  size?: number;
  durationMs?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export const BasketballLoader: React.FC<BasketballLoaderProps> = ({
  size = 120,
  durationMs = 900,
  style,
  accessibilityLabel = 'Yükleniyor',
}) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: durationMs,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: durationMs,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

    const loop = animate();
    return () => {
      // Animated.loop returns the animation instance; stop if available
      // @ts-expect-error TS doesn't know Animated.loop return type
      loop?.stop?.();
    };
  }, [scale, durationMs]);

  const interpolated = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });

  return (
    <Animated.Image
      source={require('../../../assets/sportImage/basketball.png')}
      style={[
        {
          width: size,
          height: size,
          transform: [{ scale: interpolated }],
        },
        style,
      ]}
      resizeMode="contain"
      accessibilityLabel={accessibilityLabel}
      accessible
    />
  );
};


