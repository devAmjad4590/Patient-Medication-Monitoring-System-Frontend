import React, { createContext, useContext, useState, useCallback } from 'react';

const ScreenRefreshContext = createContext();

export const useScreenRefresh = () => {
  const context = useContext(ScreenRefreshContext);
  if (!context) {
    throw new Error('useScreenRefresh must be used within ScreenRefreshProvider');
  }
  return context;
};

export const ScreenRefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback((screenName) => {
    console.log(`Triggering refresh for screen: ${screenName}`);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const triggerAllScreensRefresh = useCallback(() => {
    console.log('Triggering refresh for all screens');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const value = {
    refreshTrigger,
    triggerRefresh,
    triggerAllScreensRefresh,
  };

  return (
    <ScreenRefreshContext.Provider value={value}>
      {children}
    </ScreenRefreshContext.Provider>
  );
};