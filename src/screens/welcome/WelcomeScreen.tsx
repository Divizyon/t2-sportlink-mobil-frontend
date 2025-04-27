import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Button } from '../../components/Button/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { Ionicons } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/sportlink-bg.png')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.logo}>SPORTLINK</Text>
          <Text style={styles.slogan}>
            Spor arkadaşını bul. Aktivitelere katıl.{'\n'}Harekete geç.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.centerSection}>
            <View style={styles.optionItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.optionText}>Sevdiğin spor dalında arkadaş bul</Text>
            </View>

            <View style={styles.optionItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.optionText}>Yakınındaki etkinlikleri keşfet</Text>
            </View>

            <View style={styles.optionItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.optionText}>Kendi etkinliğini oluştur</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.registerText}>KAYIT OL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleLogin} 
              style={styles.loginButton}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.loginText}>GİRİŞ YAP</Text>
            </TouchableOpacity>
            
            <Text style={styles.tagline}>Sportif Etkinliklerde Buluşmanın En Kolay Yolu</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  bottomSection: {
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  logo: {
    fontSize: 44,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  slogan: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
  },
  centerSection: {
    alignItems: 'center',
    marginBottom: 15,
    paddingRight: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    width: '90%',
    paddingLeft: 20,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  registerButton: {
    width: '85%',
    backgroundColor: '#44BD32',
    borderRadius: 50,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 30,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 10,
  },
});

export default WelcomeScreen; 