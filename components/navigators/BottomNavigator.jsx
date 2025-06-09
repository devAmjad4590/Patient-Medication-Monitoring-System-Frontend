import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import HomeScreen from '../../screens/HomeScreen'
import MedicationScreen from '../../screens/MedicationScreen'
import AppointmentScreen from '../../screens/AppointmentScreen'
import AnalyticsScreen from '../../screens/AnalyticsScreen'
import FloatingVoiceButton from '../FloatingVoiceButton' // Add this import


const BottomTab = createBottomTabNavigator();

function BottomNavigator() {
    return (
        <View style={styles.container}>
          <BottomTab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarLabelStyle: { fontSize: 10 }
            }}
          >
            <BottomTab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={25} color={color} />,
              }}
            />
            <BottomTab.Screen
              name="Medication"
              component={MedicationScreen}
              options={{
                tabBarIcon: ({ color }) => <MaterialIcons name="medical-services" size={25} color={color} />,
              }}
            />
            <BottomTab.Screen
              name="Appointments"
              component={AppointmentScreen}
              options={{
                tabBarIcon: ({ color }) => <Entypo name="calendar" size={25} color={color} />,
              }}
            />
            <BottomTab.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{
                tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-line" size={25} color={color} />,
              }}
            />
          </BottomTab.Navigator>
          
          {/* Floating Voice Button - appears on all main app screens */}
          <FloatingVoiceButton />
        </View>
      );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BottomNavigator