import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { handleVoiceCommand } from '../api/voiceAPI';
import { useNavigation } from '@react-navigation/native';
import { useScreenRefresh } from '../ScreenRefreshContext';

const VoiceCommandModal = ({ visible, onClose }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const navigation = useNavigation();
  const { triggerAllScreensRefresh } = useScreenRefresh();

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      clearInterval(interval);
      pulseAnim.setValue(1);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
      Alert.alert('Error', 'Failed to setup audio recording');
    }
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      await setupAudio();

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('Stopping recording...');
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      setRecording(null);
      setRecordingTime(0);
      
      // Process the voice command
      await processVoiceCommand(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Simple TTS function - just speak whatever message we get
  const speakMessage = async (message) => {
    if (!message) return;
    
    try {
      console.log('🔊 Speaking:', message);
      await Speech.speak(message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const processVoiceCommand = async (audioUri) => {
    if (!audioUri) {
      Alert.alert('Error', 'No audio recorded');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Processing voice command...');
      
      const result = await handleVoiceCommand(audioUri);
      console.log('Voice command result:', result);
      
      // Get the voice message to speak
      const messageToSpeak = result.voiceMessage;
      
      // Always speak the message (whether success or error)
      await speakMessage(messageToSpeak);
      
      // Show alert based on success/failure
      if (result.success) {
        Alert.alert(
          'Success',
          messageToSpeak,
          [{ 
            text: 'OK', 
            onPress: () => {
              onClose();
              // Trigger refresh for all screens after successful voice command
              console.log('🔄 Triggering screen refresh after successful voice command');
              setTimeout(() => {
                triggerAllScreensRefresh();
              }, 100);
            }
          }]
        );
      } else {
        Alert.alert(
          'Error', 
          messageToSpeak,
          [{ text: 'OK', onPress: onClose }]
        );
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorMessage = 'Failed to process voice command. Please try again.';
      await speakMessage(errorMessage);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      } catch (error) {
        console.error('Error canceling recording:', error);
      }
    }
    setIsRecording(false);
    setRecordingTime(0);
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={cancelRecording}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Voice Command</Text>
            <TouchableOpacity onPress={cancelRecording} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#2F7EF5" />
                <Text style={styles.processingText}>Processing your command...</Text>
              </View>
            ) : (
              <>
                <View style={styles.instructionContainer}>
                  <Text style={styles.instructionText}>
                    {isRecording 
                      ? "Speak your medication command clearly" 
                      : "Tap the microphone to start recording"
                    }
                  </Text>
                </View>

                <View style={styles.recordingContainer}>
                  <Animated.View
                    style={[
                      styles.microphoneButton,
                      isRecording && styles.recordingButton,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <TouchableOpacity
                      onPress={isRecording ? stopRecording : startRecording}
                      style={styles.microphoneTouchable}
                    >
                      <MaterialIcons
                        name={isRecording ? "stop" : "mic"}
                        size={60}
                        color="white"
                      />
                    </TouchableOpacity>
                  </Animated.View>

                  {isRecording && (
                    <Text style={styles.recordingTime}>
                      Recording: {formatTime(recordingTime)}
                    </Text>
                  )}
                </View>

                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesTitle}>Example commands:</Text>
                  <Text style={styles.exampleText}>• "I took my lisinopril at 10am"</Text>
                  <Text style={styles.exampleText}>• "Mark my metformin as missed yesterday at 8pm"</Text>
                  <Text style={styles.exampleText}>• "My blood pressure is 120 over 80"</Text>
                  <Text style={styles.exampleText}>• "What are my upcoming appointments?"</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  instructionContainer: {
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  microphoneButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2F7EF5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingButton: {
    backgroundColor: '#e74c3c',
  },
  microphoneTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingTime: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  examplesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    lineHeight: 18,
  },
});

export default VoiceCommandModal;