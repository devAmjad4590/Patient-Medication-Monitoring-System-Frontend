import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import ModifySchedule from '../../screens/ModifySchedule';
import BottomNavigator from '../navigators/BottomNavigator';
import { Pressable } from 'react-native';
import PrimaryDrawerContent from './PrimaryDrawerContent';
import VoiceSettingsScreen from '../../screens/VoiceSettingsScreen';
import { MaterialIcons } from '@expo/vector-icons'


const Drawer = createDrawerNavigator();


function PrimaryDrawer({ navigation }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <PrimaryDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#2F7EF5' },
        headerRight: () => (
          <Pressable onPress={() => navigation.getParent('RightDrawer')?.openDrawer()}>
            <Ionicons name="notifications" size={24} style={{ marginRight: 15 }} />
          </Pressable>
        ),
        drawerItemStyle: {
          borderRadius: 0,
        },

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
          title: 'Modify Schedule',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
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
      <Drawer.Screen
        name="VoiceSettings"
        component={VoiceSettingsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: '',
          title: 'Voice Settings',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="settings-voice" size={size} color={color} />
          ),
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
      <Drawer.Screen
        name="Logout"
        options={{
          title: 'Logout',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        })}
      >
        {() => null}
      </Drawer.Screen>

    </Drawer.Navigator>
  );
}

export default PrimaryDrawer
