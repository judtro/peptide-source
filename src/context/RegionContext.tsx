import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Region } from '@/types';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  showRegionModal: boolean;
  setShowRegionModal: (show: boolean) => void;
  showAllMarkets: boolean;
  setShowAllMarkets: (show: boolean) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<Region>('US');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  useEffect(() => {
    const savedRegion = localStorage.getItem('chemverify-region') as Region | null;
    const savedShowAll = localStorage.getItem('chemverify-show-all-markets');
    
    if (savedRegion) {
      setRegionState(savedRegion);
    } else {
      // Show region modal on first visit
      setShowRegionModal(true);
      // Default detection mock - in production would use IP geolocation
      setRegionState('US');
    }
    
    if (savedShowAll === 'true') {
      setShowAllMarkets(true);
    }
  }, []);

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    localStorage.setItem('chemverify-region', newRegion);
  };

  const handleSetShowAllMarkets = (show: boolean) => {
    setShowAllMarkets(show);
    localStorage.setItem('chemverify-show-all-markets', String(show));
  };

  return (
    <RegionContext.Provider value={{ 
      region, 
      setRegion, 
      showRegionModal, 
      setShowRegionModal,
      showAllMarkets,
      setShowAllMarkets: handleSetShowAllMarkets
    }}>
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
