const mockNotifications = [
    {
      id: 'n1',
      title: 'Time to take Paracetamol',
      message: 'Your 500mg Paracetamol dose is scheduled for 8:00 AM.',
      type: 'reminder',
      date: '2025-04-13T08:00:00Z',
      read: false,
    },
    {
      id: 'n2',
      title: 'Low Stock: Ibuprofen',
      message: 'You have only 4 capsules of Ibuprofen left. Consider restocking.',
      type: 'warning',
      date: '2025-04-12T10:30:00Z',
      read: false,
    },
    {
      id: 'n3',
      title: 'Upcoming Appointment',
      message: 'You have a check-up with Dr. Ayesha Malik tomorrow at 9:00 AM.',
      type: 'appointment',
      date: '2025-04-12T09:00:00Z',
      read: true,
    },
    {
      id: 'n4',
      title: 'Medication Intake Logged',
      message: 'You confirmed your 7:00 PM Metformin intake.',
      type: 'log',
      date: '2025-04-11T19:00:00Z',
      read: true,
    },
    {
      id: 'n5',
      title: 'New Medication Added',
      message: 'Lisinopril has been added to your medication list.',
      type: 'system',
      date: '2025-04-10T14:45:00Z',
      read: true,
    },
    {
      id: 'n6',
      title: 'Refill Reminder',
      message: 'Aspirin stock is getting low. You have 3 doses remaining.',
      type: 'reminder',
      date: '2025-04-11T07:15:00Z',
      read: false,
    }
  ];
  
  module.exports = mockNotifications;
  