import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class MedicationReminderService{
    constructor(){
        this.configure();
    }
    
    configure = () => {
        // Configure global notification settings
        PushNotification.configure({
            onNotification: function(notification){
                console.log("NOTIFICATION:", notification);
                // Process the notification here if needed
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        })
        PushNotification.createChannel(
            {
                channelId: "medication-alarms",
                channelName: "Medication Alarms",
                channelDescription: "Critical medication reminders",
                playSound: true,
                soundName: "alarm.mp3",
                importance: 5,
                vibrate: true,
            },
            (created) => console.log(`createChannel returned '${created}'`)
        );

    }

    scheduleMedicationsReminder = (medicationIds, reminderTime) => {
        const timeSlotId = new Date(reminderTime).getTime();

        const medicationNames = medicationIds.map(med => med.name).join(", ");
        const message = `Time to take your medications: ${medicationNames}`;

        //Schedule the notification
        PushNotification.localNotificationSchedule({
            channelId: "medication-alarms",
            id: timeSlotId,
            title: "MEDICATION REMINDER",   
            message: message,
            date: new Date(reminderTime), // Schedule for the specified time
            allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
            importance: 'high',
            priority: 'max',
            visibility: 'public',
            ongoing: true,
            playSound: true,
            soundName: "alarm.mp3",
            vibrate: true,
            vibration: 1000,
            fullScreenIntent: true,
            invokeApp: true,
            userInfo: {
                timeSlotId: timeSlotId,
                medicationIds: medicationIds,
                type: 'MEDICATION_REMINDER',
            }
        });

        console.log(`Scheduled group reminder for ${medicationIds.length} medications at ${new Date(reminderTime).toLocaleTimeString()}`);
    }

    cancelReminder = (timeSlotId) => {
        PushNotification.cancelLocalNotifications({ id: timeSlotId });
        console.log(`Cancelled reminder with ID: ${timeSlotId}`);
    }

    cancelAllReminders = () => {
        PushNotification.cancelAllLocalNotifications();
        console.log("Cancelled all reminders");
    }
}

// Create a singleton instance
const reminderService = new MedicationReminderService();
export default reminderService;