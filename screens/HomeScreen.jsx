import React, {useState} from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import MedicationEntryCard from "../components/MedicationEntryCard";
import mockMedicationEntries from "../data/medicationMockData";
import { groupMedicationsByTime, getSortedSections } from "../utils/medicationUtils";

function HomeScreen() {
  const medicationEntries = mockMedicationEntries;
  const groupedMedications = groupMedicationsByTime(medicationEntries);
  const sections = getSortedSections(groupedMedications);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);


  return (
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E7E7E7",
    padding: 28,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
});

export default HomeScreen;
