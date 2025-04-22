import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import { StatusBar } from "expo-status-bar";
import MedicationEntryCard from "../components/MedicationEntryCard";
import { groupLogsByTime, getSortedSections } from "../utils/medicationUtils";
import { getMedicationLogs, markMedicationTaken } from "../api/patientAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";


function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [medicationIntakeLogs, setMedicationIntakeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const cacheKey = "@medicationIntakeLogs";

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);

      // Load cached logs from AsyncStorage if available
      const cachedLogs = await loadCachedWeekLogs()
      if (cachedLogs.length > 0) {
        setMedicationIntakeLogs(cachedLogs);
        setLoading(false);
        return;
      }

      // If no cached logs, fetch from API
      try {
        const res = await getMedicationLogs();
        setMedicationIntakeLogs(res);
        await cacheMedicationLogs();
      }
      catch (err) {
        console.error("Error fetching medication logs:", err);
        throw err;
      }
      finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [])


  // Storing the medication logs in AsyncStorage
  async function cacheMedicationLogs() {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(medicationIntakeLogs));
  }

  // Retrieving the medication logs from AsyncStorage
  async function loadCachedWeekLogs() {
    const raw = await AsyncStorage.getItem(cacheKey);
    return raw ? JSON.parse(raw) : null;
  }

  // Filter logs by selected date
  const dailyLogs = medicationIntakeLogs.filter(
    (log) => moment(log.intakeTime).format("YYYY-MM-DD") === selectedDate
  );

  const grouped = groupLogsByTime(dailyLogs);
  const sections = getSortedSections(grouped);

  async function onCheck(logId, status) {
    
    const takenAt = new Date().toISOString();
    // 1) Update in-memory
    const updated = medicationIntakeLogs.map((log) =>
      log._id === logId
        ? { ...log, status: status, takenAt: takenAt }
        : log
    );
    setMedicationIntakeLogs(updated);

    // 2) Persist cache
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch (err) {
      console.error("Error caching updated logs:", err);
    }

    // 3) PATCH server
    try {
      await markMedicationTaken({ medicationId: logId, status: status, takenAt: takenAt});
    } catch (err) {
      console.error("Error syncing check to server:", err);
      // optionally: revert local change or re-queue for later

    }
  };


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
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <MedicationEntryCard
              id={item._id}
              medicationName={item.medication.name}
              medicationType={item.medication.type}
              onCheck={onCheck}
              isChecked={item.status === "Taken"}
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
