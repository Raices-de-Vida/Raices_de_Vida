export const lightTheme = {
    background: '#FFFFFF',
    text: '#1B1F3B',
    secondaryText: '#4A4A4A',
    
    card: '#F8F8F8',
    header: '#FFE7A0',
    inputBackground: '#D9F5B7',
    inputBorder: '#2E7D32',
    primaryButton: '#F4A261',
    secondaryButton: '#2E7D32',
    borderColor: '#ccc',
    switchActive: '#F3B27A',
    switchInactive: '#f0f0f0',
    addButton: '#E8A074',
    deleteButton: '#FF6B6B',
    
    pendingStatus: '#FF6B6B',
    attendedStatus: '#4CAF50',
    derivedStatus: '#FF9800',

    toastSuccess: '#4CAF50',
    toastError: '#F44336',
    toastInfo: '#2196F3',
    toastText: 'white',
  };
  
  export const darkTheme = {
    background: '#121212',
    text: '#E1E1E1',
    secondaryText: '#AAAAAA',
    
    card: '#1E1E1E',
    header: '#3D3A1F',
    inputBackground: '#2A3B20',
    inputBorder: '#4CAF50',
    primaryButton: '#D48A54',
    secondaryButton: '#388E3C',
    borderColor: '#333',
    switchActive: '#D48A54',
    switchInactive: '#333333',
    addButton: '#D48A54',
    deleteButton: '#D32F2F',
    
    pendingStatus: '#D32F2F',
    attendedStatus: '#388E3C',
    derivedStatus: '#F57C00',

    toastSuccess: '#388E3C',
    toastError: '#D32F2F',
    toastInfo: '#1976D2',
    toastText: 'white',
  };
  
  export const getTheme = (isDarkMode) => {
    return isDarkMode ? darkTheme : lightTheme;
  };