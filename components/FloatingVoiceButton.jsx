import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useVoice } from '../VoiceContext';
import VoiceCommandModal from './VoiceCommandModal';

const FloatingVoiceButton = () => {
  const { isVoiceEnabled, isLoading } = useVoice();
  const [modalVisible, setModalVisible] = useState(false);

  // Show button while loading or when voice is enabled
  // Only hide when explicitly disabled and not loading
  if (!isLoading && !isVoiceEnabled) {
    return null;
  }

  const handlePress = () => {
    // Don't open modal if still loading
    if (isLoading) {
      console.log('Voice settings still loading...');
      return;
    }
    
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.loadingButton]}
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <MaterialIcons 
            name="mic" 
            size={28} 
            color={isLoading ? "#ccc" : "white"} 
          />
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
  loadingButton: {
    backgroundColor: '#888',
  },
});

export default FloatingVoiceButton;