import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChartCard from './ChartCard';

const TodayMetricCard = ({ 
  title, 
  value, 
  unit = '', 
  chartColor = '#5A6ACF',
  onUpdatePress 
}) => {
  // Check if we have valid data
  const hasData = value !== null && 
                  value !== undefined && 
                  value !== '' && 
                  value != 'No Data' &&
                  (Array.isArray(value) ? value.length > 0 : true);

  // Format the display value
  const getDisplayValue = () => {
    if (!hasData) return 'No data';
    
    if (Array.isArray(value)) {
      if (value.length === 0) return 'No data';
      // For arrays, show the latest value
      const latestValue = value[value.length - 1];
      return typeof latestValue === 'number' ? 
        (Number.isInteger(latestValue) ? latestValue : latestValue.toFixed(1)) 
        : latestValue;
    }
    
    return typeof value === 'number' ? 
      (Number.isInteger(value) ? value : value.toFixed(1)) 
      : value;
  };

  return (
    <ChartCard title={title}>
      <View style={styles.updateButtonContainer}>
        <TouchableOpacity 
          style={[styles.updateButton, { backgroundColor: chartColor }]}
          onPress={onUpdatePress}
        >
          <Icon name="plus" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.container}>
        <Text style={[
          hasData ? styles.value : styles.noDataValue
        ]}>
          {getDisplayValue()}
        </Text>
        {hasData && (
          <Text style={styles.unit}>{unit}</Text>
        )}
        {!hasData && (
          <Text style={styles.noDataSubtext}>Tap + to add reading</Text>
        )}
      </View>
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    height: 150
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333'
  },
  noDataValue: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    color: '#999',
    fontStyle: 'italic'
  },
  unit: {
    fontSize: 22,
    color: '#666',
    textAlign: 'center'
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  updateButtonContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  updateButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 9
  },
});

export default TodayMetricCard;