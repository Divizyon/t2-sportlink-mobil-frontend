  import { create } from 'zustand';
  import Constants from 'expo-constants';

  const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.GOOGLE_PLACES_API_KEY || '';


  interface Facility {
    id: string;
    name: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
    rating?: number;
    photos?: string[];
    distance?: number;
    type: 'basketball' | 'football' | 'tennis' | 'swimming' | 'gym';
    openNow?: boolean;
    placeId: string;
  }

  interface FacilitiesState {
    facilities: Facility[];
    isLoading: boolean;
    error: string | null;
    selectedType: string | null;
    
    // Actions
    setSelectedType: (type: string | null) => void;
    fetchNearbyFacilities: (latitude: number, longitude: number, type?: string) => Promise<void>;
    clearFacilities: () => void;
  }

  export const useFacilitiesStore = create<FacilitiesState>((set, get) => ({
    facilities: [],
    isLoading: false,
    error: null,
    selectedType: null,
    
    setSelectedType: (type) => set({ selectedType: type }),
    
    fetchNearbyFacilities: async (latitude: number, longitude: number, type?: string) => {
      set({ isLoading: true, error: null });
      
      try {
        if (!GOOGLE_PLACES_API_KEY) {
          console.error('Google Places API anahtarı bulunamadı');
          throw new Error('Google Places API anahtarı tanımlanmamış. Lütfen yöneticinizle iletişime geçin.');
        }

        console.log('Tesisler aranıyor...', { latitude, longitude, type });

        const radius = 5000; // 5km yarıçap
        let searchType = '';
        let keyword = '';
        
        // Tesis tipine göre arama parametrelerini ayarla
        switch (type) {
          case 'basketball':
            keyword = 'basketbol sahası basketball court';
            searchType = 'stadium';
            break;
          case 'football':
            keyword = 'futbol sahası soccer field';
            searchType = 'stadium';
            break;
          case 'tennis':
            keyword = 'tenis kortu tennis court';
            searchType = 'stadium';
            break;
          case 'swimming':
            keyword = 'yüzme havuzu swimming pool';
            searchType = 'swimming_pool';
            break;
          case 'gym':
            keyword = 'spor salonu fitness gym';
            searchType = 'gym';
            break;
          default:
            keyword = 'spor tesisi sports facility';
            searchType = 'stadium';
        }
        
        // API URL'ini oluştur
        const params = new URLSearchParams({
          location: `${latitude},${longitude}`,
          radius: radius.toString(),
          keyword: keyword,
          language: 'tr',
          key: GOOGLE_PLACES_API_KEY
        });
        
        if (searchType) {
          params.append('type', searchType);
        }
        
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
        
        console.log('Places API isteği gönderiliyor...');
        console.log('Sorgu parametreleri:', {
          location: `${latitude},${longitude}`,
          radius,
          keyword,
          type: searchType,
          language: 'tr'
        });
        
        try {
          const response = await fetch(url);
          console.log('API yanıt durumu:', response.status, response.statusText);
          
          if (!response.ok) {
            console.error('HTTP hata durumu:', response.status, response.statusText);
            throw new Error(`API yanıt hatası: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          console.log('Places API yanıtı:', {
            status: data.status,
            resultCount: data.results?.length || 0,
            errorMessage: data.error_message || 'Hata mesajı yok'
          });
          
          // REQUEST_DENIED hatası için daha kullanıcı dostu mesaj
          if (data.status === 'REQUEST_DENIED') {
            console.error('Places API erişim hatası:', data.error_message);
            throw new Error(`Google Places API ile iletişim kurulamıyor. API anahtarı yapılandırmasını kontrol edin. (Hata: "${data.error_message}")`);
          }
          
          // Diğer hatalar için
          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Places API hata durumu:', data.status, data.error_message);
            throw new Error(`API Hatası: ${data.status} - ${data.error_message || 'Bilinmeyen hata'}`);
          }
          
          const facilities: Facility[] = (data.results || []).map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity || 'Adres bilgisi yok',
            location: {
              latitude: place.geometry?.location?.lat || latitude,
              longitude: place.geometry?.location?.lng || longitude,
            },
            rating: place.rating,
            photos: place.photos?.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            ) || [],
            distance: place.distance, // Google Places API mesafeyi metre cinsinden döndürür
            type: type || 'gym',
            openNow: place.opening_hours?.open_now,
            placeId: place.place_id
          }));
          
          console.log(`${facilities.length} tesis bulundu.`);
          
          set({ facilities, isLoading: false });
        } catch (apiError) {
          console.error('API isteği başarısız:', apiError);
          throw new Error(`Places API isteği başarısız: ${apiError instanceof Error ? apiError.message : 'Bilinmeyen hata'}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
        console.error('Tesis arama hatası:', errorMessage);
        
        // Daha açıklayıcı hata mesajı
        let userFriendlyError = errorMessage;
        
        if (errorMessage.includes('REQUEST_DENIED') || errorMessage.includes('not authorized')) {
          userFriendlyError = 'Google Places API anahtarı yetkilendirilmemiş. Lütfen Google Cloud Console\'da Places API\'yi etkinleştirin.';
        } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
          userFriendlyError = 'Places API sorgu limiti aşıldı. Lütfen daha sonra tekrar deneyin.';
        }
        
        set({ error: `Tesisler yüklenirken bir hata oluştu: ${userFriendlyError}`, isLoading: false });
      }
    },
    
    clearFacilities: () => set({ facilities: [], error: null }),
  })); 