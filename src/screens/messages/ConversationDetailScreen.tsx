import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { useMessageStore } from '../../store/messageStore/messageStore';
import { Message } from '../../api/messages/messageApi';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';

type RouteParams = {
  ConversationDetail: {
    conversationId: string;
    userName?: string;
  };
};

export const ConversationDetailScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const route = useRoute<RouteProp<RouteParams, 'ConversationDetail'>>();
  const navigation = useNavigation<any>();
  const { conversationId, userName } = route.params;
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    currentConversation,
    messages,
    isLoadingMessages,
    sendMessage,
    setCurrentConversation,
    markMessagesAsRead,
    error
  } = useMessageStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  
  // Konuşma verisini yükle
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        await setCurrentConversation(conversationId);
      }
    };
    
    loadConversation();
    
    // Cleanup - sayfa kapandığında temizle
    return () => {
      setCurrentConversation(null);
    };
  }, [conversationId]);
  
  // Mesajları okundu olarak işaretle
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessageIds = messages
        .filter(msg => !msg.is_read && msg.sender_id !== user.id)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }
    }
  }, [messages, user]);
  
  // Konuşma başlığını ayarla
  useEffect(() => {
    // userName prop'u zaten varsa, başlığı doğrudan ayarla
    if (userName) {
      navigation.setOptions({
        title: userName,
        headerBackTitle: 'Geri',
        headerRight: () => (
          currentConversation?.is_group ? (
            <TouchableOpacity 
              onPress={() => setShowParticipants(true)}
              style={{ marginRight: 8, padding: 8 }}
            >
              <Ionicons name="people" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          ) : null
        )
      });
      return;
    }
    
    // userName yoksa eski yöntemle belirle
    if (currentConversation) {
      // Başlık oluştur
      let title = currentConversation.name || '';
      
      // Eğer grup değilse ve başlık yoksa, kullanıcı adını göster
      if (!currentConversation.is_group && !title) {
        // Diğer katılımcıları bul (kendim hariç)
        const otherParticipants = currentConversation.participants.filter(
          p => p.user_id !== user?.id
        );
        
        if (otherParticipants.length > 0) {
          const otherUser = otherParticipants[0].user;
          title = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Sohbet';
        } else {
          title = 'Sohbet';
        }
      }
      
      // Başlığı güncelle
      navigation.setOptions({
        title,
        headerBackTitle: 'Geri',
        headerRight: () => (
          currentConversation?.is_group ? (
            <TouchableOpacity 
              onPress={() => setShowParticipants(true)}
              style={{ marginRight: 8, padding: 8 }}
            >
              <Ionicons name="people" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          ) : null
        )
      });
    }
  }, [currentConversation, navigation, user, userName]);
  
  // Mesaj gönderme işlemi
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    try {
      setIsSending(true);
      
      await sendMessage(currentConversation.id, newMessage.trim());
      
      // Mesaj kutusunu temizle
      setNewMessage('');
      
      // Listeyi en sona kaydır
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Medya seçme ve gönderme
  const handlePickImage = async () => {
    // İzin iste
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Görsel seçmek için izin gerekiyor!');
      return;
    }
    
    // Görsel seçiciyi aç
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // TODO: Medya mesajı gönderme işlemi
      alert('Medya mesajı gönderme özelliği henüz aktif değil. API hazır olduğunda kullanılabilir olacak.');
    }
  };
  
  // Mesaj renderlama
  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    const messageDate = new Date(item.created_at);
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}
      >
        {/* Mesaj içeriği */}
        <View
          style={[
            styles.messageContent,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            { backgroundColor: isMyMessage ? theme.colors.accent : theme.colors.cardBackground }
          ]}
        >
          {/* Eğer medya varsa göster */}
          {item.media_url && (
            <View style={styles.mediaContainer}>
              <Image
                source={{ uri: item.media_url }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </View>
          )}
          
          {/* Mesaj metni */}
          <Text 
            style={[
              styles.messageText,
              { color: isMyMessage ? 'white' : theme.colors.text }
            ]}
          >
            {item.content}
          </Text>
          
          {/* Zaman */}
          <Text
            style={[
              styles.messageTime,
              { color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary }
            ]}
          >
            {formatDistanceToNow(messageDate, { addSuffix: true, locale: tr })}
          </Text>
        </View>
      </View>
    );
  };
  
  // Yükleniyor gösterimi
  if (isLoadingMessages && messages.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Mesajlar yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Hata gösterimi
  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => setCurrentConversation(conversationId)}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Katılımcılar Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showParticipants}
        onRequestClose={() => setShowParticipants(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Katılımcılar
              </Text>
              <TouchableOpacity onPress={() => setShowParticipants(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={currentConversation?.participants || []}
              keyExtractor={(item) => item.user_id}
              renderItem={({ item }) => (
                <View style={[styles.participantItem, { 
                  borderBottomColor: theme.colors.border,
                  backgroundColor: item.user_id === user?.id ? theme.colors.accent + '15' : undefined
                }]}>
                  <View style={styles.participantAvatar}>
                    {item.user.profile_picture ? (
                      <Image 
                        source={{ uri: item.user.profile_picture }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
                        <Text style={styles.avatarText}>
                          {item.user.first_name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    {item.is_admin && (
                      <View style={[styles.adminBadge, { backgroundColor: theme.colors.accent }]}>
                        <Ionicons name="star" size={10} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.participantInfo}>
                    <Text style={[styles.participantName, { color: theme.colors.text }]}>
                      {`${item.user.first_name || ''} ${item.user.last_name || ''}`.trim() || 'İsimsiz Kullanıcı'}
                      {item.user_id === user?.id ? ' (Sen)' : ''}
                    </Text>
                    <Text style={[styles.participantUsername, { color: theme.colors.textSecondary }]}>
                      @{item.user.username || 'kullanıcı'}
                    </Text>
                  </View>
                  
                  {item.is_admin && (
                    <View style={[styles.roleBadge, { backgroundColor: theme.colors.accent + '20' }]}>
                      <Text style={[styles.roleText, { color: theme.colors.accent }]}>Yönetici</Text>
                    </View>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyParticipants}>
                  <Ionicons name="people" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Katılımcı bulunamadı
                  </Text>
                </View>
              }
            />
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => setShowParticipants(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Mesaj Listesi */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="chatbubble-ellipses-outline" 
                size={64} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Henüz mesaj yok. İlk mesajı gönder!
              </Text>
            </View>
          }
        />
        
        {/* Mesaj Girişi */}
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.cardBackground }]}>
          {/* Medya Ekleme */}
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handlePickImage}
          >
            <Ionicons name="image-outline" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          
          {/* Mesaj Input */}
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Mesaj yazın..."
            placeholderTextColor={theme.colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          
          {/* Gönder Butonu */}
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { 
                backgroundColor: newMessage.trim() ? theme.colors.accent : theme.colors.border,
                opacity: newMessage.trim() ? 1 : 0.5
              }
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    padding: 12,
    maxWidth: '75%',
  },
  myMessageBubble: {
    borderRadius: 18,
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  attachButton: {
    padding: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  mediaContainer: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  participantAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  defaultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantUsername: {
    fontSize: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyParticipants: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConversationDetailScreen; 