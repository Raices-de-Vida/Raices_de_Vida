// App.js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { OfflineProvider } from './src/context/OfflineContext';

export default function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <AppNavigator />
      </OfflineProvider>
    </ThemeProvider>
  );
}