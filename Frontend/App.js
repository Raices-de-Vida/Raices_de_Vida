// App.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { OfflineProvider } from './src/context/OfflineContext';

// Inicializa i18n y helpers para cargar el idioma persistido
import './src/i18n/i18n';
import { loadInitialLanguage } from './src/i18n/i18n';

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      await loadInitialLanguage(); // lee AsyncStorage: 'app_language'
      setBooting(false);
    })();
  }, []);

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <OfflineProvider>
        <AppNavigator />
      </OfflineProvider>
    </ThemeProvider>
  );
}
