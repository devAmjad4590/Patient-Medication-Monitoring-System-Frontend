import React, { useState } from 'react'
import { TextField } from 'react-native-ui-lib'
import { StyleSheet } from 'react-native'

function InputField({ placeholder, isPassword, onChange, testID }) {
    function onChangeText(text){
        onChange(text)
    }
    return (
        <TextField
            placeholder={placeholder}
            floatingPlaceholder
            containerStyle={styles.textFieldContainer}
            floatingPlaceholderStyle={{ fontSize: 18, bottom: 3 }}
            secureTextEntry={isPassword}
            floatingPlaceholderColor={{focus: 'black', blur: 'grey'}}
            style={styles.fieldStyle}
            onChangeText={onChangeText}
            testID={testID}
        />
    )
}

const styles = StyleSheet.create({
    textFieldContainer: {
        width: '85%',
        backgroundColor: '#D9D9D9',
        borderRadius: 24,
        height: 60, // Corrected height value
        paddingHorizontal: 15,
        marginBottom: 20,
        // justifyContent: 'center',
    },
    fieldStyle: {
        fontSize: 17,
        paddingBottom: 20,
        color: 'black'
    },
})

export default InputField