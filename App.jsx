// UI Library dependencies
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,SafeAreaView } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import NotificationDrawer from './components/navigators/NotificationDrawer';
import MedicationScreen from './screens/MedicationScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
const Stack = createNativeStackNavigator();


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
            <Stack.Screen name="Drawer" component={NotificationDrawer} />
            <Stack.Screen name="Medication" component={MedicationScreen} />
            <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} options={{headerShown: true}}/>
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
