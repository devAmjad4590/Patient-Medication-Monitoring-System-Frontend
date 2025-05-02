import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class MedicatoinReminderService{
    constructor(){
        this.configure();
    }

    configure = () => {
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

        // Configure global notification settings
        PushNotification.configure({
            onNotification: function(notification){
                console.log("NOTIFICATION:", notification);
                // Process the notification here if needed
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        })
    }

    scheduleMedicationsReminder = (medications, reminderTime) => {
        const timeSlotId = new Date(reminderTime).getTime();

        const medicationNames = medications.map(med => med.name).join(", ");
        const message = `Time to take your medications: ${medicationNames}`;

        //Schedule the notification
        PushNotification.localNotificationSchedule({
            channelId: "medication-alarms",
            id: timeSlotId,
            title: "MEDICATION REMINDER",   
            // continue from claude here
        })
    }
}