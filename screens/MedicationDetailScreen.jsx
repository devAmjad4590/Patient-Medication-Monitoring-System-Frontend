import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import PrimaryButton from '../components/PrimaryButton';
import InfoContainer from '../components/InfoContainer';
import { getMedicationDetails } from '../api/patientAPI';

export default function MedicationDetail({ route }) {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const id = route.params.id;
  const navigation = useNavigation();

  // Refetch on every focus, and clear old data so the loader shows
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setSelectedMedication(null);

      (async () => {
        try {
          const res = await getMedicationDetails(id);
          if (isActive) {
            setSelectedMedication(res);
          }
        } catch (err) {
          console.error('Error fetching medication details:', err);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [id])
  );

  // Loader until we have fresh data
  if (!selectedMedication) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <MaterialCommunityIcons name="pill" size={120} color="black" />
      </View>

      <View style={styles.lowerContainer}>
        <InfoContainer
          title="Medication Name"
          value={`${selectedMedication.name} ${selectedMedication.unit}`}
        />

        {selectedMedication.dosage === 1 ? (
          <InfoContainer
            title="Dosage"
            value={`${selectedMedication.dosage} ${selectedMedication.type}`}
          />
        ) : (
          <InfoContainer
            title="Dosage"
            value={`${selectedMedication.dosage} ${selectedMedication.type}s`}
          />
        )}

        <InfoContainer title="Type" value={selectedMedication.type} />
        <InfoContainer
          title="Frequency"
          value={`${selectedMedication.frequency} Times a day`}
        />
        <InfoContainer title="Stock" value={selectedMedication.stock} />
        <InfoContainer
          title="Instructions"
          value={selectedMedication.instructions}
        />

        <View style={styles.buttonContainer}>
          <PrimaryButton onPress={() => navigation.navigate('Restock', { id })}>
            Restock Medicine
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    alignItems: 'center',
  },
  upperContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lowerContainer: {
    flex: 5,
    width: '100%',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
});
