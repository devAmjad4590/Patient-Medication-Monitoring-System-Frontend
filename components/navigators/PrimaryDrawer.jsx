import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import ModifySchedule from '../../screens/ModifySchedule';
import BottomNavigator from '../navigators/BottomNavigator';
import { Pressable } from 'react-native';

const Drawer = createDrawerNavigator();


function PrimaryDrawer({navigation}) {
    return (
        <Drawer.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#2F7EF5' },
            headerRight: () => (
              <Pressable onPress={() => navigation.getParent('RightDrawer')?.openDrawer()}>
                <Ionicons name="notifications" size={24} style={{ marginRight: 15 }} />
              </Pressable>
            )
          }}
        >
          <Drawer.Screen
            name="BottomTab"
            component={BottomNavigator}
            options={{
              title: '',
              drawerItemStyle: {
                display: 'none',
              },
            }}
          />
          <Drawer.Screen
            name="ModifySchedule"
            component={ModifySchedule}
            options={({ navigation }) => ({
              headerShown: true,
              headerTitle: '',
              headerLeft: () => (
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="black"
                  onPress={() =>
                    navigation.navigate('MainApp', {
                      screen: 'BottomTab',
                      params: {
                        screen: 'Home',
                      },
                    })
                  }
                  style={{ marginLeft: 15 }}
                />
              ),
            })}
          />
        </Drawer.Navigator>
      );
}

export default PrimaryDrawer
