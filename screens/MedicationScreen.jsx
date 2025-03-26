import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import InventoryCard from '../components/InventoryCard'
import mockMedicationEntries from '../data/medicationMockData'

function MedicationScreen({navigation}) {

  function handlePress(id){
    navigation.navigate('MedicationDetail', {id: id})
  }

  const inventory = Array.from(new Map(mockMedicationEntries.map(med => [med.id, med])).values())
  return (
    <ScrollView style={styles.root}>
      <View style={styles.innerContainer}>
      <Text style={styles.title}>Inventory</Text>
      {inventory.map((item) => (
        <InventoryCard onPress={handlePress.bind(this, item.id)} key={item.id} medicationName={item.name} medicationType={item.type} stock={item.stock}></InventoryCard>
      ))}
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 28,
    paddingBottom: 90
  },
  title: {
    fontSize: 24,
    fontWeight: 'semi-bold',
    textAlign: 'center',
    marginBottom: 20
  },
  innerContainer:{
    paddingBottom: 30
  }
})

export default MedicationScreen
