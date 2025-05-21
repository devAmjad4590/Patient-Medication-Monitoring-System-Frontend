// SimpleMetricValue.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChartCard from './ChartCard';

// A simple component that displays just the value and unit of a metric
const TodayMetricCard = ({ 
  title, 
  value, 
  unit = '', 
  chartColor = '#5A6ACF',
  onUpdatePress 
}) => {
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
        <Text style={styles.value}>
          {value !== null && value !== undefined ? 
            typeof value === 'number' ? 
              Number.isInteger(value) ? value : value.toFixed(1) 
              : value 
            : 'No data'}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
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
    marginBottom: 10
  },
  unit: {
    fontSize: 22,
    color: '#666',
    textAlign: 'center'
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
  }
});

export default TodayMetricCard;