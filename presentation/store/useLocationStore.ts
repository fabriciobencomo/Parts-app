import { create } from 'zustand';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  zone: string;
}

interface LocationStore {
  selectedLocation: LocationData | null;
  setSelectedLocation: (location: LocationData | null) => void;
  clearSelectedLocation: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  selectedLocation: null,
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  clearSelectedLocation: () => set({ selectedLocation: null }),
}));
