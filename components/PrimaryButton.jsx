import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function PrimaryButton({ children, onPress, disabled, testID }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      testID={testID || 'primary-button'}
      style={({ pressed }) => [
        styles.buttonOuterContainer,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <LinearGradient
        colors={['#7313B2', '#2F7EF5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonInnerContainer}
      >
        <Text style={styles.buttonText} testID={`${testID || 'primary'}-button-text`}>
          {children}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonOuterContainer: {
    borderRadius: 24,
    margin: 4,
    overflow: 'hidden',
    width: '90%',
    marginBottom: 20,
  },
  buttonInnerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5, // Add this style
  },
});

export default PrimaryButton;