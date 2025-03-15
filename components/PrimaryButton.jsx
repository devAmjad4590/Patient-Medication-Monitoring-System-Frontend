import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

function PrimaryButton({ children, onPress }) {
    return (
        <LinearGradient colors={['#7313B2', '#2F7EF5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} style={[styles.buttonOuterContainer]}>
            <Pressable style={({ pressed }) => pressed ? [styles.buttonInnerContainer, styles.pressed] : styles.buttonInnerContainer} onPress={onPress} android_ripple={{ color: '#7313B2' }}>
                <Text style={styles.buttonText}>{children}</Text>
            </Pressable>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    buttonInnerContainer: {
        paddingVertical: 15,
        paddingHorizontal: 16,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 24,
    },
    buttonOuterContainer: {
        borderRadius: 24,
        margin: 4,
        overflow: 'hidden',
        width: '90%',
        marginBottom: 20
    },

    // IOS settings
    pressed: {
        opacity: 0.75
    }
})


export default PrimaryButton
