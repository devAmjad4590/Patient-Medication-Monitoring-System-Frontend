import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, SectionList, RefreshControl, Alert, Platform, ScrollView } from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import { StatusBar } from "expo-status-bar";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedicationEntryCard from "../components/MedicationEntryCard";
import LoadingScreen from "../components/LoadingScreen";
import { groupLogsByTime, getSortedSections } from "../utils/medicationUtils";
import { getMedicationLogs, markMedicationTaken } from "../api/patientAPI";
import { useFocusEffect } from "@react-navigation/native";
import { registerPushToken } from "../api/notificationAPI";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useScreenRefresh } from "../ScreenRefreshContext";

function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [medicationIntakeLogs, setMedicationIntakeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshTrigger } = useScreenRefresh();

  // Function to load medication logs from API
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMedicationLogs();
      setMedicationIntakeLogs(res);
    } catch (err) {
      console.error("Error fetching medication logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch when component mounts
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Listen for refresh trigger from ScreenRefreshContext
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 HomeScreen: Refresh triggered, reloading data...');
      loadLogs();
    }
  }, [refreshTrigger, loadLogs]);

  // Complete push notification setup
  useEffect(() => {
    async function configurePushNotifications() {
      let token;
      
      console.log('🔔 Setting up notifications...');
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        
        await Notifications.setNotificationChannelAsync('high', {
          name: 'high',
          importance: Notifications.AndroidImportance.HIGH,
        });
        console.log('✅ Android notification channels created');
      }

      if (Device.isDevice) {
        console.log('📱 Running on physical device');
        
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('📋 Current permission status:', existingStatus);
        
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          console.log('🔄 Requesting notification permissions...');
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          console.log('📝 Permission request result:', status);
        }
        
        if (finalStatus !== 'granted') {
          console.log('❌ Failed to get push token for push notification!');
          Alert.alert(
            'Push Notification Permission',
            'You need to enable push notifications to receive reminders.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        try {
          console.log('🎫 Getting Expo push token...');
          const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
          console.log('📁 Project ID:', projectId);
          
          if (!projectId) {
            throw new Error('Project ID not found');
          }
          
          token = (await Notifications.getExpoPushTokenAsync({
            projectId,
          })).data;
          
          console.log('🎉 Expo push token obtained:', token);
          
          // Register token with backend
          const res = await registerPushToken(token);
          console.log('✅ Push token registered with backend:', res);
          
        } catch (error) {
          console.log('❌ Error getting/registering Expo push token:', error);
        }
      } else {
        console.log('⚠️ Must use physical device for Push Notifications');
        Alert.alert('Device Required', 'Must use physical device for Push Notifications');
      }
    }
    
    configurePushNotifications();
  }, []);

  // Pull-to-refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }, [loadLogs]);

  // Filter logs by selected date
  const dailyLogs = medicationIntakeLogs.filter(
    (log) => moment(log.intakeTime).format("YYYY-MM-DD") === selectedDate
  );

  const grouped = groupLogsByTime(dailyLogs);
  const sections = getSortedSections(grouped);

  // Function to handle check/uncheck of medication logs
  async function onCheck(logId, status) {
    const takenAt = new Date().toISOString();
    
    // Update in-memory state optimistically
    const updated = medicationIntakeLogs.map((log) =>
      log._id === logId
        ? { ...log, status: status, takenAt: takenAt }
        : log
    );
    setMedicationIntakeLogs(updated);

    // Sync with server
    try {
      await markMedicationTaken({ medicationId: logId, status: status, takenAt: takenAt });
    } catch (err) {
      console.error("Error syncing check to server:", err);
      // Optionally revert the local change on error
      setMedicationIntakeLogs(medicationIntakeLogs);
    }
  }

  // No medications empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="pill" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>
        {selectedDate === moment().format("YYYY-MM-DD") 
          ? "No medications for today" 
          : `No medications for ${moment(selectedDate).format("MMM DD, YYYY")}`
        }
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {selectedDate === moment().format("YYYY-MM-DD")
          ? "Enjoy your medication-free day!"
          : "Try selecting a different date"
        }
      </Text>
    </View>
  );

  // SHOW LOADING SCREEN
  if (loading) {
    return (
      <LoadingScreen 
        message="Loading your medications..." 
        icon="medication"
        backgroundColor="#E7E7E7"
        primaryColor="#2F7EF5"
      />
    );
  }

  return (
    <>
      <StatusBar style="dark" />

      <CalendarStrip
        style={{ height: 80, backgroundColor: "#D9D9D9" }}
        calendarHeaderStyle={{ display: "none" }}
        dateNumberStyle={{ fontSize: 14, color: "black" }}
        dateNameStyle={{ fontSize: 12, color: "black" }}
        highlightDateNumberStyle={{
          fontSize: 16,
          color: "white",
          backgroundColor: "#2F7EF5",
          padding: 4,
          borderRadius: 30,
          width: 30,
        }}
        highlightDateNameStyle={{ fontSize: 13, color: "#2F7EF5" }}
        highlightDateContainerStyle={{
          backgroundColor: "#4A90E2",
          borderRadius: 8,
          padding: 5,
        }}
        selectedDate={moment(selectedDate)}
        onDateSelected={(date) => setSelectedDate(date.format("YYYY-MM-DD"))}
      />

      <View style={styles.root}>
        {sections.length === 0 && !loading ? (
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2F7EF5"
                colors={["#2F7EF5"]}
              />
            }
          >
            <EmptyState />
          </ScrollView>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item._id}
            style={{ paddingHorizontal: 23 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2F7EF5"
                colors={["#2F7EF5"]}
              />
            }
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.header}>{title}</Text>
            )}
            renderItem={({ item }) => (
              <MedicationEntryCard
                id={item._id}
                medicationName={item.medication.name}
                medicationType={item.medication.type}
                onCheck={onCheck}
                status={item.status}
              />
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E7E7E7",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: 'black'
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;