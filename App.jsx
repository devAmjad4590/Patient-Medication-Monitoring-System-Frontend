import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { createNavigationContainerRef } from '@react-navigation/native';
const navigationRef = createNavigationContainerRef();
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationProvider } from './NotificationContext';
import { VoiceProvider } from './VoiceContext';
import { AuthProvider, useAuth } from './AuthContext';
import { ScreenRefreshProvider } from './ScreenRefreshContext';
import LoadingScreen from './components/LoadingScreen';

// Import your existing screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import NotificationDrawer from './components/navigators/NotificationDrawer';
import MedicationScreen from './screens/MedicationScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
import RestockScreen from './screens/RestockScreen';
import ReminderScreen from './screens/ReminderScreen';
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

// Main App Navigation Component
function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    console.log('🚀 App starting - setting up notification listeners...');

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log('🔔 Notification received in foreground:', notification);
        console.log('📄 Notification content:', notification.request.content);
        await storeNotification(notification);

        const { medications, time } = notification.request.content.data || {};
        console.log(notification.request.content.data)
        if (medications && navigationRef.isReady()) {
          console.log('🧭 Navigating to Reminder screen...');
          navigationRef.navigate('Reminder', {
            medicationIds: medications,
            time: time,
          });
        }
      
      }
    );

    // Listen for user interactions with notifications (tapping)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('👆 Notification response received:', response);
        console.log('📄 Notification data:', response.notification.request.content.data);
        
        await storeNotification(response.notification);
        
        const { medications, time } = response.notification.request.content.data || {};
        if (medications && navigationRef.isReady()) {
          console.log('🧭 Navigating to Reminder screen...');
          navigationRef.navigate('Reminder', {
            medicationIds: medications,
            time: time,
          });
        }
      }
    );

    // Clean up listeners on unmount
    return () => {
      console.log('🧹 Cleaning up notification listeners...');
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const storeNotification = async (notification) => {
    console.log("💾 Storing notification:", notification.request.identifier);
    try {
      const notificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        receivedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        date: new Date().toISOString()
      };

      const existingData = await AsyncStorage.getItem('notificationsHistory');
      const notificationsHistory = existingData ? JSON.parse(existingData) : [];
      notificationsHistory.push(notificationData);

      // Only keep last 50 notifications
      const trimmedNotifications = notificationsHistory.slice(-50);

      await AsyncStorage.setItem('notificationsHistory', JSON.stringify(trimmedNotifications));
      console.log("✅ Notification stored successfully");
    } catch (err) {
      console.error("❌ Error storing notification:", err);
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Checking authentication..." 
        icon="shield"
        backgroundColor="#E7E7E7"
        primaryColor="#2F7EF5"
      />
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated screens
          <>
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
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Main App Component
export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <AuthProvider>
        <NotificationProvider>
          <VoiceProvider>
            <ScreenRefreshProvider>
              <AppNavigation />
            </ScreenRefreshProvider>
          </VoiceProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});