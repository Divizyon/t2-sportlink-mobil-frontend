import { create } from 'zustand';
import { Message, Conversation, messageApi } from '../../api/messages/messageApi';
import { createSupabaseClient } from '../../utils/supabaseClient';

// Supabase client'ı oluştur
const supabase = createSupabaseClient();

interface MessageStore {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  activeChannel: any; // Supabase channel
  unreadMessagesCount: number; // Okunmamış mesaj sayacı
  
  // Konuşmalar
  fetchConversations: () => Promise<void>;
  createConversation: (userIds: string[], name?: string, isGroup?: boolean) => Promise<Conversation | null>;
  leaveConversation: (conversationId: string) => Promise<boolean>;
  setCurrentConversation: (conversationId: string | null) => Promise<void>;
  
  // Mesajlar
  fetchConversationMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, mediaUrl?: string) => Promise<Message | null>;
  sendMediaMessage: (conversationId: string, content: string, mediaFile: File) => Promise<Message | null>;
  markMessagesAsRead: (messageIds: string[]) => Promise<boolean>;
  
  // Okunmamış mesaj sayısı
  getUnreadMessagesCount: () => Promise<number>;
  
  // Supabase realtime
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromCurrentChannel: () => void;
  
  // Store yönetimi
  resetState: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  // İlk durum
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,
  activeChannel: null,
  unreadMessagesCount: 0,
  
  // Konuşmaları getir
  fetchConversations: async () => {
    try {
      set({ isLoadingConversations: true, error: null });
      
      const response = await messageApi.getConversations();
      
      if (response.success && response.data) {
        // Konuşmaları en son mesaj tarihine göre sırala
        const sortedConversations = response.data.sort((a, b) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        
        set({ conversations: sortedConversations });
        
        // Okunmamış mesaj sayısını güncelle
        await get().getUnreadMessagesCount();
      } else {
        throw new Error(response.message || 'Konuşmalar getirilemedi');
      }
    } catch (error: any) {
      console.error('Konuşmaları getirirken hata:', error);
      set({ error: 'Konuşmalar yüklenirken bir hata oluştu' });
    } finally {
      set({ isLoadingConversations: false });
    }
  },
  
  // Yeni konuşma oluştur
  createConversation: async (userIds, name, isGroup = false) => {
    try {
      set({ error: null });
      
      const response = await messageApi.createConversation(userIds, name, isGroup);
      
      if (response.success && response.data) {
        // Konuşmalar listesini güncelle
        const conversations = get().conversations;
        set({ conversations: [response.data, ...conversations] });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Konuşma oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Konuşma oluşturma hatası:', error);
      set({ error: 'Konuşma oluşturulurken bir hata oluştu' });
      return null;
    }
  },
  
  // Konuşmadan ayrıl
  leaveConversation: async (conversationId) => {
    try {
      set({ error: null });
      
      const response = await messageApi.leaveConversation(conversationId);
      
      if (response.success) {
        // Konuşmayı listeden kaldır
        const conversations = get().conversations.filter(
          conv => conv.id !== conversationId
        );
        
        // Eğer aktif konuşma ise, aktif konuşmayı temizle
        if (get().currentConversation?.id === conversationId) {
          set({ currentConversation: null, messages: [] });
        }
        
        set({ conversations });
        return true;
      } else {
        throw new Error(response.message || 'Konuşmadan ayrılınamadı');
      }
    } catch (error: any) {
      console.error('Konuşmadan ayrılma hatası:', error);
      set({ error: 'Konuşmadan ayrılırken bir hata oluştu' });
      return false;
    }
  },
  
  // Aktif konuşmayı belirle ve mesajlarını getir
  setCurrentConversation: async (conversationId) => {
    try {
      // Mesajları temizle ve yükleme durumunu belirt
      set({ messages: [], error: null });
      
      if (!conversationId) {
        set({ currentConversation: null });
        return;
      }
      
      // Önce mevcut konuşmalar içinden bul
      const conversation = get().conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        set({ currentConversation: conversation });
        
        // Mesajları getir
        await get().fetchConversationMessages(conversationId);
        
        // Supabase realtime aboneliği
        get().subscribeToConversation(conversationId);
      } else {
        // Konuşma mevcut değilse hata göster
        set({ error: 'Konuşma bulunamadı', currentConversation: null });
      }
    } catch (error: any) {
      console.error('Konuşma ayarlama hatası:', error);
      set({ error: 'Konuşma ayarlanırken bir hata oluştu' });
    }
  },
  
  // Konuşma mesajlarını getir
  fetchConversationMessages: async (conversationId) => {
    try {
      set({ isLoadingMessages: true, error: null });
      
      const response = await messageApi.getConversationMessages(conversationId);
      
      if (response.success && response.data) {
        // Mesajları tarihe göre sırala (eskiden yeniye)
        const sortedMessages = response.data.sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        
        set({ messages: sortedMessages });
      } else {
        throw new Error(response.message || 'Mesajlar getirilemedi');
      }
    } catch (error: any) {
      console.error('Mesajları getirme hatası:', error);
      set({ error: 'Mesajlar yüklenirken bir hata oluştu' });
    } finally {
      set({ isLoadingMessages: false });
    }
  },
  
  // Mesaj gönder
  sendMessage: async (conversationId, content, mediaUrl) => {
    try {
      set({ error: null });
      
      const response = await messageApi.sendMessage(conversationId, content, mediaUrl);
      
      if (response.success && response.data) {
        // Mesajı sohbet listesine ekle
        const messages = [...get().messages, response.data];
        set({ messages });
        
        // Konuşmalar listesini güncelle (en son mesaj tarihini güncelle)
        const conversations = get().conversations.map(conv => {
          if (conv.id === conversationId) {
            // Boş mesaj dizisi yerine içinde son mesaj olan bir dizi oluştur
            const updatedMessages = response.data ? [response.data] : [...conv.messages];
            const updatedTimestamp = response.data ? response.data.created_at : conv.updated_at;
            
            return {
              ...conv,
              messages: updatedMessages,
              updated_at: updatedTimestamp
            };
          }
          return conv;
        });
        
        // Konuşmaları yeniden sırala
        const sortedConversations = conversations.sort((a, b) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        
        set({ conversations: sortedConversations });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Mesaj gönderilemedi');
      }
    } catch (error: any) {
      console.error('Mesaj gönderme hatası:', error);
      set({ error: 'Mesaj gönderilirken bir hata oluştu' });
      return null;
    }
  },
  
  // Medya içeren mesaj gönder
  sendMediaMessage: async (conversationId, content, mediaFile) => {
    try {
      set({ error: null });
      
      const response = await messageApi.sendMediaMessage(conversationId, content, mediaFile);
      
      if (response.success && response.data) {
        // Mesajı sohbet listesine ekle
        const messages = [...get().messages, response.data];
        set({ messages });
        
        // Konuşmalar listesini güncelle
        const conversations = get().conversations.map(conv => {
          if (conv.id === conversationId) {
            // Boş mesaj dizisi yerine içinde son mesaj olan bir dizi oluştur
            const updatedMessages = response.data ? [response.data] : [...conv.messages];
            const updatedTimestamp = response.data ? response.data.created_at : conv.updated_at;
            
            return {
              ...conv,
              messages: updatedMessages,
              updated_at: updatedTimestamp
            };
          }
          return conv;
        });
        
        // Konuşmaları yeniden sırala
        const sortedConversations = conversations.sort((a, b) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        
        set({ conversations: sortedConversations });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Medya mesajı gönderilemedi');
      }
    } catch (error: any) {
      console.error('Medya mesajı gönderme hatası:', error);
      set({ error: 'Medya mesajı gönderilirken bir hata oluştu' });
      return null;
    }
  },
  
  // Mesajları okundu olarak işaretle
  markMessagesAsRead: async (messageIds) => {
    try {
      if (messageIds.length === 0) return true;
      
      set({ error: null });
      
      const response = await messageApi.markMessagesAsRead(messageIds);
      
      if (response.success) {
        // Mevcut mesajları güncelle
        const updatedMessages = get().messages.map(message => {
          if (messageIds.includes(message.id)) {
            return { ...message, is_read: true };
          }
          return message;
        });
        
        set({ messages: updatedMessages });
        
        // Tüm konuşmaların okunmamış mesaj sayısını güncelle
        await get().getUnreadMessagesCount();
        
        return true;
      } else {
        throw new Error(response.message || 'Mesajlar okundu olarak işaretlenemedi');
      }
    } catch (error: any) {
      console.error('Mesajları okundu olarak işaretleme hatası:', error);
      set({ error: 'Mesajlar okundu olarak işaretlenirken bir hata oluştu' });
      return false;
    }
  },
  
  // Okunmamış mesaj sayısını hesapla
  getUnreadMessagesCount: async () => {
    try {
      // Backend'den okunmamış mesaj sayısını getir
      const response = await messageApi.getUnreadMessagesCount();
      
      if (response.success && response.data !== undefined) {
        set({ unreadMessagesCount: response.data.count });
        return response.data.count;
      } else {
        // API'den veri alınamazsa, konuşmalardan hesapla
        const { conversations } = get();
        let unreadCount = 0;
        
        conversations.forEach(conversation => {
          const lastMessage = conversation.messages && conversation.messages.length > 0 
            ? conversation.messages[0] 
            : null;
            
          if (lastMessage && !lastMessage.is_read) {
            unreadCount++;
          }
        });
        
        set({ unreadMessagesCount: unreadCount });
        return unreadCount;
      }
    } catch (error) {
      console.error('Okunmamış mesaj sayısı hesaplanırken hata:', error);
      return 0;
    }
  },
  
  // Supabase Realtime ile konuşmaya abone ol
  subscribeToConversation: (conversationId) => {
    try {
      // Önce mevcut kanaldan aboneliği kaldır
      get().unsubscribeFromCurrentChannel();
      
      // Yeni kanala abone ol
      const channel = supabase.channel(conversationId, {
        config: {
          presence: {
            key: 'user'
          }
        }
      });
      
      // Yeni mesaj geldiğinde
      channel
        .on('broadcast', { event: 'message' }, (payload: any) => {
          console.log('Yeni mesaj alındı:', payload);
          
          // Gelen mesajı mesaj listesine ekle
          const newMessage = payload.payload as Message;
          
          // Mesaj kendi gönderdiğimiz bir mesajsa, işlemi atla (duplicate önleme)
          const existingMessage = get().messages.find(m => m.id === newMessage.id);
          if (existingMessage) return;
          
          // Yeni mesajı listeye ekle
          const messages = [...get().messages, newMessage];
          set({ messages });
          
          // Konuşmalar listesini güncelle
          const conversations = get().conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [newMessage],
                updated_at: newMessage.created_at
              };
            }
            return conv;
          });
          
          // Konuşmaları yeniden sırala
          const sortedConversations = conversations.sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          });
          
          set({ conversations: sortedConversations });
        })
        .subscribe();
      
      // Aktif kanalı kaydet
      set({ activeChannel: channel });
    } catch (error: any) {
      console.error('Realtime abonelik hatası:', error);
    }
  },
  
  // Supabase realtime aboneliğini kaldır
  unsubscribeFromCurrentChannel: () => {
    const { activeChannel } = get();
    
    if (activeChannel) {
      supabase.removeChannel(activeChannel);
      set({ activeChannel: null });
    }
  },
  
  // Store'u sıfırla
  resetState: () => {
    get().unsubscribeFromCurrentChannel();
    
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoadingConversations: false,
      isLoadingMessages: false,
      error: null,
      activeChannel: null,
      unreadMessagesCount: 0
    });
  }
})); 