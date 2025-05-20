import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import SelectOption from '../components/SelectOption';
import PrimaryButton from '../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChartCard from '../components/ChartCard';
import * as Progress from 'react-native-progress';
import MetricGraphCard from '../components/MetricGraphCard';
import { TIMEFRAMES, getLabels, getDataPointCount } from '../utils/timeLabels';

const screenWidth = Dimensions.get('window').width;

function AnalyticsScreen() {
  const [adherence, setAdherence] = useState(0.75);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES.WEEK);
  const [missedDoses, setMissedDoses] = useState(3); // State for missed doses
  const [currentStreak, setCurrentStreak] = useState(7); // State for current streak
  const [labels, setLabels] = useState([]);
  // Sample data for the metric graphs
  const bloodPressureData = [120, 125, 118, 122, 130, 125, 120];
  const bloodGlucoseData = [85, 92, 88, 95, 90, 87, 91];
  const heartRateData = [72, 75, 68, 70, 72, 74, 71];
  const weightData = [82.5, 82.3, 82.1, 81.8, 81.5, 81.9, 81.7];

  useEffect(() => {
    setLabels(getLabels(selectedTimeframe));
    // cut the data points to match the selected timeframe
    const dataPointCount = getDataPointCount(selectedTimeframe);
  }, [selectedTimeframe])


  const handleSelect = (selectedItem) => {
    setSelectedTimeframe(selectedItem.value);
    console.log(`Selected timeframe: ${selectedItem.value}`);
    // Handle the selected item here
  }

  const handleUpdateMetric = (metricType) => {
    // Function to handle updating the specific metric
    console.log(`Update ${metricType} metric button pressed`);
    // You can add navigation or modal opening logic here
  };

  // Function to format the text shown in the circle
  const formatAdherenceText = (progress) => {
    // Convert decimal to percentage and round it
    return `${Math.round(progress * 100)}%`;
  };

  return (
    <View style={styles.root}>
      <ScrollView>
        <SelectOption onSelect={handleSelect} />
        <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
          <View style={{ width: '60%', height: 100 }}>
            <PrimaryButton><Text style={{ fontSize: 20, fontWeight: '400' }}>Generate Report  </Text><Icon size={20} name='content-save-edit' /></PrimaryButton>
          </View>
        </View>
        <View style={styles.content}>
          {/* Adherence Summary Card */}
          <ChartCard title='Adherence Summary'>
            <View style={{ alignSelf: 'flex-start', marginTop: 20, flex: 1 }}>
              <Progress.Circle
                formatText={() => formatAdherenceText(adherence)}
                textStyle={{ color: 'black', fontSize: 30, fontWeight: '400' }}
                thickness={30}
                progress={adherence}
                showsText={true}
                size={150}
                color='#5A6ACF'
                animated={true}
                unfilledColor='#C7CEFF'
                borderWidth={0}
              />
            </View>
            <View style={{ flexDirection: 'column', padding: 20, paddingHorizontal: 0, width: '100%', gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                <View style={{ borderRadius: 50, backgroundColor: '#5A6ACF', width: 10, height: 10 }}></View>
                <Text style={{ textAlign: 'left', width: '30%' }}>Adherent</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                <View style={{ borderRadius: 50, backgroundColor: '#C7CEFF', width: 10, height: 10 }}></View>
                <Text style={{ textAlign: 'left', width: '30%' }}>Non-Adherent</Text>
              </View>
            </View>
          </ChartCard>

          {/* Missed Doses Card */}
          <ChartCard title='Missed Doses'>
            <View style={styles.metricContainer}>
              <View style={styles.missedDosesCircle}>
                <Text style={styles.metricNumber}>{missedDoses}</Text>
              </View>
              <Text style={styles.metricLabel}>Missed doses this week</Text>
            </View>
          </ChartCard>

          {/* Current Streak Card */}
          <ChartCard title='Current Streak'>
            <View style={styles.metricContainer}>
              <View style={styles.streakCircle}>
                <Text style={styles.streakNumber}>{currentStreak}</Text>
                <Text style={styles.streakLabel}>DAYS</Text>
              </View>
              <Text style={styles.metricLabel}>Current on-time streak</Text>
              <Text style={styles.metricRecord}>Personal best: 14 days</Text>
            </View>
          </ChartCard>

          {/* Using our new MetricGraphCard component for all the graph cards */}
          <MetricGraphCard
            title="Blood Pressure"
            data={bloodPressureData}
            labels={labels}
            onUpdatePress={() => handleUpdateMetric('blood-pressure')}
            chartColor="#5469d4"
          />

          <MetricGraphCard
            title="Blood Glucose"
            data={bloodGlucoseData}
            labels={labels}
            onUpdatePress={() => handleUpdateMetric('blood-glucose')}
            chartColor="#e67e22"
          />

          <MetricGraphCard
            title="Heart Rate"
            data={heartRateData}
            labels={labels}
            onUpdatePress={() => handleUpdateMetric('heart-rate')}
            chartColor="#e74c3c"
          />

          <MetricGraphCard
            title="Weight"
            data={weightData}
            labels={labels}
            onUpdatePress={() => handleUpdateMetric('weight')}
            chartColor="#3498db"
          />

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#E7E7E7'
  },
  content: {
    paddingBottom: 10,
    gap: 15,
    paddingHorizontal: 10,
    marginTop: 0,
    backgroundColor: '#E7E7E7'
  },
  // Styles for the Missed Doses and Current Streak cards
  metricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  missedDosesCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  metricTrend: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 5,
  },
  metricRecord: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  streakCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#5CB85C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  streakLabel: {
    fontSize: 12,
    color: 'white',
  }
});

export default AnalyticsScreen;