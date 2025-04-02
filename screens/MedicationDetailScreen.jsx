import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import mockMedicationEntries from '../data/medicationMockData'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import PrimaryButton from '../components/PrimaryButton'
import InfoContainer from '../components/InfoContainer'


function MedicationDetail({route, navigation}) {
    const id = route.params.id
    const selectedMedication = mockMedicationEntries.find(med => med.id === id)
    function handleRestock(){
      navigation.navigate('Restock', {id: id, name: selectedMedication.name})
    }
  return (
    <View style={styles.container}>
        <View style={styles.upperContainer}>
        <MaterialCommunityIcons name="pill" size={120} color="black" />
        </View>
        <View style={styles.lowerContainer}>
        <InfoContainer title={"Medication Name"} value={selectedMedication.name} />
        <InfoContainer title={"Dosage"} value={selectedMedication.dosage} />
        <InfoContainer title={"Type"} value={selectedMedication.type} />
        <InfoContainer title={"Stock"} value={selectedMedication.stock} />
        <InfoContainer title={"Instructions"} value={selectedMedication.instructions} />
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
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  }
})

export default MedicationDetail
