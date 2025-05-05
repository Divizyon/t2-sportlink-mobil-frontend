import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useMessageStore } from '../../store/messageStore/messageStore';
import { ConversationListItem } from './ConversationListItem';
import { Ionicons } from '@expo/vector-icons';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  onCreateNewConversation: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation, 
  onCreateNewConversation 
}) => {
  const { theme } = useThemeStore();
  const { 
    conversations, 
    fetchConversations, 
    isLoadingConversations, 
    error 
  } = useMessageStore();
  
  useEffect(() => {
    // Konuşmaları getir
    fetchConversations();
  }, []);
  
  // Yenileme işleyicisi
  const handleRefresh = () => {
    fetchConversations();
  };
  
  // Yükleniyor durumunu göster
  if (isLoadingConversations && conversations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Konuşmalarınız yükleniyor...
          </Text>
        </View>
      </View>
    );
  }
  
  // Hata durumunu göster
  if (error && conversations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
            onPress={fetchConversations}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Başlık */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Mesajlar</Text>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={onCreateNewConversation}
        >
          <Ionicons name="create-outline" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>
      
      {/* Konuşma Listesi */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationListItem 
            conversation={item}
            onPress={() => onSelectConversation(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingConversations}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="chatbubble-ellipses-outline" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Henüz hiç konuşmanız yok
            </Text>
            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: theme.colors.accent }]}
              onPress={onCreateNewConversation}
            >
              <Text style={styles.startButtonText}>Yeni Mesaj Başlat</Text>
            </TouchableOpacity>
          </View>
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 