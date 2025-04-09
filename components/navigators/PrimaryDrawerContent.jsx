import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import ProfileCard from '../navigators/ProfileCard'

function PrimaryDrawerContent(props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={false}
        >
          <View style={styles.userContainer}>
            <ProfileCard />
          </View>

          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>

      {/* Footer at the true bottom */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Multimedia University</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  userContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
})

export default PrimaryDrawerContent
