import { SportsFacility, SportIconMap, SportColorMap } from '../types/sportsFacilities.types';

/**
 * Konya Spor Alanları Veri Seti
 * Kullanıcı tarafından sağlanan gerçek veriler
 */
export const sportsFacilitiesData: SportsFacility[] = [
  // YÜZME TESİSLERİ
  {
    sport: "Yüzme",
    name: "Selçuklu Belediyesi Beyhekim Yüzme Havuzu",
    address: "Beyhekim, Ali Demirtaş Sk. No:4, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: 37.901018,
    longitude: 32.468046,
    maps_url: "https://www.google.com/maps/search/?api=1&query=37.901018,32.468046",
    image_url: "https://cdn0.selcuklu.bel.tr/selcuklu.bel.tr/NewsGallery/2025/01/02/55dd-09172015153520beyhekim_yuzme_havuzu_4_-_Kopya.JPG"
  },
  {
    sport: "Yüzme",
    name: "Selçuklu Belediyesi Sancak Yüzme Havuzu",
    address: "Sancak Mah. Veysel Karani Cd. No:15/1, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: 37.956473,
    longitude: 32.482044,
    maps_url: "https://www.google.com/maps/search/?api=1&query=37.956473,32.482044",
    image_url: "https://selcuklubelediyespor.com/wp-content/uploads/2025/04/14-sancak-yuzme-havuzu.jpeg"
  },
  {
    sport: "Yüzme",
    name: "Celalettin Karatay Kapalı Yüzme Havuzu (Maxpora Spor Kompleksi)",
    address: "Akabe Mah., Alaaddin Kap Cd. No:128, Karatay/Konya",
    district: "Karatay",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Celalettin%20Karatay%20Kapalı%20Yüzme%20Havuzu%20Karatay%20Konya",
    image_url: "https://bahcehavuz.com/f/2023/05/Maxpora-Yuzme-Havuzu-%E2%80%93-Konya.jpg"
  },

  // TENİS KORTLARI
  {
    sport: "Tenis",
    name: "Selçuklu Belediyesi Tenis Kortu",
    address: "Yazır Mah., Fadıl Sk. No:19/2, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: 37.953802,
    longitude: 32.496222,
    maps_url: "https://www.google.com/maps/search/?api=1&query=37.953802,32.496222",
    image_url: "https://cdn0.selcuklu.bel.tr/selcuklu.bel.tr/NewsGallery/2025/01/02/6e87-01272016130531tenis_kortu__1.jpg"
  },
  {
    sport: "Tenis",
    name: "Karatay Belediyesi Kapalı Tenis Kortu",
    address: "Ulubatlıhasan Mah., Karatay/Konya",
    district: "Karatay",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Karatay%20Belediyesi%20Kapalı%20Tenis%20Kortu%20Konya",
    image_url: "https://www.karatay.bel.tr/haber/resim1/13784/karatay-belediyesi-kapali-tenis-kortu-acildi.jpg-1500.jpg"
  },
  {
    sport: "Tenis",
    name: "Vole Tenis ve Spor Kulübü",
    address: "Feritpaşa Mh., Gökçe Bayır Sk. Kardelen Sitesi No:3/A, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Vole%20Tenis%20ve%20Spor%20Kulübü%20Konya",
    image_url: "https://voletenis.com/wp-content/uploads/2019/02/WhatsApp-Image-2019-01-03-at-17.03.311-300x223.jpeg"
  },

  // BASKETBOL VE SALON SPORLARI
  {
    sport: "Basketbol/Salon Sporları",
    name: "Selçuklu Belediyesi Uluslararası Spor Salonu",
    address: "Parsana Mah., Kerem Sk. No:2, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: 37.8794055,
    longitude: 32.4678191,
    maps_url: "https://www.google.com/maps/search/?api=1&query=37.8794055,32.4678191",
    image_url: null
  },
  {
    sport: "Basketbol/Salon Sporları",
    name: "Yenikent Spor Salonu",
    address: "Yazır Mah., Akkonak Sk. No:10, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Yenikent%20Spor%20Salonu%20Selçuklu%20Konya",
    image_url: "https://selcuklubelediyespor.com/wp-content/uploads/2025/04/02-yenikent-spor-salonu.jpeg"
  },


  // FUTBOL TESİSLERİ
  {
    sport: "Futbol (Halı Saha)",
    name: "Yazır Halı Saha",
    address: "Selahaddini Eyyübi Mah., İnce Mehmet Sk. No:2, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Yazır%20Halı%20Saha%20Selçuklu%20Konya",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd5Gu8NegIbm6LosgELJLEU5cuhqtLK7nknQ&s"
  },

  {
    sport: "Futbol (Stadyum/Amatör)",
    name: "Selçuklu Belediye Stadı",
    address: "Şeyh Şamil Mah., Serçe Saray Sk., Selçuklu/Konya",
    district: "Selçuklu",
    latitude: 37.8870147,
    longitude: 32.4545301,
    maps_url: "https://www.google.com/maps/search/?api=1&query=37.8870147,32.4545301",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoQJomPnayAmzayDpIQujRTXXVN6ePzkZv8Q&s"
  },

  // FİTNESS MERKEZLERİ
  {
    sport: "Fitness",
    name: "GYMFIT Kent Plaza",
    address: "Kent Plaza AVM, Bedir Mah. Ataseven Cd. No:2, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Kent%20Plaza%20AVM%20GYMFIT%20Konya",
    image_url: "https://www.gymfit.com.tr/frontend/images/slides/3633076318.jpg"
  },
  {
    sport: "Fitness",
    name: "Maxon Sports Club",
    address: "Selçuklu/Konya (Merkez)",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Maxon%20Sports%20Club%20Konya",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHwyjzSFhpcrfQI0jdeqEE86eIOp113LOg0w&s"
  },

  // DÖVÜŞ SPORLARI
  {
    sport: "Dövüş Sporları",
    name: "Yolcu Jiu Jitsu MMA Konya",
    address: "Doğuş Mah., Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Yolcu%20Jiu%20Jitsu%20MMA%20Konya",
    image_url: "https://avatars.mds.yandex.net/get-altay/1583511/2a0000016ff5d8e45ca2144813aa6dc8c966/orig"
  },


  // OKÇULUK
  {
    sport: "Okçuluk",
    name: "Dutlu Millet Bahçesi (Geleneksel Okçuluk Alanı)",
    address: "Dutlu Millet Bahçesi, Meram/Konya",
    district: "Meram",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Dutlu%20Millet%20Bahçesi%20Meram%20Konya",
    image_url: "https://konyabulteni.com/wp-content/uploads/2021/08/okculuk_meram3-scaled.jpg"
  },
  {
    sport: "Okçuluk",
    name: "Karatepe Binicilik ve Tenis Kulübü (Atlı/Yaya Okçuluk)",
    address: "Karahüyük Mah., Karatepe Sk. No:28, Meram/Konya",
    district: "Meram",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Karatepe%20Binicilik%20ve%20Tenis%20Kulübü%20Konya",
    image_url: null
  },

  // KAYKAY
  {
    sport: "Kaykay (Skateboard)",
    name: "Berlika Parkı Kaykay Pisti",
    address: "Berlika Parkı, Meram/Konya",
    district: "Meram",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Berlika%20Parkı%20Meram%20Konya",
    image_url: null
  },

  // BOWLING
  {
    sport: "Bowling",
    name: "Play Bowling (Novada/Novaland Outlet Konya)",
    address: "Sancak Mah., Veysel Karani Cd., Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Novada%20Bowling%20Konya",
    image_url: null
  },
  {
    sport: "Bowling",
    name: "Maxi Park Bowling (Kulesite AVM)",
    address: "Feritpaşa Mah., Kule Cd. No:8, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Kulesite%20AVM%20Bowling%20Konya",
    image_url: null
  },

  // GO-KART
  {
    sport: "Go-kart",
    name: "Konya Karting (KonyaGoKart)",
    address: "Büyükkumköy Yazır 98, Karatay/Konya",
    district: "Karatay",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Konya%20Karting%20Büyükkumköy%20Yazır%2098%20Karatay",
    image_url: null
  },

  // TIRMA SPORU
  {
    sport: "Tırmanış (Bouldering/Spor Tırmanış)",
    name: "Walland Sport Climbing (Kentplaza AVM)",
    address: "Kent Plaza AVM, Bedir Mah. Ataseven Cd. No:2, Selçuklu/Konya",
    district: "Selçuklu",
    latitude: null,
    longitude: null,
    maps_url: "https://www.google.com/maps/search/?api=1&query=Walland%20Sport%20Climbing%20Konya",
    image_url: null
  }
];

