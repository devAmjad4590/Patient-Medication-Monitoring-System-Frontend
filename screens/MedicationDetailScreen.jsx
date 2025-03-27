import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import mockMedicationEntries from '../data/medicationMockData'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import PrimaryButton from '../components/PrimaryButton'


function MedicationDetail({route}) {
    const id = route.params.id
    const selectedMedication = mockMedicationEntries.find(med => med.id === id)
    function handleRestock(){
      console.log("handle restock pressed")
    }
  return (
    <View style={styles.container}>
        <View style={styles.upperContainer}>
        <MaterialCommunityIcons name="pill" size={120} color="black" />
        </View>
        <View style={styles.lowerContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
          <Text style={styles.text}>Medication Name: </Text>
          <Text style={styles.text}>{selectedMedication.name}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
          <Text style={styles.text}>Dosage: </Text>
          <Text style={styles.text}>{selectedMedication.dosage}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
          <Text style={styles.text}>Type: </Text>
          <Text style={styles.text}>{selectedMedication.type}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
          <Text style={styles.text}>Stock: </Text>
          <Text style={styles.text}>{selectedMedication.stock}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>  
          <Text style={styles.text}>Instructions: </Text>
          <Text style={styles.text}>{selectedMedication.instructions}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
        <PrimaryButton onPress={handleRestock}>Restock Medicine</PrimaryButton>
        </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  upperContainer:{
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'

  },
  lowerContainer: {
    flex: 5,
    width: '100%',

  },
  infoContainer:{
    backgroundColor: 'white',
        padding: 20,
        elevation: 3,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  text: {
    fontSize: 16,
    textAlign: 'left',
    width: '100%'
  }
})

export default MedicationDetail
