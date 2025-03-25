import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import moment from 'moment'

// Map appointment type to a color
const typeColors = {
    'Consultation': '#2F7EF5',     // Blue
    'Follow-up': '#FF8C00',       // Orange
    'Routine Checkup': '#28A745', // Green
    'Emergency': '#DC3545',         // Red
    'Default': '#6C757D'            // Grey
}

function AppointmentCard({ type = 'Default', title, dateTime, doctorName, location }) {
    const formattedDate = moment(dateTime).format('ddd MMM D,  h:mm'); 
    const color = typeColors[type] || typeColors.Default;

    return (
        <View style={styles.cardWrapper}>
            <View style={[styles.colorBar, { backgroundColor: color }]} />
            <View style={styles.card}>
                <Text style={styles.title}>{title || type}</Text>

                <Text style={styles.subtitle}>Appointment Date</Text>
                <Text style={styles.value}>{formattedDate}</Text>

                <Text style={styles.subtitle}>Doctor</Text>
                <Text style={styles.value}>{doctorName}</Text>

                <Text style={styles.subtitle}>Location</Text>
                <Text style={styles.value}>{location}</Text>
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
        marginBottom: 8
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 4,
        color: '#707070'
    },
    value: {
        fontSize: 14,
        marginBottom: 12
    }
})

export default AppointmentCard
