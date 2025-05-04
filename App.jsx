// UI Library dependencies
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useRef } from 'react';
import ReminderScreen from './screens/ReminderScreen';
const Stack = createStackNavigator();
import PushNotification from 'react-native-push-notification';
import reminderService from './utils/MedicationReminderService';
import { getMedicationLogs } from './api/patientAPI';

export default function App() {
  // Create a ref to the navigation object
  const navigationRef = useRef(null);

  // This function allows us to navigate even when the app is in background
  const navigate = (name, params) => {
    if (navigationRef.current) {
      navigationRef.current.navigate(name, params);
    }
  };

  // Function to schedule medication reminders based on database data
  const scheduleMedicationReminders = async () => {
    try{
      const medicationLogs = await getMedicationLogs();
      const timeGroups = {};

      medicationLogs.forEach(med => {
        if(med.status === "Pending"){
          const intakeTime = new Date(med.intakeTime);

          if(intakeTime < new Date()) return;

          const timeKey = intakeTime.toISOString()
          
          if(!timeGroups[timeKey]){
            timeGroups[timeKey] = [];
          }

          timeGroups[timeKey].push(med._id || med.id)
        }
      })

      // Schedule reminders for each timegroup
      Object.entries(timeGroups).forEach(([timeStr, medicationIds]) => {
        const reminderTime = new Date(timeStr);
        reminderService.scheduleMedicationsReminder(medicationIds, reminderTime)
      })

      console.log(`Scheduled reminders for ${Object.keys(timeGroups).length} time slots)`);
    }
    catch(err){
      console.error("Error scheduling medication reminders:", err);
    }
  }

  // This is only when the user clicks on the notification
  useEffect(() => {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log("NOTIFICATION:", notification)

        // check if the notification is a medication reminder
        if(notification.data && notification.data.type === 'MEDICATION_REMINDER'){
          navigate('ReminderScreen', {
            timeSlotId: notification.data.timeSlotId,
            medicationIds: notification.data.medicationIds,
          })
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    })

    scheduleMedicationReminders(); // Schedule reminders when the app starts

    // set up periodic reminder scheduling (incase new medications are added)
    const schedulingInterval = setInterval(() => {
      scheduleMedicationReminders();
    }, 60 * 60 * 1000); // every hour
    return () => {
      clearInterval(schedulingInterval); // Clear the interval when the component unmounts
    }
  }, [])
  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            <Stack.Screen name="Drawer" component={NotificationDrawer} />
            <Stack.Screen name="Medication" component={MedicationScreen} />
            <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} options={{ headerShown: true, title: "Medication Detail" }} />
            <Stack.Screen name="Restock" component={RestockScreen} options={{ headerShown: true, title: "Medication Title" }} />
            <Stack.Screen name="Reminder" component={ReminderScreen} options={{ headerShown: true, title: "Medication Reminder", presentation: 'fullScreenModal', gestureEnabled: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
