import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface SportFriendCardProps {
  friend: any;
  onPress?: () => void;
}

export const SportFriendCard: React.FC<SportFriendCardProps> = ({ friend, onPress }) => {
  const { theme } = useThemeStore();
  const [isFriendRequested, setIsFriendRequested] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddFriend = () => {
    setIsFriendRequested(true);
    // Burada API'ye istek gönderme işlemi yapılacak
    console.log('Arkadaşlık isteği gönderildi: ', friend.first_name);
  };

  const handleCancelRequest = () => {
    setIsModalVisible(true);
  };

  const confirmCancelRequest = () => {
    setIsFriendRequested(false);
    // Burada API'ye istek iptal edildiğini bildiren istek gönderilecek
    console.log('Arkadaşlık isteği iptal edildi: ', friend.first_name);
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.contentContainer}>
          {/* Profil Fotoğrafı */}
          <View style={styles.profileImageContainer}>
            {friend.profile_picture ? (
              <Image
                source={{ uri: friend.profile_picture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
                <Ionicons name="person" size={40} color="white" />
              </View>
            )}
          </View>

          {/* İsim ve Yaş */}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {friend.first_name} {friend.last_name}
          </Text>
          <Text style={[styles.age, { color: theme.colors.textSecondary }]}>
            {friend.age} yaş
          </Text>

          {/* Sporlar */}
          <View style={styles.sportsContainer}>
            {friend.sports.slice(0, 2).map((sport: any, index: number) => (
              <View key={index} style={styles.sportItem}>
                <Ionicons name={sport.icon} size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.sportText, { color: theme.colors.textSecondary }]}>
                  {sport.name}
                </Text>
              </View>
            ))}
            {friend.sports.length > 2 && (
              <Text style={[styles.moreSports, { color: theme.colors.textSecondary }]}>
                +{friend.sports.length - 2}
              </Text>
            )}
          </View>
        </View>

        {/* Ekle/İptal Butonu */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.addButton, 
              isFriendRequested 
                ? { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent } 
                : { borderColor: theme.colors.accent }
            ]}
            onPress={isFriendRequested ? handleCancelRequest : handleAddFriend}
          >
            <Ionicons 
              name={isFriendRequested ? "checkmark" : "add"} 
              size={20} 
              color={isFriendRequested ? "white" : theme.colors.accent} 
            />
            <Text 
              style={[
                styles.addButtonText, 
                { color: isFriendRequested ? "white" : theme.colors.accent }
              ]}
            >
              {isFriendRequested ? "İstek Gönderildi" : "Ekle"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <ConfirmationModal
        visible={isModalVisible}
        title="İstek İptali"
        message={`${friend.first_name} ${friend.last_name} adlı kişiye gönderdiğiniz arkadaşlık isteğini geri çekmek istediğinize emin misiniz?`}
        confirmText="İptal Et"
        cancelText="Vazgeç"
        confirmIcon="close-circle-outline"
        isDestructive={true}
        onConfirm={confirmCancelRequest}
        onCancel={() => setIsModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    marginRight: 12,
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 280,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 8,
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  age: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  sportsContainer: {
    marginTop: 4,
    width: '100%',
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sportText: {
    fontSize: 14,
    marginLeft: 6,
  },
  moreSports: {
    fontSize: 14,
    marginTop: 2,
  },
  buttonContainer: {
    width: '100%',
    padding: 16,
    paddingTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    height: 36,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 