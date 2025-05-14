import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function ThemeToggle({ style }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
  return (
    <TouchableOpacity 
      style={[styles.themeToggle, style]} 
      onPress={toggleDarkMode}
    >
      <Ionicons 
        name={isDarkMode ? "sunny-outline" : "moon-outline"} 
        size={24} 
        color={theme.text} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  themeToggle: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
});
