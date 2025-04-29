import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { getMedicationDetails, restockMedication } from '../api/patientAPI';

export default function RestockScreen({ route, navigation }) {
  const { id } = route.params;
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [quantity, setQuantity] = useState('');

  // 1️⃣ Fetch medication details once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getMedicationDetails(id);
        setSelectedMedication(res);
      } catch (err) {
        console.error('Error fetching medication details:', err);
      }
    })();
  }, [id]);

  // 2️⃣ As soon as we have a name, update the nav bar title
  useLayoutEffect(() => {
    navigation.setOptions({ title: "Loading" });
    if (selectedMedication?.name) {
      navigation.setOptions({ title: selectedMedication.name });
    }
  }, [navigation, selectedMedication]);

  // 3️⃣ Loader until we have the data
  if (!selectedMedication) {
    return (
      <View style={[styles.root, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 4️⃣ Keep quantity numeric only
  function handleInputChange(value) {
    setQuantity(value.replace(/[^0-9]/g, ''));
  }

  // 5️⃣ Stub for when the user taps “Complete Restock”
  function handleSubmit() {
    if(quantity === '') {
      alert("Please enter a quantity to restock.");
      return;
    }
    try{
      const res = restockMedication(id, quantity)
      console.log(res);
      // navigate back to medication detail screen
    navigation.goBack()
    }
    catch(err){
      console.error("Error restocking medication:", err);
    }
    console.log('Restock', id, quantity);
  }

  return (
    <View style={styles.root}>
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

      <View style={styles.button}>
        <PrimaryButton onPress={handleSubmit}>Complete Restock</PrimaryButton>
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
