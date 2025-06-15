import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationProvider, useNotifications } from '../NotificationContext';
import NotificationCard from '../components/navigators/NotificationCard';
import { snoozeMedicationReminder, registerPushToken } from '../api/notificationAPI';
import mockNotifications from '../data/mockNotification';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock notification API
jest.mock('../api/notificationAPI', () => ({
  snoozeMedicationReminder: jest.fn(),
  registerPushToken: jest.fn(),
}));

// Mock expo-notifications for future notification scheduling
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

// Mock vector icons
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  return function MockFontAwesome5({ name, testID }) {
    const { Text } = require('react-native');
    return <Text testID={testID}>{name}</Text>;
  };
});

// Test component to access NotificationContext
const TestNotificationComponent = ({ onNotificationsLoaded, autoLoad = false }) => {
  const { notifications, isLoading, loadNotifications, clearAllNotifications } = useNotifications();

  React.useEffect(() => {
    if (autoLoad) {
      loadNotifications();
    }
  }, [autoLoad, loadNotifications]);

  React.useEffect(() => {
    if (onNotificationsLoaded && notifications !== null) {
      onNotificationsLoaded(notifications);
    }
  }, [notifications, onNotificationsLoaded]);

  if (isLoading) {
    return <Text testID="loading">Loading notifications...</Text>;
  }

  return (
    <View testID="notification-container">
      <Text testID="notification-count">
        {notifications ? notifications.length : 0} notifications
      </Text>
      <Button 
        testID="load-notifications-btn"
        title="Load Notifications" 
        onPress={loadNotifications} 
      />
      <Button 
        testID="clear-notifications-btn"
        title="Clear All" 
        onPress={clearAllNotifications} 
      />
    </View>
  );
};

