// UI Library dependencies
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,SafeAreaView } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import NotificationDrawer from './components/navigators/NotificationDrawer';
import MedicationScreen from './screens/MedicationScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
import RestockScreen from './screens/RestockScreen';
import ReminderScreen from './screens/ReminderScreen';
const Stack = createStackNavigator();


export default function App() {
  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {/* <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            <Stack.Screen name="Drawer" component={NotificationDrawer} />
            <Stack.Screen name="Medication" component={MedicationScreen} />
            <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} options={{headerShown: true, title:"Medication Detail"}}/>
            <Stack.Screen name="Restock" component={RestockScreen} options={{headerShown: true, title:"Medication Title"}}/>
          </Stack.Navigator>
        </NavigationContainer> */}
        <ReminderScreen></ReminderScreen>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
