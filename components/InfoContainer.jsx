import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

function InfoContainer({title, value}) {
  return (
    <View style={styles.infoContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{title}: </Text>
        <Text style={styles.text}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  infoContainer:{
    backgroundColor: 'white',
        padding: 20,
        elevation: 3,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
  },
  
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  text: {
    fontSize: 16,
    textAlign: 'left',
    width: '100%'
  }

})

export default InfoContainer
