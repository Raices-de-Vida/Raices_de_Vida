import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TermsScreen({ navigation }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Términos y Condiciones de Uso</Text>
      <Text style={styles.text}>Última actualización: 08 de abril de 2025</Text>

      <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
      <Text style={styles.text}>
        Al registrarte o utilizar la aplicación, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no deberás usar la aplicación.
      </Text>

      <Text style={styles.sectionTitle}>2. Definiciones</Text>
      <Text style={styles.text}>
        Usuario: Cualquier persona que utilice la aplicación, ya sea como ONG, líder comunitario, voluntario o visitante.{"\n"}
        Caso de desnutrición: Reporte generado por usuarios sobre una persona afectada por desnutrición.{"\n"}
        Nosotros: El equipo desarrollador de la aplicación Raíces de Vida.
      </Text>

      <Text style={styles.sectionTitle}>3. Uso de la Aplicación</Text>
      <Text style={styles.text}>
        Solo se puede registrar información real, verificable y sin fines comerciales.{"\n"}
        No está permitido el uso de la app para difundir información falsa, violenta o discriminatoria.{"\n"}
        El contenido subido debe respetar la privacidad y dignidad de las personas afectadas.
      </Text>

      <Text style={styles.sectionTitle}>4. Responsabilidad del Usuario</Text>
      <Text style={styles.text}>
        Los usuarios son responsables de la veracidad de los datos ingresados.{"\n"}
        El uso indebido puede llevar a la suspensión o eliminación de la cuenta.
      </Text>

      <Text style={styles.sectionTitle}>5. Privacidad y Protección de Datos</Text>
      <Text style={styles.text}>
        La app almacena datos personales solo para fines de contacto y coordinación de ayuda.{"\n"}
        Los datos serán anonimizados para proteger la identidad.{"\n"}
        No se compartirá información personal sin consentimiento.
      </Text>

      <Text style={styles.sectionTitle}>6. Notificaciones</Text>
      <Text style={styles.text}>
        La app puede enviar notificaciones sobre nuevos casos, campañas o ayuda.{"\n"}
        Puedes desactivarlas desde la configuración de tu dispositivo.
      </Text>

      <Text style={styles.sectionTitle}>7. Propiedad Intelectual</Text>
      <Text style={styles.text}>
        Todos los contenidos de la app son propiedad del equipo desarrollador o licenciados para su uso.
      </Text>

      <Text style={styles.sectionTitle}>8. Modificaciones</Text>
      <Text style={styles.text}>
        Podemos modificar estos términos en cualquier momento y notificaremos los cambios relevantes.
      </Text>

      <Text style={styles.sectionTitle}>9. Soporte y Contacto</Text>
      <Text style={styles.text}>
        Para consultas o reportes técnicos, escríbenos al correo de soporte.
      </Text>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setAccepted(!accepted)}>
          <MaterialIcons
            name={accepted ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={accepted ? '#2E7D32' : '#999'}
          />
        </TouchableOpacity>
        <Text style={styles.checkboxText}>Acepto los términos y condiciones</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !accepted && { opacity: 0.5 }]}
        disabled={!accepted}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B1F3B',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
    color: '#2E7D32',
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#F4A261',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
