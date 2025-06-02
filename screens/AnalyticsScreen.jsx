import { useState, useEffect, useCallback  } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Modal, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import SelectOption from '../components/SelectOption';
import { useFocusEffect } from '@react-navigation/native';
import PrimaryButton from '../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChartCard from '../components/ChartCard';
import * as Progress from 'react-native-progress';
import MetricGraphCard from '../components/MetricGraphCard';
import TodayMetricCard from '../components/TodayMetricCard';
import { TIMEFRAMES, getLabels } from '../utils/timeLabels';
import { getPatientMetrics, getPatientAdherence, getMissedDoses, getPatientStreaks, updatePatientMetrics } from '../api/patientAPI';
const screenWidth = Dimensions.get('window').width;

function AnalyticsScreen() {
  const [adherence, setAdherence] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES.WEEK);
  const [missedDoses, setMissedDoses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(null);

  // Input states
  const [singleValue, setSingleValue] = useState('');
  const [systolicValue, setSystolicValue] = useState('');
  const [diastolicValue, setDiastolicValue] = useState('');

  // States for graph data
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [bloodGlucoseData, setBloodGlucoseData] = useState([]);
  const [heartRateData, setHeartRateData] = useState([]);
  const [weightData, setWeightData] = useState([]);

  const metrics = [
    { id: 'bloodPressure', title: 'Blood Pressure', unit: 'mmHg', color: '#5469d4' },
    { id: 'bloodGlucose', title: 'Blood Glucose', unit: 'mg/dL', color: '#e67e22' },
    { id: 'heartRate', title: 'Heart Rate', unit: 'bpm', color: '#e74c3c' },
    { id: 'weight', title: 'Weight', unit: 'kg', color: '#3498db' }
  ];

  // Move fetchMetrics outside and make it a useCallback
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setLabels(getLabels(selectedTimeframe));

    try {
      const metricsData = await getPatientMetrics();
      const adherenceData = await getPatientAdherence(selectedTimeframe);
      const missedDosesData = await getMissedDoses(selectedTimeframe);
      const currentStreakData = await getPatientStreaks(selectedTimeframe);
      
      setBestStreak(currentStreakData.longestStreak);
      setCurrentStreak(currentStreakData.currentStreak);
      setMissedDoses(missedDosesData);
      setAdherence(adherenceData);
      
      if (selectedTimeframe !== TIMEFRAMES.TODAY) {
        setBloodPressureData(extractValues(metricsData.bloodPressure[selectedTimeframe]));
        setBloodGlucoseData(extractValues(metricsData.bloodGlucose[selectedTimeframe]));
        setHeartRateData(extractValues(metricsData.heartRate[selectedTimeframe]));
        setWeightData(extractValues(metricsData.weight[selectedTimeframe]));
      } else {
        setBloodPressureData(extractValues(metricsData.bloodPressure[selectedTimeframe]));
        setBloodGlucoseData(extractValues(metricsData.bloodGlucose[selectedTimeframe]));
        setHeartRateData(extractValues(metricsData.heartRate[selectedTimeframe]));
        setWeightData(extractValues(metricsData.weight[selectedTimeframe]));
      }
    } catch (err) {
      console.error("Error fetching patient metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

  // This will run every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMetrics();
      
      // Optional: Return cleanup function if needed
      return () => {
        // Any cleanup when leaving the screen
        console.log('User navigated away from Analytics screen');
      };
    }, [fetchMetrics])
  );

  // Pull to refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  }, [fetchMetrics]);

  const refreshData = async () => {
    setLoading(true);
    setLabels(getLabels(selectedTimeframe));
    try {
        const metricsData = await getPatientMetrics();
        const adherenceData = await getPatientAdherence(selectedTimeframe);
        const missedDosesData = await getMissedDoses(selectedTimeframe);
        const currentStreakData = await getPatientStreaks(selectedTimeframe)
        setBestStreak(currentStreakData.longestStreak);
        setCurrentStreak(currentStreakData.currentStreak);
        setMissedDoses(missedDosesData);
        setAdherence(adherenceData);
        if (selectedTimeframe !== TIMEFRAMES.TODAY) {
          setBloodPressureData(extractValues(metricsData.bloodPressure[selectedTimeframe]));
          setBloodGlucoseData(extractValues(metricsData.bloodGlucose[selectedTimeframe]));
          setHeartRateData(extractValues(metricsData.heartRate[selectedTimeframe]));
          setWeightData(extractValues(metricsData.weight[selectedTimeframe]));
        }
        else {
          setBloodPressureData(extractValues(metricsData.bloodPressure[selectedTimeframe]));
          setBloodGlucoseData(extractValues(metricsData.bloodGlucose[selectedTimeframe]));
          setHeartRateData(extractValues(metricsData.heartRate[selectedTimeframe]));
          setWeightData(extractValues(metricsData.weight[selectedTimeframe]));
        }
      }
      catch (err) {
        console.error("Error fetching patient metrics:", err);
      } finally {
        setLoading(false);
      }
  }

  const handleInputChange = (value, inputType = 'single') => {
    const numericValue = value.replace(/[^0-9.]/g, '');

    if (inputType === 'systolic') {
      setSystolicValue(numericValue);
    } else if (inputType === 'diastolic') {
      setDiastolicValue(numericValue);
    } else {
      setSingleValue(numericValue);
    }
  };

  const clearInputs = () => {
    setSingleValue('');
    setSystolicValue('');
    setDiastolicValue('');
  };

  const handleSubmit = async () => {
    if (!currentMetric) return;

    if (currentMetric.id === 'bloodPressure') {
      if (systolicValue === '' || diastolicValue === '') {
        Alert.alert('Missing Values', 'Please enter both systolic and diastolic values.');
        return;
      }
      if (parseFloat(systolicValue) <= parseFloat(diastolicValue)) {
        Alert.alert('Invalid Values', 'Systolic pressure should be higher than diastolic pressure.');
        return;
      }
      try {
        const response = await updatePatientMetrics(currentMetric.id, {
          systolic: systolicValue,
          diastolic: diastolicValue
        })
        console.log(`Update ${currentMetric.id}:`, { systolic: systolicValue, diastolic: diastolicValue });
      }
      catch (err) {
        console.log("Error updating blood pressure:", err);
      }
    } else {
      if (singleValue === '') {
        Alert.alert('Missing Value', `Please enter a value for ${currentMetric.title}.`);
        return;
      }
      try {
        const response = await updatePatientMetrics(currentMetric.id, singleValue)
        console.log(`Update ${currentMetric.id}:`, singleValue);
      }
      catch (err) {
        console.log("Error updating metric:", err);
      }
    }

    // Close modal and clear inputs
    setIsModalVisible(false);
    setCurrentMetric(null);
    clearInputs();
    refreshData();
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentMetric(null);
    clearInputs();
  };

  const extractValues = (data) => {
    console.log("check data: ", data)
    if (!data) return [];
    if (!Array.isArray(data)) {
      console.log([data.value])
      return data.value ? [data.value] : [];
    }
    return data.map(item => item.value).filter(value => value !== null);
  };

  const handleSelect = (selectedItem) => {
    setLoading(true)
    setSelectedTimeframe(selectedItem.value);
    console.log(`Selected timeframe: ${selectedItem.value}`);
  };

  const handleUpdateMetric = (metricType) => {
    const metric = metrics.find(m => m.id === metricType);
    setCurrentMetric(metric);
    setIsModalVisible(true);
  };

  const formatAdherenceText = (progress) => {
    return `${Math.round(progress * 100)}%`;
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20 }}>Loading Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Modal
        visible={isModalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Update {currentMetric?.title}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              {currentMetric?.id === 'bloodPressure' ? (
                // Blood Pressure - Two inputs
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Systolic (Upper)</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={systolicValue}
                        onChangeText={(value) => handleInputChange(value, 'systolic')}
                        placeholder="120"
                        keyboardType="numeric"
                        maxLength={3}
                      />
                      <Text style={styles.unitText}>mmHg</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Diastolic (Lower)</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={diastolicValue}
                        onChangeText={(value) => handleInputChange(value, 'diastolic')}
                        placeholder="80"
                        keyboardType="numeric"
                        maxLength={3}
                      />
                      <Text style={styles.unitText}>mmHg</Text>
                    </View>
                  </View>

                  <View style={styles.bpPreview}>
                    <Text style={styles.previewLabel}>Reading Preview:</Text>
                    <Text style={styles.previewValue}>
                      {systolicValue || '---'} / {diastolicValue || '---'} mmHg
                    </Text>
                  </View>
                </>
              ) : (
                // Single input for other metrics
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter {currentMetric?.title}</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={singleValue}
                      onChangeText={(value) => handleInputChange(value)}
                      placeholder={getPlaceholder(currentMetric?.id)}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                    <Text style={styles.unitText}>{currentMetric?.unit}</Text>
                  </View>
                </View>
              )}

              {/* Tips Section */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Tips</Text>
                <Text style={styles.tipsText}>
                  {getTips(currentMetric?.id)}
                </Text>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: currentMetric?.color || '#5469d4' }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Save Reading</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2F7EF5"
            colors={["#2F7EF5"]}
          />
        }
      >
        <SelectOption onSelect={handleSelect} currentValue={selectedTimeframe} />
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
              <Text style={styles.metricRecord}>Personal best: {bestStreak} days</Text>
            </View>
          </ChartCard>

          {/* Metric Cards - conditionally render text or graph */}
          {selectedTimeframe === TIMEFRAMES.TODAY ? (
            // Today View - Text Values
            <>
              {/* Blood Pressure */}
              <TodayMetricCard
                key={metrics[0].id}
                title={metrics[0].title}
                value={bloodPressureData}
                unit={metrics[0].unit}
                chartColor={metrics[0].color}
                onUpdatePress={() => handleUpdateMetric(metrics[0].id)}
              />
              {/* Blood Glucose */}
              <TodayMetricCard
                key={metrics[1].id}
                title={metrics[1].title}
                value={bloodGlucoseData}
                unit={metrics[1].unit}
                chartColor={metrics[1].color}
                onUpdatePress={() => handleUpdateMetric(metrics[1].id)}
              />
              {/* Heart Rate */}
              <TodayMetricCard
                key={metrics[2].id}
                title={metrics[2].title}
                value={heartRateData}
                unit={metrics[2].unit}
                chartColor={metrics[2].color}
                onUpdatePress={() => handleUpdateMetric(metrics[2].id)}
              />
              {/* Weight */}
              <TodayMetricCard
                key={metrics[3].id}
                title={metrics[3].title}
                value={weightData}
                unit={metrics[3].unit}
                chartColor={metrics[3].color}
                onUpdatePress={() => handleUpdateMetric(metrics[3].id)}
              />
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

// Helper functions
const getPlaceholder = (metricId) => {
  switch (metricId) {
    case 'bloodGlucose': return '100';
    case 'heartRate': return '72';
    case 'weight': return '70.5';
    default: return '0';
  }
};

const getTips = (metricId) => {
  switch (metricId) {
    case 'bloodPressure':
      return 'Take readings while seated and relaxed. Wait 5 minutes after exercise or caffeine.';
    case 'bloodGlucose':
      return 'For most accurate readings, test at consistent times relative to meals.';
    case 'heartRate':
      return 'Rest for 5 minutes before taking your pulse. Count for a full minute.';
    case 'weight':
      return 'Weigh yourself at the same time each day, preferably in the morning.';
    default:
      return 'Enter the most recent reading from your device.';
  }
};

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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  unitText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginLeft: 10,
  },
  bpPreview: {
    backgroundColor: '#f8f9ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  previewValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5469d4',
  },
  tipsContainer: {
    backgroundColor: '#fff9e6',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Existing styles for the main screen
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
  },
});

export default AnalyticsScreen;