import React from 'react'
import { View, Text, StyleSheet } from 'react-native-ui-lib'
import mockMedicationEntries from '../data/medicationMockData'

function MedicationDetail({route}) {
    const id = route.params.id
    const selectedMedication = mockMedicationEntries.find(med => med.id === id)
  return (
    <View>
        <Text>Medication Detail</Text>
        <Text>{selectedMedication.name}</Text>
    </View>
  )
}

export default MedicationDetail
