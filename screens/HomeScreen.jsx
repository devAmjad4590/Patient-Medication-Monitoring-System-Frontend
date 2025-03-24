import React, { useState } from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import MedicationEntryCard from "../components/MedicationEntryCard";
import mockMedicationEntries from "../data/medicationMockData";
import { groupMedicationsByTime, getSortedSections } from "../utils/medicationUtils";
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';

function HomeScreen() {
  const medicationEntries = mockMedicationEntries;
  const groupedMedications = groupMedicationsByTime(medicationEntries);
  const sections = getSortedSections(groupedMedications);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <>
      <CalendarStrip
        style={{ height: 80, paddingTop: 0, backgroundColor: '#D9D9D9' }}
        calendarHeaderStyle={{ display: "none" }} // Hide the month header
        dateNumberStyle={{ fontSize: 14, color: "black" }}  // Normal date numbers
        dateNameStyle={{ fontSize: 12, color: "black" }}  // Normal date names
        highlightDateNumberStyle={{ fontSize: 16, color: "white", backgroundColor: '#2F7EF5', padding: 4, borderRadius: 22 }}  // Selected date number
        highlightDateNameStyle={{ fontSize: 14, color: "#2F7EF5" }}  // Selected date name
        highlightDateContainerStyle={{ backgroundColor: "#4A90E2", borderRadius: 8, padding: 5 }} // Background for selected date
        selectedDate={moment(selectedDate)}
        onDateSelected={(date) => setSelectedDate(date.format('YYYY-MM-DD'))}
      />

      <View style={styles.root}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.header}>{title}</Text>}
          renderItem={({ item }) => (
            <MedicationEntryCard medicationName={item.name} medicationType={item.type} />
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
    paddingHorizontal: 23,
  },
  calendarContainer: {
    height: 200,
    flex: 4
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
});

export default HomeScreen;