import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import InventoryCard from '../components/InventoryCard';
import { getPatientMedication } from '../api/patientAPI';

export default function MedicationScreen({ navigation }) {
  const [inventory, setInventory] = useState([]);

  // Fetch (and dedupe) every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchMedications = async () => {
        try {
          const res = await getPatientMedication();
          if (isActive) {
            // Remove duplicates by id
            const medMap = Array.from(
              new Map(res.map(med => [med._id, med])).values()
            );
            setInventory(medMap);
          }
        } catch (err) {
          console.error('Error fetching medication:', err);
        }
      };

      fetchMedications();

      // Cleanup if the screen blurs before fetch finishes
      return () => {
        isActive = false;
      };
    }, []) // no dependencies → stays the same function instance
  );

  function handlePress(id) {
    navigation.navigate('MedicationDetail', { id });
  }

  return (
    <ScrollView style={styles.root}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Inventory</Text>
        {inventory.map(item => (
          <InventoryCard
            key={item._id}
            medicationName={item.name}
            medicationType={item.type}
            stock={item.stock}
            onPress={() => handlePress(item._id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 28,
    paddingBottom: 90,
  },
  innerContainer: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
});
