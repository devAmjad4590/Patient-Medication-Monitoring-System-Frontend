import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import PrimaryDrawer from '../navigators/PrimaryDrawer';
import { View, Text} from 'react-native';
import NotificationCard from './NotificationCard';
import { Button } from 'react-native-ui-lib';

const RightDrawer = createDrawerNavigator();


function NotificationDrawer() {
  function handleClearAll(){
    console.log("Clear all notifications")
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
          drawerContent={() => (
            <View style={{ flex: 1, padding: 20, paddingTop: 30 }}>
              <View style={{flex: 1}}>
              <Text style={{ fontSize: 22, fontWeight: 'semi-bold', textAlign: 'center', marginBottom: 20 }}>Notifications</Text>
              <NotificationCard></NotificationCard>
              <NotificationCard></NotificationCard>
              <NotificationCard></NotificationCard>
              </View>
              <View style={{alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <View style={{width: 200, borderRadius: 30, overflow: 'hidden'}}>
                <Button onPress={handleClearAll} label="Clear All" backgroundColor="#FDFDFD" labelStyle={{color: "black", fontSize: 16, fontWeight: 'semibold'}} outlineColor="black"></Button>
                </View>
              </View>
            </View>
          )}
        >
          <RightDrawer.Screen name="MainApp" component={PrimaryDrawer} />
        </RightDrawer.Navigator>
      );
}

export default NotificationDrawer
