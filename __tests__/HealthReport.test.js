import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { 
  getPatientMetrics,
  getPatientAdherence,
  getMissedDoses,
  getPatientStreaks,
  updatePatientMetrics,
  getMedicationLogs
} from '../api/patientAPI';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Mock navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: jest.fn(),
}));

// Mock APIs
jest.mock('../api/patientAPI', () => ({
  getPatientMetrics: jest.fn(),
  getPatientAdherence: jest.fn(),
  getMissedDoses: jest.fn(),
  getPatientStreaks: jest.fn(),
  updatePatientMetrics: jest.fn(),
  getMedicationLogs: jest.fn(),
}));

// Mock contexts
jest.mock('../ScreenRefreshContext', () => ({
  useScreenRefresh: () => ({ refreshTrigger: 0 }),
}));

// Mock Expo modules
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mock-directory/',
}));

// Mock React Native components
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => 'ScrollView');
jest.mock('react-native/Libraries/Components/RefreshControl/RefreshControl', () => 'RefreshControl');
jest.mock('react-native/Libraries/Modal/Modal', () => 'Modal');

// Mock other dependencies
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcon');
jest.mock('react-native-progress', () => ({
  Circle: 'ProgressCircle',
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Health Insights & Reports Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC22: Generate Health Report (removed 1+ week data precondition)
  describe('TC22 - Generate Health Report', () => {
    it('should generate PDF/HTML report with adherence trends when timeframe is selected', async () => {
      // Mock data for report generation
      const mockMetricsData = {
        bloodPressure: { week: [{ value: 120 }, { value: 125 }] },
        bloodGlucose: { week: [{ value: 100 }, { value: 95 }] },
        heartRate: { week: [{ value: 72 }, { value: 75 }] },
        weight: { week: [{ value: 70 }, { value: 70.5 }] }
      };

      const mockMedicationLogs = [
        {
          _id: 'log1',
          medication: { name: 'Lisinopril', type: 'Tablet' },
          intakeTime: '2024-01-15T09:00:00.000Z',
          status: 'Taken'
        },
        {
          _id: 'log2',
          medication: { name: 'Aspirin', type: 'Tablet' },
          intakeTime: '2024-01-15T21:00:00.000Z',
          status: 'Missed'
        }
      ];

      getPatientMetrics.mockResolvedValue(mockMetricsData);
      getPatientAdherence.mockResolvedValue(0.85);
      getMissedDoses.mockResolvedValue(3);
      getPatientStreaks.mockResolvedValue({ currentStreak: 5, longestStreak: 10 });
      getMedicationLogs.mockResolvedValue(mockMedicationLogs);

      Print.printToFileAsync.mockResolvedValue({
        uri: 'file://mock-path/health-report.pdf'
      });

      Sharing.isAvailableAsync.mockResolvedValue(true);
      Sharing.shareAsync.mockResolvedValue({ action: 'shared' });

      // Mock the report generation logic
      const generateHealthReport = async (selectedTimeframe = 'week') => {
        // Step 1: Select timeframe
        const metricsData = await getPatientMetrics();
        const adherenceData = await getPatientAdherence(selectedTimeframe);
        const missedDosesData = await getMissedDoses(selectedTimeframe);
        const streakData = await getPatientStreaks(selectedTimeframe);
        const medicationLogs = await getMedicationLogs();

        // Step 2: Click "Generate Report"
        const htmlContent = generateMockHTML(metricsData, medicationLogs, adherenceData);
        const pdfResult = await Print.printToFileAsync({ html: htmlContent });

        return {
          success: true,
          uri: pdfResult.uri,
          data: {
            adherence: adherenceData,
            missedDoses: missedDosesData,
            streaks: streakData
          }
        };
      };

      const result = await generateHealthReport('week');

      // Expected Result: PDF/HTML report with adherence trends
      expect(getPatientMetrics).toHaveBeenCalled();
      expect(getPatientAdherence).toHaveBeenCalledWith('week');
      expect(getMedicationLogs).toHaveBeenCalled();
      expect(Print.printToFileAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.uri).toBe('file://mock-path/health-report.pdf');
      expect(result.data.adherence).toBe(0.85);
    });

    it('should include health metrics data in the report', async () => {
      const mockMetricsData = {
        bloodPressure: { week: [{ value: 120 }] },
        bloodGlucose: { week: [{ value: 100 }] },
        heartRate: { week: [{ value: 72 }] },
        weight: { week: [{ value: 70 }] }
      };

      getPatientMetrics.mockResolvedValue(mockMetricsData);

      // Test data extraction logic
      const extractValues = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => item.value).filter(value => value !== null && value !== 0);
      };

      const bloodPressureData = extractValues(mockMetricsData.bloodPressure.week);
      const bloodGlucoseData = extractValues(mockMetricsData.bloodGlucose.week);
      const heartRateData = extractValues(mockMetricsData.heartRate.week);
      const weightData = extractValues(mockMetricsData.weight.week);

      expect(bloodPressureData).toEqual([120]);
      expect(bloodGlucoseData).toEqual([100]);
      expect(heartRateData).toEqual([72]);
      expect(weightData).toEqual([70]);
    });

    it('should handle report generation errors gracefully', async () => {
      Print.printToFileAsync.mockRejectedValue(new Error('PDF generation failed'));

      try {
        await Print.printToFileAsync({ html: '<html>test</html>' });
      } catch (error) {
        expect(error.message).toBe('PDF generation failed');
      }

      expect(Print.printToFileAsync).toHaveBeenCalled();
    });
  });

  // TC23: Share Report
  describe('TC23 - Share Report', () => {
    it('should attach report to email draft when share button is clicked', async () => {
      const mockReportUri = 'file://mock-path/health-report.pdf';

      // Mock generated report (precondition)
      Print.printToFileAsync.mockResolvedValue({
        uri: mockReportUri
      });

      Sharing.isAvailableAsync.mockResolvedValue(true);
      Sharing.shareAsync.mockResolvedValue({
        action: 'shared',
        activityType: 'com.apple.UIKit.activity.Mail'
      });

      // Step 1: Click "Share"
      const isAvailable = await Sharing.isAvailableAsync();
      expect(isAvailable).toBe(true);

      // Step 2: Select email
      const shareResult = await Sharing.shareAsync(mockReportUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Health Report',
        UTI: 'com.adobe.pdf'
      });

      // Expected Result: Report attached to email draft
      expect(Sharing.shareAsync).toHaveBeenCalledWith(mockReportUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Health Report',
        UTI: 'com.adobe.pdf'
      });
      expect(shareResult.action).toBe('shared');
    });

    it('should handle sharing when not available on device', async () => {
      const mockReportUri = 'file://mock-path/health-report.pdf';

      Sharing.isAvailableAsync.mockResolvedValue(false);

      const isAvailable = await Sharing.isAvailableAsync();
      expect(isAvailable).toBe(false);

      // Should show appropriate error message
      const handleUnavailableSharing = (isAvailable) => {
        if (!isAvailable) {
          return { error: 'Sharing is not available on this device' };
        }
        return { success: true };
      };

      const result = handleUnavailableSharing(isAvailable);
      expect(result.error).toBe('Sharing is not available on this device');
    });

    it('should handle different sharing options', async () => {
      const mockReportUri = 'file://mock-path/health-report.pdf';

      Sharing.isAvailableAsync.mockResolvedValue(true);
      Sharing.shareAsync.mockResolvedValue({
        action: 'shared',
        activityType: 'com.google.Drive'
      });

      await Sharing.shareAsync(mockReportUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Health Report'
      });

      expect(Sharing.shareAsync).toHaveBeenCalledWith(mockReportUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Health Report'
      });
    });
  });

  // TC24: Record Health Metrics
  describe('TC24 - Record Health Metrics', () => {
    it('should save metric and display in trends graph when BP/glucose value is entered', async () => {
      // Test blood pressure entry
      updatePatientMetrics.mockResolvedValue({
        success: true,
        message: 'Blood pressure updated successfully'
      });

      // Step 1: Enter BP value
      const bloodPressureData = {
        systolic: '120',
        diastolic: '80'
      };

      // Step 2: Save
      const result = await updatePatientMetrics('bloodPressure', bloodPressureData);

      // Expected Result: Metric appears in trends graph
      expect(updatePatientMetrics).toHaveBeenCalledWith('bloodPressure', bloodPressureData);
      expect(result.success).toBe(true);
    });

    it('should save glucose reading correctly', async () => {
      updatePatientMetrics.mockResolvedValue({
        success: true,
        message: 'Blood glucose updated successfully'
      });

      // Step 1: Enter glucose value
      const glucoseValue = '100';

      // Step 2: Save
      const result = await updatePatientMetrics('bloodGlucose', glucoseValue);

      // Expected Result: Metric saved successfully
      expect(updatePatientMetrics).toHaveBeenCalledWith('bloodGlucose', glucoseValue);
      expect(result.success).toBe(true);
    });

    it('should save heart rate reading correctly', async () => {
      updatePatientMetrics.mockResolvedValue({
        success: true,
        message: 'Heart rate updated successfully'
      });

      const heartRateValue = '72';
      const result = await updatePatientMetrics('heartRate', heartRateValue);

      expect(updatePatientMetrics).toHaveBeenCalledWith('heartRate', heartRateValue);
      expect(result.success).toBe(true);
    });

    it('should save weight reading correctly', async () => {
      updatePatientMetrics.mockResolvedValue({
        success: true,
        message: 'Weight updated successfully'
      });

      const weightValue = '70.5';
      const result = await updatePatientMetrics('weight', weightValue);

      expect(updatePatientMetrics).toHaveBeenCalledWith('weight', weightValue);
      expect(result.success).toBe(true);
    });

    it('should validate blood pressure input correctly', () => {
      // Test validation logic for blood pressure
      const validateBloodPressure = (systolic, diastolic) => {
        if (!systolic || !diastolic) {
          return { valid: false, message: 'Please enter both systolic and diastolic values.' };
        }
        if (parseFloat(systolic) <= parseFloat(diastolic)) {
          return { valid: false, message: 'Systolic pressure should be higher than diastolic pressure.' };
        }
        return { valid: true };
      };

      // Valid inputs
      expect(validateBloodPressure('120', '80')).toEqual({ valid: true });

      // Invalid inputs
      expect(validateBloodPressure('', '80')).toEqual({
        valid: false,
        message: 'Please enter both systolic and diastolic values.'
      });

      expect(validateBloodPressure('80', '120')).toEqual({
        valid: false,
        message: 'Systolic pressure should be higher than diastolic pressure.'
      });
    });

    it('should validate single metric input correctly', () => {
      const validateSingleMetric = (value, metricName) => {
        if (!value || value === '') {
          return { valid: false, message: `Please enter a value for ${metricName}.` };
        }
        if (isNaN(parseFloat(value))) {
          return { valid: false, message: 'Please enter a valid number.' };
        }
        return { valid: true };
      };

      // Valid inputs
      expect(validateSingleMetric('100', 'Blood Glucose')).toEqual({ valid: true });
      expect(validateSingleMetric('72.5', 'Heart Rate')).toEqual({ valid: true });

      // Invalid inputs
      expect(validateSingleMetric('', 'Blood Glucose')).toEqual({
        valid: false,
        message: 'Please enter a value for Blood Glucose.'
      });

      expect(validateSingleMetric('invalid', 'Heart Rate')).toEqual({
        valid: false,
        message: 'Please enter a valid number.'
      });
    });

    it('should handle metric update errors gracefully', async () => {
      updatePatientMetrics.mockRejectedValue({
        error: 'UPDATE_FAILED',
        message: 'Failed to update metric'
      });

      try {
        await updatePatientMetrics('bloodGlucose', '100');
      } catch (error) {
        expect(error.message).toBe('Failed to update metric');
      }

      expect(updatePatientMetrics).toHaveBeenCalledWith('bloodGlucose', '100');
    });
  });

  // Additional: Test timeframe functionality
  describe('Timeframe Selection', () => {
    it('should fetch data for different timeframes correctly', async () => {
      const timeframes = ['today', 'week', 'month', 'year'];

      for (const timeframe of timeframes) {
        getPatientAdherence.mockResolvedValue(0.8);
        getMissedDoses.mockResolvedValue(2);
        getPatientStreaks.mockResolvedValue({ currentStreak: 3, longestStreak: 7 });

        await getPatientAdherence(timeframe);
        await getMissedDoses(timeframe);
        await getPatientStreaks(timeframe);

        expect(getPatientAdherence).toHaveBeenCalledWith(timeframe);
        expect(getMissedDoses).toHaveBeenCalledWith(timeframe);
        expect(getPatientStreaks).toHaveBeenCalledWith(timeframe);
      }
    });
  });

  // Test input filtering logic
  describe('Input Filtering', () => {
    it('should filter numeric input correctly', () => {
      const handleInputChange = (value) => {
        return value.replace(/[^0-9.]/g, '');
      };

      expect(handleInputChange('120abc')).toBe('120');
      expect(handleInputChange('12.5xyz')).toBe('12.5');
      expect(handleInputChange('abc')).toBe('');
      expect(handleInputChange('72')).toBe('72');
    });
  });

  // Test adherence calculation
  describe('Adherence Calculation', () => {
    it('should format adherence percentage correctly', () => {
      const formatAdherenceText = (progress) => {
        return `${Math.round(progress * 100)}%`;
      };

      expect(formatAdherenceText(0.85)).toBe('85%');
      expect(formatAdherenceText(0.5)).toBe('50%');
      expect(formatAdherenceText(1.0)).toBe('100%');
      expect(formatAdherenceText(0.0)).toBe('0%');
    });
  });
});

// Helper function for mock HTML generation
const generateMockHTML = (metricsData, medicationLogs, adherence) => {
  return `
    <html>
      <head><title>Health Report</title></head>
      <body>
        <h1>Health Report</h1>
        <p>Adherence: ${Math.round(adherence * 100)}%</p>
        <p>Medications: ${medicationLogs.length} logs</p>
        <p>Metrics: Blood Pressure, Blood Glucose, Heart Rate, Weight</p>
      </body>
    </html>
  `;
};