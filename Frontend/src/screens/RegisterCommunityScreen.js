import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function RegisterCommunityScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dpi, setDpi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [esLider, setEsLider] = useState(false);
  const [comunidades, setComunidades] = useState([]);
  const [mostrarComunidades, setMostrarComunidades] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmpty = (value) => submitted && value.trim() === '';

  useEffect(() => {
    //Cargar la lista de comunidades del backend
    const fetchComunidades = async () => {
      try {
        const response = await axios.get('//localhost:3001/api/comunidades');
        setComunidades(response.data);
      } catch (error) {
        console.error('Error cargando comunidades:', error);
        // Comunidades predefinidas como fallback [DUMMY DATA]
        setComunidades([
          { id_comunidad: 1, nombre_comunidad: 'San Gaspar Ixchil' },
          { id_comunidad: 2, nombre_comunidad: 'Santa Bárbara' },
          { id_comunidad: 3, nombre_comunidad: 'Huehuetenango' },
          { id_comunidad: 4, nombre_comunidad: 'Cahabón' },
          { id_comunidad: 5, nombre_comunidad: 'Colotenango' },
          { id_comunidad: 6, nombre_comunidad: 'Lanquín' }
        ]);
      }
    };

    fetchComunidades();
  }, []);

  const handleRegister = async () => {
    setSubmitted(true);
    
    // Validaciones avanzadas
    const dpiRegex = /^\d{13}$/;
    const phoneRegex = /^\d{8,10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    let errors = [];
    
    if (!nombre) errors.push('Nombre es obligatorio');
    if (!apellido) errors.push('Apellido es obligatorio');
    if (!dpi) {
      errors.push('DPI es obligatorio');
    } else if (!dpiRegex.test(dpi)) {
      errors.push('DPI debe contener exactamente 13 dígitos numéricos');
    }
    
    if (telefono && !phoneRegex.test(telefono)) {
      errors.push('Formato de teléfono inválido');
    }
    
    if (email && !emailRegex.test(email)) {
      errors.push('Formato de correo electrónico inválido');
    }
    
    if (!password) {
      errors.push('Contraseña es obligatoria');
    } else if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (password !== confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    
    if (!comunidad) {
      errors.push('Debe seleccionar una comunidad');
    }
    
    if (errors.length > 0) {
      Alert.alert('Error', errors.join('\n'));
      return;
    }

    setLoading(true);
    
    try {
      // Obtener ID de la comunidad seleccionada
      const comunidadSeleccionada = comunidades.find(c => c.nombre_comunidad === comunidad);
      const id_comunidad = comunidadSeleccionada?.id_comunidad || 1;
      
      // Datos para el registro
      const userData = {
        nombre,
        apellido,
        dpi,
        telefono,
        email: email || `${dpi}@raicesdevida.app`, // Email generado si no se proporciona
        password,
        rol: esLider ? 'Lider Comunitario' : 'Miembro Comunidad',
        tipo_referencia: 'Comunidad',
        id_referencia: id_comunidad
      };

      // Mostrar feedback al usuario
      const loadingToast = Toast.show({
        type: 'info',
        text1: 'Procesando registro',
        text2: 'Por favor espere...',
        visibilityTime: 2000,
        autoHide: false
      });
      
      const response = await axios.post('//localhost:3001/api/auth/register/community', userData);
      
      // Eliminar el toast de carga y mostrar éxito
      Toast.hide(loadingToast);
      Toast.show({
        type: 'success',
        text1: 'Registro exitoso',
        text2: 'Su cuenta ha sido creada correctamente'
      });
      
      navigation.navigate('Login');
    } catch (error) {
      // Manejo de errores mejorado
      let errorMessage = 'No se pudo completar el registro.';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Este DPI o correo electrónico ya está registrado.';
        } else if (error.response.status === 400 && error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 500) {
          errorMessage = 'Error en el servidor. Intente más tarde.';
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error de registro',
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <ThemeToggle />
        
        <Text style={[styles.title, { color: theme.text }]}>Registro Comunitario</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Crea una cuenta como miembro de la comunidad
        </Text>

        {/* Nombre */}
        <Text style={[styles.label, { color: theme.text }]}>Nombre *</Text>
        <View style={[
          styles.inputBox, 
          isEmpty(nombre) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ingresa tu nombre"
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Apellido */}
        <Text style={[styles.label, { color: theme.text }]}>Apellido *</Text>
        <View style={[
          styles.inputBox, 
          isEmpty(apellido) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Ingresa tu apellido"
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* DPI */}
        <Text style={[styles.label, { color: theme.text }]}>DPI *</Text>
        <View style={[
          styles.inputBox, 
          isEmpty(dpi) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={dpi}
            onChangeText={setDpi}
            placeholder="Ingresa tu DPI (13 dígitos)"
            keyboardType="numeric"
            maxLength={13}
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Teléfono */}
        <Text style={[styles.label, { color: theme.text }]}>Teléfono</Text>
        <View style={[
          styles.inputBox,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ingresa tu número de teléfono"
            keyboardType="phone-pad"
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Email (opcional) */}
        <Text style={[styles.label, { color: theme.text }]}>Email (opcional)</Text>
        <View style={[
          styles.inputBox,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu email (opcional)"
            keyboardType="email-address"
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Contraseña */}
        <Text style={[styles.label, { color: theme.text }]}>Contraseña *</Text>
        <View style={[
          styles.inputBox, 
          isEmpty(password) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Confirmar Contraseña */}
        <Text style={[styles.label, { color: theme.text }]}>Confirmar Contraseña *</Text>
        <View style={[
          styles.inputBox, 
          isEmpty(confirmPassword) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirma tu contraseña"
            secureTextEntry
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Comunidad */}
        <Text style={[styles.label, { color: theme.text }]}>Comunidad *</Text>
        <TouchableOpacity
          style={[
            styles.dropdownBox,
            isEmpty(comunidad) && styles.errorInput,
            { backgroundColor: theme.inputBackground }
          ]}
          onPress={() => setMostrarComunidades(!mostrarComunidades)}
        >
          <Text style={[styles.dropdownText, { color: comunidad ? theme.text : theme.secondaryText }]}>
            {comunidad || 'Selecciona tu comunidad'}
          </Text>
          <Ionicons 
            name={mostrarComunidades ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={theme.text}
          />
        </TouchableOpacity>
        
        {mostrarComunidades && (
          <View style={[
            styles.optionGroup, 
            { backgroundColor: theme.inputBackground }
          ]}>
            {comunidades.map((item) => (
              <TouchableOpacity 
                key={item.id_comunidad}
                onPress={() => {
                  setComunidad(item.nombre_comunidad);
                  setMostrarComunidades(false);
                }}
              >
                <Text style={[styles.option, { color: theme.text }]}>
                  {item.nombre_comunidad}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Checkbox para Líder Comunitario */}
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setEsLider(!esLider)}
        >
          <Ionicons
            name={esLider ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={theme.secondaryButton}
          />
          <Text style={[styles.checkboxText, { color: theme.text }]}>
            Soy Líder Comunitario
          </Text>
        </TouchableOpacity>

        {/* Botón de registro */}
        <TouchableOpacity 
          style={[
            styles.button,
            { backgroundColor: theme.secondaryButton },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Procesando...' : 'Registrarme'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.secondaryButton }]}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
          <Text style={[styles.termsLink, { color: theme.secondaryButton }]}>
            Términos y condiciones
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    paddingTop: 90,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginLeft: 4,
  },
  inputBox: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  errorInput: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dropdownBox: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    height: 48,
  },
  dropdownText: {
    fontSize: 16,
  },
  optionGroup: {
    borderRadius: 8,
    padding: 10,
    marginTop: -14,
    marginBottom: 16,
    maxHeight: 200,
  },
  option: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  termsLink: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
  }
});