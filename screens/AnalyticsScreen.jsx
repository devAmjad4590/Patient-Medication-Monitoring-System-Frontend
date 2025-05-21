import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import SelectOption from '../components/SelectOption';
import PrimaryButton from '../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChartCard from '../components/ChartCard';
import * as Progress from 'react-native-progress';
import MetricGraphCard from '../components/MetricGraphCard';
import TodayMetricCard from '../components/TodayMetricCard';
import { TIMEFRAMES, getLabels, getDataPointCount } from '../utils/timeLabels';
import { simplifiedMockData } from '../data/mockMetricsData';

const screenWidth = Dimensions.get('window').width;

function AnalyticsScreen() {
  const [adherence, setAdherence] = useState(0.75);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES.WEEK);
  const [missedDoses, setMissedDoses] = useState(3); // State for missed doses
  const [currentStreak, setCurrentStreak] = useState(7); // State for current streak
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for graph data
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [bloodGlucoseData, setBloodGlucoseData] = useState([]);
  const [heartRateData, setHeartRateData] = useState([]);
  const [weightData, setWeightData] = useState([]);

  // make the metric array and map it to the available data above
  const metrics = [
    { id: 'bloodPressure', title: 'Blood Pressure', unit: 'mmHg', color: '#5469d4' },
    { id: 'bloodGlucose', title: 'Blood Glucose', unit: 'mg/dL', color: '#e67e22' },
    { id: 'heartRate', title: 'Heart Rate', unit: 'bpm', color: '#e74c3c' },
    { id: 'weight', title: 'Weight', unit: 'kg', color: '#3498db' }
  ]
  
  useEffect(() => {
    setLoading(true);
    setLabels(getLabels(selectedTimeframe));
    
    setBloodPressureData(extractValues(simplifiedMockData.bloodPressure[selectedTimeframe]));
    setBloodGlucoseData(extractValues(simplifiedMockData.bloodGlucose[selectedTimeframe]));
    setHeartRateData(extractValues(simplifiedMockData.heartRate[selectedTimeframe]));
    setWeightData(extractValues(simplifiedMockData.weight[selectedTimeframe]));
    
    setLoading(false);
  }, [selectedTimeframe]);

  const todayValues = {
    bloodPressure: simplifiedMockData.bloodPressure.today[0]?.value,
    bloodGlucose: simplifiedMockData.bloodGlucose.today[0]?.value,
    heartRate: simplifiedMockData.heartRate.today[0]?.value,
    weight: simplifiedMockData.weight.today[0]?.value
  }

  const extractValues = (data) => {
    if(!data) return [];
    return data.map(item => item.value).filter(value => value !== null);
  };

  const handleSelect = (selectedItem) => {
    setSelectedTimeframe(selectedItem.value);
    console.log(`Selected timeframe: ${selectedItem.value}`);
  };

  const handleUpdateMetric = (metricType) => {
    console.log(`Update ${metricType} metric button pressed`);
  };

  const formatAdherenceText = (progress) => {
    return `${Math.round(progress * 100)}%`;
  };

  if (loading){
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20 }}>Loading Data...</Text>
      </View>
    );
  }

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

          {/* Metric Cards - conditionally render text or graph */}
          {selectedTimeframe === TIMEFRAMES.TODAY ? (
            // Today View - Text Values
            <>
              {metrics.map(metric => (
                <TodayMetricCard
                  key={metric.id}
                  title={metric.title}
                  value={todayValues[metric.id]}
                  unit={metric.unit}
                  chartColor={metric.color}
                  onUpdatePress={() => handleUpdateMetric(metric.id)}
                />
              ))}
            </>
          ) : (
            // Other Timeframes - Graph Views
            <>
              <MetricGraphCard
                title="Blood Pressure"
                data={bloodPressureData}
                labels={labels}
                onUpdatePress={() => handleUpdateMetric('bloodPressure')}
                chartColor="#5469d4"
              />

              <MetricGraphCard
                title="Blood Glucose"
                data={bloodGlucoseData}
                labels={labels}
                onUpdatePress={() => handleUpdateMetric('bloodGlucose')}
                chartColor="#e67e22"
              />

              <MetricGraphCard
                title="Heart Rate"
                data={heartRateData}
                labels={labels}
                onUpdatePress={() => handleUpdateMetric('heartRate')}
                chartColor="#e74c3c"
              />

              <MetricGraphCard
                title="Weight"
                data={weightData}
                labels={labels}
                onUpdatePress={() => handleUpdateMetric('weight')}
                chartColor="#3498db"
              />
            </>
          )}
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