// src/screens/SubirInfografiaScreen.js (actualizado para i18n)
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

const PALETTE = {
  butter: '#F2D88F',
  cream: '#FFF7DA',
  sea: '#6698CC',
  blush: '#E36888',
  green: '#2E7D32',
  greenBg: '#E6F6EA',
  orange: '#F08C21',
};

export default function SubirInfografiaScreen({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation();

  const [form, setForm] = useState({
    autor: '',
    fecha: new Date(),
    showFecha: false,
    organizacion: '',
    tema: '',
    bibliografia: '',
    imagen: null,
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const clearField = (field) => setForm(prev => ({ ...prev, [field]: '' }));
  const handleBack = () => navigation.goBack();

  const handleAgregarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert(t('upload.needPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange('imagen', result.assets[0].uri);
    }
  };

  const handleSubir = () => {
    alert(t('upload.success'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      {/* ===== Header ===== */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream,
            borderColor: theme.border || '#EADFBF',
          },
        ]}
      >
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Image
            source={isDarkMode
              ? require('../styles/logos/LogoDARK.png')
              : require('../styles/logos/LogoBRIGHT.png')}
            style={styles.logo}
          />
          <View>
            <Text style={[styles.topTitle, { color: theme.text }]}>
              {t('screens.infographics.title')}
            </Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : PALETTE.sea }]}>
              {t('screens.infographics.subtitle')}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ===== Contenido ===== */}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Imagen de portada */}
        <TouchableOpacity
          style={[
            styles.uploadArea,
            { borderColor: theme.inputBorder, backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
          ]}
          onPress={handleAgregarFoto}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('upload.addPhoto')}
        >
          {form.imagen ? (
            <Image source={{ uri: form.imagen }} style={styles.imagePreview} />
          ) : (
            <>
              <View style={[styles.badge, { backgroundColor: isDarkMode ? '#243126' : PALETTE.greenBg }]}>
                <MaterialCommunityIcons name="camera-plus" size={26} color={PALETTE.green} />
              </View>
              <Text style={[styles.uploadTitle, { color: theme.text }]}>{t('upload.addPhoto')}</Text>
              <Text style={[styles.uploadHint, { color: theme.secondaryText }]}>
                {t('upload.tapToSelect')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Autor */}
        <Field
          label={t('fields.author')}
          value={form.autor}
          onChangeText={(tval) => handleChange('autor', tval)}
          onClear={() => clearField('autor')}
          placeholder={t('placeholders.authorExample')}
          theme={theme}
        />

        {/* Fecha */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: theme.text }]}>{t('fields.date')}</Text>
          <TouchableOpacity
            style={[styles.inputBox, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
            onPress={() => handleChange('showFecha', true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.inputIcon} style={{ marginRight: 10 }} />
            <Text style={[styles.valueText, { color: theme.inputText }]}>{form.fecha.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {form.showFecha && (
            <DateTimePicker
              value={form.fecha}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                handleChange('showFecha', false);
                if (selectedDate) handleChange('fecha', selectedDate);
              }}
            />
          )}
        </View>

        {/* Organización */}
        <PickerField
          label={t('fields.organization')}
          value={form.organizacion}
          onValueChange={(v) => handleChange('organizacion', v)}
          items={[
            { label: t('orgs.yoop'), value: 'Yoop' },
            { label: t('orgs.un'), value: 'ONU' },
            { label: t('orgs.volunteer'), value: 'Voluntario' }
          ]}
          placeholder={t('placeholders.pickOrganization')}
          theme={theme}
        />

        {/* Tema */}
        <PickerField
          label={t('fields.topic')}
          value={form.tema}
          onValueChange={(v) => handleChange('tema', v)}
          items={[
            { label: t('topics.nutrition'), value: 'Nutrición' },
            { label: t('topics.hygiene'), value: 'Higiene' },
            { label: t('topics.other'), value: 'Otros' }
          ]}
          placeholder={t('placeholders.pickTopic')}
          theme={theme}
        />

        {/* Bibliografía */}
        <Field
          label={t('fields.bibliography')}
          value={form.bibliografia}
          onChangeText={(tval) => handleChange('bibliografia', tval)}
          onClear={() => clearField('bibliografia')}
          placeholder={t('placeholders.references')}
          multiline
          theme={theme}
        />

        {/* Botón enviar */}
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: PALETTE.orange }]} onPress={handleSubir}>
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.primaryText}>{t('buttons.submit')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

/* --------- Subcomponentes --------- */
function Field({ label, value, onChangeText, onClear, placeholder, multiline = false, theme }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.inputBox, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
        <TextInput
          style={[
            styles.input,
            { color: theme.inputText },
            multiline && { height: 96, textAlignVertical: 'top', paddingTop: 10 },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.inputPlaceholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
        />
        {!!value && (
          <TouchableOpacity onPress={onClear} accessibilityLabel="Clear">
            <Ionicons name="close-circle" size={18} color={theme.inputBorder} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function PickerField({ label, value, onValueChange, items, placeholder, theme }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.inputBox, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
        <RNPickerSelect
          value={value}
          onValueChange={onValueChange}
          placeholder={{ label: placeholder, value: '' }}
          items={items}
          useNativeAndroidPickerStyle={false}
          style={{
            inputIOS: styles.pickerText(theme),
            inputAndroid: styles.pickerText(theme),
            placeholder: { color: theme.inputPlaceholder },
          }}
        />
      </View>
    </View>
  );
}

/* --------- Estilos --------- */
const styles = StyleSheet.create({
  /* Header */
  topBar: {
    height: 72,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10 },
  logo: { width: 34, height: 34, marginRight: 10, resizeMode: 'contain' },
  topTitle: { fontSize: 20, fontWeight: '800' },
  topSubtitle: { fontSize: 12, fontWeight: '600' },
  themeToggle: { padding: 6, borderRadius: 10 },

  /* Contenido */
  content: { padding: 20, paddingBottom: 120 },
  fieldWrap: { marginBottom: 16 },
  label: { fontWeight: '700', fontSize: 14, marginBottom: 8 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 15 },
  valueText: { fontSize: 15 },
  pickerText: (theme) => ({
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: theme.inputText,
  }),

  /* Imagen */
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  badge: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  uploadTitle: { fontWeight: '800', fontSize: 16 },
  uploadHint: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },

  /* Botón */
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primaryText: { fontWeight: '700', fontSize: 16, color: '#fff', marginLeft: 8 },
});
