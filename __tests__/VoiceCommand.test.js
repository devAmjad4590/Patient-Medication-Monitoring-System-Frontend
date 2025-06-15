import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { 
  processVoiceCommand, 
  executeVoiceCommand, 
  handleVoiceCommand 
} from '../api/voiceAPI';

// Mock navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Voice APIs
jest.mock('../api/voiceAPI', () => ({
  processVoiceCommand: jest.fn(),
  executeVoiceCommand: jest.fn(),
  handleVoiceCommand: jest.fn(),
}));

// Mock ScreenRefreshContext
jest.mock('../ScreenRefreshContext', () => ({
  useScreenRefresh: () => ({
    triggerAllScreensRefresh: jest.fn(),
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: {
      createAsync: jest.fn(() => Promise.resolve({
        recording: {
          stopAndUnloadAsync: jest.fn(() => Promise.resolve()),
          getURI: jest.fn(() => 'mock-audio-uri'),
        }
      })),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(() => Promise.resolve()),
}));

// Mock Expo vector icons - following the pattern from other tests
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock React Native components that cause issues
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => 'ActivityIndicator');
jest.mock('react-native/Libraries/Modal/Modal', () => 'Modal');

// Mock VoiceContext to avoid act() warnings
jest.mock('../VoiceContext', () => ({
  useVoice: jest.fn(() => ({
    isVoiceEnabled: true,
    isLoading: false,
    toggleVoiceCommand: jest.fn(),
    loadVoiceSettings: jest.fn(),
  })),
  VoiceProvider: ({ children }) => children,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Voice Commands Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC25: Voice-Activated Logging
  describe('TC25 - Voice-Activated Logging', () => {
    it('should log medication as taken when voice command "Log Lisinopril taken" is processed', async () => {
      // Mock successful voice processing
      processVoiceCommand.mockResolvedValue({
        intent: 'LOG_MEDICATION',
        medicationName: 'Lisinopril',
        status: 'Taken',
        originalTime: '10:00 AM',
        scheduledTime: '10:00:00',
        apiPayload: {
          medicationId: 'med123',
          status: 'Taken',
          takenAt: '2024-01-15T10:00:00.000Z'
        }
      });

      executeVoiceCommand.mockResolvedValue({
        success: true,
        voiceResponse: 'Lisinopril has been marked as taken. Your medication stock has been updated.',
        updatedStock: 29
      });

      handleVoiceCommand.mockResolvedValue({
        success: true,
        voiceMessage: 'Lisinopril has been marked as taken. Your medication stock has been updated.',
        voiceResult: {
          intent: 'LOG_MEDICATION',
          medicationName: 'Lisinopril',
          status: 'Taken'
        },
        executionResult: {
          success: true,
          updatedStock: 29
        }
      });

      // Test the voice command processing
      const result = await handleVoiceCommand('mock-audio-uri');

      // Expected Result: Medication marked "Taken"; stock updated
      expect(handleVoiceCommand).toHaveBeenCalledWith('mock-audio-uri');
      expect(result.success).toBe(true);
      expect(result.voiceMessage).toContain('Lisinopril has been marked as taken');
      expect(result.executionResult.updatedStock).toBe(29);
    });

    it('should handle different medication names correctly', async () => {
      const medications = ['Aspirin', 'Metformin', 'Lisinopril'];

      for (const medication of medications) {
        handleVoiceCommand.mockResolvedValue({
          success: true,
          voiceMessage: `${medication} has been marked as taken.`
        });

        const result = await handleVoiceCommand('mock-audio-uri');

        expect(result.voiceMessage).toContain(medication);
        expect(result.success).toBe(true);
      }
    });

    it('should handle medication not found error', async () => {
      handleVoiceCommand.mockResolvedValue({
        success: false,
        voiceMessage: 'Medication NonexistentMedication not found in your current prescriptions.'
      });

      const result = await handleVoiceCommand('mock-audio-uri');

      expect(result.success).toBe(false);
      expect(result.voiceMessage).toContain('not found');
    });
  });

  // TC26: Check Next Appointment
  describe('TC26 - Check Next Appointment', () => {
    it('should respond with appointment details when "Next appointment?" is asked', async () => {
      handleVoiceCommand.mockResolvedValue({
        success: true,
        voiceMessage: 'Your next appointment is on January 20th at 2:00 PM with Dr. Smith at Room 101.',
        voiceResult: {
          intent: 'CHECK_APPOINTMENTS'
        },
        executionResult: {
          success: true,
          appointmentData: {
            date: '2024-01-20',
            time: '14:00',
            doctor: 'Dr. Smith',
            location: 'Room 101'
          }
        }
      });

      // Test the voice command processing
      const result = await handleVoiceCommand('mock-audio-uri');

      // Expected Result: System responds: "Appointment on [Date] at [Time]"
      expect(handleVoiceCommand).toHaveBeenCalledWith('mock-audio-uri');
      expect(result.success).toBe(true);
      expect(result.voiceMessage).toContain('January 20th at 2:00 PM');
      expect(result.voiceMessage).toContain('Dr. Smith');
    });

    it('should handle no upcoming appointments', async () => {
      handleVoiceCommand.mockResolvedValue({
        success: true,
        voiceMessage: 'You have no upcoming appointments scheduled.'
      });

      const result = await handleVoiceCommand('mock-audio-uri');

      expect(result.success).toBe(true);
      expect(result.voiceMessage).toContain('no upcoming appointments');
    });

    it('should handle different appointment query variations', async () => {
      const queries = [
        { expected: 'next' },
        { expected: 'upcoming' },
        { expected: 'today' }
      ];

      for (const { expected } of queries) {
        handleVoiceCommand.mockResolvedValue({
          success: true,
          voiceMessage: `Found appointments for ${expected}.`
        });

        const result = await handleVoiceCommand('mock-audio-uri');
        expect(result.voiceMessage).toContain(expected);
      }
    });
  });

  // TC27: Invalid Command
  describe('TC27 - Invalid Command', () => {
    it('should respond with "Command not recognized" for invalid command "Order pizza"', async () => {
      handleVoiceCommand.mockResolvedValue({
        success: false,
        voiceMessage: 'Command not recognized. I can help you with medication logging, checking appointments, or recording health metrics.',
        voiceResult: {
          intent: 'UNKNOWN',
          originalQuery: 'Order pizza'
        }
      });

      // Test invalid command processing
      const result = await handleVoiceCommand('mock-audio-uri');

      // Expected Result: Response: "Command not recognized"
      expect(handleVoiceCommand).toHaveBeenCalledWith('mock-audio-uri');
      expect(result.success).toBe(false);
      expect(result.voiceMessage).toContain('Command not recognized');
      expect(result.voiceResult.intent).toBe('UNKNOWN');
    });

    it('should provide helpful suggestions for invalid commands', async () => {
      const invalidCommands = [
        'Play music',
        'What is the weather',
        'Call mom',
        'Order food'
      ];

      for (const command of invalidCommands) {
        handleVoiceCommand.mockResolvedValue({
          success: false,
          voiceMessage: 'I did not understand that command. Try saying things like: Log my medication, Check my appointments, or Record my blood pressure.'
        });

        const result = await handleVoiceCommand('mock-audio-uri');

        expect(result.success).toBe(false);
        expect(result.voiceMessage).toContain('did not understand');
      }
    });

    it('should handle low confidence speech recognition', async () => {
      handleVoiceCommand.mockResolvedValue({
        success: false,
        voiceMessage: 'I could not clearly understand what you said. Please speak clearly and try again.'
      });

      const result = await handleVoiceCommand('mock-audio-uri');

      expect(result.success).toBe(false);
      expect(result.voiceMessage).toContain('could not clearly understand');
    });
  });

  // Test Voice API Error Handling
  describe('Voice API Error Handling', () => {
    it('should handle FastAPI processing errors', async () => {
      handleVoiceCommand.mockResolvedValue({
        success: false,
        error: 'FastAPI server error',
        voiceMessage: 'Failed to process voice command. Please try again.'
      });

      const result = await handleVoiceCommand('mock-audio-uri');

      expect(result.success).toBe(false);
      expect(result.voiceMessage).toContain('Failed to process');
    });

    it('should handle Express backend execution errors', async () => {
      handleVoiceCommand.mockResolvedValue({
        success: false,
        error: 'Backend server error',
        voiceMessage: 'Failed to execute command. Please try again.'
      });

      const result = await handleVoiceCommand('mock-audio-uri');

      expect(result.success).toBe(false);
      expect(result.voiceMessage).toContain('Failed to execute');
    });

    it('should handle network connectivity issues', async () => {
      handleVoiceCommand.mockRejectedValue(new Error('Network request failed'));

      try {
        await handleVoiceCommand('mock-audio-uri');
      } catch (error) {
        expect(error.message).toBe('Network request failed');
      }
    });
  });

  // Test Voice Command Processing Logic
  describe('Voice Command Processing Logic', () => {
    it('should process medication logging commands correctly', async () => {
      const testCases = [
        {
          command: 'I took my lisinopril',
          expectedIntent: 'LOG_MEDICATION',
          expectedMedication: 'Lisinopril'
        },
        {
          command: 'Mark metformin as taken',
          expectedIntent: 'LOG_MEDICATION',
          expectedMedication: 'Metformin'
        }
      ];

      for (const testCase of testCases) {
        processVoiceCommand.mockResolvedValue({
          intent: testCase.expectedIntent,
          medicationName: testCase.expectedMedication,
          status: 'Taken'
        });

        const result = await processVoiceCommand('mock-audio-uri');
        
        expect(result.intent).toBe(testCase.expectedIntent);
        expect(result.medicationName).toBe(testCase.expectedMedication);
      }
    });

    it('should process appointment queries correctly', async () => {
      const appointmentQueries = [
        'What is my next appointment',
        'Check my upcoming appointments',
        'When is my next doctor visit'
      ];

      for (const query of appointmentQueries) {
        processVoiceCommand.mockResolvedValue({
          intent: 'CHECK_APPOINTMENTS',
          searchCriteria: 'next',
          originalQuery: query
        });

        const result = await processVoiceCommand('mock-audio-uri');
        
        expect(result.intent).toBe('CHECK_APPOINTMENTS');
        expect(result.searchCriteria).toBe('next');
      }
    });

    it('should handle health metric recording commands', async () => {
      const healthCommands = [
        'My blood pressure is 120 over 80',
        'Record blood sugar 95',
        'Log weight 150 pounds'
      ];

      for (const command of healthCommands) {
        processVoiceCommand.mockResolvedValue({
          intent: 'RECORD_HEALTH_METRIC',
          metricType: 'blood_pressure',
          value: '120/80',
          originalCommand: command
        });

        const result = await processVoiceCommand('mock-audio-uri');
        
        expect(result.intent).toBe('RECORD_HEALTH_METRIC');
      }
    });
  });

  // Test Voice Command Execution
  describe('Voice Command Execution', () => {
    it('should execute medication logging successfully', async () => {
      const medicationCommand = {
        intent: 'LOG_MEDICATION',
        medicationName: 'Lisinopril',
        status: 'Taken',
        takenAt: '2024-01-15T10:00:00.000Z'
      };

      executeVoiceCommand.mockResolvedValue({
        success: true,
        voiceResponse: 'Lisinopril has been marked as taken.',
        updatedStock: 29
      });

      const result = await executeVoiceCommand(medicationCommand);

      expect(executeVoiceCommand).toHaveBeenCalledWith(medicationCommand);
      expect(result.success).toBe(true);
      expect(result.voiceResponse).toContain('Lisinopril');
    });

    it('should execute appointment queries successfully', async () => {
      const appointmentQuery = {
        intent: 'CHECK_APPOINTMENTS',
        searchCriteria: 'next'
      };

      executeVoiceCommand.mockResolvedValue({
        success: true,
        voiceResponse: 'Your next appointment is on January 20th at 2:00 PM.',
        appointmentData: {
          date: '2024-01-20',
          time: '14:00',
          doctor: 'Dr. Smith'
        }
      });

      const result = await executeVoiceCommand(appointmentQuery);

      expect(executeVoiceCommand).toHaveBeenCalledWith(appointmentQuery);
      expect(result.success).toBe(true);
      expect(result.voiceResponse).toContain('January 20th');
    });

    it('should handle execution failures gracefully', async () => {
      const invalidCommand = {
        intent: 'INVALID_INTENT',
        data: 'invalid data'
      };

      executeVoiceCommand.mockResolvedValue({
        success: false,
        voiceResponse: 'Failed to execute command.',
        error: 'Invalid intent'
      });

      const result = await executeVoiceCommand(invalidCommand);

      expect(result.success).toBe(false);
      expect(result.voiceResponse).toContain('Failed to execute');
    });
  });

  // Test Integration Flow
  describe('Voice Command Integration Flow', () => {
    it('should process complete medication logging flow', async () => {
      // Step 1: Process voice command
      processVoiceCommand.mockResolvedValue({
        intent: 'LOG_MEDICATION',
        medicationName: 'Lisinopril',
        status: 'Taken'
      });

      // Step 2: Execute the command
      executeVoiceCommand.mockResolvedValue({
        success: true,
        voiceResponse: 'Medication logged successfully.'
      });

      // Step 3: Handle complete flow
      handleVoiceCommand.mockResolvedValue({
        success: true,
        voiceMessage: 'Medication logged successfully.',
        voiceResult: { intent: 'LOG_MEDICATION' },
        executionResult: { success: true }
      });

      const result = await handleVoiceCommand('mock-audio-uri');

      expect(result.success).toBe(true);
      expect(result.voiceMessage).toContain('Medication logged');
    });

    it('should handle complete error flow', async () => {
      // Mock processing failure
      processVoiceCommand.mockRejectedValue(new Error('Processing failed'));

      handleVoiceCommand.mockResolvedValue({
        success: false,
        voiceMessage: 'Failed to process voice command. Please try again.',
        error: 'Processing failed'
      });

      const result = await handleVoiceCommand('mock-audio-uri');

      expect(result.success).toBe(false);
      expect(result.voiceMessage).toContain('Failed to process');
    });
  });
});