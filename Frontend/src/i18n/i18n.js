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
import enAlertasDepartamento from '../locales/en/AlertasDepartamento.json';
import enDatosAyuda from '../locales/en/DatosAyuda.json';
import enEditarAlerta from '../locales/en/EditarAlerta.json';
import enImportancia from '../locales/en/Importancia.json';
import enMapaDepartamentos from '../locales/en/MapaDepartamentos.json';
import enRecomendaciones from '../locales/en/Recomendaciones.json';
import enRegisterAlerta from '../locales/en/RegisterAlerta.json';
import enRegisterCommunity from '../locales/en/RegisterCommunity.json';
import enRegistrarSignos from '../locales/en/RegistrarSignos.json';
import enSubirInfo from '../locales/en/SubirInfo.json';
import enExportacionPDF from '../locales/en/ExportacionPDF.json';
import enGestionImagenes from '../locales/en/GestionImagenes.json';

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
import esAlertasDepartamento from '../locales/es/AlertasDepartamento.json';
import esDatosAyuda from '../locales/es/DatosAyuda.json';
import esEditarAlerta from '../locales/es/EditarAlerta.json';
import esImportancia from '../locales/es/Importancia.json';
import esMapaDepartamentos from '../locales/es/MapaDepartamentos.json';
import esRecomendaciones from '../locales/es/Recomendaciones.json';
import esRegisterAlerta from '../locales/es/RegisterAlerta.json';
import esRegisterCommunity from '../locales/es/RegisterCommunity.json';
import esRegistrarSignos from '../locales/es/RegistrarSignos.json';
import esSubirInfo from '../locales/es/SubirInfo.json';
import esExportacionPDF from '../locales/es/ExportacionPDF.json';
import esGestionImagenes from '../locales/es/GestionImagenes.json';

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
  'DetallePaciente',
  // nuevos
  'AlertasDepartamento',
  'DatosAyuda',
  'EditarAlerta',
  'Importancia',
  'MapaDepartamentos',
  'Recomendaciones',
  'RegisterAlerta',
  'RegisterCommunity',
  'RegistrarSignos',
  'SubirInfo',
  'ExportacionPDF',
  'GestionImagenes'
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
    DetallePaciente: enDetallePaciente,
    AlertasDepartamento: enAlertasDepartamento,
    DatosAyuda: enDatosAyuda,
    EditarAlerta: enEditarAlerta,
    Importancia: enImportancia,
    MapaDepartamentos: enMapaDepartamentos,
    Recomendaciones: enRecomendaciones,
    RegisterAlerta: enRegisterAlerta,
    RegisterCommunity: enRegisterCommunity,
    RegistrarSignos: enRegistrarSignos,
    SubirInfo: enSubirInfo,
    ExportacionPDF: enExportacionPDF,
    GestionImagenes: enGestionImagenes
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
    DetallePaciente: esDetallePaciente,
    AlertasDepartamento: esAlertasDepartamento,
    DatosAyuda: esDatosAyuda,
    EditarAlerta: esEditarAlerta,
    Importancia: esImportancia,
    MapaDepartamentos: esMapaDepartamentos,
    Recomendaciones: esRecomendaciones,
    RegisterAlerta: esRegisterAlerta,
    RegisterCommunity: esRegisterCommunity,
    RegistrarSignos: esRegistrarSignos,
    SubirInfo: esSubirInfo,
    ExportacionPDF: esExportacionPDF,
    GestionImagenes: esGestionImagenes
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
