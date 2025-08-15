/**
 * Spor Tesisleri TypeScript Tip Tanımları
 * Konya spor alanları için gerekli tipleri içerir
 */

export type SportType =
  | 'Yüzme'
  | 'Tenis'
  | 'Basketbol/Salon Sporları'
  | 'Futbol (Halı Saha)'
  | 'Futbol (Stadyum/Amatör)'
  | 'Fitness'
  | 'Dövüş Sporları'
  | 'Okçuluk'
  | 'Kaykay (Skateboard)'
  | 'Bowling'
  | 'Go-kart'
  | 'Tırmanış (Bouldering/Spor Tırmanış)';

export type DistrictType = 'Selçuklu' | 'Karatay' | 'Meram';

/**
 * Spor tesisi veri modeli
 */
export interface SportsFacility {
  /** Spor türü */
  sport: SportType;
  /** Tesis adı */
  name: string;
  /** Tesis adresi */
  address: string;
  /** İlçe */
  district: DistrictType;
  /** Enlem koordinatı */
  latitude: number | null;
  /** Boylam koordinatı */
  longitude: number | null;
  /** Google Maps URL'i */
  maps_url: string;
  /** Tesis görseli URL'i */
  image_url: string | null;
}

/**
 * Filtreleme seçenekleri
 */
export interface FilterOptions {
  /** Seçili spor türleri */
  selectedSports: SportType[];
  /** Seçili ilçeler */
  selectedDistricts: DistrictType[];
  /** Arama metni */
  searchText: string;
}

/**
 * Spor türlerine göre icon mapping
 */
export type SportIconMap = {
  [K in SportType]: string;
};

/**
 * Spor türlerine göre renk mapping
 */
export type SportColorMap = {
  [K in SportType]: string;
};

/**
 * Spor tesisleri ekranı için props
 */
export interface SportsFacilitiesScreenProps {
  /** Navigation prop */
  navigation?: any;
  /** Route prop */
  route?: any;
}

/**
 * Spor tesisi kartı için props
 */
export interface FacilityCardProps {
  /** Tesis bilgileri */
  facility: SportsFacility;
  /** Karta tıklanınca çalışacak fonksiyon */
  onPress?: (facility: SportsFacility) => void;
  /** Harita butonuna tıklanınca çalışacak fonksiyon */
  onMapPress?: (facility: SportsFacility) => void;
}

/**
 * Filtreleme modalı için props
 */
export interface FilterModalProps {
  /** Modal görünürlüğü */
  visible: boolean;
  /** Modal kapatma fonksiyonu */
  onClose: () => void;
  /** Filtre uygulama fonksiyonu */
  onApplyFilters: (filters: FilterOptions) => void;
  /** Mevcut filtre seçenekleri */
  currentFilters: FilterOptions;
  /** Mevcut spor türleri listesi */
  availableSports: SportType[];
  /** Mevcut ilçeler listesi */
  availableDistricts: DistrictType[];
}

/**
 * Arama sonucu
 */
export interface SearchResult {
  /** Bulunan tesisler */
  facilities: SportsFacility[];
  /** Toplam sonuç sayısı */
  totalCount: number;
  /** Arama sorgusu */
  query: string;
}
