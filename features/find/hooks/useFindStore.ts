import { useEffect } from 'react';
import { useFindStore as useStore } from '../store/findStore';

/**
 * Find feature veri yönetimi için özel hook
 * Veri yükleme işlemlerini otomatik olarak başlatır ve
 * ilgili state'lere ve action'lara kolay erişim sağlar
 */
export const useFindStore = () => {
  // Store'dan state ve action'ları çek
  const {
    // State
    events,
    facilities,
    partners,
    searchQuery,
    selectedSportFilter,
    showAllEvents,
    activeTab,
    joinedEventIds,
    connectedPartnerIds,
    isLoading,
    showFacilitiesSkeleton,
    selectedEvent,
    showEventPopup,
    error,
    selectedDate,

    // Actions
    loadEvents,
    loadFacilities,
    loadPartners,
    setSearchQuery,
    setSportFilter,
    setShowAllEvents,
    setActiveTab,
    joinEvent,
    leaveEvent,
    connectPartner,
    disconnectPartner,
    selectEvent,
    setShowEventPopup,
    resetView,
    setSelectedDate,
    getFilteredEvents,
    getFilteredFacilities,
    getFilteredPartners,
  } = useStore();

  // Component mount olduğunda verileri yükle
  useEffect(() => {
    loadEvents();
    loadFacilities();
    loadPartners();
  }, [loadEvents, loadFacilities, loadPartners]);

  // Hook'tan kullanılabilecek tüm state ve action'ları döndür
  return {
    // State
    events,
    facilities,
    partners,
    searchQuery,
    selectedSportFilter,
    showAllEvents,
    activeTab,
    joinedEventIds,
    connectedPartnerIds,
    isLoading,
    showFacilitiesSkeleton,
    selectedEvent,
    showEventPopup,
    error,
    selectedDate,

    // Filtrelenmiş veriler
    filteredEvents: getFilteredEvents(),
    filteredFacilities: getFilteredFacilities(),
    filteredPartners: getFilteredPartners(),

    // Actions
    loadEvents,
    loadFacilities,
    loadPartners,
    setSearchQuery,
    setSportFilter,
    setShowAllEvents,
    setActiveTab,
    joinEvent,
    leaveEvent,
    connectPartner,
    disconnectPartner,
    selectEvent,
    setShowEventPopup,
    resetView,
    setSelectedDate,

    // Helper functions
    isEventJoined: (eventId: string) => joinedEventIds.includes(eventId),
    isPartnerConnected: (partnerId: string) => connectedPartnerIds.includes(partnerId),
  };
};

export default useFindStore;
