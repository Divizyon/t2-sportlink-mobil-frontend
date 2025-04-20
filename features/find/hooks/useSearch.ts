import { useMemo } from 'react';
import { useFindStore } from '../store/findStore';

export const useSearch = () => {
  const { searchQuery, searchData, events, setSearchQuery } = useFindStore(state => ({
    searchQuery: state.searchQuery,
    searchData: state.searchData,
    events: state.events,
    setSearchQuery: state.setSearchQuery,
  }));

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return searchData.filter(
      item =>
        item.title.toLowerCase().includes(query) ||
        item.sportType.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query),
    );
  }, [searchQuery, searchData]);

  const getMatchedEvent = (title: string) => {
    return events.find(e => e.title === title);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    searchResults,
    getMatchedEvent,
    setSearchQuery,
    clearSearch,
  };
};
