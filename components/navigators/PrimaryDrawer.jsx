import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer';
import ModifySchedule from '../../screens/ModifySchedule';
import BottomNavigator from '../navigators/BottomNavigator';
import { Pressable, SafeAreaView, Text } from 'react-native';
import PrimaryDrawerContent from './PrimaryDrawerContent';
import VoiceSettingsScreen from '../../screens/VoiceSettingsScreen';
import { MaterialIcons } from '@expo/vector-icons'
import { logout } from '../../api/authAPI';
import { useNotifications } from '../../NotificationContext';
import { useAuth } from '../../AuthContext'; // Import useAuth

const Drawer = createDrawerNavigator();

function PrimaryDrawer({ navigation }) {
  const { loadNotifications } = useNotifications();
  const { logout: logoutContext } = useAuth(); // Get logout from AuthContext

  const handleNotificationPress = async () => {
    // Refresh notifications before opening the drawer
    await loadNotifications();
    navigation.getParent('RightDrawer')?.openDrawer();
  };

  const handleLogout = async () => {
    try {
      // Call API logout
      await logout();
      // Call AuthContext logout to update app state
      logoutContext();
      // No need to navigate - the App.jsx will automatically show login screen
      // when isAuthenticated becomes false
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails, we should still log out locally
      logoutContext();
    }
  };

  return (
    <View style={styles.container}>
      <Drawer.Navigator
        drawerContent={(props) => 
          <SafeAreaView style={{ flex: 1 }}>
            <PrimaryDrawerContent {...props} />
          </SafeAreaView>
        }
        screenOptions={{
          headerStyle: { backgroundColor: '#2F7EF5' },
          headerRight: () => (
            <Pressable onPress={handleNotificationPress}>
              <MaterialIcons name="notifications" color="black" size={32} style={{ marginRight: 15 }} />
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
              <MaterialIcons name="schedule" size={size} color={color} />
            ),
            headerLeft: () => (
              <MaterialIcons
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
              <MaterialIcons
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
              <MaterialIcons name="logout" size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            drawerItemPress: async (e) => {
              e.preventDefault();
              await handleLogout();
            },
          })}
        >
          {() => null}
        </Drawer.Screen>
      </Drawer.Navigator>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PrimaryDrawer