// simplifiedMockData.js
// Contains bloodPressure (with systolic and diastolic), bloodGlucose, heartRate, and weight

const simplifiedMockData = {
  bloodPressure: {
    today: [
      { timestamp: '2025-05-20T06:00:00', value: 122, systolic: 122, diastolic: 80 },
      { timestamp: '2025-05-20T09:00:00', value: 118, systolic: 118, diastolic: 78 },
      { timestamp: '2025-05-20T12:00:00', value: 124, systolic: 124, diastolic: 82 },
      { timestamp: '2025-05-20T15:00:00', value: 120, systolic: 120, diastolic: 79 },
      { timestamp: '2025-05-20T18:00:00', value: 117, systolic: 117, diastolic: 77 },
      // No 9pm reading - simulated missing data
    ],
    week: [
      { timestamp: '2025-05-14', value: 121, systolic: 121, diastolic: 80 },
      { timestamp: '2025-05-15', value: 124, systolic: 124, diastolic: 82 },
      { timestamp: '2025-05-16', value: 119, systolic: 119, diastolic: 79 },
      { timestamp: '2025-05-17', value: null, systolic: null, diastolic: null }, // Missing data
      { timestamp: '2025-05-18', value: 122, systolic: 122, diastolic: 81 },
      { timestamp: '2025-05-19', value: 118, systolic: 118, diastolic: 78 },
      { timestamp: '2025-05-20', value: 120, systolic: 120, diastolic: 80 },
    ],
    month: [
      { timestamp: '2025-04-20', value: 123, systolic: 123, diastolic: 82 },
      { timestamp: '2025-04-27', value: 120, systolic: 120, diastolic: 80 },
      { timestamp: '2025-05-04', value: 118, systolic: 118, diastolic: 78 },
      { timestamp: '2025-05-11', value: null, systolic: null, diastolic: null }, // Missing data
      { timestamp: '2025-05-18', value: 121, systolic: 121, diastolic: 81 },
    ],
    year: [
      { timestamp: '2024-06-01', value: 124, systolic: 124, diastolic: 82 },
      { timestamp: '2024-07-01', value: 122, systolic: 122, diastolic: 80 },
      { timestamp: '2024-08-01', value: 120, systolic: 120, diastolic: 79 },
      { timestamp: '2024-09-01', value: 119, systolic: 119, diastolic: 78 },
      { timestamp: '2024-10-01', value: 121, systolic: 121, diastolic: 80 },
      { timestamp: '2024-11-01', value: 123, systolic: 123, diastolic: 81 },
      { timestamp: '2024-12-01', value: 125, systolic: 125, diastolic: 83 },
      { timestamp: '2025-01-01', value: 124, systolic: 124, diastolic: 82 },
      { timestamp: '2025-02-01', value: null, systolic: null, diastolic: null }, // Missing data
      { timestamp: '2025-03-01', value: 120, systolic: 120, diastolic: 79 },
      { timestamp: '2025-04-01', value: 118, systolic: 118, diastolic: 78 },
      { timestamp: '2025-05-01', value: 121, systolic: 121, diastolic: 80 },
    ]
  },
  
  bloodGlucose: {
    today: [
      { timestamp: '2025-05-20T06:00:00', value: 95, isFasting: true },
      { timestamp: '2025-05-20T09:00:00', value: 110, isFasting: false },
      { timestamp: '2025-05-20T12:00:00', value: 118, isFasting: false },
      { timestamp: '2025-05-20T15:00:00', value: 104, isFasting: false },
      { timestamp: '2025-05-20T18:00:00', value: 112, isFasting: false },
      { timestamp: '2025-05-20T21:00:00', value: 92, isFasting: false },
    ],
    week: [
      { timestamp: '2025-05-14', value: 97, isFasting: true },
      { timestamp: '2025-05-15', value: 94, isFasting: true },
      { timestamp: '2025-05-16', value: 96, isFasting: true },
      { timestamp: '2025-05-17', value: 98, isFasting: true },
      { timestamp: '2025-05-18', value: null, isFasting: null }, // Missing data
      { timestamp: '2025-05-19', value: 93, isFasting: true },
      { timestamp: '2025-05-20', value: 95, isFasting: true },
    ],
    month: [
      { timestamp: '2025-04-20', value: 96, isFasting: true },
      { timestamp: '2025-04-27', value: 94, isFasting: true },
      { timestamp: '2025-05-04', value: 97, isFasting: true },
      { timestamp: '2025-05-11', value: 95, isFasting: true },
      { timestamp: '2025-05-18', value: 93, isFasting: true },
    ],
    year: [
      { timestamp: '2024-06-01', value: 95, isFasting: true },
      { timestamp: '2024-07-01', value: 96, isFasting: true },
      { timestamp: '2024-08-01', value: 94, isFasting: true },
      { timestamp: '2024-09-01', value: 97, isFasting: true },
      { timestamp: '2024-10-01', value: 95, isFasting: true },
      { timestamp: '2024-11-01', value: 98, isFasting: true },
      { timestamp: '2024-12-01', value: 96, isFasting: true },
      { timestamp: '2025-01-01', value: 93, isFasting: true },
      { timestamp: '2025-02-01', value: 95, isFasting: true },
      { timestamp: '2025-03-01', value: null, isFasting: null }, // Missing data
      { timestamp: '2025-04-01', value: 94, isFasting: true },
      { timestamp: '2025-05-01', value: 95, isFasting: true },
    ]
  },
  
  heartRate: {
    today: [
      { timestamp: '2025-05-20T06:00:00', value: 68, restingRate: true },
      { timestamp: '2025-05-20T09:00:00', value: 72, restingRate: true },
      { timestamp: '2025-05-20T12:00:00', value: 75, restingRate: true },
      { timestamp: '2025-05-20T15:00:00', value: 70, restingRate: true },
      { timestamp: '2025-05-20T18:00:00', value: 73, restingRate: true },
      { timestamp: '2025-05-20T21:00:00', value: 69, restingRate: true },
    ],
    week: [
      { timestamp: '2025-05-14', value: 72, restingRate: true },
      { timestamp: '2025-05-15', value: 71, restingRate: true },
      { timestamp: '2025-05-16', value: 73, restingRate: true },
      { timestamp: '2025-05-17', value: 70, restingRate: true },
      { timestamp: '2025-05-18', value: 72, restingRate: true },
      { timestamp: '2025-05-19', value: null, restingRate: null }, // Missing data
      { timestamp: '2025-05-20', value: 71, restingRate: true },
    ],
    month: [
      { timestamp: '2025-04-20', value: 71, restingRate: true },
      { timestamp: '2025-04-27', value: 73, restingRate: true },
      { timestamp: '2025-05-04', value: 70, restingRate: true },
      { timestamp: '2025-05-11', value: 72, restingRate: true },
      { timestamp: '2025-05-18', value: 71, restingRate: true },
    ],
    year: [
      { timestamp: '2024-06-01', value: 73, restingRate: true },
      { timestamp: '2024-07-01', value: 72, restingRate: true },
      { timestamp: '2024-08-01', value: 74, restingRate: true },
      { timestamp: '2024-09-01', value: 73, restingRate: true },
      { timestamp: '2024-10-01', value: 71, restingRate: true },
      { timestamp: '2024-11-01', value: 70, restingRate: true },
      { timestamp: '2024-12-01', value: 72, restingRate: true },
      { timestamp: '2025-01-01', value: 74, restingRate: true },
      { timestamp: '2025-02-01', value: 73, restingRate: true },
      { timestamp: '2025-03-01', value: 71, restingRate: true },
      { timestamp: '2025-04-01', value: null, restingRate: null }, // Missing data
      { timestamp: '2025-05-01', value: 72, restingRate: true },
    ]
  },
  
  weight: {
    today: [
      { timestamp: '2025-05-20T06:00:00', value: 75.2, bmi: 24.6 },
      // Weight typically measured once per day
    ],
    week: [
      { timestamp: '2025-05-14', value: 75.8, bmi: 24.8 },
      { timestamp: '2025-05-15', value: 75.6, bmi: 24.7 },
      { timestamp: '2025-05-16', value: 75.5, bmi: 24.7 },
      { timestamp: '2025-05-17', value: 75.4, bmi: 24.7 },
      { timestamp: '2025-05-18', value: 75.3, bmi: 24.6 },
      { timestamp: '2025-05-19', value: null, bmi: null }, // Missing data
      { timestamp: '2025-05-20', value: 75.2, bmi: 24.6 },
    ],
    month: [
      { timestamp: '2025-04-20', value: 76.2, bmi: 24.9 },
      { timestamp: '2025-04-27', value: 76.0, bmi: 24.9 },
      { timestamp: '2025-05-04', value: 75.7, bmi: 24.8 },
      { timestamp: '2025-05-11', value: 75.5, bmi: 24.7 },
      { timestamp: '2025-05-18', value: 75.3, bmi: 24.6 },
    ],
    year: [
      { timestamp: '2024-06-01', value: 79.0, bmi: 25.8 },
      { timestamp: '2024-07-01', value: 78.5, bmi: 25.7 },
      { timestamp: '2024-08-01', value: 78.0, bmi: 25.5 },
      { timestamp: '2024-09-01', value: 77.6, bmi: 25.4 },
      { timestamp: '2024-10-01', value: 77.2, bmi: 25.3 },
      { timestamp: '2024-11-01', value: 76.8, bmi: 25.1 },
      { timestamp: '2024-12-01', value: null, bmi: null }, // Missing data
      { timestamp: '2025-01-01', value: 76.5, bmi: 25.0 },
      { timestamp: '2025-02-01', value: 76.3, bmi: 25.0 },
      { timestamp: '2025-03-01', value: 76.0, bmi: 24.9 },
      { timestamp: '2025-04-01', value: 75.8, bmi: 24.8 },
      { timestamp: '2025-05-01', value: 75.4, bmi: 24.7 },
    ]
  }
};

// Metadata for quick reference
const metricInfo = {
  bloodPressure: {
    title: 'Blood Pressure',
    unit: 'mmHg',
    icon: 'heart-pulse',
    color: '#5469d4',
    targetRange: [90, 120], // Systolic target range
    displayFormat: (data) => data.systolic && data.diastolic ? `${data.systolic}/${data.diastolic}` : '--/--'
  },
  bloodGlucose: {
    title: 'Blood Glucose',
    unit: 'mg/dL',
    icon: 'water',
    color: '#e67e22',
    targetRange: [70, 99], // Fasting target range
    displayFormat: (data) => data.value ? `${data.value}` : '--'
  },
  heartRate: {
    title: 'Heart Rate',
    unit: 'bpm',
    icon: 'heart',
    color: '#e74c3c',
    targetRange: [60, 100],
    displayFormat: (data) => data.value ? `${data.value}` : '--'
  },
  weight: {
    title: 'Weight',
    unit: 'kg',
    icon: 'scale-bathroom',
    color: '#3498db',
    targetRange: [65, 80],
    displayFormat: (data) => data.value ? `${data.value.toFixed(1)}` : '--'
  }
};

export { simplifiedMockData, metricInfo };