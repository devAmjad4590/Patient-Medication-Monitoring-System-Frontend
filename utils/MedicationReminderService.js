import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications for when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class MedicationReminderService {
  constructor() {
    this.initialize();
  }

  initialize = async () => {
    try {
      // Check if device is a physical device (not simulator)
      

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      console.log('Notification permissions granted');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  scheduleMedicationsReminder = async (medicationIds, reminderTime) => {
    try {
      const timeSlotId = new Date(reminderTime).getTime().toString();
    //   const medicationNames = medicationIds.map(med => med.name).join(", ");
      const message = `Time to take your medications.`

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "MEDICATION REMINDER",
          body: message,
          sound: true,
          priority: 'max',
          vibrate: [0, 250, 250, 250],
          data: {
            timeSlotId: timeSlotId,
            medicationIds: medicationIds,
            type: 'MEDICATION_REMINDER',
          },
          
        },
        trigger: {
          date: new Date(reminderTime),
          
        },
      });

      console.log(`Scheduled group reminder for ${medicationIds.length} medications at ${new Date(reminderTime).toLocaleTimeString()} with ID: ${identifier}`);
      return identifier;
    } catch (error) {
      console.error('Error scheduling medication reminder:', error);
      return null;
    }
  };

  cancelReminder = async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled reminder with ID: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  };

  cancelAllReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all reminders');
    } catch (error) {
      console.error('Error cancelling all reminders:', error);
    }
  };
}

// Create a singleton instance
const reminderService = new MedicationReminderService();
export default reminderService;