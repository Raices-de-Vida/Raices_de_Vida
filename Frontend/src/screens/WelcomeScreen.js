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

      {/* Botones de inicio de sesión */}
      <TouchableOpacity 
        style={[styles.loginButton, { backgroundColor: theme.secondaryButton }]} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginText}>Iniciar sesión</Text>
      </TouchableOpacity>

      {/* Registrarse como grupo */}
      <View style={styles.registerGroup}>
        <Text style={[styles.registerText, { color: theme.secondaryText }]}>Registrarse como:</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.registerButton, { backgroundColor: theme.primaryButton }]} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>ONG</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.registerButton, { backgroundColor: theme.primaryButton }]} 
            onPress={() => navigation.navigate('RegisterCommunity')}
          >
            <Text style={styles.registerButtonText}>Comunidad</Text>
          </TouchableOpacity>
        </View>
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
  loginButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  registerGroup: {
    width: '100%',
    alignItems: 'center',
  },
  registerText: {
    marginBottom: 12,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    gap: 12,
  },
  registerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  }
});