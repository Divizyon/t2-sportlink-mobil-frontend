import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type DivizyonFooterProps = {
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  logoStyle?: ImageStyle;
};

export const DivizyonFooter: React.FC<DivizyonFooterProps> = ({
  containerStyle,
  textStyle,
  logoStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}> 
      <Text style={[styles.text, textStyle]}>Powered by</Text>
      <Image
        source={require('../../../assets/images/banner.png')}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  text: {
    fontSize: 16,
    color: '#888',
  },
  logo: {
    width: 120,
    height: 30,
  },
});


