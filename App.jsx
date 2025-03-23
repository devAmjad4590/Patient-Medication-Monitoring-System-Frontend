// UI Library dependencies
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WelcomeScreen from './screens/WelcomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import HomeScreen from './screens/HomeScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import MedicationScreen from './screens/MedicationScreen';
import ModifySchedule from './screens/ModifySchedule';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const BottomTab = createBottomTabNavigator();

function DrawerNavigator({ navigation }) {
  return (
    <Drawer.Navigator>
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
        options={{
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              onPress={() => navigation.navigate('Drawer', { screen: 'BottomTab', params: { screen: 'Home' } })}
              style={{ marginLeft: 15 }}
            />
          ),
          headerTitle: '', // Remove the title
          headerShown: true, // Ensure the header is shown
        }}
      />
    </Drawer.Navigator>
  );
}

function BottomNavigator() {
  return (
    <BottomTab.Navigator screenOptions={{ headerShown: false }}>
      <BottomTab.Screen name="Home" component={HomeScreen} />
      <BottomTab.Screen name="Appointments" component={AppointmentScreen} />
      <BottomTab.Screen name="Analytics" component={AnalyticsScreen} />
      <BottomTab.Screen name="Medication" component={MedicationScreen} />
    </BottomTab.Navigator>
  );
}

export default function App() {
  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            <Stack.Screen name="Drawer" component={DrawerNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});