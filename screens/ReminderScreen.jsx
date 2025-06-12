import React, { useState, useEffect, useCallback } from 'react'
import { View, FlatList, Text, StyleSheet, ImageBackground, Alert, BackHandler } from 'react-native'
import MedicationEntryCard from '../components/MedicationEntryCard'
import PrimaryButton from '../components/PrimaryButton'
import DestructiveButton from '../components/DestructiveButton'
import { LinearGradient } from 'expo-linear-gradient'
import moment from 'moment'
import { getMedicationIntakeLogsById, markMedicationTaken } from '../api/patientAPI'
import { snoozeMedicationReminder } from '../api/notificationAPI'
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'

function ReminderScreen({ route, navigation }) {
  const [reminderVisible, setReminderVisible] = useState(true)
  const [dueMedications, setDueMedications] = useState([])
  const [currentTime, setCurrentTime] = useState(moment().format('h:mm A'))
  const [loading, setLoading] = useState(true)
  const [snoozing, setSnoozing] = useState(false)
  const cacheKey = "@medicationIntakeLogs"
  
  const time = route.params?.time
  const medicationIds = route.params?.medicationIds || []
  console.log("Medication IDs:", medicationIds)

  async function snoozeHandler() {
    setSnoozing(true)
    
    try {
      // Only snooze pending medications
      const pendingMedicationIds = dueMedications
        .filter(med => med.status === "Pending")
        .map(med => med._id)
      
      if (pendingMedicationIds.length === 0) {
        Alert.alert(
          "No Pending Medications",
          "There are no pending medications to snooze.",
          [{ text: "OK" }]
        )
        setSnoozing(false)
        return
      }

      // Call the snooze API
      const response = await snoozeMedicationReminder(pendingMedicationIds)
      
      // Show success message
      Alert.alert(
        "Reminder Snoozed",
        `Your medication reminder has been snoozed for 5 minutes. You'll be reminded again at ${moment().add(5, 'minutes').format('h:mm A')}.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to home
              navigation.reset({
                index: 0,
                routes: [{
                  name: 'Drawer',
                  state: {
                    routes: [{
                      name: 'MainApp',
                      state: {
                        routes: [{
                          name: 'BottomTab',
                          state: {
                            routes: [{ name: 'Home' }]
                          }
                        }]
                      }
                    }]
                  }
                }]
              });
            }
          }
        ]
      )
      
    } catch (error) {
      console.error("Error snoozing medication reminder:", error)
      Alert.alert(
        "Error",
        "There was an error snoozing your reminder. Please try again.",
        [{ text: "OK" }]
      )
    } finally {
      setSnoozing(false)
    }
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [])

  async function dismissHandler() {
    console.log("Dismiss clicked - marking all as missed")

    Alert.alert(
      "Mark as Missed",
      "Are you sure you want to mark all medications as missed?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Mark as Missed",
          onPress: async () => {
            const missedAt = new Date().toISOString();

            const updatePromises = dueMedications.map(async (medication) => {
              if (medication.status === "Missed") return;

              console.log(`Marking medication ${medication._id} as Missed`);

              try {
                await markMedicationTaken({
                  medicationId: medication._id,
                  status: "Missed",
                  takenAt: null,
                  missedAt: missedAt
                });
                console.log(`Successfully marked ${medication._id} as missed on server`);
              } catch (err) {
                console.error(`Error marking medication ${medication._id} as missed:`, err);
              }
            });

            try {
              await Promise.all(updatePromises);

              const updatedMedications = dueMedications.map(med => ({
                ...med,
                status: "Missed",
                missedAt
              }));
              setDueMedications(updatedMedications);

              const cachedLogsJson = await AsyncStorage.getItem(cacheKey);
              if (cachedLogsJson) {
                let cachedLogs = JSON.parse(cachedLogsJson);

                cachedLogs = cachedLogs.map(log => {
                  if (medicationIds.includes(log._id)) {
                    return { ...log, status: "Missed", missedAt };
                  }
                  return log;
                });

                await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedLogs));
                console.log("Updated cache with missed status for all medications");
              }

              navigation.reset({
                index: 0,
                routes: [{
                  name: 'Drawer',
                  state: {
                    routes: [{
                      name: 'MainApp',
                      state: {
                        routes: [{
                          name: 'BottomTab',
                          state: {
                            routes: [{ name: 'Home' }]
                          }
                        }]
                      }
                    }]
                  }
                }]
              });
            } catch (err) {
              console.error("Error updating medications as missed:", err);
              Alert.alert(
                "Error",
                "There was an error marking medications as missed. Please try again."
              );
            }
          }
        }
      ]
    );
  }

  useEffect(() => {
    try {
      const init = async () => {
        await fetchMedicationLogs()
        setCurrentTime(moment(time).format('h:mm A'))
        setLoading(false)
      }
      init()
    }
    catch (err) {
      console.error("Error in useEffect:", err)
    }
    finally {
      setLoading(false)
    }
  }, [medicationIds])

  const fetchMedicationLogs = async () => {
    try {
      setLoading(true)
      const allLogs = await getMedicationIntakeLogsById(medicationIds)
      setDueMedications(allLogs)
      console.log("Fetched medication logs:", allLogs)
    }
    catch (err) {
      console.error("Error fetching medications:", err)
      setLoading(false)
    }
  }

  async function onCheck(logId, status) {
    console.log(`Marking medication ${logId} as ${status}`)

    const takenAt = new Date().toISOString();

    const updated = dueMedications.map((log) =>
      log._id === logId
        ? { ...log, status: status, takenAt: takenAt }
        : log
    );
    setDueMedications(updated);

    try {
      const cachedLogsJson = await AsyncStorage.getItem(cacheKey);
      let cachedLogs = cachedLogsJson ? JSON.parse(cachedLogsJson) : [];

      cachedLogs = cachedLogs.map(log =>
        log._id === logId
          ? { ...log, status: status, takenAt: takenAt }
          : log
      );

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedLogs));
      console.log("Updated cache with new status");
    } catch (err) {
      console.error("Error updating medication cache:", err);
    }

    try {
      await markMedicationTaken({
        medicationId: logId,
        status: status,
        takenAt: takenAt
      });
      console.log("Successfully updated medication status on server");
      
      const allTaken = updated.every(med => med.status === "Taken");
      if (allTaken) {
        Alert.alert(
          "Success!",
          "All medications have been marked as taken.",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{
                    name: 'Drawer',
                    state: {
                      routes: [{
                        name: 'MainApp',
                        state: {
                          routes: [{
                            name: 'BottomTab',
                            state: {
                              routes: [{ name: 'Home' }]
                            }
                          }]
                        }
                      }]
                    }
                  }]
                });
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error("Error updating medication on server:", err);
    }
  };

  return (
    <LinearGradient
      colors={['#E6F7FF', '#D0EFFF']}
      style={styles.gradientOverlay}
    >
      <ImageBackground
        source={require('../assets/reminderBackground.png')}
        style={styles.backgroundImage}
        resizeMode='cover'
        imageStyle={{ opacity: 0.65 }}
      >
        <View style={styles.root}>
          <Text style={[{}, styles.title]}>Medication{'\n'}Reminder</Text>
          <Text style={styles.time}>{currentTime}</Text>
          <View style={styles.medicationContainer}>
            <FlatList
              data={dueMedications}
              renderItem={({ item }) => (
                <MedicationEntryCard
                  id={item._id}
                  medicationName={item.medication.name}
                  medicationType={item.medication.type}
                  status={item.status}
                  onCheck={onCheck}
                />
              )}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
            />
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton 
              onPress={snoozeHandler}
              disabled={snoozing || loading}
            >
              {snoozing ? "Snoozing..." : "Snooze (5 min)"}
            </PrimaryButton>
            <DestructiveButton onPress={dismissHandler}>Dismiss</DestructiveButton>
          </View>
        </View>
      </ImageBackground>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: 'black'
  },
  time: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
    color: 'black'
  },
  medicationContainer: {
    flex: 3.5,
    padding: 10,
    backgroundColor: '#D0D7DE',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#B0B0B0',
  },
  buttonContainer: {
    justifyContent: 'space-between',
    flex: 2,
    width: '90%',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1
  }
})

export default ReminderScreen