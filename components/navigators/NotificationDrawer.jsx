import React, { useEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import PrimaryDrawer from '../navigators/PrimaryDrawer';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import NotificationCard from './NotificationCard';
import { Button } from 'react-native-ui-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RightDrawer = createDrawerNavigator();

function NotificationDrawer() {
  // Initialize with null to track loading state
  const [notifications, setNotifications] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  function handleClearAll() {
    console.log("Clear all notifications")
    setNotifications([]);
    AsyncStorage.removeItem('notificationsHistory').then(() => {
      console.log("Notifications cleared");
    }).catch(err => {
      console.error("Error clearing notifications:", err);
    });
  }
  
  // Load notifications only once on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const storedNotifications = await AsyncStorage.getItem('notificationsHistory');
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
      } else {
        setNotifications([]); // Ensure we always have an array
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]); // Fallback to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Custom drawer content with loading state handling
  const renderDrawerContent = (props) => {
    // Return a loading placeholder or the actual content
    if (isLoading) {
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: 30 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 22, 
              fontWeight: '600', // Fixed fontWeight
              textAlign: 'center', 
              marginBottom: 20 
            }}>
              Notifications
            </Text>
            
            {(!notifications || notifications.length === 0) && (
              <Text style={{ 
                fontSize: 16, 
                textAlign: 'center', 
                color: '#888' 
              }}>
                No notifications available
              </Text>
            )}
            
            <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
              {notifications && notifications.map((notification) => (
                <NotificationCard 
                  key={notification.id || Math.random().toString()} 
                  title={notification.title || 'Notification'} 
                  message={notification.body || ''} 
                />
              ))}
            </ScrollView>
          </View>
          
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            marginBottom: 20 
          }}>
            <View style={{ width: 200, borderRadius: 30 }}>
              <Button 
                onPress={() => {
                  handleClearAll();
                  props.navigation.closeDrawer();
                }} 
                label="Clear All" 
                style={{marginBottom: 10}} 
                backgroundColor="#FDFDFD" 
                labelStyle={{ 
                  color: "black", 
                  fontSize: 16, 
                  fontWeight: '600'  // Fixed fontWeight
                }} 
                outlineColor="black"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <RightDrawer.Navigator
      id="RightDrawer"
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: '#fff',
        },
      }}
      drawerContent={renderDrawerContent}
    >
      <RightDrawer.Screen name="MainApp" component={PrimaryDrawer} />
    </RightDrawer.Navigator>
  );
}

export default NotificationDrawer;