import { useState, useEffect, useCallback } from 'react';
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
import { getPatientMetrics, getPatientAdherence, getMissedDoses, getPatientStreaks, updatePatientMetrics, getMedicationLogs } from '../api/patientAPI';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Input states
  const [singleValue, setSingleValue] = useState('');
  const [systolicValue, setSystolicValue] = useState('');
  const [diastolicValue, setDiastolicValue] = useState('');

  // States for graph data
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [bloodGlucoseData, setBloodGlucoseData] = useState([]);
  const [heartRateData, setHeartRateData] = useState([]);
  const [weightData, setWeightData] = useState([]);

  // States for PDF data
  const [medicationLogsData, setMedicationLogsData] = useState([]);

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

  // PDF Generation Functions
  const generateHealthReportHTML = (metricsData, medicationData) => {
    const currentDate = new Date().toLocaleDateString();
    const timeframeName = getTimeframeName(selectedTimeframe);

    // Generate medication table rows
    const medicationRows = medicationData.map(log => {
      const intakeDate = new Date(log.intakeTime).toLocaleDateString();
      const intakeTime = new Date(log.intakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const statusColor = log.status === 'Taken' ? '#28a745' : log.status === 'Missed' ? '#dc3545' : '#ffc107';

      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${log.medication?.name || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${log.medication?.type || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${intakeDate}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${intakeTime}</td>
          <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">${log.status}</td>
        </tr>
      `;
    }).join('');

    // Generate health metrics summary
    const healthMetricsSummary = metrics.map(metric => {
      let data, latestValue;

      switch (metric.id) {
        case 'bloodPressure':
          data = bloodPressureData;
          latestValue = data.length > 0 ? `${data[data.length - 1]} mmHg` : 'No data';
          break;
        case 'bloodGlucose':
          data = bloodGlucoseData;
          latestValue = data.length > 0 ? `${data[data.length - 1]} mg/dL` : 'No data';
          break;
        case 'heartRate':
          data = heartRateData;
          latestValue = data.length > 0 ? `${data[data.length - 1]} bpm` : 'No data';
          break;
        case 'weight':
          data = weightData;
          latestValue = data.length > 0 ? `${data[data.length - 1]} kg` : 'No data';
          break;
        default:
          latestValue = 'No data';
      }

      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${metric.title}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${latestValue}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.length} readings</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Health Report</title>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
          }
          .header {
            text-align: center;
            background: linear-gradient(135deg, #7313B2, #2F7EF5);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #7313B2;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .section {
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .section-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
          }
          .section-header h2 {
            margin: 0;
            color: #333;
            font-size: 20px;
          }
          .section-content {
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
          }
          th {
            background-color: #7313B2;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #7313B2;
          }
          td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .footer p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Health Report</h1>
          <p>Generated on ${currentDate} • Period: ${timeframeName}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>Medication Adherence</h3>
            <div class="value">${Math.round(adherence * 100)}%</div>
          </div>
          <div class="summary-card">
            <h3>Missed Doses</h3>
            <div class="value">${missedDoses}</div>
          </div>
          <div class="summary-card">
            <h3>Current Streak</h3>
            <div class="value">${currentStreak} days</div>
          </div>
          <div class="summary-card">
            <h3>Best Streak</h3>
            <div class="value">${bestStreak} days</div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Health Metrics Summary</h2>
          </div>
          <div class="section-content">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Latest Value</th>
                  <th>Total Readings</th>
                </tr>
              </thead>
              <tbody>
                ${healthMetricsSummary}
              </tbody>
            </table>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Medication Intake Log</h2>
          </div>
          <div class="section-content">
            <table>
              <thead>
                <tr>
                  <th>Medication Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${medicationRows}
              </tbody>
            </table>
          </div>
        </div>

        <div class="footer">
          <p>This report was generated automatically by the Patient Medication Monitoring System</p>
          <p>For questions about your health data, please consult with your healthcare provider</p>
        </div>
      </body>
      </html>
    `;
  };

  const getTimeframeName = (timeframe) => {
    switch (timeframe) {
      case TIMEFRAMES.TODAY: return 'Today';
      case TIMEFRAMES.WEEK: return 'This Week';
      case TIMEFRAMES.MONTH: return 'This Month';
      case TIMEFRAMES.YEAR: return 'This Year';
      default: return 'Custom Period';
    }
  };

  const generatePDFReport = async () => {
    try {
      setGeneratingPDF(true);

      // Fetch medication logs for the table
      const medicationLogs = await getMedicationLogs();
      setMedicationLogsData(medicationLogs);

      // Generate HTML content
      const htmlContent = generateHealthReportHTML(
        {
          bloodPressure: bloodPressureData,
          bloodGlucose: bloodGlucoseData,
          heartRate: heartRateData,
          weight: weightData
        },
        medicationLogs
      );

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });

      console.log('PDF generated at:', uri);

      // Share the PDF
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Health Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

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
    console.log(data)
    if (!data) return [];

    if (!Array.isArray(data)) {
      console.log([data.value])
      return data.value ? [data.value] : [];
    }

    // Check if array is empty or has no valid values
    if (data.length === 0) {
      return [];
    }

    // Check if all values are null/undefined/0
    const hasValidData = data.some(item => item.value && item.value !== 0);
    if (!hasValidData) {
      return [];
    }

    // Create segments of consecutive actual values with line breaks
    const chartData = data.map(item => {
      // If value is 0 or null, return null (this creates gaps in the chart)
      if (item.value === 0 || item.value === null || item.value === undefined) {
        return null;
      }
      return item.value;
    });

    console.log('Chart data with line breaks:', chartData);
    return chartData;
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
            <PrimaryButton onPress={generatePDFReport} disabled={generatingPDF}>
              <Text style={{ fontSize: 20, fontWeight: '400' }}>
                {generatingPDF ? 'Generating...' : 'Generate Report'}
              </Text>
              <Icon size={20} name='content-save-edit' />
            </PrimaryButton>
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
              <Text style={styles.metricLabel}>Missed doses this {selectedTimeframe}</Text>
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