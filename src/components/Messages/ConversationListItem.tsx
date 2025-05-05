import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { Conversation } from '../../api/messages/messageApi';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ConversationListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({ 
  conversation, 
  onPress 
}) => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  
  // Son mesajı al
  const lastMessage = conversation.messages && conversation.messages.length > 0 
    ? conversation.messages[0] 
    : null;
  
  // Konuşmanın diğer katılımcılarını al (kendim hariç)
  const otherParticipants = conversation.participants.filter(
    p => p.user_id !== user?.id
  );
  
  // Başlık oluştur
  const getTitle = () => {
    // Grup konuşması ise, konuşma adını göster
    if (conversation.is_group) {
      return conversation.name || 'Grup Sohbeti';
    }
    
    // Grup değilse ve diğer katılımcı varsa, kullanıcı adını göster
    if (otherParticipants.length > 0) {
      const otherUser = otherParticipants[0].user;
      return `${otherUser.first_name} ${otherUser.last_name}`;
    }
    
    return 'Sohbet';
  };
  
  // Avatarı oluştur - grup ise birden fazla kişinin avatarı, değilse diğer kullanıcının avatarı
  const renderAvatar = () => {
    if (conversation.is_group) {
      return (
        <View style={[styles.groupAvatar, { backgroundColor: theme.colors.cardBackground }]}>
          <Ionicons name="people" size={24} color={theme.colors.accent} />
        </View>
      );
    }
    
    if (otherParticipants.length > 0) {
      const otherUser = otherParticipants[0].user;
      
      if (otherUser.profile_picture) {
        return (
          <Image
            source={{ uri: otherUser.profile_picture }}
            style={styles.avatar}
          />
        );
      }
      
      // Profil resmi yoksa baş harfleri göster
      return (
        <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
          <Text style={styles.avatarInitial}>
            {otherUser.first_name.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }
    
    // Varsayılan avatar
    return (
      <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
        <Text style={styles.avatarInitial}>?</Text>
      </View>
    );
  };
  
  // Mesaj içeriğini formatla (kısa şekilde)
  const formatMessageContent = () => {
    if (!lastMessage) {
      return 'Yeni konuşma';
    }
    
    // Medya içeren mesaj ise özel metin göster
    if (lastMessage.media_url) {
      return '📎 Medya paylaştı';
    }
    
    // Normal mesaj
    const content = lastMessage.content?.trim() || '';
    return content.length > 35 ? content.substring(0, 35) + '...' : content;
  };
  
  // Mesaj zamanını formatla
  const formatMessageTime = () => {
    if (!lastMessage) {
      // Son mesaj yoksa, konuşmanın oluşturulma zamanını göster
      return formatDistanceToNow(new Date(conversation.created_at), {
        addSuffix: true,
        locale: tr
      });
    }
    
    return formatDistanceToNow(new Date(lastMessage.created_at), {
      addSuffix: true,
      locale: tr
    });
  };
  
  // Mesajın okunma durumunu kontrol et
  const isUnread = () => {
    if (!lastMessage) {
      return false;
    }
    
    // Son mesaj gönderen ben değilsem ve okunmadıysa
    return lastMessage.sender_id !== user?.id && !lastMessage.is_read;
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.cardBackground }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {renderAvatar()}
        {isUnread() && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.colors.accent }]} />
        )}
      </View>
      
      {/* Konuşma Bilgileri */}
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text 
            style={[
              styles.title, 
              { 
                color: theme.colors.text,
                fontWeight: isUnread() ? 'bold' : 'normal'
              }
            ]}
            numberOfLines={1}
          >
            {getTitle()}
          </Text>
          
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {formatMessageTime()}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.message, 
            { 
              color: isUnread() ? theme.colors.text : theme.colors.textSecondary,
              fontWeight: isUnread() ? '500' : 'normal'
            }
          ]}
          numberOfLines={1}
        >
          {formatMessageContent()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
  },
}); 