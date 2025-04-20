import { create } from 'zustand';
import { Event, Facility, Partner, SearchItem } from '../types/index';
import { dummyEvents, dummyFacilities, dummyPartners, dummySearchData } from './mockData';
import { Animated } from 'react-native';

interface FindState {
  // State
  events: Event[];
  facilities: Facility[];
  partners: Partner[];
  searchData: SearchItem[];
  searchQuery: string;
  selectedSportFilter: string | null;
  showAllEvents: boolean;
  activeTab: 'events' | 'facilities' | 'partners';
  joinedEventIds: string[];
  connectedPartnerIds: string[];
  isLoading: boolean;
  showFacilitiesSkeleton: boolean;
  selectedEvent: Event | null;
  showEventPopup: boolean;
  error: string | null;
  connectionRequestSentTo: string | null;
  requestSuccessAnimation: Animated.Value;
  selectedDate: Date | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSportFilter: (filter: string | null) => void;
  setShowAllEvents: (value: boolean) => void;
  setActiveTab: (tab: 'events' | 'facilities' | 'partners') => void;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  connectPartner: (partnerId: string) => void;
  disconnectPartner: (partnerId: string) => void;
  loadFacilities: () => Promise<void>;
  loadEvents: () => Promise<void>;
  loadPartners: () => Promise<void>;
  selectEvent: (event: Event | null) => void;
  setShowEventPopup: (value: boolean) => void;
  resetView: () => void;
  setConnectionRequestSentTo: (partnerId: string | null) => void;
  setSelectedDate: (date: Date | null) => void;
  getFilteredEvents: () => Event[];
  getFilteredFacilities: () => Facility[];
  getFilteredPartners: () => Partner[];
}

// API çağrılarını simüle eden fonksiyonlar
const fetchEvents = (): Promise<Event[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(dummyEvents);
    }, 300);
  });
};

const fetchFacilities = (): Promise<Facility[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(dummyFacilities);
    }, 400);
  });
};

const fetchPartners = (): Promise<Partner[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(dummyPartners);
    }, 200);
  });
};

export const useFindStore = create<FindState>((set, get) => ({
  // Initial state
  events: [],
  facilities: [],
  partners: [],
  searchData: dummySearchData,
  searchQuery: '',
  selectedSportFilter: null,
  showAllEvents: false,
  activeTab: 'events',
  joinedEventIds: [],
  connectedPartnerIds: [],
  isLoading: true,
  showFacilitiesSkeleton: true,
  selectedEvent: null,
  showEventPopup: false,
  error: null,
  connectionRequestSentTo: null,
  requestSuccessAnimation: new Animated.Value(0),
  selectedDate: null,

  // Actions
  setSearchQuery: query => set({ searchQuery: query }),

  setSportFilter: filter => set({ selectedSportFilter: filter }),

  setShowAllEvents: value => set({ showAllEvents: value }),

  setActiveTab: tab => set({ activeTab: tab }),

  joinEvent: eventId =>
    set(state => ({
      joinedEventIds: [...state.joinedEventIds, eventId],
    })),

  leaveEvent: eventId =>
    set(state => ({
      joinedEventIds: state.joinedEventIds.filter(id => id !== eventId),
    })),

  connectPartner: partnerId => {
    const state = get();

    // Eğer zaten bağlantı kurulduysa bağlantıyı iptal et
    if (state.connectedPartnerIds.includes(partnerId)) {
      set(state => ({
        connectedPartnerIds: state.connectedPartnerIds.filter(id => id !== partnerId),
      }));
      return;
    }

    // Direkt olarak bağlantı kuruldu olarak işaretle
    set(state => ({
      connectedPartnerIds: [...state.connectedPartnerIds, partnerId],
    }));
  },

  disconnectPartner: partnerId =>
    set(state => ({
      connectedPartnerIds: state.connectedPartnerIds.filter(id => id !== partnerId),
    })),

  loadFacilities: async () => {
    set({ isLoading: true, showFacilitiesSkeleton: true, error: null });
    try {
      const facilities = await fetchFacilities();
      set({
        facilities: facilities.sort((a, b) => {
          const distanceA = parseFloat(a.distance.split(' ')[0]);
          const distanceB = parseFloat(b.distance.split(' ')[0]);
          return distanceA - distanceB;
        }),
        isLoading: false,
        showFacilitiesSkeleton: false,
      });
    } catch (error) {
      console.error('Tesisler yüklenirken hata oluştu:', error);
      set({
        isLoading: false,
        showFacilitiesSkeleton: false,
        error: 'Tesisler yüklenirken hata oluştu',
      });
    }
  },

  loadEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await fetchEvents();
      set({
        events: events.sort((a, b) => {
          const distanceA = parseFloat(a.distance.split(' ')[0]);
          const distanceB = parseFloat(b.distance.split(' ')[0]);
          return distanceA - distanceB;
        }),
        isLoading: false,
      });
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata oluştu:', error);
      set({
        isLoading: false,
        error: 'Etkinlikler yüklenirken hata oluştu',
      });
    }
  },

  loadPartners: async () => {
    set({ isLoading: true, error: null });
    try {
      const partners = await fetchPartners();
      set({
        partners: partners,
        isLoading: false,
      });
    } catch (error) {
      console.error('Spor arkadaşları yüklenirken hata oluştu:', error);
      set({
        isLoading: false,
        error: 'Spor arkadaşları yüklenirken hata oluştu',
      });
    }
  },

  selectEvent: event => set({ selectedEvent: event }),

  setShowEventPopup: value => set({ showEventPopup: value }),

  resetView: () =>
    set({
      showAllEvents: false,
      selectedSportFilter: null,
      searchQuery: '',
      showEventPopup: false,
      selectedEvent: null,
    }),

  setConnectionRequestSentTo: partnerId => set({ connectionRequestSentTo: partnerId }),

  setSelectedDate: date => set({ selectedDate: date }),

  // Getter fonksiyonları
  getFilteredEvents: () => {
    const state = get();
    return state.events
      .filter(event => {
        // Arama filtresi
        if (
          state.searchQuery &&
          !event.title.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
          !event.sportType.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
          !event.location.toLowerCase().includes(state.searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Spor türü filtresi
        if (
          state.selectedSportFilter &&
          state.selectedSportFilter !== 'Tümü' &&
          event.sportType !== state.selectedSportFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const distanceA = parseFloat(a.distance.split(' ')[0]);
        const distanceB = parseFloat(b.distance.split(' ')[0]);
        return distanceA - distanceB;
      });
  },

  getFilteredFacilities: () => {
    const state = get();
    return state.facilities
      .filter(facility => {
        // Arama filtresi
        if (
          state.searchQuery &&
          !facility.name.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
          !facility.sportType.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
          !facility.location.toLowerCase().includes(state.searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const distanceA = parseFloat(a.distance.split(' ')[0]);
        const distanceB = parseFloat(b.distance.split(' ')[0]);
        return distanceA - distanceB;
      });
  },

  getFilteredPartners: () => {
    const state = get();
    return state.partners.filter(partner => {
      // Arama filtresi
      if (
        state.searchQuery &&
        !partner.name.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
        !partner.preferredSports?.some(sport =>
          sport.toLowerCase().includes(state.searchQuery.toLowerCase()),
        ) &&
        !partner.distance.toLowerCase().includes(state.searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  },
}));
