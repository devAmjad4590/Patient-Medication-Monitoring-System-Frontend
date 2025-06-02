import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

function SecondaryButton({ children, onPress }) {
    return (
        <LinearGradient 
            colors={['#7313B2', '#2F7EF5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonOuterContainer}
        >
            <View style={styles.buttonInnerContainer}>
                <Pressable 
                    style={({ pressed }) => 
                        pressed 
                            ? [styles.buttonContent, styles.pressed] 
                            : styles.buttonContent
                    } 
                    onPress={onPress} 
                    android_ripple={{ color: '#FFFFFF' }} // Set a suitable ripple color
                >
                    <Text style={styles.buttonText}>{children}</Text>
                </Pressable>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    buttonOuterContainer: {
        borderRadius: 24,
        margin: 4,
        overflow: 'hidden',
        width: '90%',
        padding: 2, // Add padding to create space for the gradient border
    },
    buttonInnerContainer: {
        borderRadius: 22, // Adjust to fit inside the outer container
        overflow: 'hidden',
        backgroundColor: '#D9D9D9',
    },
    buttonContent: {
        paddingVertical: 15,
        paddingHorizontal: 16,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 24,
        textAlign: 'center',
        color: '#7313B2', // Keep the text color as white
    },
    pressed: {
        opacity: 0.75
    }
})

export default SecondaryButton