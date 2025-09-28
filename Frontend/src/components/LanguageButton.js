import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n/i18n';

export default function LanguageButton({ force = 'en', style, label }) {
  const { i18n, t } = useTranslation('common');

  const onPress = async () => {
    // Si quieres forzar inglés siempre:
    if (force) return changeLanguage(force);
    // O toggle es/en:
    await changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text>{label || t('changeLanguage')}</Text>
    </TouchableOpacity>
  );
}
