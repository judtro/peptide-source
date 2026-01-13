import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Region } from '@/types';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  showRegionModal: boolean;
  setShowRegionModal: (show: boolean) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<Region>('US');
  const [showRegionModal, setShowRegionModal] = useState(false);

  useEffect(() => {
    const savedRegion = localStorage.getItem('chemverify-region') as Region | null;
    if (savedRegion) {
      setRegionState(savedRegion);
    } else {
      // Show region modal on first visit
      setShowRegionModal(true);
      // Default detection mock - in production would use IP geolocation
      setRegionState('US');
    }
  }, []);

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    localStorage.setItem('chemverify-region', newRegion);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, showRegionModal, setShowRegionModal }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextType => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
