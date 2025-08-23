import React, { useEffect, useRef, useState } from 'react'
import { 
  View, Image, TouchableOpacity, StyleSheet, Text, ScrollView, 
  useWindowDimensions, Animated, Platform, StatusBar, Dimensions 
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BottomNav from '../components/BottomNav'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../styles/theme'

export default function MapaDepartamentos() {
  const navigation = useNavigation()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const theme = getTheme(isDarkMode)
  const { width, height } = useWindowDimensions()
  const screenDimensions = Dimensions.get('window')
  
  const isLargeScreen = width > 768
  const isTablet = width >= 600 && width < 1024
  const isSmallScreen = width < 360

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  
  const [resumenNacional, setResumenNacional] = useState({
    alertasActivas: 0,
    totalDepartamentos: 22,
    casosCriticos: 0
  })
  const [departamentosData, setDepartamentosData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const departamentosGuatemala = [
    { id: 1, nombre: 'Guatemala', top: 145, left: 72, coordenadas: { lat: 14.6349, lng: -90.5069 } },
    { id: 2, nombre: 'Sacatepéquez', top: 150, left: 68, coordenadas: { lat: 14.5589, lng: -90.7307 } },
    { id: 3, nombre: 'Chimaltenango', top: 140, left: 64, coordenadas: { lat: 14.6569, lng: -90.8151 } },
    { id: 4, nombre: 'Escuintla', top: 162, left: 68, coordenadas: { lat: 14.3058, lng: -90.7857 } },
    { id: 5, nombre: 'Santa Rosa', top: 158, left: 76, coordenadas: { lat: 14.1561, lng: -90.2817 } },
    { id: 6, nombre: 'Sololá', top: 136, left: 60, coordenadas: { lat: 14.7719, lng: -91.1865 } },
    { id: 7, nombre: 'Totonicapán', top: 132, left: 56, coordenadas: { lat: 14.9092, lng: -91.3636 } },
    { id: 8, nombre: 'Quetzaltenango', top: 136, left: 52, coordenadas: { lat: 14.8333, lng: -91.5167 } },
    { id: 9, nombre: 'Suchitepéquez', top: 144, left: 56, coordenadas: { lat: 14.5458, lng: -91.5072 } },
    { id: 10, nombre: 'Retalhuleu', top: 149, left: 52, coordenadas: { lat: 14.5392, lng: -91.6728 } },
    { id: 11, nombre: 'San Marcos', top: 140, left: 48, coordenadas: { lat: 14.9633, lng: -91.8044 } },
    { id: 12, nombre: 'Huehuetenango', top: 104, left: 40, coordenadas: { lat: 15.3192, lng: -91.4678 } },
    { id: 13, nombre: 'Quiché', top: 112, left: 64, coordenadas: { lat: 15.0331, lng: -91.1456 } },
    { id: 14, nombre: 'Baja Verapaz', top: 120, left: 76, coordenadas: { lat: 15.0906, lng: -90.3128 } },
    { id: 15, nombre: 'Alta Verapaz', top: 96, left: 80, coordenadas: { lat: 15.4711, lng: -90.3794 } },
    { id: 16, nombre: 'Petén', top: 64, left: 96, coordenadas: { lat: 16.9267, lng: -89.8931 } },
    { id: 17, nombre: 'Izabal', top: 104, left: 120, coordenadas: { lat: 15.3444, lng: -88.5906 } },
    { id: 18, nombre: 'Zacapa', top: 124, left: 104, coordenadas: { lat: 14.9728, lng: -89.5306 } },
    { id: 19, nombre: 'Chiquimula', top: 132, left: 108, coordenadas: { lat: 14.7972, lng: -89.5458 } },
    { id: 20, nombre: 'Jalapa', top: 140, left: 88, coordenadas: { lat: 14.6319, lng: -89.9889 } },
    { id: 21, nombre: 'Jutiapa', top: 149, left: 92, coordenadas: { lat: 14.2917, lng: -89.8953 } },
    { id: 22, nombre: 'El Progreso', top: 128, left: 96, coordenadas: { lat: 14.8753, lng: -90.0647 } }
  ]

  useEffect(() => {
    setupAnimations()
    cargarDatos()
  }, [])

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
    ]).start()
  }

  const cargarDatos = async () => {
    setIsLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const baseUrl = 'http://localhost:3000'

      const [resumenResponse, departamentosResponse] = await Promise.allSettled([
        fetch(`${baseUrl}/api/alertas/resumen-nacional`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${baseUrl}/api/departamentos/estadisticas`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ])

      if (resumenResponse.status === 'fulfilled' && resumenResponse.value.ok) {
        const resumenData = await resumenResponse.value.json()
        setResumenNacional({
          alertasActivas: resumenData.alertasActivas || 0,
          totalDepartamentos: 22, //QUEMADO
          casosCriticos: resumenData.casosCriticos || 0
        })
      }

      let departamentosConDatos = departamentosGuatemala.map(dept => ({
        ...dept,
        alertas: 0,
        poblacion: '0 hab.',
        status: 'bajo'
      }))

      if (departamentosResponse.status === 'fulfilled' && departamentosResponse.value.ok) {
        const deptData = await departamentosResponse.value.json()
        
        departamentosConDatos = departamentosGuatemala.map(dept => {
          const backendData = deptData.find(d => d.nombre === dept.nombre)
          return {
            ...dept,
            alertas: backendData?.alertas || 0,
            poblacion: backendData?.poblacion || '0 hab.',
            status: backendData?.status || 'bajo'
          }
        })
      }

      setDepartamentosData(departamentosConDatos)

    } catch (error) {
      console.log('Error cargando datos:', error)
      setDepartamentosData(departamentosGuatemala.map(dept => ({
        ...dept,
        alertas: 0,
        poblacion: '0 hab.',
        status: 'bajo'
      })))
    } finally {
      setIsLoading(false)
    }
  }

  const irADepartamento = (departamento) => {
    // Animación de selección
    setSelectedDepartment(departamento.nombre)
    setTimeout(() => {
      navigation.navigate('AlertasDepartamento', { departamento: departamento.nombre })
    }, 300)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'crítico': return '#FF4757'
      case 'alto': return '#FF8C42'
      case 'medio': return '#FFA726'
      case 'bajo': return '#66BB6A'
      default: return theme.primaryButton
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'crítico': return 'Crítico'
      case 'alto': return 'Alto'
      case 'medio': return 'Medio'
      case 'bajo': return 'Bajo'
      default: return 'Normal'
    }
  }

  const styles = getResponsiveStyles(theme, { width, height, isLargeScreen, isTablet, isSmallScreen }, isDarkMode)

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      
      {/* Header moderno con logo (sin flecha de regreso) */}
      <View style={styles.modernHeader}>
        <View style={styles.headerContent}>
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
            <Text style={styles.modernHeaderTitle}>Departamentos</Text>
            <Text style={styles.modernHeaderSubtitle}>Mapa interactivo de Guatemala</Text>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Estadísticas generales */}
        <Animated.View 
          style={[
            styles.statsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.statsTitle}>
            <Ionicons name="analytics" size={20} color={theme.primaryButton} /> 
            {' '}Resumen Nacional
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {isLoading ? '...' : resumenNacional.alertasActivas}
              </Text>
              <Text style={styles.statLabel}>Alertas Activas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {resumenNacional.totalDepartamentos}
              </Text>
              <Text style={styles.statLabel}>Departamentos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {isLoading ? '...' : resumenNacional.casosCriticos}
              </Text>
              <Text style={styles.statLabel}>Casos Críticos</Text>
            </View>
          </View>
        </Animated.View>

        {/* Mapa interactivo */}
        <Animated.View 
          style={[
            styles.mapCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>
            <Ionicons name="map" size={20} color={theme.primaryButton} /> 
            {' '}Mapa Interactivo
          </Text>
          <Text style={styles.sectionSubtitle}>
            Toca cualquier departamento para ver sus alertas
          </Text>
          
          <View style={styles.mapContainer}>
            <View style={styles.mapImageContainer}>
              <Image source={require('../../assets/mapaGuatemala.png')} style={styles.mapa} />
              
              {/* Botones interactivos por departamento - posicionados absolutamente sobre el mapa */}
              {departamentosData.map((dept) => {
                const mapWidth = Math.min(width * 0.9, 380)
                const mapHeight = Math.min(mapWidth * 1.2, 450)
                
                const scaledLeft = (dept.left / 160) * mapWidth
                const scaledTop = (dept.top / 200) * mapHeight
                
                return (
                  <View
                    key={dept.id}
                    style={[
                      styles.departamento, 
                      { 
                        left: scaledLeft - 16,
                        top: scaledTop - 16,
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.departamentoButton,
                        {
                          backgroundColor: selectedDepartment === dept.nombre 
                            ? getStatusColor(dept.status) 
                            : getStatusColor(dept.status),
                          opacity: selectedDepartment === dept.nombre ? 1 : 0.85,
                          transform: selectedDepartment === dept.nombre 
                            ? [{ scale: 1.3 }] 
                            : [{ scale: 1 }]
                        }
                      ]}
                      onPress={() => irADepartamento(dept)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.alertBadge, { 
                        backgroundColor: dept.alertas > 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(200, 200, 200, 0.8)'
                      }]}>
                        <Text style={[styles.alertCount, { 
                          color: dept.alertas > 0 ? '#333' : '#666',
                          fontWeight: dept.alertas > 0 ? 'bold' : '500'
                        }]}>
                          {isLoading ? '...' : dept.alertas}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              })}
            </View>
          </View>
        </Animated.View>

        {/* Lista de departamentos */}
        <Animated.View 
          style={[
            styles.listCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>
            <Ionicons name="list" size={20} color={theme.primaryButton} /> 
            {' '}Departamentos Monitoreados
          </Text>
          
          {departamentosData.map((dept, index) => (
            <TouchableOpacity
              key={dept.id}
              style={[
                styles.departmentItem,
                { 
                  borderBottomWidth: index === departamentosData.length - 1 ? 0 : 1,
                  backgroundColor: selectedDepartment === dept.nombre 
                    ? theme.optionSelected 
                    : 'transparent'
                }
              ]}
              onPress={() => irADepartamento(dept)}
              activeOpacity={0.7}
            >
              <View style={styles.departmentInfo}>
                <View style={styles.departmentHeader}>
                  <Text style={styles.departmentName}>{dept.nombre}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dept.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(dept.status)}</Text>
                  </View>
                </View>
                <View style={styles.departmentStats}>
                  <Text style={styles.departmentDetail}>
                    <Ionicons name="people" size={14} color={theme.secondaryText} /> {dept.poblacion}
                  </Text>
                  <Text style={styles.departmentDetail}>
                    <Ionicons name="warning" size={14} color={getStatusColor(dept.status)} /> 
                    {isLoading ? ' ... alertas' : ` ${dept.alertas} alertas`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  )
}

const getResponsiveStyles = (theme, screenInfo, isDarkMode) => {
  const { width, height, isLargeScreen, isTablet, isSmallScreen } = screenInfo
  
  const fontScale = isSmallScreen ? 0.9 : isLargeScreen ? 1.1 : 1
  const paddingScale = isSmallScreen ? 0.8 : isLargeScreen ? 1.2 : 1
  const spacingScale = isSmallScreen ? 0.8 : isLargeScreen ? 1.1 : 1
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
    logoContainer: {
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
      justifyContent: 'flex-start',
    },
    scrollContent: {
      paddingHorizontal: 20 * paddingScale,
      paddingVertical: 20 * spacingScale,
      paddingBottom: 120 * spacingScale,
    },
    statsCard: {
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
    statsTitle: {
      fontSize: 19 * fontScale,
      fontWeight: 'bold',
      color: theme.primaryButton,
      marginBottom: 24 * spacingScale,
      textAlign: 'left',
      letterSpacing: 0.3,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      fontSize: 32 * fontScale,
      fontWeight: '700',
      color: theme.primaryButton,
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 14 * fontScale,
      color: theme.secondaryText,
      textAlign: 'center',
      fontWeight: '500',
    },
    mapCard: {
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
    listCard: {
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
      marginBottom: 12 * spacingScale,
      textAlign: 'left',
      letterSpacing: 0.3,
    },
    sectionSubtitle: {
      fontSize: 15 * fontScale,
      color: theme.secondaryText,
      marginBottom: 24,
      fontStyle: 'italic',
      lineHeight: 22,
    },
    mapContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.inputBackground,
      borderRadius: 20,
      padding: 16,
      marginVertical: 8,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 8,
    },
    mapImageContainer: {
      position: 'relative',
      width: Math.min(width * 0.9, 380),
      height: Math.min(Math.min(width * 0.9, 380) * 1.2, 450),
    },
    mapa: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
      borderRadius: 12,
    },
    departamento: {
      position: 'absolute',
      width: 32,
      height: 32,
      zIndex: 1000,
    },
    departamentoButton: {
      width: '100%',
      height: '100%',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    alertBadge: {
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 3,
      minWidth: 24,
      minHeight: 18,
      alignItems: 'center',
      justifyContent: 'center',
      // Sombra para el badge
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    alertCount: {
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    departmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.dividerColor,
    },
    departmentInfo: {
      flex: 1,
    },
    departmentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    departmentName: {
      fontSize: 17 * fontScale,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12 * fontScale,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    departmentStats: {
      flexDirection: 'row',
      gap: 20,
    },
    departmentDetail: {
      fontSize: 14 * fontScale,
      color: theme.secondaryText,
      fontWeight: '500',
    },
  })
}
