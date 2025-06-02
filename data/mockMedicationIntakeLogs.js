const mockMedicationIntakeLogs = [
    {
      id: 'log1',
      userId: '101',
      medicationId: '1',
      intakeTime: '2025-04-13T08:00:00Z',
      status: 'Pending',
      medication: {
        name: 'Paracetamol',
        type: 'Tablet'
      }
    },
    {
      id: 'log2',
      userId: '101',
      medicationId: '1',
      intakeTime: '2025-04-13T20:00:00Z',
      status: 'Pending',
      medication: {
        name: 'Paracetamol',
        type: 'Tablet'
      }
    },
    {
      id: 'log3',
      userId: '102',
      medicationId: '2',
      intakeTime: '2025-04-13T09:00:00Z',
      status: 'Taken',
      medication: {
        name: 'Ibuprofen',
        type: 'Tablet'
      }
    },
    {
      id: 'log4',
      userId: '102',
      medicationId: '2',
      intakeTime: '2025-04-13T21:00:00Z',
      status: 'Pending',
      medication: {
        name: 'Ibuprofen',
        type: 'Tablet'
      }
    },
  ];
  
  export default mockMedicationIntakeLogs;
  