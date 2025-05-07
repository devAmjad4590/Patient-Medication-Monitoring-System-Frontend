import React, { useState, useEffect } from 'react'
import { View, FlatList, Text, StyleSheet, ImageBackground } from 'react-native'
import MedicationEntryCard from '../components/MedicationEntryCard'
import PrimaryButton from '../components/PrimaryButton'
import DestructiveButton from '../components/DestructiveButton'
import mockMedicationIntakeLogs from '../data/mockMedicationIntakeLogs'
import { LinearGradient } from 'expo-linear-gradient'
import moment from 'moment'
import { getMedicationIntakeLogsById, getMedicationLogs } from '../api/patientAPI'



function ReminderScreen({route, navigation}) {
    const [reminderVisible, setReminderVisible] = useState(true)
    const [dueMedications, setDueMedications] = useState([])
    const [currentTime, setCurrentTime] = useState(moment().format('h:mm A'))
    const [loading, setLoading] = useState(true)

    // get medication IDs from route params
    const time = route.params?.time
    const medicationIds = route.params?.medicationIds || []
    console.log("Medication IDs:", medicationIds)


    useEffect(() => {
        try{
            const init = async () => {
                await fetchMedicationLogs()
                setLoading(false)
            }
            init()
        }
        catch(err){
            console.error("Error in useEffect:", err)
        }
        finally{
            setLoading(false)
        }
    }, [medicationIds])

    const fetchMedicationLogs = async () => {
        try{
            setLoading(true)
            const allLogs = await getMedicationIntakeLogsById(medicationIds)
            setDueMedications(allLogs)
            console.log("Fetched medication logs:", allLogs)
        }
        catch(err){
            console.error("Error fetching medications:", err)
            setLoading(false)
        }
    }


    return (
        <LinearGradient
            colors={['#E6F7FF', '#D0EFFF']} // Soft blue gradient
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
                    <Text style={styles.time}>2:30 PM</Text>
                    <View style={styles.medicationContainer}>
                        <FlatList
                            data={dueMedications}
                            renderItem={({ item }) => (
                                <MedicationEntryCard
                                    medicationName={item.medication.name}
                                    medicationType={item.medication.type}
                                    intakeTime={item.intakeTime}
                                    status={item.status}
                                />
                            )}
                            keyExtractor={(item) => item.id || item._id}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <PrimaryButton>Snooze</PrimaryButton>
                        <DestructiveButton>Dismiss</DestructiveButton>
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
        marginTop: 20
    },
    time: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 20
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
