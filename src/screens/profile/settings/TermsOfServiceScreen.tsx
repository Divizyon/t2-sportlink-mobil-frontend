import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { colors } from '../../../constants/colors/colors';

export const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useThemeStore();

  const handleBack = () => {
    navigation.goBack();
  };

  const openDivizyonWebsite = () => {
    Linking.openURL('https://www.divizyon.org');
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Kullanım Şartları
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
            SportLink Kullanım Şartları
          </Text>
          
          <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </Text>

          {/* Giriş */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              1. Genel Hükümler
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              SportLink uygulaması, Divizyon çatısı altında geliştirilen yenilikçi bir spor platformudur. 
              Divizyon, kolektif öğrenmeyi ve üretmeyi teşvik eden, işbirlikçi ve disiplinler ötesi 
              gençlerin, girişimcilerin ve profesyonellerin yüksek teknoloji olanaklarına sahip 
              ortak çalışma alanında bir araya geldiği yazılım ve dijital sanatlar açık inovasyon platformudur.
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Bu uygulamayı kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. 
              Bu şartlar, uygulamanın kullanımı ile ilgili tüm hak ve yükümlülükleri düzenler.
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Divizyon hakkında daha fazla bilgi için:{' '}
              <Text 
                style={[styles.link, { color: theme.colors.primary }]}
                onPress={openDivizyonWebsite}
              >
                https://www.divizyon.org
              </Text>
            </Text>
          </View>

          {/* Hizmet Tanımı */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              2. Hizmet Tanımı
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              SportLink, spor etkinlikleri oluşturma, katılma ve spor arkadaşları bulma 
              amacıyla geliştirilmiş bir sosyal platformdur. Uygulama aracılığıyla:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Spor etkinlikleri oluşturabilir ve yönetebilirsiniz
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Diğer kullanıcıların etkinliklerine katılabilirsiniz
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Spor arkadaşları bulabilir ve mesajlaşabilirsiniz
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Konum tabanlı etkinlik arama yapabilirsiniz
              </Text>
            </View>
          </View>

          {/* Kullanıcı Sorumlulukları */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              3. Kullanıcı Sorumlulukları
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Uygulamayı kullanırken aşağıdaki sorumluluklara sahipsiniz:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Doğru ve güncel bilgiler sağlamak
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Diğer kullanıcıların haklarına saygı göstermek
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Uygunsuz içerik paylaşmamak
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Güvenlik önlemlerini almak
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Etkinlik güvenliğini sağlamak
              </Text>
            </View>
          </View>

          {/* Yasaklı İçerikler */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              4. Yasaklı İçerikler
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Aşağıdaki içerikler kesinlikle yasaktır:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Müstehcen, pornografik veya yetişkinlere yönelik içerik
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Şiddet, nefret söylemi veya ayrımcılık içeren içerik
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Yasadışı faaliyetleri teşvik eden içerik
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Spam, reklam veya ticari amaçlı içerik
              </Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                • Telif hakkı ihlali oluşturan içerik
              </Text>
            </View>
          </View>

          {/* Fikri Mülkiyet */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              5. Fikri Mülkiyet Hakları
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              SportLink uygulaması ve tüm içeriği Divizyon şirketine aittir. 
              Kullanıcılar, uygulamanın kaynak kodunu, tasarımını veya içeriğini 
              kopyalayamaz, değiştiremez veya dağıtamaz.
            </Text>
          </View>

          {/* Gizlilik */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              6. Gizlilik
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için 
              Gizlilik Politikamızı inceleyebilirsiniz.
            </Text>
          </View>

          {/* Sorumluluk Reddi */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              7. Sorumluluk Reddi
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              SportLink, kullanıcılar arasında gerçekleşen etkinliklerden 
              doğabilecek zararlardan sorumlu değildir. Kullanıcılar kendi 
              güvenliklerinden sorumludur.
            </Text>
          </View>

          {/* Değişiklikler */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              8. Şartlarda Değişiklik
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Bu kullanım şartları gerektiğinde güncellenebilir. Önemli değişiklikler 
              kullanıcılara bildirilecektir.
            </Text>
          </View>

          {/* İletişim */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              9. İletişim
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Bu şartlarla ilgili sorularınız için: {'\n'}
              E-posta: support@sportlink.com {'\n'}
              Telefon: +90 (212) XXX XX XX
            </Text>
          </View>

          {/* Geliştirici Bilgisi */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              10. Geliştirici
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              SportLink uygulaması Divizyon inovasyon platformu çatısı altında geliştirilmiştir. 
              Divizyon, teknoloji alanında çalışan girişimciler ve profesyoneller için 
              işbirliği ve inovasyon ortamı sağlayan bir platformdur.
            </Text>
            <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
              Divizyon hakkında detaylı bilgi için:{' '}
              <Text 
                style={[styles.link, { color: theme.colors.primary }]}
                onPress={openDivizyonWebsite}
              >
                https://www.divizyon.org
              </Text>
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
  link: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
