import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, SectionList, RefreshControl, Alert, Platform } from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import { StatusBar } from "expo-status-bar";
import MedicationEntryCard from "../components/MedicationEntryCard";
import { groupLogsByTime, getSortedSections } from "../utils/medicationUtils";
import { getMedicationLogs, markMedicationTaken } from "../api/patientAPI";
import { useFocusEffect } from "@react-navigation/native";
import { registerPushToken } from "../api/notificationAPI";
import * as Notifications from "expo-notifications";

function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [medicationIntakeLogs, setMedicationIntakeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Push notification setup
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Push Notification Permission',
          'You need to enable push notifications to receive reminders.',
          [{ text: 'OK' }]
        );
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      const res = await registerPushToken(pushTokenData.data);
      console.log('Push token registered:', res);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('high', {
          name: 'high',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    }
    configurePushNotifications();
  }, []);

  // // Refetch data when screen comes into focus
  // useFocusEffect(
  //   useCallback(() => {
  //     if (!loading) {
  //       loadLogs();
  //     }
  //   }, [loadLogs, loading])
  // );

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
  },
});

export default HomeScreen;