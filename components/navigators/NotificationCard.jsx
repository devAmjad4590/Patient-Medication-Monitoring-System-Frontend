import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

function NotificationCard() {
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10, justifyContent: 'center' }}>
                <FontAwesome5 name="calendar-check" size={25} color="black" />
                <Text style={styles.title}>Notification Title</Text>
            </View>
            <Text style={styles.message}>You have an appointment right now</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
        alignItems: 'center',
        elevation: 10,
        backgroundColor: '#fff',
        height: 'auto',
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        paddingTop: 5,
        paddingHorizontal: 7
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    message: {
        fontSize: 16,
        color: '#555',
        textAlign: 'left'
    },
})

export default NotificationCard
