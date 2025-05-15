import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

function ChartCard({ children, title}) {
  return (
    <View style={styles.outerCard}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 250,
    paddingVertical: 20,
    marginHorizontal: 20,
  },
  outerCard: {
    elevation: 6,
    borderRadius: 20,
    backgroundColor: 'white',
  },
    title: {
    fontWeight: 600,
    fontSize: 17
  },
  caption: {
    fontWeight: 400,
    color: '#434242'
  },
})

export default ChartCard
