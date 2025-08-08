import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { colors } from '../../../constants/colors/colors';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useThemeStore();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'right', 'left']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Gizlilik Politikası
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.content, { backgroundColor: theme.colors.cardBackground }]}>
          
          {/* Başlık */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            SportLink Gizlilik Politikası
          </Text>
          
          <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </Text>

          {/* Giriş */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              1. Giriş
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              SportLink olarak, kişisel verilerinizin güvenliği bizim için çok önemlidir. 
              Bu gizlilik politikası, hangi bilgileri topladığımızı, nasıl kullandığımızı 
              ve koruduğumuzu açıklar.
            </Text>
          </View>

          {/* Toplanan Veriler */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              2. Topladığımız Veriler
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Uygulamamızı kullanırken aşağıdaki verileri toplarız:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Hesap bilgileri (ad, e-posta, telefon)
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Profil bilgileri (profil fotoğrafı, spor tercihleri)
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Konum verileri (etkinlik konumları, yakın etkinlik arama)
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Kullanım verileri (etkinlik katılımları, mesajlaşma)
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Cihaz bilgileri (cihaz türü, işletim sistemi)
              </Text>
            </View>
          </View>

          {/* Veri Kullanımı */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              3. Verilerin Kullanım Amacı
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Topladığımız verileri aşağıdaki amaçlarla kullanırız:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Hesabınızı oluşturmak ve yönetmek
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Spor etkinlikleri önermek
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Yakın etkinlikleri bulmanıza yardımcı olmak
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Mesajlaşma hizmeti sağlamak
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Uygulama performansını iyileştirmek
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Güvenlik ve dolandırıcılığı önlemek
              </Text>
            </View>
          </View>

          {/* Veri Paylaşımı */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              4. Veri Paylaşımı
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Kişisel verilerinizi üçüncü taraflarla paylaşmaz, satmaz veya kiralamayız. 
              Ancak aşağıdaki durumlarda veri paylaşımı yapabiliriz:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Yasal zorunluluk durumunda
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Hizmet sağlayıcılarımızla (sunucu, analitik)
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Güvenlik tehditlerini önlemek için
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Sizin açık izninizle
              </Text>
            </View>
          </View>

          {/* Veri Güvenliği */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              5. Veri Güvenliği
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Verilerinizi korumak için aşağıdaki güvenlik önlemlerini alırız:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • SSL şifreleme ile veri transferi
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Güvenli sunucu altyapısı
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Düzenli güvenlik denetimleri
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Erişim kontrolü ve yetkilendirme
              </Text>
            </View>
          </View>

          {/* Çerezler ve Takip */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              6. Çerezler ve Takip Teknolojileri
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Uygulamamız, kullanıcı deneyimini iyileştirmek ve analitik amaçlarla 
              çerezler ve benzer teknolojiler kullanır. Bu teknolojiler:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Oturum yönetimi
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Kullanım analizi
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Performans optimizasyonu
              </Text>
            </View>
          </View>

          {/* Kullanıcı Hakları */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              7. Kullanıcı Hakları
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Verilerinize erişim hakkı
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Verilerinizi düzeltme hakkı
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Verilerinizi silme hakkı
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • İşlemeye itiraz hakkı
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Veri taşınabilirliği hakkı
              </Text>
            </View>
          </View>

          {/* Veri Saklama */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              8. Veri Saklama Süresi
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Kişisel verilerinizi aşağıdaki süreler boyunca saklarız:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Hesap verileri: Hesap silinene kadar
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Etkinlik verileri: 5 yıl
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Mesajlaşma verileri: 2 yıl
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Analitik veriler: 1 yıl
              </Text>
            </View>
          </View>

          {/* Çocuklar */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              9. Çocukların Gizliliği
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Uygulamamız 13 yaş altı kullanıcılar için tasarlanmamıştır. 
              13 yaş altı kullanıcılardan bilerek kişisel veri toplamayız.
            </Text>
          </View>

          {/* Değişiklikler */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              10. Politika Değişiklikleri
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler 
              kullanıcılara bildirilecektir.
            </Text>
          </View>

          {/* İletişim */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              11. İletişim
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Gizlilik politikamızla ilgili sorularınız için: {'\n'}
              E-posta: privacy@sportlink.com {'\n'}
              Adres: Divizyon Teknoloji A.Ş. {'\n'}
              İstanbul, Türkiye
            </Text>
          </View>

        </View>
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
    paddingVertical: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  content: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 16,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
});
