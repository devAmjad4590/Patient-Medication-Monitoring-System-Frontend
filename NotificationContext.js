import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedNotifications = await AsyncStorage.getItem('notificationsHistory');
      console.log("Raw stored notifications:", storedNotifications);

      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        console.log("Parsed notifications:", parsedNotifications);
        
        // Sort by date (newest first)
        const sortedNotifications = parsedNotifications.sort((a, b) => {
          const dateA = new Date(a.date || a.timestamp || 0);
          const dateB = new Date(b.date || b.timestamp || 0);
          return dateB - dateA;
        });
        setNotifications(sortedNotifications);
      } else {
        console.log("No stored notifications found");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem('notificationsHistory');
      console.log("Notifications cleared");
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  }, []);

  const value = {
    notifications,
    isLoading,
    loadNotifications,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};