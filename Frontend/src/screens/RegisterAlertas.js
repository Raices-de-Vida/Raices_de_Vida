import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, 
  useWindowDimensions, LayoutAnimation, Platform, UIManager, Animated, Modal,
  StatusBar, ActivityIndicator, Dimensions, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RegisterAlertas({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { width, height } = useWindowDimensions();
  const screenDimensions = Dimensions.get('window');
  
  const isLargeScreen = width > 768;
  const isTablet = width >= 600 && width < 1024;
  const isSmallScreen = width < 360;
  
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    ubicacion: '',
    comunidad: '',
    descripcion: '',
    tipoAlerta: '',
    prioridad: '',
  });

  const [dropdownStates, setDropdownStates] = useState({
    comunidades: false,
    tipos: false,
    prioridades: false,
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [foto, setFoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [locationCharCount, setLocationCharCount] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollViewRef = useRef();

  const comunidades = ['San Gaspar Ixchil', 'Santa Bárbara', 'Huehuetenango', 'Cahabón', 'Colotenango', 'Lanquín'];
  const tipos = ['Médica', 'Nutricional', 'Psicosocial', 'Urgente'];
  const prioridades = ['Baja', 'Media', 'Alta', 'Crítica'];

  useEffect(() => {
    cargarDatosPrevios();
    setupAnimations();
    const keyboardListeners = setupKeyboardListeners();
    
    return () => {
      keyboardListeners.forEach(listener => listener?.remove());
    };
  }, []);

  useEffect(() => {
    setCharCount(formData.descripcion.length);
    setLocationCharCount(formData.ubicacion.length);
  }, [formData.descripcion, formData.ubicacion]);

  const setupAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const setupKeyboardListeners = () => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return [keyboardDidShow, keyboardDidHide];
  };

  const cargarDatosPrevios = async () => {
    try {
      const fotoGuardada = await AsyncStorage.getItem('fotoAlerta');
      
      if (fotoGuardada) {
        setFoto(fotoGuardada);
      }
    } catch (error) {
      console.log('Error cargando datos previos:', error);
    }
  };

  const updateFormData = (field, value) => {
    console.log(`Updating form data: ${field} = ${value}`);
    
    if (field === 'nombre') {
      // Solo letras, espacios y caracteres especiales básicos
      const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]*$/;
      if (!nameRegex.test(value)) return;
    }
    
    if (field === 'edad') {
      // Solo números, máximo 3 dígitos
      const ageRegex = /^\d{0,3}$/;
      if (!ageRegex.test(value)) return;
      if (parseInt(value) > 150) return;
    }

    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const toggleDropdown = (dropdown) => {
    console.log(`Toggling dropdown: ${dropdown}`);
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
    });

    setDropdownStates(prev => {
      const newState = {
        comunidades: false,
        tipos: false,
        prioridades: false,
      };
      
      if (prev[dropdown]) {
        console.log(`Closing dropdown: ${dropdown}`);
        setActiveDropdown(null);
        return newState;
      } else {
        console.log(`Opening dropdown: ${dropdown}`);
        setActiveDropdown(dropdown);
        return { ...newState, [dropdown]: true };
      }
    });
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      comunidades: false,
      tipos: false,
      prioridades: false,
    });
    setActiveDropdown(null);
  };

  const selectOption = (field, value, dropdown) => {
    console.log(`Selecting option: ${field} = ${value}`);
    
    updateFormData(field, value);
    
    setTimeout(() => {
      closeAllDropdowns();
    }, 100);
  };

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos permisos para acceder a tus fotos.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0].uri;
        await AsyncStorage.setItem('fotoAlerta', selectedImage);
        setFoto(selectedImage);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la imagen');
    }
  };

  const eliminarFoto = async () => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar la foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('fotoAlerta');
            setFoto(null);
          }
        }
      ]
    );
  };

  const validarFormulario = () => {
    const { nombre, edad, comunidad, tipoAlerta, prioridad, descripcion } = formData;
    
    if (!nombre.trim()) return 'El nombre es obligatorio';
    if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!edad.trim()) return 'La edad es obligatoria';
    if (isNaN(edad) || parseInt(edad) <= 0 || parseInt(edad) > 150) return 'Ingresa una edad válida';
    if (!comunidad) return 'Selecciona una comunidad';
    if (!tipoAlerta) return 'Selecciona el tipo de alerta';
    if (!prioridad) return 'Selecciona el nivel de prioridad';
    if (!descripcion.trim()) return 'La descripción es obligatoria';
    if (descripcion.trim().length < 50) return 'La descripción debe tener al menos 50 caracteres para proporcionar suficiente detalle sobre la emergencia';
    
    return null;
  };

  const handleCrear = async () => {
    const error = validarFormulario();
    if (error) {
      Alert.alert('Campos incompletos', error);
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await AsyncStorage.removeItem('fotoAlerta');

      Alert.alert(
        'Alerta creada',
        'La alerta ha sido registrada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la alerta. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (position) => {
    scrollViewRef.current?.scrollTo({
      y: position,
      animated: true
    });
  };

  const styles = getResponsiveStyles(theme, { width, height, isLargeScreen, isTablet, isSmallScreen }, isDarkMode);

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.header}
      />
      
      {/* Overlay para cerrar dropdowns */}
      {false && activeDropdown && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1}
          onPress={closeAllDropdowns}
        />
      )}
      
      {/* Header minimalista y moderno con logo */}
      <View style={styles.modernHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.modernBackButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          {/* Logo adaptativo */}
          <View style={styles.logoContainer}>
            <Image 
              source={isDarkMode 
                ? require('../styles/logos/LogoDARK.png')
                : require('../styles/logos/LogoBRIGHT.png')
              }
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.headerTitleSection}>
            <Text style={styles.modernHeaderTitle}>Nueva Alerta</Text>
            <Text style={styles.modernHeaderSubtitle}>Registro de emergencia</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.modernThemeToggle}
            onPress={toggleDarkMode}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Información personal */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person" size={20} color={theme.primaryButton} /> 
            {' '}Información Personal
          </Text>
          
          <View style={isLargeScreen ? styles.rowContainer : styles.columnContainer}>
            <FormField
              label="Nombre completo"
              value={formData.nombre}
              onChangeText={(text) => updateFormData('nombre', text)}
              placeholder="Ingresa el nombre"
              icon="person-outline"
              theme={theme}
              style={isLargeScreen ? styles.halfWidth : styles.fullWidth}
              maxLength={50}
              required={true}
            />
            
            <FormField
              label="Edad"
              value={formData.edad}
              onChangeText={(text) => updateFormData('edad', text)}
              placeholder="Años"
              icon="calendar-outline"
              keyboardType="numeric"
              theme={theme}
              style={isLargeScreen ? styles.halfWidth : styles.fullWidth}
              maxLength={3}
              required={true}
            />
          </View>

        </View>

        {/* Ubicación específica */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location-outline" size={20} color={theme.primaryButton} /> 
              {' '}Ubicación específica
            </Text>
            <View style={styles.charCounterContainer}>
              <Text style={[
                styles.charCounter, 
                {
                  color: locationCharCount > 160 
                    ? theme.errorColor 
                    : locationCharCount > 120 
                    ? theme.warningColor
                    : theme.successColor
                }
              ]}>
                {locationCharCount}/200
              </Text>
            </View>
          </View>
          
          <View style={[styles.textAreaContainer, { minHeight: 100 }]}>
            <TextInput
              style={[styles.textArea, { minHeight: 60 }]}
              placeholder="Dirección, referencias, coordenadas..."
              placeholderTextColor={theme.inputPlaceholder}
              value={formData.ubicacion}
              onChangeText={(text) => updateFormData('ubicacion', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>
        </View>

        {/* Clasificación de la alerta */}
        <View style={[
          styles.sectionCard,
          activeDropdown && { zIndex: 10000, elevation: 10000 }
        ]}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="medical" size={20} color={theme.primaryButton} /> 
            {' '}Clasificación de Emergencia
          </Text>
          
          <DropdownField
            label="Comunidad"
            value={formData.comunidad}
            placeholder="Selecciona una comunidad"
            options={comunidades}
            onSelect={(value) => selectOption('comunidad', value, 'comunidades')}
            isOpen={dropdownStates.comunidades}
            onToggle={() => toggleDropdown('comunidades')}
            icon="home-outline"
            theme={theme}
            style={styles.fullWidth}
            zIndex={3000}
            required={true}
            activeDropdown={activeDropdown}
            dropdownKey="comunidades"
          />

          <View style={isLargeScreen ? styles.rowContainer : styles.columnContainer}>
            <DropdownField
              label="Tipo de alerta"
              value={formData.tipoAlerta}
              placeholder="Selecciona el tipo"
              options={tipos}
              onSelect={(value) => selectOption('tipoAlerta', value, 'tipos')}
              isOpen={dropdownStates.tipos}
              onToggle={() => toggleDropdown('tipos')}
              icon="medical-outline"
              theme={theme}
              style={isLargeScreen ? styles.halfWidth : styles.fullWidth}
              zIndex={2000}
              required={true}
              activeDropdown={activeDropdown}
              dropdownKey="tipos"
            />
            
            <DropdownField
              label="Nivel de prioridad"
              value={formData.prioridad}
              placeholder="Selecciona prioridad"
              options={prioridades}
              onSelect={(value) => selectOption('prioridad', value, 'prioridades')}
              isOpen={dropdownStates.prioridades}
              onToggle={() => toggleDropdown('prioridades')}
              icon="alert-circle-outline"
              theme={theme}
              style={isLargeScreen ? styles.halfWidth : styles.fullWidth}
              priorityColors={true}
              zIndex={1000}
              required={true}
              activeDropdown={activeDropdown}
              dropdownKey="prioridades"
            />
          </View>
        </View>

        {/* Descripción detallada */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="document-text" size={20} color={theme.primaryButton} /> 
              {' '}Descripción de la Emergencia
            </Text>
            <View style={styles.charCounterContainer}>
              <Text style={[
                styles.charCounter, 
                {
                  color: charCount > 1600 
                    ? theme.errorColor
                    : charCount > 1200 
                    ? theme.warningColor
                    : theme.successColor
                }
              ]}>
                {charCount}/2000
              </Text>
            </View>
          </View>
          
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe detalladamente la situación de emergencia: síntomas específicos, cuándo comenzó, circunstancias importantes, estado actual del paciente, tratamientos intentados, evolución del problema, factores de riesgo..."
              placeholderTextColor={theme.inputPlaceholder}
              value={formData.descripcion}
              onChangeText={(text) => updateFormData('descripcion', text)}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={2000}
              onFocus={() => scrollToSection && scrollToSection(400)}
            />
          </View>
        </View>

        {/* Evidencia fotográfica */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="camera" size={20} color={theme.primaryButton} /> 
            {' '}Evidencia Fotográfica
          </Text>
          <Text style={styles.sectionSubtitle}>Opcional - Ayuda a evaluar la situación</Text>
          
          {foto ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: foto }} style={styles.imagePreview} />
              <TouchableOpacity 
                onPress={eliminarFoto} 
                style={styles.removeImageButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={seleccionarFoto} 
                style={styles.changeImageButton}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={16} color={theme.primaryButton} />
                <Text style={[styles.changeImageText, { color: theme.primaryButton }]}>
                  Cambiar
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.photoUploadArea} 
              onPress={seleccionarFoto}
              activeOpacity={0.7}
            >
              <View style={styles.photoUploadContent}>
                <Ionicons name="camera-outline" size={32} color={theme.primaryButton} />
                <Text style={styles.photoUploadText}>Agregar fotografía</Text>
                <Text style={styles.photoUploadSubtext}>
                  Toca para seleccionar desde galería
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Botones de acción mejorados */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="close-outline" size={20} color={theme.cancelButtonText} />
            <Text style={[styles.actionButtonText, { color: theme.cancelButtonText }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.createButton]} 
            onPress={handleCrear}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.primaryButtonText} />
            ) : (
              <Ionicons name="checkmark-outline" size={20} color={theme.primaryButtonText} />
            )}
            <Text style={[styles.actionButtonText, { color: theme.primaryButtonText }]}>
              {isLoading ? 'Enviando...' : 'Crear Alerta'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de carga */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primaryButton} />
            <Text style={styles.loadingText}>Enviando alerta...</Text>
            <Text style={[styles.loadingText, { fontSize: 14, opacity: 0.7 }]}>
              Por favor espera
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Componente FormField mejorado y responsive
const FormField = ({ 
  label, value, onChangeText, placeholder, icon, keyboardType = 'default', 
  theme, style, maxLength, multiline = false, numberOfLines = 1, 
  charCount = 0, required = false, alwaysShowCounter = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getCharCounterColor = () => {
    if (!maxLength || charCount === 0) return theme.secondaryText;
    const percentage = (charCount / maxLength) * 100;
    if (percentage >= 90) return theme.errorColor;
    if (percentage >= 70) return theme.warningColor;
    return theme.successColor;
  };

  const shouldShowCounter = (alwaysShowCounter && maxLength) || (maxLength && charCount > 0);

  return (
    <View style={[style, { marginBottom: 20 }]}>
      <View style={getFieldStyles(theme).labelContainer}>
        <Text style={[
          getFieldStyles(theme).fieldLabel, 
          { color: required ? theme.primaryButton : theme.text }
        ]}>
          {required && <Text style={{ color: theme.errorColor, fontWeight: 'bold', fontSize: 16 }}>* </Text>}
          {label}
        </Text>
        {shouldShowCounter && (
          <Text style={[
            getFieldStyles(theme).fieldCharCounter,
            { color: getCharCounterColor() }
          ]}>
            {charCount}/{maxLength}
          </Text>
        )}
      </View>
      <Animated.View style={[
        getFieldStyles(theme).inputContainer, 
        { 
          borderColor: isFocused ? theme.inputBorderFocus : (required && !value ? theme.warningColor : theme.inputBorder),
          borderWidth: isFocused ? 2 : 1,
          shadowOpacity: isFocused ? 0.15 : 0.05,
          elevation: isFocused ? 4 : 2,
          minHeight: multiline ? (isFocused || value ? 90 : 56) : 56,
        }
      ]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={isFocused ? theme.primaryButton : theme.inputIcon} 
          style={getFieldStyles(theme).inputIcon} 
        />
        <TextInput
          style={[getFieldStyles(theme).textInput, { color: theme.inputText }]}
          placeholder={placeholder}
          placeholderTextColor={theme.inputPlaceholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value ? (
          <TouchableOpacity 
            onPress={() => onChangeText('')} 
            style={getFieldStyles(theme).clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.inputBorder} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </View>
  );
};

const DropdownField = ({ 
  label, value, placeholder, options, onSelect, isOpen, onToggle, icon, 
  theme, style = {}, priorityColors = false, zIndex = 1000, required = false,
  activeDropdown = null, dropdownKey = null
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const isTopMost = activeDropdown === dropdownKey;
  const effectiveZIndex = isTopMost ? 99999 : (isOpen ? zIndex + 1000 : 1);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Baja': return theme.priorityLow;      // Celeste
      case 'Media': return theme.priorityMedium;   // Verde  
      case 'Alta': return theme.priorityHigh;     // Naranja
      case 'Crítica': return theme.priorityCritical; // Rojo
      default: return theme.text;
    }
  };

  return (
    <View style={[
      style, 
      { 
        marginBottom: 20, 
        zIndex: effectiveZIndex,
        elevation: effectiveZIndex
      }
    ]}>
      <Text style={[
        getFieldStyles(theme).fieldLabel, 
        { color: required ? theme.primaryButton : theme.text }
      ]}>
        {required && <Text style={{ color: theme.errorColor, fontWeight: 'bold', fontSize: 16 }}>* </Text>}
        {label}
      </Text>
      <TouchableOpacity
        style={[
          getFieldStyles(theme).dropdownContainer, 
          { 
            borderColor: isOpen 
              ? theme.inputBorderFocus 
              : (required && !value ? theme.warningColor : theme.inputBorder),
            borderWidth: isOpen ? 2 : 1,
            shadowOpacity: isOpen ? 0.15 : 0.05,
            elevation: effectiveZIndex,
            zIndex: effectiveZIndex
          }
        ]}
        onPress={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={icon} 
          size={20} 
          color={isOpen ? theme.primaryButton : theme.inputIcon} 
          style={getFieldStyles(theme).inputIcon} 
        />
        <Text style={[
          getFieldStyles(theme).dropdownText, 
          { 
            color: value 
              ? (priorityColors ? getPriorityColor(value) : theme.inputText)
              : theme.inputPlaceholder 
          }
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={isOpen ? theme.primaryButton : theme.inputIcon}
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={[
          getFieldStyles(theme).dropdownOptions, 
          { 
            backgroundColor: theme.dropdownBackground,
            zIndex: effectiveZIndex + 1,
            elevation: effectiveZIndex + 1
          }
        ]}>
          <ScrollView 
            style={{ 
              maxHeight: Math.min(options.length * 50, 250),
              borderRadius: 16 
            }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={`${option}-${index}`}
                style={[
                  getFieldStyles(theme).dropdownOption,
                  { 
                    backgroundColor: value === option 
                      ? theme.optionSelected 
                      : 'transparent' 
                  },
                  index === options.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => {
                  console.log(`Option pressed: ${option}`);
                  onSelect(option);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  getFieldStyles(theme).dropdownOptionText,
                  { 
                    color: priorityColors ? getPriorityColor(option) : theme.text,
                    fontWeight: value === option ? '600' : '400'
                  }
                ]}>
                  {option}
                </Text>
                {value === option && (
                  <Ionicons 
                    name="checkmark" 
                    size={18} 
                    color={theme.primaryButton} 
                  />
                )}
                {priorityColors && (
                  <View style={[
                    getFieldStyles(theme).priorityIndicator, 
                    { backgroundColor: getPriorityColor(option) }
                  ]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const getFieldStyles = (theme) => StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  fieldCharCounter: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.05,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.inputText,
    paddingVertical: 0,
    lineHeight: 20,
  },
  clearButton: {
    padding: 4,
    marginTop: -2,
    opacity: 0.6,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.05,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.dropdownBackground,
    borderWidth: 1,
    borderColor: theme.dropdownBorder,
    borderTopWidth: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 999999,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.dividerColor,
    minHeight: 50,
  },
  dropdownOptionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 20,
  },
  priorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 12,
  },
});

const getResponsiveStyles = (theme, screenInfo, isDarkMode) => {
  const { width, height, isLargeScreen, isTablet, isSmallScreen } = screenInfo;
  
  const fontScale = isSmallScreen ? 0.9 : isLargeScreen ? 1.1 : 1;
  const paddingScale = isSmallScreen ? 0.8 : isLargeScreen ? 1.2 : 1;
  const spacingScale = isSmallScreen ? 0.8 : isLargeScreen ? 1.1 : 1;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    dropdownOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 5000,
      elevation: 5000,
      backgroundColor: 'transparent',
    },
    modernHeader: {
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'ios' ? 50 : 35,
      paddingBottom: 15,
      paddingHorizontal: 20 * paddingScale,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
      position: 'relative',
      zIndex: 1000, 
    },
    modernBackButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      minWidth: 40,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      marginLeft: 12,
      marginRight: 8,
    },
    logo: {
      width: 42,
      height: 42,
      borderRadius: 10,
      backgroundColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    headerTitleSection: {
      flex: 1,
      paddingLeft: 8,
      alignItems: 'flex-start',
    },
    modernHeaderTitle: {
      fontSize: 22 * fontScale,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: -0.5,
    },
    modernHeaderSubtitle: {
      fontSize: 13 * fontScale,
      color: theme.secondaryText,
      marginTop: 1,
      fontWeight: '500',
    },
    modernThemeToggle: {
      padding: 6,
      borderRadius: 10,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      minWidth: 36,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      marginTop: -4,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    scrollContent: {
      paddingHorizontal: 20 * paddingScale,
      paddingVertical: 20 * spacingScale,
      paddingBottom: 50 * spacingScale,
    },
    sectionCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      padding: 28 * paddingScale,
      marginBottom: 20 * spacingScale,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.2 : 0.08,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder || 'rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
      fontSize: 19 * fontScale,
      fontWeight: 'bold',
      color: theme.primaryButton,
      marginBottom: 24 * spacingScale,
      textAlign: 'left',
      letterSpacing: 0.3,
    },
    sectionSubtitle: {
      fontSize: 15 * fontScale,
      color: theme.secondaryText,
      marginBottom: 20,
      fontStyle: 'italic',
      lineHeight: 22,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    charCounter: {
      fontSize: 13 * fontScale,
      fontWeight: '600',
    },
    charCounterContainer: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: theme.inputBackground,
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 20 * spacingScale,
    },
    columnContainer: {
      flexDirection: 'column',
    },
    halfWidth: {
      flex: 1,
    },
    fullWidth: {
      width: '100%',
    },
    textAreaContainer: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 20 * paddingScale,
      minHeight: 180,
    },
    textArea: {
      fontSize: 16 * fontScale,
      color: theme.inputText,
      minHeight: 140,
      textAlignVertical: 'top',
      lineHeight: 24,
    },
    imageContainer: {
      alignItems: 'center',
      position: 'relative',
      marginTop: 16,
    },
    imagePreview: {
      width: Math.min(width * 0.6, 280),
      height: Math.min(width * 0.6, 280),
      borderRadius: 20,
      resizeMode: 'cover',
    },
    removeImageButton: {
      position: 'absolute',
      top: 12,
      right: width * 0.2 - 18,
      backgroundColor: theme.deleteButton,
      borderRadius: 22,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
    },
    changeImageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderWidth: 2,
      borderColor: theme.primaryButton,
      borderRadius: 28,
      gap: 8,
      backgroundColor: theme.cardBackground,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    changeImageText: {
      fontSize: 15 * fontScale,
      fontWeight: '600',
    },
    photoUploadArea: {
      borderWidth: 2,
      borderColor: theme.inputBorder,
      borderStyle: 'dashed',
      borderRadius: 20,
      padding: 48 * paddingScale,
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      marginTop: 16,
    },
    photoUploadContent: {
      alignItems: 'center',
      gap: 14 * spacingScale,
    },
    photoUploadText: {
      fontSize: 17 * fontScale,
      fontWeight: '600',
      color: theme.text,
    },
    photoUploadSubtext: {
      fontSize: 15 * fontScale,
      color: theme.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
    },
    actionButtonsContainer: {
      flexDirection: isLargeScreen ? 'row' : 'column',
      gap: 20 * spacingScale,
      marginTop: 24 * spacingScale,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 36,
      borderRadius: 20,
      gap: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      minHeight: 64,
    },
    cancelButton: {
      backgroundColor: theme.cancelButton,
      flex: isLargeScreen ? 1 : undefined,
      borderWidth: 2,
      borderColor: theme.cancelButtonBorder,
    },
    createButton: {
      backgroundColor: theme.primaryButton,
      flex: isLargeScreen ? 2 : undefined,
    },
    actionButtonText: {
      fontSize: 17 * fontScale,
      fontWeight: 'bold',
      letterSpacing: 0.3,
    },
    loadingOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      backgroundColor: theme.cardBackground,
      paddingHorizontal: 48,
      paddingVertical: 36,
      borderRadius: 24,
      alignItems: 'center',
      gap: 20,
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      minWidth: width * 0.6,
    },
    loadingText: {
      fontSize: 17 * fontScale,
      color: theme.text,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
};
