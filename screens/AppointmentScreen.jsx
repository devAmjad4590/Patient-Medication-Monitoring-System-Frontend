import React, {useEffect, useState} from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Text}from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppointmentCard from '../components/AppointmentCard'
import {getPastAppointments, getUpcomingAppointments} from '../api/patientAPI'
import SegmentedControl from 'react-native-ui-lib/segmentedControl';

function AppointmentScreen() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = React.useState([]);
  const [pastAppointments, setPastAppointments] = React.useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => {
      await fetchAppointments();
    }
    init();
  }, []); // run once on mount

  async function fetchAppointments(){
    setLoading(true);
    try{
      const upcoming = await getUpcomingAppointments();
      const past = await getPastAppointments();
      
      setUpcomingAppointments(upcoming);

       // Sort past appointments by date (latest to oldest)
      const sortedPast = past.sort((a, b) => {
        return new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime);
      });
      
      setPastAppointments(sortedPast);

    }
    catch(err){
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  // Empty state component
  const EmptyState = ({ isUpcoming }) => (
    <View style={styles.emptyStateContainer}>
      <Icon 
        name={isUpcoming ? "calendar-plus" : "calendar-check"} 
        size={80} 
        color="#ccc" 
      />
      <Text style={styles.emptyStateTitle}>
        {isUpcoming ? "No Upcoming Appointments" : "No Past Appointments"}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {isUpcoming 
          ? "You don't have any scheduled appointments. Contact your healthcare provider to book an appointment."
          : "You haven't had any appointments yet. Your appointment history will appear here once you visit your healthcare provider."
        }
      </Text>
    </View>
  );

  const currentData = selectedIndex === 0 ? upcomingAppointments : pastAppointments;
  const isEmpty = currentData.length === 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
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

      {isEmpty ? (
        <EmptyState isUpcoming={selectedIndex === 0} />
      ) : (
        <FlatList
          data={currentData}
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
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
})

export default AppointmentScreen