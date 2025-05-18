import { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import SelectOption from '../components/SelectOption';
import PrimaryButton from '../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChartCard from '../components/ChartCard';
import * as Progress from 'react-native-progress';
import { LineChart } from 'react-native-chart-kit';



const screenWidth = Dimensions.get('window').width;


function AnalyticsScreen() {
  const [adherence, setAdherence] = useState(0.75);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');


  const handleSelect = (selectedItem) => {
    setSelectedTimeframe(selectedItem.value);
    // Handle the selected item here
  }

  // Function to format the text shown in the circle
  const formatAdherenceText = (progress) => {
    // Convert decimal to percentage and round it
    return `${Math.round(progress * 100)}%`;
  };
  return (
    <View style={styles.root}>
      <SelectOption></SelectOption>
      <View style={{ flex: 1, alignItems: 'flex-end', marginTop: 20 }}>
        <View style={{ width: '60%', height: '300' }}>
          <PrimaryButton><Text style={{ fontSize: 20, fontWeight: 400 }}>Generate Report  </Text><Icon size={20} name='content-save-edit'></Icon></PrimaryButton>
        </View>
      </View>
      <View style={styles.content}>
        {/* Adherence Summary Card */}
        <ChartCard title='Adherence Summary'>

          <View style={{ alignSelf: 'flex-start', marginTop: 20, flex: 1 }}>
            <Progress.Circle
              formatText={() => formatAdherenceText(adherence)}
              textStyle={{ color: 'black', fontSize: 30, fontWeight: 400 }}
              thickness={30}
              progress={adherence}
              showsText={true}
              size={150}
              color='#5A6ACF'
              animated={true}
              unfilledColor='#C7CEFF'
              borderWidth={0}
            />
          </View>
          <View style={{ flexDirection: 'column', padding: 20, paddingHorizontal: 0, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
              <View style={{ borderRadius: '50%', backgroundColor: '#5A6ACF', width: 10, height: 10 }}></View>
              <Text style={{ textAlign: 'left', width: '30%' }}>Adherent</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
              <View style={{ borderRadius: '50%', backgroundColor: '#C7CEFF', width: 10, height: 10 }}></View>
              <Text style={{ textAlign: 'left', width: '30%' }}>Non-Adherent</Text>
            </View>
          </View>
        </ChartCard>
        {/* Blood Pressure Chart */}
        <ChartCard title='Blood Pressure'>
          <LineChart
            data={{
              labels: ['01', '02', '03', '04', '05', '06', '07'],
              datasets: [
                {
                  data: [20, 45, 28, 80, 99, 43, 66],
                  color: (opacity = 1) => `rgba(84, 105, 212, ${opacity})`, // Changed to a royal blue color
                  strokeWidth: 2
                }
              ],
            }}
            width={screenWidth - 55}
            height={190}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(84, 105, 212, ${opacity})`, // Same blue for other elements
              labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`, // Gray for labels
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#5469d4'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </ChartCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#E7E7E7'
  },
  content: {
    flex: 7,
    paddingVertical: 20,
    gap: 15,
    paddingHorizontal: 10,
  },



});

export default AnalyticsScreen;