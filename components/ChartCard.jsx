import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

function ChartCard({children}) {
  return (
    <View style={styles.outerCard}>
    <View style={styles.card}>
      {children}
    </View>
    </View>
  )
}

const styles = StyleSheet.create({
    card: {
        height: 250,
        paddingVertical: 20,
        marginHorizontal: 20,    },
    outerCard: {
        elevation: 6,
        borderRadius: 20,
        backgroundColor: 'white',
    }
})

export default ChartCard
