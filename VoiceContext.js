import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VoiceContext = createContext();

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
};

export const VoiceProvider = ({ children }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load voice settings from storage
  const loadVoiceSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedSetting = await AsyncStorage.getItem('voiceCommandEnabled');
      const enabled = storedSetting === 'true';
      setIsVoiceEnabled(enabled);
      console.log('Voice settings loaded:', enabled);
    } catch (error) {
      console.error('Error loading voice settings:', error);
      setIsVoiceEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save voice settings to storage
  const toggleVoiceCommand = useCallback(async (enabled) => {
    try {
      setIsVoiceEnabled(enabled);
      await AsyncStorage.setItem('voiceCommandEnabled', enabled.toString());
      console.log('Voice settings saved:', enabled);
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  }, []);

  // AUTO-LOAD SETTINGS ON COMPONENT MOUNT
  useEffect(() => {
    loadVoiceSettings();
  }, [loadVoiceSettings]);

  const value = {
    isVoiceEnabled,
    isLoading,
    loadVoiceSettings,
    toggleVoiceCommand,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};