import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info'
};

export const CustomToast = ({ message, type, visible, duration = 3000, onHide }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onHide?.());
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case ToastTypes.SUCCESS:
        return { backgroundColor: theme.toastSuccess };
      case ToastTypes.ERROR:
        return { backgroundColor: theme.toastError };
      default:
        return { backgroundColor: theme.toastInfo };
    }
  };

  const getIcon = () => {
    switch (type) {
      case ToastTypes.SUCCESS:
        return <Ionicons name="checkmark-circle" size={24} color="white" />;
      case ToastTypes.ERROR:
        return <Ionicons name="close-circle" size={24} color="white" />;
      default:
        return <Ionicons name="information-circle" size={24} color="white" />;
    }
  };

  return (
    <Animated.View style={[
      styles.toastContainer,
      getToastStyle(),
      { opacity: fadeAnim, top: 40 }
    ]}>
      {getIcon()}
      <Text style={[styles.toastText, { color: theme.toastText }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});