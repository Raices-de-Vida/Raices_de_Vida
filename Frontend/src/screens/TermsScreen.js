// src/screens/TermsScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#F2D88F',
  sea:       '#6698CC',
  cream:     '#FFF7DA',
};

export default function TermsScreen({ navigation }) {
  const [accepted, setAccepted] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  // Colores para “vibes”: en claro usamos la paleta; en oscuro usamos el theme
  const bg       = isDarkMode ? theme.background        : PALETTE.butter;
  const paperBg  = isDarkMode ? (theme.card || theme.inputBackground) : PALETTE.cream;
  const border   = isDarkMode ? theme.border            : '#EAD8A6';
  const titleCol = isDarkMode ? theme.text              : PALETTE.blush;
  const accent   = isDarkMode ? theme.secondaryButton   : PALETTE.sea;
  const btnPrim  = isDarkMode ? theme.primaryButton     : PALETTE.tangerine;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bg }]}>
      <ThemeToggle />

      {/* decor: blobs y un par de hojas */}
      <View style={[styles.blob, styles.blobTL, { backgroundColor: accent, opacity: 0.18 }]} />
      <View style={[styles.blob, styles.blobBR, { backgroundColor: titleCol, opacity: 0.16 }]} />
      <Leaf color={accent} rotate="-18deg" style={{ position: 'absolute', top: 110, left: 26 }} />
      <Leaf color={accent} rotate="16deg"  style={{ position: 'absolute', top: 160, left: 64 }} />
      <Leaf color={titleCol} rotate="-22deg" style={{ position: 'absolute', bottom: 70, right: 78 }} />

      {/* “paper” */}
      <View style={[styles.paper, { backgroundColor: paperBg, borderColor: border }]}>
        <Text style={[styles.title, { color: titleCol }]}>Términos y Condiciones de Uso</Text>
        <Text style={[styles.small, { color: isDarkMode ? theme.secondaryText : '#6B7280' }]}>
          Última actualización: 08 de abril de 2025
        </Text>

        <Section title="1. Aceptación de los Términos" color={accent}>
          Al registrarte o utilizar la aplicación, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no deberás usar la aplicación.
        </Section>

        <Section title="2. Definiciones" color={accent}>
          Usuario: Cualquier persona que utilice la aplicación, ya sea como ONG, líder comunitario, voluntario o visitante.{'\n'}
          Caso de desnutrición: Reporte generado por usuarios sobre una persona afectada por desnutrición.{'\n'}
          Nosotros: El equipo desarrollador de la aplicación Raíces de Vida.
        </Section>

        <Section title="3. Uso de la Aplicación" color={accent}>
          Solo se puede registrar información real, verificable y sin fines comerciales.{'\n'}
          No está permitido el uso de la app para difundir información falsa, violenta o discriminatoria.{'\n'}
          El contenido subido debe respetar la privacidad y dignidad de las personas afectadas.
        </Section>

        <Section title="4. Responsabilidad del Usuario" color={accent}>
          Los usuarios son responsables de la veracidad de los datos ingresados.{'\n'}
          El uso indebido puede llevar a la suspensión o eliminación de la cuenta.
        </Section>

        <Section title="5. Privacidad y Protección de Datos" color={accent}>
          La app almacena datos personales solo para fines de contacto y coordinación de ayuda.{'\n'}
          Los datos serán anonimizados para proteger la identidad.{'\n'}
          No se compartirá información personal sin consentimiento.
        </Section>

        <Section title="6. Notificaciones" color={accent}>
          La app puede enviar notificaciones sobre nuevos casos, campañas o ayuda.{'\n'}
          Puedes desactivarlas desde la configuración de tu dispositivo.
        </Section>

        <Section title="7. Propiedad Intelectual" color={accent}>
          Todos los contenidos de la app son propiedad del equipo desarrollador o licenciados para su uso.
        </Section>

        <Section title="8. Modificaciones" color={accent}>
          Podemos modificar estos términos en cualquier momento y notificaremos los cambios relevantes.
        </Section>

        <Section title="9. Soporte y Contacto" color={accent}>
          Para consultas o reportes técnicos, escríbenos al correo de soporte.
        </Section>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setAccepted(!accepted)}>
            <MaterialIcons
              name={accepted ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={accepted ? accent : (isDarkMode ? theme.secondaryText : '#94A3B8')}
            />
          </TouchableOpacity>
          <Text style={[styles.checkboxText, { color: isDarkMode ? theme.text : '#1F2937' }]}>
            Acepto los términos y condiciones
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: btnPrim }, !accepted && { opacity: 0.5 }]}
          disabled={!accepted}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ====== Componentes auxiliares ====== */
const Section = ({ title, color, children }) => (
  <View style={{ marginTop: 16 }}>
    <Text style={{ fontSize: 16, fontWeight: '700', color }}>{title}</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 6 }}>{children}</Text>
  </View>
);

const Leaf = ({ color, rotate = '0deg', style }) => (
  <View
    style={[
      {
        width: 26,
        height: 17,
        backgroundColor: color,
        borderTopLeftRadius: 26,
        borderBottomRightRadius: 26,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        opacity: 0.85,
        transform: [{ rotate }],
      },
      style,
    ]}
  />
);

const RADIUS = 18;

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1, alignItems: 'center' },

  // blobs de fondo
  blob: { position: 'absolute', width: 260, height: 260, borderRadius: 90 },
  blobTL: { top: -70, left: -60, transform: [{ rotate: '18deg' }] },
  blobBR: { right: -70, bottom: -60, transform: [{ rotate: '-15deg' }] },

  // tarjeta “paper”
  paper: {
    width: '100%',
    maxWidth: 720,
    borderWidth: 1,
    borderRadius: RADIUS,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  title: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  small: { fontSize: 13, textAlign: 'center', marginBottom: 10 },

  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 14 },
  checkboxText: { marginLeft: 10, fontSize: 14 },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
