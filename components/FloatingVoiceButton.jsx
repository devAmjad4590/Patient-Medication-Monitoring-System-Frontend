import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useVoice } from '../VoiceContext';
import VoiceCommandModal from './VoiceCommandModal';

const FloatingVoiceButton = () => {
  const { isVoiceEnabled } = useVoice();
  const [modalVisible, setModalVisible] = useState(false);

  if (!isVoiceEnabled) {
    return null;
  }

  const handlePress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="mic" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <VoiceCommandModal
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  bottom: 70, // Above the tab bar
  alignSelf: 'center',
  left: '50%',
  marginLeft: -28, // Half of button width (56/2)
  zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2F7EF5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default FloatingVoiceButton;