/**
 * Spor türlerine göre icon mapping
 */
export const sportIconMap: SportIconMap = {
  'Yüzme': 'water-outline',
  'Tenis': 'tennisball-outline',
  'Basketbol/Salon Sporları': 'basketball-outline',
  'Futbol (Halı Saha)': 'football-outline',
  'Futbol (Stadyum/Amatör)': 'football-outline',
  'Fitness': 'fitness-outline',
  'Dövüş Sporları': 'barbell-outline',
  'Okçuluk': 'radio-outline',
  'Kaykay (Skateboard)': 'bicycle-outline',
  'Bowling': 'ellipse-outline',
  'Go-kart': 'car-sport-outline',
  'Tırmanış (Bouldering/Spor Tırmanış)': 'trail-sign-outline'
};

/**
 * Spor türlerine göre renk mapping
 */
export const sportColorMap: SportColorMap = {
  'Yüzme': '#00B4D8',              // Mavi
  'Tenis': '#90E0EF',              // Açık mavi
  'Basketbol/Salon Sporları': '#F77F00',   // Turuncu
  'Futbol (Halı Saha)': '#2D6A4F',         // Yeşil
  'Futbol (Stadyum/Amatör)': '#40916C',    // Açık yeşil
  'Fitness': '#D62828',                    // Kırmızı
  'Dövüş Sporları': '#6F2DBD',             // Mor
  'Okçuluk': '#E85D04',                    // Turuncu
  'Kaykay (Skateboard)': '#F48C06',        // Sarı
  'Bowling': '#9D4EDD',                    // Açık mor
  'Go-kart': '#F72585',                    // Pembe
  'Tırmanış (Bouldering/Spor Tırmanış)': '#8B5CF6'  // Mor
};

/**
 * Mevcut spor türleri listesi
 */
export const availableSports = Array.from(new Set(sportsFacilitiesData.map(facility => facility.sport)));

/**
 * Mevcut ilçeler listesi
 */
export const availableDistricts = Array.from(new Set(sportsFacilitiesData.map(facility => facility.district)));

/**
 * İlçe bazında tesis sayıları
 */
export const facilitiesByDistrict = availableDistricts.map(district => ({
  district,
  count: sportsFacilitiesData.filter(facility => facility.district === district).length
}));

/**
 * Spor türü bazında tesis sayıları
 */
export const facilitiesBySport = availableSports.map(sport => ({
  sport,
  count: sportsFacilitiesData.filter(facility => facility.sport === sport).length
}));
