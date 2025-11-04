// src/screens/ExportacionPDFScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA', sea: '#6698CC', tangerine: '#F08C21' };
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function ExportacionPDFScreen({ route, navigation }) {
  const { paciente } = route.params;
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('ExportacionPDF');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Llamar al endpoint del backend
      const response = await fetch(`${API_URL}/api/pacientes/${paciente.id_paciente}/exportar-pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      if (Platform.OS === 'web') {
        // SOLUCIÓN WEB: Descargar directamente
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Patient_Consult_${paciente.nombre}_${paciente.apellido || ''}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        Alert.alert(
          t('alerts.successTitle'),
          'PDF descargado exitosamente'
        );
      } else {
        // SOLUCIÓN MÓVIL: FileReader + FileSystem
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          
          // Guardar el archivo temporalmente
          const filename = `Patient_Consult_${paciente.nombre}_${paciente.apellido || ''}_${new Date().toISOString().split('T')[0]}.pdf`;
          const fileUri = `${FileSystem.documentDirectory}${filename}`;
          
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert(
            t('alerts.successTitle'),
            t('alerts.successMsg'),
            [
              { 
                text: t('buttons.share'), 
                onPress: () => shareFile(fileUri) 
              },
              { 
                text: t('buttons.ok'), 
                style: 'cancel' 
              }
            ]
          );
        };
      }
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      Alert.alert(t('alerts.errorTitle'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const shareFile = async (uri) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(t('alerts.errorTitle'), t('alerts.sharingNotAvailable'));
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert(t('alerts.errorTitle'), error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }]}>{t('top.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Preview Info */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="document-text-outline" size={48} color={PALETTE.tangerine} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('preview.title')}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
            {paciente.nombre} {paciente.apellido || ''}
          </Text>
          <Text style={[styles.cardInfo, { color: theme.secondaryText }]}>
            {t('preview.description')}
          </Text>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: PALETTE.tangerine, opacity: loading ? 0.6 : 1 }]}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="download-outline" size={20} color="#fff" />
          )}
          <Text style={styles.exportBtnText}>
            {loading ? t('buttons.generating') : t('buttons.exportPDF')}
          </Text>
        </TouchableOpacity>

        {/* Info adicional */}
        <View style={[styles.infoBox, { backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={PALETTE.sea} />
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            {t('info.message')}
          </Text>
        </View>
      </ScrollView>
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
  topTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 120 },
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  cardSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  cardInfo: { fontSize: 12, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  exportBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
