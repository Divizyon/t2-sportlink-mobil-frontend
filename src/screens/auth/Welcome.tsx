import React from 'react';
import { Platform, ImageBackground, Text as RNText } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Box,
  VStack,
  Text,
  HStack,
  Pressable,
  Button,
  Center,
  StatusBar
} from '@gluestack-ui/themed';
import { COLORS, normalize } from '@/src/constants';
import { useNavigationHelpers } from '@/src/navigation';

/**
 * Karşılama ekranı
 * Kullanıcı henüz giriş yapmamışsa gösterilen ilk ekran
 */
export default function Welcome() {
  const { navigateToSignUp, navigateToSignIn } = useNavigationHelpers();

  return (
    <Box flex={1}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground 
        source={require('@/assets/images/sportlink-bg.png')}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      >
        <Box
          flex={1}
          paddingHorizontal={20}
          justifyContent="space-between"
          paddingTop={Platform.OS === 'ios' ? 50 : 35}
          paddingBottom={Platform.OS === 'ios' ? 25 : 20}
        >
          {/* Üst kısım - Logo ve slogan */}
          <Center marginTop={50}>
            <Text
              fontSize={56}
              fontWeight="bold"
              color={COLORS.neutral.white}
              letterSpacing={1}
              fontStyle="italic"
              textShadowColor={COLORS.accent}
              textShadowOffset={{ width: 1, height: 1 }}
              textShadowRadius={1}
            >
              SPORTLINK
            </Text>
            <Text
              color={COLORS.neutral.white}
              fontSize={17}
              marginTop={6}
              textAlign="center"
              fontWeight="700"
              fontStyle="italic"
            >
              Spor arkadaşını bul. Aktivitelere katıl.{'\n'}
              Harekete geç.
            </Text>
          </Center>

          {/* Alt kısım - Özellikler ve butonlar */}
          <VStack marginBottom={5} gap={0} alignItems="center">
            {/* Özellik butonları */}
            <VStack gap={2} marginBottom={18} width="90%">
              <Pressable>
                <HStack
                  paddingVertical={4}
                  paddingHorizontal={10}
                  alignItems="center"
                >
                  <Center
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="rgba(100,100,100,0.6)"
                    marginRight={14}
                  >
                    <FontAwesome name="users" size={18} color={COLORS.neutral.white} />
                  </Center>
                  <Text color={COLORS.neutral.white} fontSize={16} fontWeight="700">
                    Sevdiğin spor dalında arkadaş bul
                  </Text>
                </HStack>
              </Pressable>
              
              <Pressable>
                <HStack
                  paddingVertical={4}
                  paddingHorizontal={10}
                  alignItems="center"
                >
                  <Center
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="rgba(100,100,100,0.6)"
                    marginRight={14}
                  >
                    <FontAwesome name="map-marker" size={18} color={COLORS.neutral.white} />
                  </Center>
                  <Text color={COLORS.neutral.white} fontSize={16} fontWeight="700">
                    Yakınındaki etkinlikleri keşfet
                  </Text>
                </HStack>
              </Pressable>
              
              <Pressable>
                <HStack
                  paddingVertical={4}
                  paddingHorizontal={10}
                  alignItems="center"
                >
                  <Center
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="rgba(100,100,100,0.6)"
                    marginRight={14}
                  >
                    <FontAwesome name="calendar" size={18} color={COLORS.neutral.white} />
                  </Center>
                  <Text color={COLORS.neutral.white} fontSize={16} fontWeight="700">
                    Kendi etkinliğini oluştur
                  </Text>
                </HStack>
              </Pressable>
            </VStack>

            {/* Kayıt ol ve giriş yap butonları */}
            <VStack gap={10} alignItems="center" width="100%">
              <Button 
                backgroundColor={COLORS.accent}
                borderRadius={30}
                width="85%"
                onPress={navigateToSignUp}
                height={54}
                p={0}
              >
                <HStack alignItems="center" justifyContent="center">
                  <FontAwesome name="user-plus" size={20} color={COLORS.neutral.white} style={{ marginRight: 10 }} />
                  <RNText style={{ color: COLORS.neutral.white, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>
                    KAYIT OL
                  </RNText>
                </HStack>
              </Button>
              
              <Button 
                backgroundColor="transparent"
                borderColor={COLORS.neutral.white}
                borderWidth={1}
                borderRadius={25}
                width="auto"
                paddingHorizontal={25}
                onPress={navigateToSignIn}
                height={46}
                p={0}
              >
                <HStack alignItems="center" justifyContent="center">
                  <FontAwesome name="sign-in" size={16} color={COLORS.neutral.white} style={{ marginRight: 10 }} />
                  <RNText style={{ color: COLORS.neutral.white, fontSize: 15, fontWeight: '500', letterSpacing: 0.5 }}>
                    GİRİŞ YAP
                  </RNText>
                </HStack>
              </Button>
              
              {/* Alt bilgi metni */}
              <Text 
                color={COLORS.neutral.white}
                fontSize={12}
                textAlign="center"
                opacity={0.7}
                fontWeight="300"
                marginTop={15}
              >
                Sportif Etkinliklerde Buluşmanın En Kolay Yolu
              </Text>
            </VStack>
          </VStack>
        </Box>
      </ImageBackground>
    </Box>
  );
} 