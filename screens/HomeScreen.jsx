import React, { useState } from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import { StatusBar } from "expo-status-bar";
import MedicationEntryCard from "../components/MedicationEntryCard";
import mockMedicationIntakeLogs from "../data/mockMedicationIntakeLogs";
import { groupLogsByTime, getSortedSections } from "../utils/medicationUtils";

function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));

  // 🔍 Filter logs by selected date
  const filteredLogs = mockMedicationIntakeLogs.filter(
    (log) => moment(log.intakeTime).format("YYYY-MM-DD") === selectedDate
  );

  const grouped = groupLogsByTime(filteredLogs);
  const sections = getSortedSections(grouped);

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
        highlightDateNameStyle={{ fontSize: 14, color: "#2F7EF5" }}
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
          keyExtractor={(item) => item.id}
          style={{ paddingHorizontal: 23 }}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <MedicationEntryCard
              medicationName={item.medication.name}
              medicationType={item.medication.type}
              status={item.status}
              intakeTime={item.intakeTime}
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
