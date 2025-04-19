import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Raíces de vida</Text>
      <Text style={styles.subtitle}>ayudar es nuestra misión</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>LOG IN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1B1F3B',
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loginButton: {
    borderColor: '#2E7D32',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  loginText: {
    color: '#2E7D32',
    fontWeight: '500',
    fontSize: 13,
  },
  registerButton: {
    backgroundColor: '#F4A261',
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
