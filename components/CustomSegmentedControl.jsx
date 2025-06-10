import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

const CustomSegmentedControl = ({ 
  segments, 
  selectedIndex, 
  onChangeIndex,
  containerStyle,
  activeBackgroundColor = 'white',
  inactiveTextColor = 'black',
  activeTextColor = 'black',
  backgroundColor = '#CFCFCF',
  style = {}
}) => {
  const animatedValue = useRef(new Animated.Value(selectedIndex)).current;
  const [layoutComplete, setLayoutComplete] = useState(false);
  const [segmentWidth, setSegmentWidth] = useState(0);

  useEffect(() => {
    // Update animated value when selectedIndex changes
    if (layoutComplete) {
      Animated.spring(animatedValue, {
        toValue: selectedIndex,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [selectedIndex, layoutComplete]);

  const onLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    const newSegmentWidth = (width - 8) / segments.length; // 8 = 4px padding on each side
    setSegmentWidth(newSegmentWidth);
    
    // Set the initial position immediately after layout
    animatedValue.setValue(selectedIndex);
    setLayoutComplete(true);
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          borderRadius: containerStyle?.borderRadius || 30,
          borderColor: containerStyle?.borderColor || 'black',
          borderWidth: containerStyle?.borderColor ? 1 : 0,
          height: style?.height || 50,
        }, 
        containerStyle
      ]}
      onLayout={onLayout}
    >
      {/* Animated background slider */}
      {layoutComplete && (
        <Animated.View
          style={[
            styles.slider,
            {
              backgroundColor: activeBackgroundColor,
              width: segmentWidth,
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, segments.length - 1],
                    outputRange: [4, (segments.length - 1) * segmentWidth + 4],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* Segment buttons */}
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={index}
          style={styles.segment}
          onPress={() => onChangeIndex(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              {
                fontSize: style?.fontSize || 15,
                fontWeight: style?.fontWeight || '500',
                color: selectedIndex === index ? activeTextColor : inactiveTextColor,
              }
            ]}
          >
            {segment.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  slider: {
    position: 'absolute',
    top: 4,
    height: '100%',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  segmentText: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default CustomSegmentedControl;