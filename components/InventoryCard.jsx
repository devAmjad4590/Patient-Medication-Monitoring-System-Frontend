import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

function InventoryCard({medicationName, medicationType, stock, onPress}) {
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
    <Pressable 
      onPress={onPress} 
      style={styles.outerContainer}
      testID={`inventory-card-${medicationName}`}
    >
      {renderMedicationIcon()}
      <View style={styles.textContainer}>
        <Text style={styles.medicationName} testID={`medication-name-${medicationName}`}>
          {medicationName}
        </Text>
        <Text style={styles.caption} testID={`medication-type-${medicationName}`}>
          {medicationType}
        </Text>
      </View>
      <Text 
        style={{color: 'black'}} 
        testID={`stock-count-${medicationName}`}
      >
        {stock} left
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: 'white',
        padding: 20,
        elevation: 3,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
        justifyContent: 'space-between', // Pushes items apart
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    textContainer: {
        flex: 1, // Takes up remaining space to push checkbox to the right
        marginLeft: 15,
    },
    medicationName: {
        fontSize: 17,
        fontWeight: '600',
        color: 'black'
    },
    caption: {
        fontSize: 13,
        color: '#7F7F7F',
    },
})

export default InventoryCard