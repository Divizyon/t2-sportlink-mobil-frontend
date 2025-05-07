import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useMessageStore } from '../../store/messageStore/messageStore';
import { ConversationList } from '../../components/Messages/ConversationList';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/userStore/authStore';

export const MessagesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  
  // Konuşmayı seçme işlemi
  const handleSelectConversation = (conversationId: string) => {
    // Conversation başlığını bul
    const { conversations } = useMessageStore.getState();
    const conversation = conversations.find(c => c.id === conversationId);
    
    // Konuşma başlığını belirle
    let userName = 'Sohbet';
    if (conversation) {
      if (conversation.is_group) {
        userName = conversation.name || 'Grup Sohbeti';
      } else {
        // Kendi dışındaki kullanıcıyı bul
        const { user } = useAuthStore.getState();
        const otherParticipants = conversation.participants.filter(
          p => p.user_id !== user?.id
        );
        
        if (otherParticipants.length > 0) {
          const otherUser = otherParticipants[0].user;
          userName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Kullanıcı';
        }
      }
    }
    
    // Konuşma detayı sayfasına yönlendir
    navigation.navigate('ConversationDetail', { 
      conversationId,
      userName 
    });
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