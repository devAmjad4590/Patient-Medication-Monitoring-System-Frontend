import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import mockMedicationEntries from '../data/medicationMockData';
import PrimaryButton from '../components/PrimaryButton';

function RestockScreen({ route, navigation }) {
  const { id } = route.params;
  const selectedMedication = mockMedicationEntries.find(med => med.id === id);
  const name = selectedMedication.name;

  const [quantity, setQuantity] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
  }, [navigation, name]);

  function handleInputChange(value) {
    const numeric = value.replace(/[^0-9]/g, '');
    setQuantity(numeric);
  }

  return (
    <View style={styles.root}>
      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.textStyle}>Add amount:</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={handleInputChange}
            keyboardType="number-pad"
            maxLength={3}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Button at bottom */}
      <View style={styles.button}>
      <PrimaryButton >Complete Restock</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  content: {
    alignItems: 'center',
    marginTop: 60,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: 70,
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
    color: '#000',
    paddingVertical: 4,
  },
  button: {
    alignSelf: 'center',
    marginBottom: 90,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RestockScreen;
