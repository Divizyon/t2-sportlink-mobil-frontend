import { useMemo } from 'react';
import { useFindStore } from '../store/findStore';
import { Event } from '../types/index';

export const useEvents = () => {
  const {
    events,
    searchQuery,
    selectedSportFilter,
    selectedDate,
    selectedEvent,
    showEventPopup,
    joinedEventIds,
  } = useFindStore(state => ({
    events: state.events,
    searchQuery: state.searchQuery,
    selectedSportFilter: state.selectedSportFilter,
    selectedDate: state.selectedDate,
    selectedEvent: state.selectedEvent,
    showEventPopup: state.showEventPopup,
    joinedEventIds: state.joinedEventIds,
  }));

  const { selectEvent, setShowEventPopup, joinEvent, leaveEvent, setSportFilter, setSelectedDate } =
    useFindStore(state => ({
      selectEvent: state.selectEvent,
      setShowEventPopup: state.setShowEventPopup,
      joinEvent: state.joinEvent,
      leaveEvent: state.leaveEvent,
      setSportFilter: state.setSportFilter,
      setSelectedDate: state.setSelectedDate,
    }));

  // Etkinlikleri mesafeye göre sırala
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const distanceA = parseFloat(a.distance.split(' ')[0]);
      const distanceB = parseFloat(b.distance.split(' ')[0]);
      return distanceA - distanceB;
    });
  }, [events]);

  // Spor türleri
  const sportTypes = useMemo(() => {
    return ['Tümü', ...Array.from(new Set(events.map(event => event.sportType)))];
  }, [events]);

  // Filtrelenmiş etkinlikler - önce arama sonra spor türü filtrelemesi
  const filteredEvents = useMemo(() => {
    return sortedEvents.filter(event => {
      // Arama filtresi
      if (
        searchQuery &&
        !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.sportType.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Spor türü filtresi
      if (
        selectedSportFilter &&
        selectedSportFilter !== 'Tümü' &&
        event.sportType !== selectedSportFilter
      ) {
        return false;
      }

      return true;
    });
  }, [sortedEvents, searchQuery, selectedSportFilter]);

  // Tarihe göre filtreleme fonksiyonu
  const filteredEventsByDate = useMemo(() => {
    if (!selectedDate) return filteredEvents;

    // Gerçek bir tarih filteresi burada uygulanabilir
    // Şimdilik sadece veriyi döndürüyoruz
    return filteredEvents;
  }, [filteredEvents, selectedDate]);

  // Etkinliğe katılma durumunu kontrol et
  const isJoined = (eventId: number) => joinedEventIds.includes(eventId);

  // Etkinlik detaylarını göster
  const showEventDetails = (event: Event) => {
    selectEvent(event);
    setShowEventPopup(true);
  };

  // Etkinlik popupını kapat
  const closeEventPopup = () => {
    setShowEventPopup(false);
  };

  // Tarih filtresini temizle
  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  return {
    events,
    sortedEvents,
    filteredEvents,
    filteredEventsByDate,
    sportTypes,
    selectedEvent,
    showEventPopup,
    joinedEventIds,
    isJoined,
    showEventDetails,
    closeEventPopup,
    joinEvent,
    leaveEvent,
    setSportFilter,
    setSelectedDate,
    clearDateFilter,
  };
};
