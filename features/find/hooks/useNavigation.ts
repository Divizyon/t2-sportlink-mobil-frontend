import { useFindStore } from '../store/findStore';

export const useNavigation = () => {
  const { showAllEvents, activeTab } = useFindStore(state => ({
    showAllEvents: state.showAllEvents,
    activeTab: state.activeTab,
  }));

  const { setShowAllEvents, setActiveTab, resetView } = useFindStore(state => ({
    setShowAllEvents: state.setShowAllEvents,
    setActiveTab: state.setActiveTab,
    resetView: state.resetView,
  }));

  // Tüm etkinlikleri göster
  const handleShowAllEvents = () => {
    setShowAllEvents(true);
    setActiveTab('events');
  };

  // Tüm tesisleri göster
  const handleShowAllFacilities = () => {
    setShowAllEvents(true);
    setActiveTab('facilities');
  };

  // Tüm spor arkadaşlarını göster
  const handleShowAllPartners = () => {
    setShowAllEvents(true);
    setActiveTab('partners');
  };

  // Ana ekrana dön
  const handleReturnToMainView = () => {
    resetView();
  };

  return {
    showAllEvents,
    activeTab,
    handleShowAllEvents,
    handleShowAllFacilities,
    handleShowAllPartners,
    handleReturnToMainView,
  };
};
