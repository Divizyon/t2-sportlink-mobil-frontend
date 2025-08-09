import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Linking,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '../../../navigation/ProfileStack';

type HelpNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

type HelpSectionProps = {
  title: string;
  content: string;
  isOpen: boolean;
  onPress: () => void;
  theme: any;
};

// Açılabilir yardım başlığı bileşeni
const HelpSection: React.FC<HelpSectionProps> = ({ 
  title, 
  content, 
  isOpen, 
  onPress, 
  theme 
}) => {
  return (
    <View style={[
      styles.helpSection, 
      { 
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.border || theme.colors.textSecondary + '30',
        borderWidth: 1 
      }
    ]}>
      <TouchableOpacity 
        style={styles.helpHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.helpTitle, { color: theme.colors.text }]}>{title}</Text>
        <Ionicons 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={theme.colors.accent}
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.helpContent}>
          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            {content}
          </Text>
        </View>
      )}
    </View>
  );
};

export const HelpScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<HelpNavigationProp>();
  
  // Hangi yardım bölümlerinin açık olduğunu takip eden state
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});
  
  // Yardım bölümünü açıp kapatma fonksiyonu
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // İletişim formu gönderme fonksiyonu
  const handleContactSupport = () => {
    Alert.alert(
      'Destek Ekibine Ulaş',
      'Destek ekibimize e-posta göndererek ulaşabilirsiniz.',
      [
        {
          text: 'E-posta Gönder',
          onPress: () => {
            Linking.openURL('mailto:destek@sportlink.com?subject=SportLink%20Uygulama%20Desteği');
          }
        },
        {
          text: 'İptal',
          style: 'cancel'
        }
      ]
    );
  };
  
  // Yardım içerikleri
  const helpContents = [
    {
      id: 'account',
      title: 'Hesap Ayarları',
      content: 'Profil bilgilerinizi güncellemek için "Profilim" sayfasında düzenle butonuna tıklayabilirsiniz. Şifrenizi değiştirmek için ayarlar bölümünden yapabilirsiniz. Hesabınızla ilgili tüm işlemleri profile sayfasından gerçekleştirebilirsiniz.'
    },
    {
      id: 'events',
      title: 'Etkinlik Oluşturma ve Katılma',
      content: 'Yeni bir etkinlik oluşturmak için ana sayfadaki "+" butonuna tıklayın. Etkinlik detaylarını doldurduktan sonra "Oluştur" butonuna basın. Etkinliklere katılmak için "Etkinlikler" sekmesinden istediğiniz etkinliği seçin ve "Katıl" butonuna tıklayın. Kendi oluşturduğunuz etkinlikleri düzenlemek veya iptal etmek için etkinlik detay sayfasındaki "Düzenle" butonunu kullanabilirsiniz.'
    },
    {
      id: 'location',
      title: 'Konum Sorunları',
      content: 'Konum servislerinin düzgün çalışabilmesi için telefonunuzun ayarlarından konum izinlerini açmanız gerekiyor. Android: Ayarlar > Uygulamalar > SportLink > İzinler > Konum > İzin Ver. iOS: Ayarlar > Gizlilik > Konum Servisleri > SportLink > "Uygulamayı Kullanırken" seçeneğini işaretleyin. Konumunuzu güncellemek istiyorsanız, profilinizdeki "Konum" kartında "Düzenle" butonuna tıklayabilirsiniz.'
    },
    {
      id: 'notifications',
      title: 'Bildirim Ayarları',
      content: 'Bildirim tercihlerinizi "Ayarlar > Bildirim Ayarları" bölümünden yönetebilirsiniz. Etkinlik bildirimleri, arkadaşlık istekleri, mesajlar ve duyurular için ayrı ayrı bildirim tercihlerini ayarlayabilirsiniz. Bildirimler gelmiyorsa, telefonunuzun ayarlarından uygulama bildirimlerinin açık olduğundan emin olun.'
    },
    {
      id: 'friends',
      title: 'Arkadaş Ekleme ve Sosyal Özellikler',
      content: 'Yeni arkadaşlar eklemek için, "Keşfet" sekmesinde kişileri arayabilir veya "Profilim > Arkadaşlar" bölümünde "Arkadaş Ekle" butonunu kullanabilirsiniz. Arkadaşlarınızla etkinlik planlamak için etkinlik oluşturma sayfasında "Arkadaşlarımı Davet Et" seçeneğini kullanın. Arkadaşlık isteklerini görmek ve yönetmek için "Profilim > Arkadaşlar > İstekler" bölümüne gidin.'
    },
    {
      id: 'technical',
      title: 'Teknik Sorunlar',
      content: 'Uygulama donuyorsa veya yavaş çalışıyorsa, telefonunuzu yeniden başlatmayı deneyin. Sorun devam ederse, uygulamayı telefonunuzdan kaldırıp yeniden yükleyebilirsiniz. Uygulama verileriniz hesabınızla ilişkili olduğu için, tekrar giriş yaptığınızda tüm verilerinize erişebileceksiniz. Özel teknik sorunlar için destek ekibimizle iletişime geçin.'
    },
    {
      id: 'payments',
      title: 'Ödeme ve Ücretli Etkinlikler',
      content: 'Ücretli etkinliklere katılmak için ödeme bilgilerinizi "Ayarlar > Ödeme Yöntemleri" bölümünden ekleyebilirsiniz. Güvenli ödeme için kredi kartı, banka kartı veya çeşitli online ödeme yöntemlerini kullanabilirsiniz. Ödeme işleminde sorun yaşarsanız, işlem numaranızla birlikte destek ekibimizle iletişime geçin.'
    }
  ];
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Yardım ve Destek
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Üst bölüm - Açıklama */}
        <View style={[
          styles.introSection, 
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.border || theme.colors.textSecondary + '30',
            borderWidth: 1
          }
        ]}>
          <Text style={[styles.introTitle, { color: theme.colors.text }]}>
            SportLink'e Hoş Geldiniz!
          </Text>
          <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
            Aşağıda uygulamamızı kullanırken karşılaşabileceğiniz sık sorulan sorular ve çözümleri 
            bulabilirsiniz. Daha fazla yardıma ihtiyacınız olursa, destek ekibimizle iletişime geçmekten 
            çekinmeyin.
          </Text>
        </View>
        
        {/* Sık Sorulan Sorular */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Sık Sorulan Sorular
        </Text>
        
        {helpContents.map((item) => (
          <HelpSection 
            key={item.id}
            title={item.title}
            content={item.content}
            isOpen={!!openSections[item.id]}
            onPress={() => toggleSection(item.id)}
            theme={theme}
          />
        ))}
        
        {/* İletişim Bölümü */}
        <View style={[
          styles.contactSection, 
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.border || theme.colors.textSecondary + '30',
            borderWidth: 1 
          }
        ]}>
          <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
            Hala Sorunuz mu Var?
          </Text>
          <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
            Aradığınız cevabı bulamadıysanız destek ekibimizle iletişime geçebilirsiniz. 
            Size en kısa sürede yardımcı olacağız.
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <Text style={styles.contactButtonText}>
              Destek Ekibine Ulaş
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Sürüm Bilgisi */}
        <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
          SportLink v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  introSection: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  helpSection: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  helpHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  helpContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  }
});
