import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'


function InventoryCard({medicationName, medicationType, stock, onPress}) {
  return (
    <Pressable onPress={onPress} style={styles.outerContainer}>
            <MaterialCommunityIcons name="pill" size={35} color="black" />
            <View style={styles.textContainer}>
                <Text style={styles.medicationName}>{medicationName}</Text>
                <Text style={styles.caption}>{medicationType}</Text>
            </View>
            <Text>{stock} left</Text>
        </Pressable>
  )
}
const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: 'white',
        padding: 20,
        elevation: 3,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
        justifyContent: 'space-between', // Pushes items apart
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    textContainer: {
        flex: 1, // Takes up remaining space to push checkbox to the right
        marginLeft: 15,
    },
    medicationName: {
        fontSize: 17,
        fontWeight: '600',
    },
    caption: {
        fontSize: 13,
        color: '#7F7F7F',
    },
})

export default InventoryCard
