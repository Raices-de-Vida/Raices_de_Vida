import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';

export default function WelcomeScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemeToggle />
      
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <Text style={[styles.title, { color: theme.text }]}>Raíces de vida</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>ayudar es nuestra misión</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.loginButton, { borderColor: theme.secondaryButton }]} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.loginText, { color: theme.secondaryButton }]}>LOG IN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.registerButton, { backgroundColor: theme.primaryButton }]} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 230,
    height: 230,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loginButton: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  loginText: {
    fontWeight: '500',
    fontSize: 13,
  },
  registerButton: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  registerText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
});