// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ===== EN ===== */
import enCommon from '../locales/en/common.json';
import enWelcome from '../locales/en/welcome.json';
import enHome from '../locales/en/Home.json';
import enGraficas from '../locales/en/Graficas.json';
import enPerfil from '../locales/en/Perfil.json';
import enConfiguracion from '../locales/en/Configuracion.json';
import enImportacionDatos from '../locales/en/ImportacionDatos.json';
import enSeleccionPacienteAlertas from '../locales/en/SeleccionPacienteAlertas.json';
import enLogin from '../locales/en/Login.json';
import enRegister from '../locales/en/Register.json';
import enTerms from '../locales/en/Terms.json';
import enDatosUsuario from '../locales/en/DatosUsuario.json';
import enCambiarContrasena from '../locales/en/CambiarContrasena.json';
import enPacienteForm from '../locales/en/PacienteForm.json';
import enDetallePaciente from '../locales/en/DetallePaciente.json';

/* ===== ES ===== */
import esCommon from '../locales/es/common.json';
import esWelcome from '../locales/es/welcome.json';
import esHome from '../locales/es/Home.json';
import esGraficas from '../locales/es/Graficas.json';
import esPerfil from '../locales/es/Perfil.json';
import esConfiguracion from '../locales/es/Configuracion.json';
import esImportacionDatos from '../locales/es/ImportacionDatos.json';
import esSeleccionPacienteAlertas from '../locales/es/SeleccionPacienteAlertas.json';
import esLogin from '../locales/es/Login.json';
import esRegister from '../locales/es/Register.json';
import esTerms from '../locales/es/Terms.json';
import esDatosUsuario from '../locales/es/DatosUsuario.json';
import esCambiarContrasena from '../locales/es/CambiarContrasena.json';
import esPacienteForm from '../locales/es/PacienteForm.json';
import esDetallePaciente from '../locales/es/DetallePaciente.json';

export const NAMESPACES = [
  'common',
  'Welcome',
  'Home',
  'Graficas',
  'Perfil',
  'Configuracion',
  'ImportacionDatos',
  'SeleccionPacienteAlertas',
  'Login',
  'Register',
  'Terms',
  'DatosUsuario',
  'CambiarContrasena',
  'PacienteForm',
  'DetallePaciente'
];

const resources = {
  en: {
    common: enCommon,
    Welcome: enWelcome,
    Home: enHome,
    Graficas: enGraficas,
    Perfil: enPerfil,
    Configuracion: enConfiguracion,
    ImportacionDatos: enImportacionDatos,
    SeleccionPacienteAlertas: enSeleccionPacienteAlertas,
    Login: enLogin,
    Register: enRegister,
    Terms: enTerms,
    DatosUsuario: enDatosUsuario,
    CambiarContrasena: enCambiarContrasena,
    PacienteForm: enPacienteForm,
    DetallePaciente: enDetallePaciente
  },
  es: {
    common: esCommon,
    Welcome: esWelcome,
    Home: esHome,
    Graficas: esGraficas,
    Perfil: esPerfil,
    Configuracion: esConfiguracion,
    ImportacionDatos: esImportacionDatos,
    SeleccionPacienteAlertas: esSeleccionPacienteAlertas,
    Login: esLogin,
    Register: esRegister,
    Terms: esTerms,
    DatosUsuario: esDatosUsuario,
    CambiarContrasena: esCambiarContrasena,
    PacienteForm: esPacienteForm,
    DetallePaciente: esDetallePaciente
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    ns: NAMESPACES,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
    react: { useSuspense: false },
    returnNull: false
  });

export const changeLanguage = async (lang) => {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('app_language', lang);
  } catch {}
};

export const loadInitialLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem('app_language');
    if (saved && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
  } catch {}
};

export default i18n;
