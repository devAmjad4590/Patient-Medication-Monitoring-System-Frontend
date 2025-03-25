import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import PrimaryDrawer from '../navigators/PrimaryDrawer';
import { View, Text } from 'react-native';


const RightDrawer = createDrawerNavigator();


function NotificationDrawer() {
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
          drawerContent={() => (
            <View style={{ flex: 1, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🔔 Notifications</Text>
            </View>
          )}
        >
          <RightDrawer.Screen name="MainApp" component={PrimaryDrawer} />
        </RightDrawer.Navigator>
      );
}

export default NotificationDrawer
