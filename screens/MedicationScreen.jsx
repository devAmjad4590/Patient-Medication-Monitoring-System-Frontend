import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingScreen from '../components/LoadingScreen'; // Add this import

import InventoryCard from '../components/InventoryCard';
import { getPatientMedication } from '../api/patientAPI';

export default function MedicationScreen({ navigation }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch (and dedupe) every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchMedications = async () => {
        setLoading(true);
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
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchMedications();

      // Cleanup if the screen blurs before fetch finishes
      return () => {
        isActive = false;
      };
    }, [])
  );

  function handlePress(id) {
    navigation.navigate('MedicationDetail', { id });
  }

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="pill-off" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Medications in Inventory</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your medication inventory is empty. Contact your healthcare provider to add medications to your treatment plan.
      </Text>
    </View>
  );

  // SHOW LOADING SCREEN
  if (loading) {
    return (
      <LoadingScreen 
        message="Loading your medication inventory..." 
        icon="medical-services"
        backgroundColor="#f5f5f5"
        primaryColor="#2F7EF5"
      />
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Inventory</Text>
      {inventory.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {inventory.map(item => (
            <InventoryCard
              key={item._id}
              medicationName={item.name}
              medicationType={item.type}
              stock={item.stock}
              onPress={() => handlePress(item._id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 28,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});