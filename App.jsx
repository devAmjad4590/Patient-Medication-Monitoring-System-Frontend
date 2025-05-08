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
    notificationListener.current = Notifications.addNotificationReceivedListener(
      response => {
        //const {redirectTo, params} = response.request.content.data;
        // navigationRef.navgate('Reminder')
        // if(redirectTo === 'Reminder'){
        // }
        const { medicationGroup, medications, time, identifier } = response.request.content.data;
        if (medicationGroup) {
          navigationRef.navigate('Reminder', {
            medicationIds: medications,
            time: time,
            identifier: identifier
          })
        }
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response received:', response);
        // Handle user interaction with the notification here
      }
    );

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <NavigationContainer ref={navigationRef}>
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
        </NavigationContainer>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
  });