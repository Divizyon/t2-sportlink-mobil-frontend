import { useFindStore } from '../store/findStore';

export const useFacilities = () => {
  const { facilities, isLoading, showFacilitiesSkeleton, error } = useFindStore(state => ({
    facilities: state.facilities,
    isLoading: state.isLoading,
    showFacilitiesSkeleton: state.showFacilitiesSkeleton,
    error: state.error,
  }));

  const { loadFacilities } = useFindStore(state => ({
    loadFacilities: state.loadFacilities,
  }));

  // Tesisleri keşfet fonksiyonu
  const exploreFacilities = () => {
    loadFacilities();
  };

  return {
    facilities,
    isLoading,
    showFacilitiesSkeleton,
    error,
    exploreFacilities,
  };
};
