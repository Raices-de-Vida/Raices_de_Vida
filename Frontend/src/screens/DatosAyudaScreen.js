import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function DatosAyudaScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container]}>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Datos de ayuda</Text>
        </View>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]} 
          onPress={() => navigation.navigate('Recomendaciones')}
        >
          <Ionicons name="thumbs-up-outline" size={30} color={theme.text} />
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Recomendaciones</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>cómo utilizar un alimento</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]} 
          onPress={() => navigation.navigate('Importancia')}
        >
          <Ionicons name="information-circle-outline" size={30} color={theme.text} />
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Importancia</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>Buena salud</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Barra inferior reutilizable */}
      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
  },
});
