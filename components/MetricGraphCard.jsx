// MetricGraphCard.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChartCard from './ChartCard';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

function MetricGraphCard({ 
  title, 
  data, 
  labels, 
  onUpdatePress,
  chartColor = '#5469d4',
  chartConfig = {},
  hidePointsAtIndex,
  height = 190
}) {
  
  const defaultChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(84, 105, 212, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: chartColor
    }
  };

  const mergedChartConfig = { ...defaultChartConfig, ...chartConfig };
  
  return (
    <View style={styles.cardWithButtonContainer}>
      <ChartCard title={title}>
        <View style={styles.updateButtonContainer}>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={onUpdatePress}
          >
            <Icon name="plus" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data,
                color: (opacity = 1) => `rgba(84, 105, 212, ${opacity})`,
                strokeWidth: 2
              }
            ],
          }}
          width={screenWidth - 55}
          height={height}
          chartConfig={mergedChartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
          hidePointsAtIndex={hidePointsAtIndex}
        />
      </ChartCard>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWithButtonContainer: {
    position: 'relative',
  },
  updateButtonContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  updateButton: {
    backgroundColor: '#5A6ACF',
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

export default MetricGraphCard;