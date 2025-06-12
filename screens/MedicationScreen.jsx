import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingScreen from '../components/LoadingScreen';
import InventoryCard from '../components/InventoryCard';
import { getPatientMedication } from '../api/patientAPI';
import { useScreenRefresh } from '../ScreenRefreshContext';

export default function MedicationScreen({ navigation }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useScreenRefresh();

  // Function to load medications from API
  const fetchMedications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPatientMedication();
      // Remove duplicates by id
      const medMap = Array.from(
        new Map(res.map(med => [med._id, med])).values()
      );
      setInventory(medMap);
    } catch (err) {
      console.error('Error fetching medication:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch (and dedupe) every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        await fetchMedications();
      };

      if (isActive) {
        loadData();
      }

      // Cleanup if the screen blurs before fetch finishes
      return () => {
        isActive = false;
      };
    }, [fetchMedications])
  );

  // Listen for refresh trigger from ScreenRefreshContext
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 MedicationScreen: Refresh triggered, reloading data...');
      fetchMedications();
    }
  }, [refreshTrigger, fetchMedications]);

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
    color: 'black'
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