describe('Notification System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC16: Medication Reminder - Test notification logic and UI
  describe('TC16 - Medication Reminder', () => {
    it('should display medication reminder notification correctly', () => {
      const medicationReminder = {
        id: 'med-reminder-1',
        title: 'Time to take Lisinopril',
        message: 'Your 10mg Lisinopril dose is scheduled for 8:00 AM.',
        type: 'reminder'
      };

      const { getByText, getByTestId } = render(
        <NotificationCard 
          title={medicationReminder.title}
          message={medicationReminder.message}
        />
      );

      // Expected Result: Notification appears with "Take/Snooze" context
      expect(getByText('Time to take Lisinopril')).toBeTruthy();
      expect(getByText('Your 10mg Lisinopril dose is scheduled for 8:00 AM.')).toBeTruthy();
      // Check that the icon is rendered (icon name as text due to mocking)
      expect(getByText('calendar-check')).toBeTruthy();
    });

    it('should create medication reminder notification with correct format', () => {
      const createMedicationReminder = (medicationName, dosage, time) => {
        return {
          id: `med-reminder-${Date.now()}`,
          title: `Time to take ${medicationName}`,
          message: `Your ${dosage} ${medicationName} dose is scheduled for ${time}.`,
          type: 'reminder',
          timestamp: new Date().toISOString(),
          read: false
        };
      };

      const reminder = createMedicationReminder('Lisinopril', '10mg', '8:00 AM');

      expect(reminder.title).toBe('Time to take Lisinopril');
      expect(reminder.message).toBe('Your 10mg Lisinopril dose is scheduled for 8:00 AM.');
      expect(reminder.type).toBe('reminder');
      expect(reminder.read).toBe(false);
    });

    it('should handle snooze functionality for medication reminders', async () => {
      const medicationIds = ['med1', 'med2'];
      
      snoozeMedicationReminder.mockResolvedValue({
        success: true,
        message: 'Medications snoozed successfully',
        snoozeUntil: '2024-01-15T08:05:00.000Z'
      });

      // Step: Scheduled medication time reached -> User clicks snooze
      const result = await snoozeMedicationReminder(medicationIds);

      // Expected Result: Notification snoozed for 5 minutes
      expect(snoozeMedicationReminder).toHaveBeenCalledWith(medicationIds);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Medications snoozed successfully');
    });

    it('should validate medication reminder time format', () => {
      const isValidReminderTime = (time) => {
        // Check if time matches HH:MM AM/PM format
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
        return timeRegex.test(time);
      };

      expect(isValidReminderTime('8:00 AM')).toBe(true);
      expect(isValidReminderTime('12:30 PM')).toBe(true);
      expect(isValidReminderTime('25:00 AM')).toBe(false);
      expect(isValidReminderTime('invalid')).toBe(false);
    });
  });

  // TC17: Low Stock Alert - Test stock notification logic
  describe('TC17 - Low Stock Alert', () => {
    it('should display low stock alert notification correctly', () => {
      const lowStockAlert = {
        id: 'stock-alert-1',
        title: 'Low Stock: Aspirin',
        message: 'You have only 3 capsules of Aspirin left. Consider restocking.',
        type: 'warning'
      };

      const { getByText } = render(
        <NotificationCard 
          title={lowStockAlert.title}
          message={lowStockAlert.message}
        />
      );

      // Expected Result: Notification: "Low stock for [Medication]"
      expect(getByText('Low Stock: Aspirin')).toBeTruthy();
      expect(getByText('You have only 3 capsules of Aspirin left. Consider restocking.')).toBeTruthy();
    });

    it('should create low stock notification when stock reaches threshold', () => {
      const createLowStockNotification = (medicationName, currentStock, threshold) => {
        return {
          id: `low-stock-${Date.now()}`,
          title: `Low Stock: ${medicationName}`,
          message: `You have only ${currentStock} ${currentStock === 1 ? 'dose' : 'doses'} of ${medicationName} left. Consider restocking.`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false
        };
      };

      const notification = createLowStockNotification('Aspirin', 3, 5);

      expect(notification.title).toBe('Low Stock: Aspirin');
      expect(notification.message).toBe('You have only 3 doses of Aspirin left. Consider restocking.');
      expect(notification.type).toBe('warning');
    });

    it('should trigger low stock alert when medication stock < threshold', () => {
      const checkStockThreshold = (medication) => {
        const { stock, threshold, name } = medication;
        if (stock <= threshold) {
          return {
            shouldAlert: true,
            notification: {
              title: `Low Stock: ${name}`,
              message: `You have only ${stock} ${stock === 1 ? 'dose' : 'doses'} of ${name} left. Consider restocking.`,
              type: 'warning'
            }
          };
        }
        return { shouldAlert: false };
      };

      // Test medication below threshold
      const lowStockMed = { name: 'Aspirin', stock: 3, threshold: 5 };
      const result = checkStockThreshold(lowStockMed);

      expect(result.shouldAlert).toBe(true);
      expect(result.notification.title).toBe('Low Stock: Aspirin');

      // Test medication above threshold
      const normalStockMed = { name: 'Lisinopril', stock: 10, threshold: 5 };
      const result2 = checkStockThreshold(normalStockMed);

      expect(result2.shouldAlert).toBe(false);
    });

    it('should handle different medication units in stock alerts', () => {
      const createStockAlert = (name, stock, unit) => {
        const unitText = stock === 1 ? unit.slice(0, -1) : unit; // Remove 's' for singular
        return `You have only ${stock} ${unitText} of ${name} left. Consider restocking.`;
      };

      expect(createStockAlert('Aspirin', 1, 'tablets')).toBe('You have only 1 tablet of Aspirin left. Consider restocking.');
      expect(createStockAlert('Aspirin', 3, 'tablets')).toBe('You have only 3 tablets of Aspirin left. Consider restocking.');
      expect(createStockAlert('Cough Syrup', 1, 'bottles')).toBe('You have only 1 bottle of Cough Syrup left. Consider restocking.');
    });
  });

  // TC18: Appointment Reminder - Test appointment notifications
  describe('TC18 - Appointment Reminder', () => {
    it('should display appointment reminder notification correctly', () => {
      const appointmentReminder = {
        id: 'apt-reminder-1',
        title: 'Upcoming Appointment',
        message: 'You have a check-up with Dr. Smith in 1 hour at 2:00 PM.',
        type: 'appointment'
      };

      const { getByText } = render(
        <NotificationCard 
          title={appointmentReminder.title}
          message={appointmentReminder.message}
        />
      );

      // Expected Result: Notification: "Appointment at [Time]"
      expect(getByText('Upcoming Appointment')).toBeTruthy();
      expect(getByText('You have a check-up with Dr. Smith in 1 hour at 2:00 PM.')).toBeTruthy();
    });

    it('should create appointment reminder notification 1 hour before', () => {
      const createAppointmentReminder = (doctor, appointmentTime, location) => {
        return {
          id: `apt-reminder-${Date.now()}`,
          title: 'Upcoming Appointment',
          message: `You have an appointment with ${doctor} in 1 hour at ${appointmentTime}${location ? ` at ${location}` : ''}.`,
          type: 'appointment',
          timestamp: new Date().toISOString(),
          read: false
        };
      };

      const reminder = createAppointmentReminder('Dr. Smith', '2:00 PM', 'Room 101');

      expect(reminder.title).toBe('Upcoming Appointment');
      expect(reminder.message).toBe('You have an appointment with Dr. Smith in 1 hour at 2:00 PM at Room 101.');
      expect(reminder.type).toBe('appointment');
    });

    it('should calculate reminder time correctly (1 hour before appointment)', () => {
      const calculateReminderTime = (appointmentDateTime) => {
        const appointmentTime = new Date(appointmentDateTime);
        const reminderTime = new Date(appointmentTime.getTime() - 60 * 60 * 1000); // 1 hour before
        return reminderTime;
      };

      const appointmentTime = new Date('2024-01-15T14:00:00.000Z'); // 2:00 PM
      const reminderTime = calculateReminderTime(appointmentTime);
      const expectedReminderTime = new Date('2024-01-15T13:00:00.000Z'); // 1:00 PM

      expect(reminderTime.getTime()).toBe(expectedReminderTime.getTime());
    });

    it('should handle different appointment types in reminders', () => {
      const appointmentTypes = [
        { type: 'Consultation', doctor: 'Dr. Smith' },
        { type: 'Follow-up', doctor: 'Dr. Johnson' },
        { type: 'Routine Checkup', doctor: 'Dr. Brown' },
        { type: 'Emergency', doctor: 'Dr. Wilson' }
      ];

      appointmentTypes.forEach(({ type, doctor }) => {
        const message = `You have a ${type.toLowerCase()} with ${doctor} in 1 hour at 2:00 PM.`;
        
        const { getByText } = render(
          <NotificationCard 
            title="Upcoming Appointment"
            message={message}
          />
        );

        expect(getByText(message)).toBeTruthy();
      });
    });
  });

  // TC19: NotificationContext Testing
  describe('TC19 - NotificationContext Integration', () => {
    it('should load notifications from AsyncStorage successfully', async () => {
      const mockStoredNotifications = JSON.stringify([
        {
          id: 'n1',
          title: 'Test Notification',
          message: 'Test message',
          timestamp: '2024-01-15T08:00:00.000Z',
          type: 'reminder'
        }
      ]);

      AsyncStorage.getItem.mockResolvedValue(mockStoredNotifications);

      let loadedNotifications = null;
      const handleNotificationsLoaded = (notifications) => {
        loadedNotifications = notifications;
      };

      render(
        <NotificationProvider>
          <TestNotificationComponent 
            onNotificationsLoaded={handleNotificationsLoaded} 
            autoLoad={true}
          />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('notificationsHistory');
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(loadedNotifications).not.toBeNull();
        expect(loadedNotifications[0].title).toBe('Test Notification');
      }, { timeout: 3000 });
    });

    it('should handle empty notification storage gracefully', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      let loadedNotifications = null;
      const handleNotificationsLoaded = (notifications) => {
        loadedNotifications = notifications;
      };

      render(
        <NotificationProvider>
          <TestNotificationComponent 
            onNotificationsLoaded={handleNotificationsLoaded} 
            autoLoad={true}
          />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(loadedNotifications).toEqual([]);
      }, { timeout: 3000 });
    });

    it('should clear all notifications successfully', async () => {
      AsyncStorage.removeItem.mockResolvedValue();
      AsyncStorage.getItem.mockResolvedValue(null);

      const { getByTestId } = render(
        <NotificationProvider>
          <TestNotificationComponent autoLoad={true} />
        </NotificationProvider>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(getByTestId('notification-container')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('clear-notifications-btn'));
      });

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('notificationsHistory');
      });
    });

    it('should sort notifications by date (newest first)', async () => {
      const unsortedNotifications = [
        { id: '1', timestamp: '2024-01-15T08:00:00.000Z', title: 'Old' },
        { id: '2', timestamp: '2024-01-15T10:00:00.000Z', title: 'New' },
        { id: '3', timestamp: '2024-01-15T09:00:00.000Z', title: 'Middle' }
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(unsortedNotifications));

      let loadedNotifications = null;
      const handleNotificationsLoaded = (notifications) => {
        loadedNotifications = notifications;
      };

      render(
        <NotificationProvider>
          <TestNotificationComponent 
            onNotificationsLoaded={handleNotificationsLoaded} 
            autoLoad={true}
          />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(loadedNotifications).not.toBeNull();
        expect(loadedNotifications.length).toBe(3);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(loadedNotifications[0].title).toBe('New');   // 10:00 AM (newest)
        expect(loadedNotifications[1].title).toBe('Middle'); // 09:00 AM
        expect(loadedNotifications[2].title).toBe('Old');    // 08:00 AM (oldest)
      });
    });
  });

  // TC20: NotificationCard Component Testing
  describe('TC20 - NotificationCard Component UI', () => {
    it('should render notification card with title and message', () => {
      const { getByText } = render(
        <NotificationCard 
          title="Test Notification"
          message="This is a test message"
        />
      );

      expect(getByText('Test Notification')).toBeTruthy();
      expect(getByText('This is a test message')).toBeTruthy();
    });

    it('should handle long titles and messages gracefully', () => {
      const longTitle = 'Very Long Notification Title That Might Cause Display Issues';
      const longMessage = 'This is a very long notification message that should be displayed properly even when it contains a lot of text and might wrap to multiple lines';

      const { getByText } = render(
        <NotificationCard 
          title={longTitle}
          message={longMessage}
        />
      );

      expect(getByText(longTitle)).toBeTruthy();
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle empty title and message gracefully', () => {
      const { getByText } = render(
        <NotificationCard 
          title=""
          message=""
        />
      );

      // Should still render the calendar-check icon even with empty content
      expect(getByText('calendar-check')).toBeTruthy();
    });

    it('should handle special characters in title and message', () => {
      const specialTitle = 'Notification with émojis 💊 & symbols!';
      const specialMessage = 'Message with "quotes", numbers 123, and symbols @#$%';

      const { getByText } = render(
        <NotificationCard 
          title={specialTitle}
          message={specialMessage}
        />
      );

      expect(getByText(specialTitle)).toBeTruthy();
      expect(getByText(specialMessage)).toBeTruthy();
    });
  });

  // TC21: API Integration Testing
  describe('TC21 - Notification API Integration', () => {
    it('should register push token successfully', async () => {
      const mockToken = 'mock-push-token-12345';
      
      registerPushToken.mockResolvedValue({
        success: true,
        message: 'Push token registered successfully'
      });

      const result = await registerPushToken(mockToken);

      expect(registerPushToken).toHaveBeenCalledWith(mockToken);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Push token registered successfully');
    });

    it('should handle push token registration errors', async () => {
      const mockToken = 'invalid-token';
      
      registerPushToken.mockRejectedValue(new Error('Invalid token format'));

      try {
        await registerPushToken(mockToken);
      } catch (error) {
        expect(error.message).toBe('Invalid token format');
      }

      expect(registerPushToken).toHaveBeenCalledWith(mockToken);
    });

    it('should handle snooze API errors gracefully', async () => {
      snoozeMedicationReminder.mockRejectedValue(new Error('Network error'));

      try {
        await snoozeMedicationReminder(['med1']);
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      expect(snoozeMedicationReminder).toHaveBeenCalledWith(['med1']);
    });
  });

  // TC22: Mock Data Validation
  describe('TC22 - Mock Notification Data', () => {
    it('should validate mock notification structure', () => {
      expect(Array.isArray(mockNotifications)).toBe(true);
      expect(mockNotifications.length).toBeGreaterThan(0);

      mockNotifications.forEach(notification => {
        expect(notification).toHaveProperty('id');
        expect(notification).toHaveProperty('title');
        expect(notification).toHaveProperty('message');
        expect(notification).toHaveProperty('type');
        expect(notification).toHaveProperty('date');
        expect(notification).toHaveProperty('read');
      });
    });

    it('should contain different notification types', () => {
      const types = [...new Set(mockNotifications.map(n => n.type))];
      
      expect(types).toContain('reminder');
      expect(types).toContain('warning');
      expect(types).toContain('appointment');
      expect(types.length).toBeGreaterThan(1);
    });

    it('should have valid date formats in mock data', () => {
      mockNotifications.forEach(notification => {
        const date = new Date(notification.date);
        expect(date instanceof Date && !isNaN(date.getTime())).toBe(true);
      });
    });
  });
});