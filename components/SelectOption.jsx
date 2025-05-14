import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



function SelectOption() {
    const displayOptions = [
        { label: 'Today', value: 'today', icon: 'calendar-today' },
        { label: 'This Week', value: 'week', icon: 'calendar-week' },
        { label: 'This Month', value: 'month', icon: 'calendar-month' },
        { label: 'All Time', value: 'all', icon: 'calendar' },
        { label: 'Custom', value: 'custom', icon: 'calendar-edit' },
      ];
  return (
      <View style={styles.optionContainer}>
              <SelectDropdown
                data={displayOptions}
                defaultValue={displayOptions[0]}
                onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index);
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      {selectedItem && (
                        <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />
                      )}
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {(selectedItem && selectedItem.label) || 'Select period'}
                      </Text>
                      <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
                      <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                      <Text style={styles.dropdownItemTxtStyle}>{item.label}</Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
    </View>
  )
}

const styles = StyleSheet.create({
optionContainer: {
    alignItems: 'center',
    paddingTop: 20
  },
  dropdownButtonStyle: {
    width: 200,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 4,

  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownButtonArrowStyle: {
    fontSize: 22,
    color: '#6c757d',
  },
  dropdownButtonIconStyle: {
    fontSize: 20,
    marginRight: 8,
    color: '#2465FD',
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 20,
    marginRight: 8,
    color: '#2465FD',
  },
})

export default SelectOption
