import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

// Import your existing screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import NotificationDrawer from './components/navigators/NotificationDrawer';
import MedicationScreen from './screens/MedicationScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
import RestockScreen from './screens/RestockScreen';
import ReminderScreen from './screens/ReminderScreen';
import { createNavigationContainerRef } from '@react-navigation/native';
const navigationRef = createNavigationContainerRef();
import { registerPushToken } from './api/notificationAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyticsScreen from './screens/AnalyticsScreen';

// Set up notifications configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createStackNavigator();

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Initialize notification listeners

    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        await storeNotification(notification);
        console.log('Notification received in foreground:', notification.request.content.data);
      }
    )

    notificationListener.current = Notifications.addNotificationReceivedListener(
      async (response) => {
        console.log('Notification received:', response.request.content);
        storeNotification(response).then(() => {
          console.log("Notification stored successfully");
        }).catch(err => {
          console.error("Error storing notification:", err);
        })
        const { medications, time } = response.request.content.data;
        if (medications) {
          navigationRef.navigate('Reminder', {
            medicationIds: medications,
            time: time,
          })
        }
      }
    );

    // responseListener.current = Notifications.addNotificationResponseReceivedListener(
    //   response => {
        
    //   }
    // );

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const storeNotification = async (notification) => {
    console.log("Storing notification:", notification);
    try{
      const notificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        receivedAt: new Date().toISOString(),
      };

      const existingData = await AsyncStorage.getItem('notificationsHistory');
      const notificationsHistory = existingData ? JSON.parse(existingData) : [];
      notificationsHistory.push(notificationData);

      // Only keep last 50 notifications
    const trimmedNotifications = notificationsHistory.slice(-50);

    await AsyncStorage.setItem('notificationsHistory', JSON.stringify(trimmedNotifications));
    }
    catch(err){
      console.error("Error storing notification:", err);
    }
  }

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {/* <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            <Stack.Screen name="Drawer" component={NotificationDrawer} />
            <Stack.Screen name="Medication" component={MedicationScreen} />
            <Stack.Screen
              name="MedicationDetail"
              component={MedicationDetailScreen}
              options={{ headerShown: true, title: "Medication Detail" }}
            />
            <Stack.Screen
              name="Restock"
              component={RestockScreen}
              options={{ headerShown: true, title: "Medication Title" }}
            />
            <Stack.Screen
              name="Reminder"
              component={ReminderScreen}
            />
          </Stack.Navigator>
        </NavigationContainer> */}
        <AnalyticsScreen></AnalyticsScreen>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
  });