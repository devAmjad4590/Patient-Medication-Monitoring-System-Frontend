import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import ProfileCard from '../navigators/ProfileCard'
import { checkAuth } from '../../api/authAPI'

function PrimaryDrawerContent(props) {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      setLoading(true)
      const userData = await checkAuth();
      if (!userData) {
        console.log("NO USER DATA")
        setUser({}) // Set empty object if no user data
      } else {
        setUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setUser({})
    } finally {
      setLoading(false)
    }
  }

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUser()
  }, [])
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={false}
        >
          <View style={styles.userContainer}>
            <ProfileCard fullName={user.name} email={user.email}/>
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
    flex: 18,
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
    flex: 1
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
})

export default PrimaryDrawerContent
