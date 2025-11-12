// FormComponents.js - Componentes reutilizables de formulario
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const stylesCx = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  underInput: { borderBottomWidth: 1, borderColor: '#B0B5BC', paddingVertical: 4, fontSize: 13, minWidth: 60 },
  underMini: { borderBottomWidth: 1, borderColor: '#B0B5BC', paddingVertical: 2, fontSize: 12, textAlign: 'center' },
  inlineWrap: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8, marginTop: 6 },
  subHeader: { fontSize: 14, fontWeight: '800', marginTop: 18, marginBottom: 8 },
  smallLabel: { fontSize: 11, fontWeight: '700' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: '#E5E7EB' },
  sectionSep: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }
});

export function UnderlineInput({ label, value, onChange, long, placeholder }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={[stylesCx.label, { marginBottom: 4, color: '#6B7280' }]}>{label}</Text> : null}
      <TextInput 
        value={value} 
        onChangeText={onChange} 
        placeholder={placeholder || label} 
        placeholderTextColor="#9CA3AF"
        style={[stylesCx.underInput, long && { width: '100%', minHeight: 34 }]} 
      />
    </View>
  );
}

export function Vital({ label, dual, value1, value2, onChange1, onChange2 }) {
  return (
    <View style={{ marginRight: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 4 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput 
          value={value1} 
          onChangeText={onChange1} 
          keyboardType='numeric' 
          style={[stylesCx.underMini, { width: 48, marginRight: dual ? 4 : 0 }]} 
        />
        {dual && (
          <>
            <Text style={{ marginHorizontal: 2 }}>/</Text>
            <TextInput 
              value={value2} 
              onChangeText={onChange2} 
              keyboardType='numeric' 
              style={[stylesCx.underMini, { width: 48 }]} 
            />
          </>
        )}
      </View>
    </View>
  );
}

export function RadioGroup({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {options.map(opt => (
        <TouchableOpacity 
          key={opt} 
          onPress={() => onChange(opt)} 
          style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}
        >
          <View style={{
            width: 16, 
            height: 16, 
            borderRadius: 8, 
            borderWidth: 2, 
            borderColor: value === opt ? '#2D60C8' : '#9CA3AF',
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            {value === opt && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2D60C8' }} />}
          </View>
          <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '700' }}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function RadioLabeled({ label, value, onChange }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[stylesCx.label, { color: '#6B7280', marginBottom: 4 }]}>{label}</Text>
      <RadioGroup options={['N', 'Y']} value={value || ''} onChange={onChange} />
    </View>
  );
}

export function Check({ label, checked, onChange }) {
  return (
    <TouchableOpacity 
      onPress={onChange} 
      style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14, marginBottom: 6 }}
    >
      <View style={{
        width: 18, 
        height: 18, 
        borderWidth: 2, 
        borderColor: checked ? '#2D60C8' : '#9CA3AF',
        backgroundColor: checked ? '#2D60C8' : 'transparent', 
        borderRadius: 4, 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        {checked && <Ionicons name='checkmark' size={12} color='#fff' />}
      </View>
      <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function HabitsBlock({ title, data, onChange, theme, t }) {
  const render = (k, label) => (
    <View key={k} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 6 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.secondaryText, marginRight: 4 }}>{label}?</Text>
      <RadioGroup 
        options={['N', 'Y']} 
        value={data[k].use ? 'Y' : 'N'} 
        onChange={v => onChange({ ...data, [k]: { ...data[k], use: v === 'Y' } })} 
      />
      {data[k].use && (
        <TextInput 
          value={data[k].count} 
          onChangeText={t => onChange({ ...data, [k]: { ...data[k], count: t } })} 
          placeholder='#' 
          placeholderTextColor={theme.secondaryText} 
          style={[stylesCx.underMini, { width: 48, marginLeft: 4, color: theme.text }]} 
        />
      )}
    </View>
  );

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={[stylesCx.subHeader, { color: theme.text }]}>{title} {t('c1.hab.titleSuffix')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {render('tobacco', t('c1.hab.tobacco'))}
        {render('alcohol', t('c1.hab.alcohol'))}
        {render('drugs', t('c1.hab.drugs'))}
      </View>
    </View>
  );
}

export function Multiline({ label, value, onChange, theme, placeholder }) {
  return (
    <View style={{ marginTop: 16 }}>
      {label ? <Text style={[stylesCx.label, { color: theme.secondaryText, marginBottom: 4 }]}>{label}</Text> : null}
      <TextInput 
        value={value} 
        onChangeText={onChange} 
        placeholder={placeholder || label} 
        placeholderTextColor={theme.secondaryText}
        multiline 
        style={{
          minHeight: 90, 
          borderWidth: 1, 
          borderColor: '#E5E7EB', 
          borderRadius: 12, 
          padding: 10, 
          fontSize: 13, 
          color: theme.text, 
          textAlignVertical: 'top'
        }} 
      />
    </View>
  );
}

export function Row({ children }) {
  return <View style={{ flexDirection: 'row', columnGap: 16, flexWrap: 'wrap' }}>{children}</View>;
}

export function Col({ children, flex }) {
  return <View style={{ flex: flex || 1 }}>{children}</View>;
}
