import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Entypo from "@expo/vector-icons/Entypo";
import { Checkbox } from "react-native-ui-lib";

export default function MedicationEntryCard({
  id,
  medicationName,
  medicationType,
  status,    // "Pending" | "Taken" | "Missed"
  onCheck,   // (id: string, newStatus: string) => void
}) {
  const isTaken = status === "Taken";
  const isMissed = status === "Missed";

  // Define your cycle of states
  const getNextStatus = (cur) => {
    switch (cur) {
      case "Taken": return "Pending";
      case "Pending": return "Taken";
      case "Missed": return "Taken";
      default: return "Pending";
    }
  };

  const handlePress = () => {
    const next = getNextStatus(status);

    // Confirm Taken→Pending
    if (status === "Taken" && next === "Pending") {
      Alert.alert(
        "Confirm Medication Status",
        `Are you sure you want to mark "${medicationName}" as missed?`,
        [
          { text: "Yes", onPress: () => onCheck(id, next) },
          { text: "Cancel", style: "cancel" }
        ]
      );

      // Confirm Missed→Taken
    } else if (status === "Missed" && next === "Taken") {
      Alert.alert(
        "Confirm Medication Status",
        `Are you sure you took "${medicationName}"?`,
        [
          { text: "Yes", onPress: () => onCheck(id, next) },
          { text: "Cancel", style: "cancel" }
        ]
      );

      // All other transitions (e.g. Pending→Taken) happen immediately
    } else {
      onCheck(id, next);
    }
  };

  // Function to render the appropriate icon based on medication type
  const renderMedicationIcon = () => {
    const iconSize = 35;
    const iconColor = "black";

    switch (medicationType?.toLowerCase()) {
      case "tablet":
        return <FontAwesome5 name="tablets" size={iconSize} color={iconColor} testID={`icon-${medicationName}`} />;
      case "syrup":
        return <MaterialCommunityIcons name="bottle-tonic-plus-outline" size={iconSize} color={iconColor} testID={`icon-${medicationName}`} />;
      case "syringe":
        return <FontAwesome5 name="syringe" size={iconSize} color={iconColor} testID={`icon-${medicationName}`} />;
      case "capsule":
      default:
        return <MaterialCommunityIcons name="pill" size={iconSize} color={iconColor} testID={`icon-${medicationName}`} />;
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.outerContainer} testID={`medication-card-${medicationName}`}>
      {renderMedicationIcon()}
      <View style={styles.textContainer}>
        <Text testID={`medication-name-${medicationName}`} style={styles.medicationName}>{medicationName}</Text>
        <Text style={styles.caption} testID={`medication-type-${medicationName}`}>{medicationType}</Text>
      </View>
      {isMissed ? (
        <Entypo name="circle-with-cross" size={24} color="red" testID={`missed-icon-${medicationName}`} />
      ) : (
        <Checkbox
          size={28}
          borderRadius={20}
          value={isTaken}
          onValueChange={handlePress}
          testID={`checkbox-${medicationName}`}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  medicationName: {
    fontSize: 17,
    fontWeight: "600",
    color: 'black'
  },
  caption: {
    fontSize: 13,
    color: "#7F7F7F",
  },
});