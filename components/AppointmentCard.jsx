import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import moment from 'moment'
import AntDesign from '@expo/vector-icons/AntDesign'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

const typeColors = {
    'Consultation': '#2F7EF5',
    'Follow-up': '#FF8C00',
    'Routine Checkup': '#28A745',
    'Emergency': '#DC3545',
    'Default': '#6C757D'
}

function AppointmentCard({ type = 'Default', title, dateTime, doctorName, location }) {
    const formattedDate = moment(dateTime).format('ddd MMM D,  h:mm')
    const color = typeColors[type] || typeColors.Default

    return (
        <View style={styles.cardWrapper}>
            <View style={[styles.colorBar, { backgroundColor: color }]} />
            <View style={styles.card}>
                <Text style={styles.title}>{title || type}</Text>

                <Text style={styles.subtitle}>Appointment Date</Text>
                <View style={styles.row}>
                    <AntDesign name="clockcircle" size={16} color="#555" style={styles.icon} />
                    <Text style={styles.value}>{formattedDate}</Text>
                </View>

                <Text style={styles.subtitle}>Doctor</Text>
                <View style={styles.row}>
                    <FontAwesome name="user-md" size={16} color="#555" style={styles.icon} />
                    <Text style={styles.value}> {doctorName}</Text>
                </View>

                <Text style={styles.subtitle}>Location</Text>
                <View style={styles.row}>
                    <MaterialIcons name="location-on" size={16} color="#555" style={styles.icon} />
                    <Text style={styles.value}> {location}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardWrapper: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
    },
    colorBar: {
        width: 6,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    card: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 4,
        color: '#707070',
    },
    value: {
        fontSize: 14,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
        justifyContent: 'flex-start'
    },
    icon: {
        marginRight: 8,
    },
})

export default AppointmentCard
