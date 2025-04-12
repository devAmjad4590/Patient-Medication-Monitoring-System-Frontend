import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

function NotificationCard({title, message}) {
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10, justifyContent: 'center' }}>
                <FontAwesome5 name="calendar-check" size={25} color="black" />
                <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    message: {
        fontSize: 14,
        color: '#555',
        textAlign: 'left'
    },
})

export default NotificationCard
