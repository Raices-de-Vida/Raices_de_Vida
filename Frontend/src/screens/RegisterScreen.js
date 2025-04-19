import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dpi, setDpi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isEmpty = (value) => submitted && value.trim() === '';

  const handleRegister = async () => {
    alert('Se presionó el botón');
    setSubmitted(true);

    if (
      name.trim() &&
      phone.trim() &&
      dpi.trim() &&
      (email.trim() || dpi.trim()) &&
      password.trim() &&
      confirmPassword.trim()
    ) {
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const response = await axios.post('http://192.168.249.99:3000/api/auth/register', {
        nombre: name,
        apellido: 'SinApellido',
        email,
        password,
        rol: 'ONG',
        tipo_referencia: 'ONG',
        id_referencia: 1,
      });

      console.log(' Usuario registrado:', response.data);
      alert('Registro exitoso');
      navigation.navigate('Login');
    } else {
      alert('Por favor llena todos los campos');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <TextInput
        style={[styles.input, isEmpty(name) && styles.errorInput]}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, isEmpty(phone) && styles.errorInput]}
        placeholder="Teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, isEmpty(dpi) && styles.errorInput]}
        placeholder="DPI"
        value={dpi}
        onChangeText={setDpi}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />
      <Text style={styles.optional}>O ingresa tu correo electrónico</Text>
      <TextInput
        style={[styles.input, isEmpty(email) && styles.errorInput]}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, isEmpty(password) && styles.errorInput]}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, isEmpty(confirmPassword) && styles.errorInput]}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
        <Text style={styles.termsLink}>Términos y condiciones</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#1B1F3B',
  },
  optional: {
    fontSize: 12,
    color: '#6D6D6D',
    marginBottom: 4,
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#2E7D32',
    borderWidth: 1,
  },
  errorInput: {
    borderColor: 'red',
  },
  button: {
    backgroundColor: '#F4A261',
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  link: {
    color: '#2E7D32',
    marginTop: 15,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  termsLink: {
    color: '#2E7D32',
    marginTop: 5,
    fontSize: 13,
  },
});
