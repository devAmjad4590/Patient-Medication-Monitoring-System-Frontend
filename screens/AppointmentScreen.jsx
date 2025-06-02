import React, {useEffect, useState} from 'react'
import { View, StyleSheet, FlatList, RefreshControl}from 'react-native'
import AppointmentCard from '../components/AppointmentCard'
import {getPastAppointments, getUpcomingAppointments} from '../api/patientAPI'
import SegmentedControl from 'react-native-ui-lib/segmentedControl';


function AppointmentScreen() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = React.useState([]);
  const [pastAppointments, setPastAppointments] = React.useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  
  useEffect(() => {
    const init = async () => {
      await fetchAppointments();
    }
    init();
  }, []); // run once on mount

  async function fetchAppointments(){
    try{
      const upcoming = await getUpcomingAppointments();
      const past = await getPastAppointments();
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    }
    catch(err){
      console.error('Error fetching appointments:', err);
    }
  }

  return (
    <View style={styles.root}>
      <SegmentedControl
        segments={[
          { label: 'Upcoming' },
          { label: 'Past' },
        ]}
        onChangeIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
        containerStyle={{
          backgroundColor: '#D9D9D9',
          borderRadius: 30,
          borderColor: 'black',
          width: '100%',
          alignSelf: 'center',
          marginBottom: 20
        }}
        activeBackgroundColor="white"
        inactiveTextColor="black"
        activeTextColor="black"
        backgroundColor='#CFCFCF'
        style={{ fontSize: 15, fontWeight: '500', height: 50, borderRadius: 20, }}
      />

      <FlatList
        data={upcomingAppointments && selectedIndex === 0 ? upcomingAppointments : pastAppointments}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchAppointments();
              setRefreshing(false);
            }}
          />
        }
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <AppointmentCard
            type={item.type}
            dateTime={item.appointmentDateTime}
            doctorName={item.doctorName}
            location={item.location}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 28,
  }
})

export default AppointmentScreen
