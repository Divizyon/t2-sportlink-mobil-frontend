import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string | null;
  stats: {
    createdEvents: number;
    joinedEvents: number;
    rating: number;
    friends: number;
  };
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstName,
  lastName,
  username,
  profilePicture,
  stats
}) => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { updateProfilePicture } = useProfileStore();

  const handleImagePick = async () => {
    try {
      // İzinleri kontrol et
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'İzin Gerekli',
          'Profil fotoğrafını değiştirmek için galeri erişim izni gerekiyor.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Galeriyi aç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        // Profil fotoğrafını güncelle
        const success = await updateProfilePicture(result.assets[0].uri);
        
        if (!success) {
          Alert.alert(
            'Hata',
            'Profil fotoğrafı güncellenirken bir hata oluştu.',
            [{ text: 'Tamam' }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        'Profil fotoğrafı seçilirken bir hata oluştu.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.profileImageContainer}>
          {profilePicture ? (
            <Image 
              source={{ uri: profilePicture }} 
              style={styles.profileImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0)}{lastName.charAt(0)}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={handleImagePick}
          >
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.fullName}>{firstName} {lastName}</Text>
          <Text style={styles.username}>@{username}</Text>
        </View>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color="#338626" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.createdEvents}</Text>
          <Text style={styles.statLabel}>Oluşturduğum{'\n'}Etkinlik</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.joinedEvents}</Text>
          <Text style={styles.statLabel}>Katıldığım{'\n'}Etkinlik</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.friends}</Text>
          <Text style={styles.statLabel}>Arkadaş</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.editButton} 
        onPress={handleEditProfile}
      >
        <Text style={styles.editButtonText}>Profili Düzenle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileImageContainer: {
    marginRight: 16,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#273C75',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#338626',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  settingsButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#338626',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#338626',
    fontSize: 14,
    fontWeight: '600',
  },
}); 