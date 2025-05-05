import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useMessageStore } from '../../store/messageStore/messageStore';
import { ConversationList } from '../../components/Messages/ConversationList';
import { useNavigation } from '@react-navigation/native';

export const MessagesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  
  // Konuşmayı seçme işlemi
  const handleSelectConversation = (conversationId: string) => {
    // Konuşma detayı sayfasına yönlendir
    navigation.navigate('ConversationDetail', { conversationId });
  };
  
  // Yeni konuşma oluşturma işlemi
  const handleCreateNewConversation = () => {
    // Yeni konuşma sayfasına yönlendir
    navigation.navigate('NewConversation');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      {/* Konuşma Listesi */}
      <ConversationList
        onSelectConversation={handleSelectConversation}
        onCreateNewConversation={handleCreateNewConversation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MessagesScreen; 