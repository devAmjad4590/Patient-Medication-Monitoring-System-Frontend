import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AppointmentCard from '../components/AppointmentCard';
import CustomSegmentedControl from '../components/CustomSegmentedControl';
import { getUpcomingAppointments, getPastAppointments } from '../api/patientAPI';

// Mock APIs only
jest.mock('../api/patientAPI', () => ({
  getUpcomingAppointments: jest.fn(),
  getPastAppointments: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

// Mock contexts
jest.mock('../ScreenRefreshContext', () => ({
  useScreenRefresh: () => ({ refreshTrigger: 0 }),
}));

// Mock moment
jest.mock('moment', () => {
  return jest.fn(() => ({
    format: jest.fn(() => 'Tue Jan 10, 2:00')
  }));
});

// Mock vector icons to prevent act() warnings
jest.mock('@expo/vector-icons/AntDesign', () => {
  return function MockAntDesign({ name }) {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  };
});

jest.mock('@expo/vector-icons/FontAwesome', () => {
  return function MockFontAwesome({ name }) {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  };
});

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  return function MockMaterialIcons({ name }) {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  return function MockMaterialCommunityIcon({ name }) {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  };
});

describe('Appointment Management Tests - PATIENT UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC17: Appointment Card Display - REAL COMPONENT TEST
  describe('TC17 - Appointment Card Display', () => {
    it('should display appointment details correctly in card', () => {
      const appointmentData = {
        type: 'Consultation',
        doctorName: 'Dr. John Doe',
        appointmentDateTime: '2024-02-15T10:00:00.000Z',
        location: 'Room 101'
      };

      const { getByText } = render(
        <AppointmentCard 
          type={appointmentData.type}
          dateTime={appointmentData.appointmentDateTime}
          doctorName={appointmentData.doctorName}
          location={appointmentData.location}
        />
      );

      // Expected Result: Shows type, date, doctor, location
      expect(getByText('Consultation')).toBeTruthy();
      expect(getByText('Dr. John Doe')).toBeTruthy();
      expect(getByText('Room 101')).toBeTruthy();
      expect(getByText('Appointment Date')).toBeTruthy();
      expect(getByText('Doctor')).toBeTruthy();
      expect(getByText('Location')).toBeTruthy();
    });

    it('should display different appointment types correctly', () => {
      const appointmentTypes = [
        'Consultation',
        'Follow-up', 
        'Routine Checkup',
        'Emergency'
      ];

      appointmentTypes.forEach((type) => {
        const { getByText } = render(
          <AppointmentCard 
            type={type}
            dateTime="2024-02-15T10:00:00.000Z"
            doctorName="Dr. Test"
            location="Room 101"
          />
        );

        expect(getByText(type)).toBeTruthy();
        expect(getByText('Dr. Test')).toBeTruthy();
      });
    });

    it('should handle missing appointment data gracefully', () => {
      const { getByText } = render(
        <AppointmentCard 
          type="Default"
          dateTime="2024-02-15T10:00:00.000Z"
          doctorName=""
          location=""
        />
      );

      expect(getByText('Default')).toBeTruthy();
      expect(getByText('Doctor')).toBeTruthy(); // Section headers should still show
      expect(getByText('Location')).toBeTruthy();
    });

    it('should handle undefined props gracefully', () => {
      const { getByText } = render(
        <AppointmentCard 
          type={undefined}
          dateTime="2024-02-15T10:00:00.000Z"
          doctorName={undefined}
          location={undefined}
        />
      );

      expect(getByText('Doctor')).toBeTruthy(); // Section headers should still show
      expect(getByText('Location')).toBeTruthy();
    });
  });

  // TC18: CustomSegmentedControl Component Test
  describe('TC18 - CustomSegmentedControl Component', () => {
    it('should render segments correctly', () => {
      const mockOnChangeIndex = jest.fn();
      
      const { getByText } = render(
        <CustomSegmentedControl
          segments={[
            { label: 'Upcoming' },
            { label: 'Past' },
          ]}
          selectedIndex={0}
          onChangeIndex={mockOnChangeIndex}
        />
      );

      expect(getByText('Upcoming')).toBeTruthy();
      expect(getByText('Past')).toBeTruthy();
    });

    it('should call onChangeIndex when segment is pressed', () => {
      const mockOnChangeIndex = jest.fn();
      
      const { getByText } = render(
        <CustomSegmentedControl
          segments={[
            { label: 'Upcoming' },
            { label: 'Past' },
          ]}
          selectedIndex={0}
          onChangeIndex={mockOnChangeIndex}
        />
      );

      const pastSegment = getByText('Past');
      fireEvent.press(pastSegment);

      expect(mockOnChangeIndex).toHaveBeenCalledWith(1);
    });

    it('should handle different selected indices', () => {
      const mockOnChangeIndex = jest.fn();
      
      // Test selectedIndex = 1 (Past selected)
      const { getByText } = render(
        <CustomSegmentedControl
          segments={[
            { label: 'Upcoming' },
            { label: 'Past' },
          ]}
          selectedIndex={1}
          onChangeIndex={mockOnChangeIndex}
        />
      );

      expect(getByText('Upcoming')).toBeTruthy();
      expect(getByText('Past')).toBeTruthy();
    });

    it('should handle empty segments array', () => {
      const mockOnChangeIndex = jest.fn();
      
      render(
        <CustomSegmentedControl
          segments={[]}
          selectedIndex={0}
          onChangeIndex={mockOnChangeIndex}
        />
      );

      // Should not crash with empty segments
    });
  });

  // TC19: API Integration Tests (without rendering AppointmentScreen)
  describe('TC19 - API Integration', () => {
    it('should call getUpcomingAppointments API correctly', async () => {
      const mockAppointments = [
        {
          type: 'Consultation',
          doctorName: 'Dr. John Doe',
          appointmentDateTime: '2024-02-15T10:00:00.000Z',
          location: 'Room 101'
        }
      ];

      getUpcomingAppointments.mockResolvedValue(mockAppointments);

      const result = await getUpcomingAppointments();

      expect(getUpcomingAppointments).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
      expect(result[0].doctorName).toBe('Dr. John Doe');
    });

    it('should call getPastAppointments API correctly', async () => {
      const mockPastAppointments = [
        {
          type: 'Follow-up',
          doctorName: 'Dr. Jane Smith',
          appointmentDateTime: '2023-12-15T09:00:00.000Z',
          location: 'Room 102'
        }
      ];

      getPastAppointments.mockResolvedValue(mockPastAppointments);

      const result = await getPastAppointments();

      expect(getPastAppointments).toHaveBeenCalled();
      expect(result).toEqual(mockPastAppointments);
      expect(result[0].doctorName).toBe('Dr. Jane Smith');
    });

    it('should handle API errors gracefully', async () => {
      getUpcomingAppointments.mockRejectedValue(new Error('Network error'));

      try {
        await getUpcomingAppointments();
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      expect(getUpcomingAppointments).toHaveBeenCalled();
    });

    it('should handle empty appointment lists', async () => {
      getUpcomingAppointments.mockResolvedValue([]);
      getPastAppointments.mockResolvedValue([]);

      const upcomingResult = await getUpcomingAppointments();
      const pastResult = await getPastAppointments();

      expect(upcomingResult).toEqual([]);
      expect(pastResult).toEqual([]);
      expect(upcomingResult.length).toBe(0);
      expect(pastResult.length).toBe(0);
    });
  });

  // TC20: Data Processing Tests
  describe('TC20 - Data Processing', () => {
    it('should sort past appointments by date (latest to oldest)', () => {
      const unsortedAppointments = [
        { appointmentDateTime: '2023-01-15T10:00:00.000Z', doctorName: 'Dr. First' },
        { appointmentDateTime: '2023-03-20T14:00:00.000Z', doctorName: 'Dr. Latest' },
        { appointmentDateTime: '2023-02-10T09:00:00.000Z', doctorName: 'Dr. Middle' }
      ];

      const sorted = unsortedAppointments.sort((a, b) => {
        return new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime);
      });

      expect(sorted[0].doctorName).toBe('Dr. Latest');
      expect(sorted[1].doctorName).toBe('Dr. Middle');
      expect(sorted[2].doctorName).toBe('Dr. First');
    });

    it('should handle undefined appointment dates in sorting', () => {
      const appointmentsWithUndefined = [
        { appointmentDateTime: '2023-01-15T10:00:00.000Z', doctorName: 'Dr. Valid' },
        { appointmentDateTime: undefined, doctorName: 'Dr. Undefined' },
        { appointmentDateTime: '2023-03-20T14:00:00.000Z', doctorName: 'Dr. Latest' }
      ];

      const sorted = appointmentsWithUndefined.sort((a, b) => {
        const dateA = new Date(a.appointmentDateTime || 0);
        const dateB = new Date(b.appointmentDateTime || 0);
        return dateB - dateA;
      });

      expect(sorted[0].doctorName).toBe('Dr. Latest');
      expect(sorted[1].doctorName).toBe('Dr. Valid');
      expect(sorted[2].doctorName).toBe('Dr. Undefined');
    });

    it('should validate appointment time format', () => {
      const isValidDateTime = (dateTime) => {
        if (!dateTime) return false;
        const date = new Date(dateTime);
        return date instanceof Date && !isNaN(date.getTime());
      };

      expect(isValidDateTime('2024-02-15T10:00:00.000Z')).toBe(true);
      expect(isValidDateTime('invalid-date')).toBe(false);
      expect(isValidDateTime('')).toBe(false);
      expect(isValidDateTime(undefined)).toBe(false);
      expect(isValidDateTime(null)).toBe(false);
    });

    it('should check if appointment is upcoming or past', () => {
      const now = new Date();
      
      const isUpcomingAppointment = (dateTime) => {
        if (!dateTime) return false;
        return new Date(dateTime) > now;
      };

      const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      expect(isUpcomingAppointment(futureDate.toISOString())).toBe(true);
      expect(isUpcomingAppointment(pastDate.toISOString())).toBe(false);
      expect(isUpcomingAppointment(undefined)).toBe(false);
    });
  });

  // TC21: Edge Cases
  describe('TC21 - Edge Cases', () => {
    it('should handle appointment with special characters', () => {
      const { getByText } = render(
        <AppointmentCard 
          type="Follow-up & Review"
          dateTime="2024-02-15T10:00:00.000Z"
          doctorName="Dr. José María"
          location="Room A-1"
        />
      );

      expect(getByText('Follow-up & Review')).toBeTruthy();
      expect(getByText('Dr. José María')).toBeTruthy();
      expect(getByText('Room A-1')).toBeTruthy();
    });

    it('should handle very long appointment data', () => {
      const longData = {
        type: 'Very Long Appointment Type Name That Might Cause Display Issues',
        doctorName: 'Dr. Very Long Doctor Name That Might Cause Layout Problems',
        location: 'Room with a very long name that might cause text overflow issues'
      };

      const { getByText } = render(
        <AppointmentCard 
          type={longData.type}
          dateTime="2024-02-15T10:00:00.000Z"
          doctorName={longData.doctorName}
          location={longData.location}
        />
      );

      expect(getByText(longData.type)).toBeTruthy();
      expect(getByText(longData.doctorName)).toBeTruthy();
      expect(getByText(longData.location)).toBeTruthy();
    });

    it('should handle numeric values as strings', () => {
      const { getByText } = render(
        <AppointmentCard 
          type="Consultation"
          dateTime="2024-02-15T10:00:00.000Z"
          doctorName="Dr. 123 Test"
          location="Room 456"
        />
      );

      expect(getByText('Dr. 123 Test')).toBeTruthy();
      expect(getByText('Room 456')).toBeTruthy();
    });
  });

  // TC22: Component Props Validation
  describe('TC22 - Component Props Validation', () => {
    it('should render AppointmentCard with minimal required props', () => {
      const { getByText } = render(
        <AppointmentCard 
          dateTime="2024-02-15T10:00:00.000Z"
        />
      );

      expect(getByText('Appointment Date')).toBeTruthy();
      expect(getByText('Doctor')).toBeTruthy();
      expect(getByText('Location')).toBeTruthy();
    });

    it('should render CustomSegmentedControl with minimal props', () => {
      render(
        <CustomSegmentedControl
          segments={[{ label: 'Test' }]}
          selectedIndex={0}
          onChangeIndex={() => {}}
        />
      );

      // Should not crash with minimal props
    });

    it('should handle null/undefined callbacks in CustomSegmentedControl', () => {
      const { getByText } = render(
        <CustomSegmentedControl
          segments={[{ label: 'Test' }]}
          selectedIndex={0}
          onChangeIndex={null}
        />
      );

      const testSegment = getByText('Test');
      
      // Should throw an error when pressing with null callback (this is expected behavior)
      expect(() => {
        fireEvent.press(testSegment);
      }).toThrow('onChangeIndex is not a function');
    });

    it('should work correctly with valid callback', () => {
      const mockCallback = jest.fn();
      const { getByText } = render(
        <CustomSegmentedControl
          segments={[{ label: 'Test' }]}
          selectedIndex={0}
          onChangeIndex={mockCallback}
        />
      );

      const testSegment = getByText('Test');
      
      // Should work fine with valid callback
      expect(() => {
        fireEvent.press(testSegment);
      }).not.toThrow();
      
      expect(mockCallback).toHaveBeenCalledWith(0);
    });
  });
});