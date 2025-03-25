import React from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import AppointmentCard from '../components/AppointmentCard'
import { pastAppointments, upcomingAppointments } from '../data/mockAppointment.js'
import SegmentedControl from 'react-native-ui-lib/segmentedControl';


function AppointmentScreen() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const appointments = selectedIndex === 0 ? upcomingAppointments : pastAppointments;

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
        data={appointments}
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
