// UI Library dependencies
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const BottomTab = createBottomTabNavigator();
const RightDrawer = createDrawerNavigator();

function RightDrawerNavigator() {
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
      <RightDrawer.Screen name="MainApp" component={DrawerNavigator} />
    </RightDrawer.Navigator>
  );
}

function DrawerNavigator({ navigation }) {
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

function BottomNavigator() {
  return (
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
            <Stack.Screen name="Drawer" component={RightDrawerNavigator} />
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
