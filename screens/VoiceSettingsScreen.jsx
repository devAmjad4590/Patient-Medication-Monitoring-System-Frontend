import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useVoice } from '../VoiceContext';

function VoiceSettingsScreen() {
  const { isVoiceEnabled, isLoading, loadVoiceSettings, toggleVoiceCommand } = useVoice();

  useEffect(() => {
    loadVoiceSettings();
  }, [loadVoiceSettings]);

  const handleToggleVoice = async (value) => {
    try {
      await toggleVoiceCommand(value);
      
      if (value) {
        Alert.alert(
          'Voice Commands Enabled',
          'A floating microphone button will now appear on your screens. Tap it to give voice commands for medication tracking, health metrics, and more.',
          [{ text: 'Got it!' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update voice command settings');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading voice settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Main Toggle Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="settings-voice" size={24} color="#2F7EF5" />
            <Text style={styles.sectionTitle}>Voice Commands</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Voice Commands</Text>
              <Text style={styles.settingDescription}>
                Allow voice control for medication tracking and health metrics
              </Text>
            </View>
            <Switch
              value={isVoiceEnabled}
              onValueChange={handleToggleVoice}
              trackColor={{ false: '#e0e0e0', true: '#2F7EF5' }}
              thumbColor={isVoiceEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info-outline" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Available Commands</Text>
          </View>
          
          <View style={styles.featuresList}>
            <FeatureItem
              icon="medication"
              title="Medication Tracking"
              description="Mark medications as taken, missed, or pending"
              examples={[
                "I took my lisinopril at 8am",
                "Mark my metformin as missed yesterday at 2pm"
              ]}
            />
            
            <FeatureItem
              icon="favorite"
              title="Health Metrics"
              description="Record blood pressure, weight, heart rate, and blood glucose"
              examples={[
                "My blood pressure is 120 over 80",
                "Record my weight as 70 kilograms"
              ]}
            />
            
            <FeatureItem
              icon="calendar-today"
              title="Appointments"
              description="Check upcoming and past appointments"
              examples={[
                "What is my next upcoming appointment today?",
                "Show me my recent appointment"
              ]}
            />
            
            <FeatureItem
              icon="analytics"
              title="Analytics"
              description="Get medication adherence rates and streaks"
              examples={[
                "What is my adherence rate this week?",
                "What is my current streak?"
              ]}
            />
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="help-outline" size={24} color="#666" />
            <Text style={styles.sectionTitle}>How to Use</Text>
          </View>
          
          <View style={styles.instructionsList}>
            <InstructionStep
              step="1"
              text="Tap the floating microphone button that appears in the bottom right of your screen"
            />
            <InstructionStep
              step="2"
              text="Speak your command clearly when the recording starts"
            />
            <InstructionStep
              step="3"
              text="Tap the stop button when you're done speaking"
            />
            <InstructionStep
              step="4"
              text="Wait for the system to process and confirm your command"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="security" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
          </View>
          
          <Text style={styles.privacyText}>
            • Voice recordings are processed securely and not stored permanently{'\n'}
            • Audio data is only used to understand your medication commands{'\n'}
            • You can disable voice commands at any time{'\n'}
            • All voice data follows the same privacy standards as your other health information
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const FeatureItem = ({ icon, title, description, examples }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureHeader}>
      <MaterialIcons name={icon} size={20} color="#2F7EF5" />
      <Text style={styles.featureTitle}>{title}</Text>
    </View>
    <Text style={styles.featureDescription}>{description}</Text>
    <View style={styles.examplesContainer}>
      {examples.map((example, index) => (
        <Text key={index} style={styles.exampleText}>
          "{example}"
        </Text>
      ))}
    </View>
  </View>
);

const InstructionStep = ({ step, text }) => (
  <View style={styles.instructionStep}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{step}</Text>
    </View>
    <Text style={styles.instructionText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#2F7EF5',
    paddingLeft: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  examplesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
  },
  exampleText: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  instructionsList: {
    gap: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2F7EF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default VoiceSettingsScreen;