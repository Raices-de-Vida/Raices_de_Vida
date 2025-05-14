// RecomendacionesScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function RecomendacionesScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.header, { backgroundColor: theme.header }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Recomendaciones</Text>
      </View>

      <View style={[styles.placeholder, { backgroundColor: theme.card }]}> 
        <Text style={[styles.placeholderText, { color: theme.secondaryText }]}>[Aquí iría la imagen del plato equilibrado]</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  placeholder: {
    height: 400,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontStyle: 'italic' },
});
