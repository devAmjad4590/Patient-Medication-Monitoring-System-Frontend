import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getPatientMedication, getMedicationSchedule, updateMedicationSchedule } from '../api/patientAPI';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

const { height: screenHeight } = Dimensions.get('window');

const ModifySchedule = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'edit'
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  
  // Use a temporary value state without updating on every keystroke
  const [tempTime, setTempTime] = useState('');
  
  // Add refs to help manage keyboard and input
  const textInputRef = useRef(null);
  const timeInputValueRef = useRef(''); // Hold the current input value
  const isUpdatingRef = useRef(false); // Flag to prevent multiple operations
  const focusTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMedications();
    
    return () => {
      // Clean up any lingering timeouts
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const medicationsData = await getPatientMedication();
      setMedications(medicationsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load medications');
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationSelect = async (medication) => {
    try {
      setLoading(true);
      const scheduleData = await getMedicationSchedule(medication._id);
      setSelectedMedication(scheduleData.medication);
      setSelectedTimes([...scheduleData.medication.selectedDoseTimes]);
      setStep('edit');
    } catch (error) {
      Alert.alert('Error', 'Failed to load medication schedule');
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMedicationIcon = (type) => {
    const iconSize = 30;
    const iconColor = "#7313B2";

    switch (type?.toLowerCase()) {
      case "tablet":
        return <FontAwesome5 name="tablets" size={iconSize} color={iconColor} />;
      case "syrup":
        return <MaterialCommunityIcons name="bottle-tonic-plus-outline" size={iconSize} color={iconColor} />;
      case "syringe":
        return <FontAwesome5 name="syringe" size={iconSize} color={iconColor} />;
      case "capsule":
      default:
        return <MaterialCommunityIcons name="pill" size={iconSize} color={iconColor} />;
    }
  };

  const openTimeModal = useCallback((index) => {
    // Prevent opening if already in progress
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    // Set up the modal data first
    const initialTime = selectedTimes[index] || '';
    setEditingIndex(index);
    
    // Store value in ref to avoid state updates during typing
    timeInputValueRef.current = initialTime;
    
    // Set the initial display value (this won't change during typing)
    setTempTime(initialTime);
    
    // Open the modal
    setModalVisible(true);
    
    // Schedule focus after modal is fully visible
    focusTimeoutRef.current = setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
      isUpdatingRef.current = false;
    }, 300);
  }, [selectedTimes]);

const handleTimeChange = useCallback((newText) => {
  // Remove any non-numeric characters except colon
  let input = newText.replace(/[^0-9:]/g, '');
  
  // Handle input formatting
  if (input.length > 0) {
    // Split by colon (if exists)
    const parts = input.split(':');
    
    if (parts.length > 1) {
      // User already typed a colon
      let hours = parts[0];
      let minutes = parts[1];
      
      // Restrict hours to 0-23
      if (hours.length > 0) {
        const hoursNum = parseInt(hours, 10);
        if (hoursNum > 23) {
          hours = '23';
        }
      }
      
      // Restrict minutes to 0-59
      if (minutes.length > 0) {
        const minutesNum = parseInt(minutes, 10);
        if (minutesNum > 59) {
          minutes = '59';
        }
      }
      
      // Limit each part to appropriate length
      hours = hours.substring(0, 2);
      minutes = minutes.substring(0, 2);
      
      // Format with leading zeros if complete
      if (hours.length === 2 && minutes.length === 2) {
        // Format complete time
        input = `${hours}:${minutes}`;
      } else {
        // Partial entry, keep as is
        input = hours + (parts.length > 1 ? ':' + minutes : '');
      }
    } else if (input.length >= 2) {
      // No colon yet, but at least 2 digits
      const hours = input.substring(0, 2);
      const hoursNum = parseInt(hours, 10);
      
      if (hoursNum > 23) {
        // Restrict hours to 0-23
        input = '23' + input.substring(2);
      }
      
      // Auto-insert colon after 2 digits
      if (input.length === 2) {
        input = input + ':';
      } else if (input.length > 2) {
        // Format with colon in proper position
        input = input.substring(0, 2) + ':' + input.substring(2);
        
        // If we have enough digits for minutes too, format them
        if (input.length >= 5) {
          const minutesPart = input.substring(3, 5);
          const minutesNum = parseInt(minutesPart, 10);
          
          if (minutesNum > 59) {
            input = input.substring(0, 3) + '59';
          }
          
          // Ensure we don't exceed the 5-character format
          input = input.substring(0, 5);
        }
      }
    }
  }
  
  // Store in ref
  timeInputValueRef.current = input;
  
  // Update display value only when needed
  if (input.length === 5) {
    setTempTime(input);
  }
}, []);

  // Save the time value from our ref
  const saveTimeChange = useCallback(() => {
    // Prevent multiple submissions
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    // Get latest value from ref
    const currentValue = timeInputValueRef.current;
    
    // Validate time format
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(currentValue)) {
      Alert.alert('Invalid Time', 'Please enter a valid time in HH:MM format');
      isUpdatingRef.current = false;
      return;
    }

    // Update the time
    const newTimes = [...selectedTimes];
    newTimes[editingIndex] = currentValue;
    
    // Close keyboard first before state changes
    Keyboard.dismiss();
    
    setTimeout(() => {
      // Update state and close modal
      setSelectedTimes(newTimes);
      setModalVisible(false);
      setTempTime('');
      setEditingIndex(-1);
      timeInputValueRef.current = '';
      isUpdatingRef.current = false;
    }, 100);
  }, [selectedTimes, editingIndex]);

  const cancelTimeChange = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    setTimeout(() => {
      // Reset all values
      setModalVisible(false);
      setTempTime('');
      setEditingIndex(-1);
      timeInputValueRef.current = '';
      isUpdatingRef.current = false;
    }, 100);
  }, []);

  const handleSave = async () => {
    try {
      // Frontend validation
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      for (const time of selectedTimes) {
        if (!timePattern.test(time)) {
          Alert.alert('Invalid Time', `Please enter valid time in HH:mm format for: ${time}`);
          return;
        }
      }

      // Check for duplicate times
      const uniqueTimes = [...new Set(selectedTimes)];
      if (uniqueTimes.length !== selectedTimes.length) {
        Alert.alert('Duplicate Times', 'Please remove duplicate time entries');
        return;
      }

      Alert.alert(
        'Confirm Changes',
        `This will update the schedule for "${selectedMedication.name}" and reschedule all future doses. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update',
            onPress: async () => {
              try {
                setSaving(true);
                
                // Call API
                const response = await updateMedicationSchedule(selectedMedication._id, selectedTimes);
                
                // Check if the operation was successful
                if (response.success) {
                  // Success case
                  Alert.alert(
                    'Success',
                    response.message || 'Medication schedule updated successfully',
                    [{ 
                      text: 'OK', 
                      onPress: () => {
                        setStep('select');
                        setSelectedMedication(null);
                        setSelectedTimes([]);
                        
                        setTimeout(() => {
                          navigation.navigate('MainApp', {
                            screen: 'BottomTab',
                            params: { screen: 'Home' },
                          });
                        }, 100);
                      }
                    }]
                  );
                } else {
                  // Handle validation errors
                  switch (response.error) {
                    case 'DOSE_INTERVAL_TOO_SHORT':
                      const requiredHours = Math.floor(response.requiredIntervalMinutes / 60);
                      const requiredMinutes = response.requiredIntervalMinutes % 60;
                      
                      let requiredTimeMessage = "";
                      if (requiredHours > 0) {
                        requiredTimeMessage = `${requiredHours} hour(s) and ${requiredMinutes} minute(s)`;
                      } else {
                        requiredTimeMessage = `${requiredMinutes} minute(s)`;
                      }

                      Alert.alert(
                        'Schedule Conflict',
                        `${response.message}\n\nPlease adjust your dose times to have at least ${requiredTimeMessage} between each dose.`,
                        [{ text: 'OK' }]
                      );
                      break;
                      
                    case 'INVALID_TIME_FORMAT':
                      Alert.alert('Invalid Time Format', response.message);
                      break;
                      
                    case 'INVALID_INPUT':
                      Alert.alert('Invalid Input', response.message);
                      break;
                      
                    default:
                      Alert.alert('Schedule Error', response.message || 'Failed to update schedule');
                      break;
                  }
                }
                
              } catch (error) {
                console.error('Network error:', error);
                Alert.alert('Connection Error', error.message || 'Please check your internet connection and try again.');
              } finally {
                setSaving(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Using a key for each render helps prevent stale state in the TextInput
  const modalKey = `time-modal-${editingIndex}`;

  // Time picker modal - using an uncontrolled approach for the input
  const TimePickerModal = React.memo(() => (
    <Modal
      animationType="fade" // Changed to "fade" to minimize render issues
      transparent={true}
      visible={modalVisible}
      onRequestClose={cancelTimeChange}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Edit Dose {editingIndex + 1} Time
            </Text>
            <Pressable onPress={cancelTimeChange} style={styles.modalCloseButton}>
              <AntDesign name="close" size={24} color="#666" />
            </Pressable>
          </View>
          
          <View style={styles.timeInputSection}>
            <Text style={styles.timeInputLabel}>Enter time (HH:MM format)</Text>
            <TextInput
              key={modalKey} // Important! This ensures a fresh TextInput on each modal open
              ref={textInputRef}
              style={styles.modalTimeInput}
              defaultValue={timeInputValueRef.current} // Use defaultValue instead of value
              onChangeText={handleTimeChange}
              placeholder="09:30"
              placeholderTextColor="#999"
              maxLength={5}
              keyboardType="numeric"
              autoFocus={false} // Set to false, we'll focus manually
              selectTextOnFocus={true}
              blurOnSubmit={false}
              returnKeyType="done"
              onSubmitEditing={saveTimeChange}
              caretHidden={false}
              // Using these props to stabilize keyboard behavior
              disableFullscreenUI={true}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect={false}
              // Native only props
              clearButtonMode="never"
              enablesReturnKeyAutomatically={false}
              contextMenuHidden={true}
              textContentType="none"
            />
            <Text style={styles.timeHint}>Example: 09:30, 14:45, 21:00</Text>
          </View>

          <View style={styles.modalButtons}>
            <Pressable style={styles.modalCancelButton} onPress={cancelTimeChange}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.modalSaveButton} onPress={saveTimeChange}>
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  ));

  // Empty state component
  const EmptyMedicationsState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="pill-off" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Medications Available</Text>
      <Text style={styles.emptyStateSubtitle}>
        You don't have any medications in your inventory to modify schedules for. Add medications to your treatment plan first.
      </Text>
    </View>
  );

  const renderMedicationList = () => (
    <View style={styles.container}>
      
      {medications.length === 0 ? (
        <EmptyMedicationsState />
      ) : (
        <ScrollView style={styles.medicationList} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Select Medication to Modify</Text>
          <Text style={styles.subtitle}>Choose which medication schedule you want to change</Text>
          {medications.map((medication) => (
            <Pressable
              key={medication._id}
              style={styles.medicationCard}
              onPress={() => handleMedicationSelect(medication)}
            >
              {renderMedicationIcon(medication.type)}
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDetails}>
                  {medication.dosage} {medication.unit} • {medication.type}
                </Text>
                <Text style={styles.currentSchedule}>
                  {medication.selectedDoseTimes?.length || 0} doses per day
                </Text>
              </View>
              <AntDesign name="right" size={20} color="#7313B2" />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderTimeEditor = () => (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => setStep('select')}>
        <AntDesign name="left" size={24} color="#7313B2" />
        <Text style={styles.backText}>Back to Medications</Text>
      </Pressable>

      <View style={styles.medicationHeader}>
        {renderMedicationIcon(selectedMedication.type)}
        <View style={styles.medicationHeaderInfo}>
          <Text style={styles.medicationHeaderName}>{selectedMedication.name}</Text>
          <Text style={styles.medicationHeaderDetails}>
            {selectedMedication.dosage} {selectedMedication.unit} • {selectedMedication.type}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Dose Times</Text>
      <Text style={styles.sectionSubtitle}>
        Tap on any dose time to modify it
      </Text>

      {/* Display dose interval requirement */}
      {selectedMedication.doseInterval && (
        <View style={styles.intervalWarning}>
          <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#FF6B35" />
          <Text style={styles.intervalWarningText}>
            Minimum {Math.floor(selectedMedication.doseInterval / 60)}h {selectedMedication.doseInterval % 60}m between doses
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.timesList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {selectedTimes.map((time, index) => (
          <Pressable 
            key={index} 
            style={styles.timeRow}
            onPress={() => openTimeModal(index)}
          >
            <Text style={styles.timeLabel}>Dose {index + 1}</Text>
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeDisplay}>{time || 'Tap to set'}</Text>
              <AntDesign name="edit" size={16} color="#7313B2" />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Fixed save button */}
      <View style={styles.fixedButtonContainer}>
        <PrimaryButton onPress={handleSave} disabled={saving}>
          {saving ? 'Updating...' : 'Save Changes'}
        </PrimaryButton>
      </View>

      {/* Time picker modal */}
      <TimePickerModal />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7313B2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {step === 'select' ? renderMedicationList() : renderTimeEditor()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7313B2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  medicationList: {
    flex: 1,
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 15,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  currentSchedule: {
    fontSize: 12,
    color: '#7313B2',
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#7313B2',
    fontWeight: '500',
  },
  medicationHeader: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  medicationHeaderInfo: {
    marginLeft: 15,
  },
  medicationHeaderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicationHeaderDetails: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  intervalWarning: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  intervalWarningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
    flex: 1,
  },
  timesList: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  timeRow: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 16,
    color: '#7313B2',
    fontWeight: '600',
    marginRight: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  fixedButtonContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  timeInputSection: {
    padding: 30,
    alignItems: 'center',
  },
  timeInputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalTimeInput: {
    borderWidth: 2,
    borderColor: '#7313B2',
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    width: 150,
    backgroundColor: '#F8F9FA',
    color: '#333',
    fontWeight: '600',
  },
  timeHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  modalSaveButton: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#7313B2',
    borderBottomRightRadius: 20,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ModifySchedule;