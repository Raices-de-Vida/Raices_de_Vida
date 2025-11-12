import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA', sea: '#6698CC', tangerine: '#F08C21', red: '#E53935' };
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_IMAGES = 5;

export default function GestionImagenesScreen({ route, navigation }) {
  const { paciente } = route.params;
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('GestionImagenes');

  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    cargarImagenes();
  }, []);

  const cargarImagenes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pacientes/${paciente.id_paciente}/imagenes`);
      if (response.ok) {
        const data = await response.json();
        setImagenes(data);
      }
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarImagen = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('alerts.permissionTitle'), t('alerts.permissionMsg'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setSelectedImage(result.assets[0].base64);
      setModalVisible(true);
    }
  };

  const guardarImagen = async () => {
    if (!titulo.trim()) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.titleRequired'));
      return;
    }

    if (titulo.length > 100) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.titleTooLong'));
      return;
    }

    if (descripcion.length > 200) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.descriptionTooLong'));
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/api/pacientes/${paciente.id_paciente}/imagenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          imagen_base64: selectedImage,
          mime_type: 'image/jpeg'
        })
      });

      if (response.ok) {
        Alert.alert(t('alerts.successTitle'), t('alerts.uploadSuccess'));
        setModalVisible(false);
        resetForm();
        cargarImagenes();
      } else {
        const errorData = await response.json();
        Alert.alert(t('alerts.errorTitle'), errorData.error || t('alerts.uploadError'));
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert(t('alerts.errorTitle'), t('alerts.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const eliminarImagen = (imagen) => {
    console.log('[DEBUG 1/5] Función eliminarImagen llamada con ID:', imagen.id_imagen);
    console.log('[DEBUG 2/5] Mostrando confirmación de eliminación');
    
    // Usar confirm nativo en web, Alert en móvil
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`${t('alerts.deleteTitle')}\n\n${t('alerts.deleteMsg')}`);
      if (!confirmar) {
        console.log('[DEBUG] Usuario canceló la eliminación');
        return;
      }
      console.log('[DEBUG 3/5] Usuario confirmó eliminación (web), iniciando proceso...');
      ejecutarEliminacion(imagen);
    } else {
      Alert.alert(
        t('alerts.deleteTitle'),
        t('alerts.deleteMsg'),
        [
          { 
            text: t('buttons.cancel'), 
            style: 'cancel',
            onPress: () => console.log('[DEBUG] Usuario canceló la eliminación')
          },
          {
            text: t('buttons.delete'),
            style: 'destructive',
            onPress: () => {
              console.log('[DEBUG 3/5] Usuario confirmó eliminación (móvil), iniciando proceso...');
              ejecutarEliminacion(imagen);
            }
          }
        ]
      );
    }
  };

  const ejecutarEliminacion = async (imagen) => {
    try {
      console.log('[DEBUG 4/5] Enviando DELETE a:', `${API_URL}/api/imagenes/${imagen.id_imagen}`);
      const response = await fetch(`${API_URL}/api/imagenes/${imagen.id_imagen}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('[DEBUG 5/5] Response recibida - status:', response.status, 'ok:', response.ok);
      
      if (response.ok) {
        console.log('[DEBUG ✅] Imagen eliminada exitosamente, recargando lista...');
        if (Platform.OS === 'web') {
          alert(`${t('alerts.successTitle')}: ${t('alerts.deleteSuccess')}`);
        } else {
          Alert.alert(t('alerts.successTitle'), t('alerts.deleteSuccess'));
        }
        await cargarImagenes();
      } else {
        const errorText = await response.text();
        console.error('[DEBUG ❌] Error en response:', errorText);
        if (Platform.OS === 'web') {
          alert(`${t('alerts.errorTitle')}: ${t('alerts.deleteError')}\n\nError ${response.status}: ${errorText}`);
        } else {
          Alert.alert(t('alerts.errorTitle'), `${t('alerts.deleteError')}\n\nError ${response.status}`);
        }
      }
    } catch (error) {
      console.error('[DEBUG ❌] Exception capturada:', error.message, error.stack);
      if (Platform.OS === 'web') {
        alert(`${t('alerts.errorTitle')}: Error de conexión\n\n${error.message}`);
      } else {
        Alert.alert(t('alerts.errorTitle'), `Error de conexión: ${error.message}`);
      }
    }
  };

  const verImagen = (imagen) => {
    setViewingImage(imagen);
    setViewModalVisible(true);
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setSelectedImage(null);
    setImageUri('');
  };

  const canUpload = imagenes.length < MAX_IMAGES;

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      <View style={[styles.topBar, { backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.topTitle, { color: theme.text }]}>{t('top.title')}</Text>
          <Text style={[styles.topSubtitle, { color: theme.secondaryText }]}>
            {`${paciente.nombre}${paciente.apellido ? ' ' + paciente.apellido : ''}`}
          </Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{`${imagenes.length}/${MAX_IMAGES}`}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PALETTE.sea} />
            <Text style={[styles.loadingText, { color: theme.secondaryText }]}>{t('loading')}</Text>
          </View>
        ) : (
          <>
            {canUpload && (
              <TouchableOpacity
                style={[styles.uploadBtn, { backgroundColor: PALETTE.tangerine }]}
                onPress={seleccionarImagen}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>{t('buttons.upload')}</Text>
              </TouchableOpacity>
            )}

            {!canUpload && (
              <View style={[styles.infoBox, { backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream, borderColor: theme.border }]}>
                <Ionicons name="information-circle-outline" size={20} color={PALETTE.tangerine} />
                <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                  {t('info.limitReached')}
                </Text>
              </View>
            )}

            {imagenes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={64} color={theme.secondaryText} />
                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                  {t('empty.message')}
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {imagenes.map((imagen) => (
                  <View
                    key={imagen.id_imagen}
                    style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  >
                    <TouchableOpacity onPress={() => verImagen(imagen)} activeOpacity={0.8}>
                      <Image
                        source={{ uri: `data:${imagen.mime_type};base64,${imagen.imagen_base64}` }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                        {imagen.titulo}
                      </Text>
                      {imagen.descripcion && (
                        <Text style={[styles.cardDescription, { color: theme.secondaryText }]} numberOfLines={2}>
                          {imagen.descripcion}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          onPress={() => eliminarImagen(imagen)}
                          style={[styles.deleteBtn, { backgroundColor: PALETTE.red }]}
                        >
                          <Ionicons name="trash-outline" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('modal.title')}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}

            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: isDarkMode ? theme.inputBackground : '#fff', borderColor: theme.border }]}
              placeholder={t('modal.titlePlaceholder')}
              placeholderTextColor={theme.secondaryText}
              value={titulo}
              onChangeText={setTitulo}
              maxLength={100}
            />
            <Text style={[styles.charCount, { color: theme.secondaryText }]}>
              {titulo.length}/100
            </Text>

            <TextInput
              style={[styles.textArea, { color: theme.text, backgroundColor: isDarkMode ? theme.inputBackground : '#fff', borderColor: theme.border }]}
              placeholder={t('modal.descriptionPlaceholder')}
              placeholderTextColor={theme.secondaryText}
              value={descripcion}
              onChangeText={setDescripcion}
              maxLength={200}
              multiline
              numberOfLines={4}
            />
            <Text style={[styles.charCount, { color: theme.secondaryText }]}>
              {descripcion.length}/200
            </Text>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: PALETTE.sea, opacity: uploading ? 0.6 : 1 }]}
              onPress={guardarImagen}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>{t('buttons.save')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={viewModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.viewModalOverlay}>
          <TouchableOpacity
            style={styles.viewModalClose}
            onPress={() => setViewModalVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          {viewingImage && (
            <View style={styles.viewModalContent}>
              <Image
                source={{ uri: `data:${viewingImage.mime_type};base64,${viewingImage.imagen_base64}` }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <View style={styles.imageInfo}>
                <Text style={styles.imageTitle}>{viewingImage.titulo}</Text>
                {viewingImage.descripcion && (
                  <Text style={styles.imageDescription}>{viewingImage.descripcion}</Text>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 72,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  backBtn: { marginRight: 12 },
  topTitle: { fontSize: 18, fontWeight: '800' },
  topSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  counterBadge: {
    backgroundColor: PALETTE.sea,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  content: { padding: 16, paddingBottom: 100 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, marginLeft: 12 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  thumbnail: { width: '100%', height: 140, backgroundColor: '#E5E7EB' },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardDescription: { fontSize: 12, lineHeight: 16, marginBottom: 8 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#E5E7EB',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 4,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 4,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, textAlign: 'right', marginBottom: 12 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  viewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  viewModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '70%',
  },
  imageInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
  },
  imageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  imageDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});
