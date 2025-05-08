import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import moment from 'moment-timezone';

class MedicationReminderService {
  constructor() {
    this.initialize();
    this.scheduledMedicationIds = new Set();
  }

  initialize = async () => {
    try {
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications!');
        return;
      }

      // For Android, create a channel for high-priority notifications
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
          name: 'Medication Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
        });
      }
      
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  };

  scheduleMedicationsReminder = async (medicationLogs) => {
    // Cancel existing reminders first
    await this.cancelAllReminders();
    
    // Filter out past medications or already taken medications
    const validLogs = medicationLogs.filter((log) => {
      const intakeTime = new Date(log.intakeTime);
      return intakeTime > new Date() && log.status !== "Taken";
    });

    // Group medications by intake time (hour and minute)
    const groupedByTime = {};

    validLogs.forEach((log) => {
      const intakeTime = new Date(log.intakeTime);
      const timeKey = moment(intakeTime).format("YYYY-MM-DD HH:mm");

      if (!groupedByTime[timeKey]) {
        groupedByTime[timeKey] = {
          time: intakeTime,
          medications: [],
        };
      }

      groupedByTime[timeKey].medications.push(log._id);
    });

    // Schedule notifications for each time group
    for (const timeKey in groupedByTime) {
      const group = groupedByTime[timeKey];
      const medicationCount = group.medications.length;
      const medicationNames = group.medications.map(med => med.name).join(", ");

      // Create title and body based on medication count
      let title, body;
      if (medicationCount === 1) {
        title = "Medication Reminder";
        body = `It's time to take ${group.medications[0].name}`;
      } else {
        title = `Medication Reminder (${medicationCount} medications)`;
        body = `It's time to take: ${medicationNames}`;
      }

      // Generate unique ID for this notification
      const notificationId = `med_${group.time.getTime()}`;
      
      // Schedule the notification with Expo Notifications
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: title,
          body: body,
          data: {
            medicationGroup: true,
            medications: group.medications,
            time: group.time.toISOString(),
          },
          sound: 'default',
          priority: 'high',
          // Android specific options that can help make it more prominent
          android: {
            channelId: 'medication-reminders',
            color: '#FF0000',
            priority: Notifications.AndroidNotificationPriority.MAX,
            sticky: true,
          },
          // iOS specific options
          ios: {
            sound: true,
          },
        },
        trigger: {
          // TYPE OF NOTIFICATIONS
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: group.time,
        },
      });

      // Store the ID for tracking
      this.scheduledMedicationIds.add(notificationId);
    }

    // // Test notification (fires after 10 seconds)
    // const testTime = new Date(Date.now() + 10000);
    // await Notifications.scheduleNotificationAsync({
    //   identifier: 'test-reminder',
    //   content: {
    //     title: "Test Medication Reminder",
    //     body: "This is a test reminder",
    //     data: { test: true ,
    //       time: testTime.toISOString(),
    //       medicationGroup: true,
    //       medications: ['6819a8246fffd310743181be', '6819a8246fffd310743181bd', '6819a8246fffd310743181bc']
    //     },
    //     sound: 'default',
    //     priority: 'high',
    //     android: {
    //       channelId: 'medication-reminders',
    //       priority: Notifications.AndroidNotificationPriority.MAX,
    //       sticky: true,
    //     },
    //   },
    //   trigger: {
    //     date: testTime,
    //   },
    // });

    console.log("Scheduled medication reminders with Expo Notifications");
  };

  cancelAllReminders = async () => {
    try {
      // Cancel all notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledMedicationIds.clear();
      console.log("Cancelled all reminders");
    } catch (error) {
      console.error("Error cancelling reminders:", error);
    }
  };

  //work here
  snoozeReminder = async (notificationId, snoozeTime) => {
    try{
      // snooze 5 minutes
      const snoozeDate = new Date(Date.now() + snoozeTime * 60 * 1000);
      // Cancel the existing notification
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      // Schedule a new notification with the snooze time

    }
    catch (error) {
      console.error("Error snoozing reminder:", error);
    }
  }

  // Methods to listen for notification interactions
  addNotificationReceivedListener = (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
  };

  addNotificationResponseReceivedListener = (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  };

  // Other methods as needed...
}

// Create a singleton instance
const reminderService = new MedicationReminderService();
export default reminderService;