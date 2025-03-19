import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Checkbox } from 'react-native-ui-lib'

function MedicationEntryCard({medicationName, medicationType}) {
    const [checked, setChecked] = React.useState(false)

    const handlePress = () => {
        setChecked(!checked)
    }

    return (
        <Pressable onPress={handlePress} style={styles.outerContainer}>
            <MaterialCommunityIcons name="pill" size={35} color="black" />
            <View style={styles.textContainer}>
                <Text style={styles.medicationName}>{medicationName}</Text>
                <Text style={styles.caption}>{medicationType}</Text>
            </View>
            <Checkbox size={28} borderRadius={20} value={checked} onValueChange={setChecked} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
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

export default MedicationEntryCard