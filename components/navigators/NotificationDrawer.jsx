import React, { useEffect } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import PrimaryDrawer from '../navigators/PrimaryDrawer';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import NotificationCard from './NotificationCard';
import { Button } from 'react-native-ui-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';


const RightDrawer = createDrawerNavigator();


function NotificationDrawer() {
  const [notifications, setNotifications] = React.useState([]);
  function handleClearAll() {
    console.log("Clear all notifications")
    setNotifications([]);
    AsyncStorage.removeItem('notificationsHistory').then(() => {
      console.log("Notifications cleared");
    }).catch(err => {
      console.error("Error clearing notifications:", err);
    })
 
  }
  useEffect(() => {
    loadNotifications();
  }, [notifications]);

  const loadNotifications = async () => {
    const storedNotifications = await AsyncStorage.getItem('notificationsHistory');
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications);
      setNotifications(parsedNotifications);
    }


  }

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
      drawerContent={props => (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingTop: 30 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: 'semi-bold', textAlign: 'center', marginBottom: 20 }}>Notifications</Text>
              {notifications.length === 0 && (
                <Text style={{ fontSize: 16, textAlign: 'center', color: '#888' }}>No notifications available</Text>
              )}
              <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <NotificationCard key={notification.id} title={notification.title} message={notification.body} />
                ))}
              </ScrollView>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%'  }}> {/* overflow style was here*/ }
              <View style={{ width: 200, borderRadius: 30 }}>
                <Button onPress={() => {
                  handleClearAll();
                  props.navigation.closeDrawer()
                }} label="Clear All" style={{marginBottom: 10}} backgroundColor="#FDFDFD" labelStyle={{ color: "black", fontSize: 16, fontWeight: 'semibold' }} outlineColor="black"></Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      )}
    >
      <RightDrawer.Screen name="MainApp" component={PrimaryDrawer} />
    </RightDrawer.Navigator>
  );
}

export default NotificationDrawer
