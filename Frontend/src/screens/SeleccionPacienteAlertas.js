import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

const PALETTE = { tangerine: '#F08C21', blush: '#E36888', butter: '#F2D88F', sea: '#6698CC', cream: '#FFF7DA' };

export default function SeleccionPacienteAlertas({ navigation, route }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('SeleccionPacienteAlertas');

  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [minEdad, setMinEdad] = useState('');
  const [maxEdad, setMaxEdad] = useState('');
  const [minIMC, setMinIMC] = useState('');
  const [maxIMC, setMaxIMC] = useState('');
  const [comunidadTxt, setComunidadTxt] = useState('');
  const [loading, setLoading] = useState(false);

  const DUMMY = React.useMemo(() => {
    const base = [
      { id_paciente: 10001, nombre:'Ana', apellido:'García', edad:5, genero:'F', comunidad_pueblo:'Comunidad Norte', imc:15.2, peso_kg:18, altura_cm:110, _flagWorst:'Media' },
      { id_paciente: 10002, nombre:'Luis', apellido:'Pérez', edad:9, genero:'M', comunidad_pueblo:'Comunidad Norte', imc:13.9, peso_kg:22, altura_cm:130, _flagWorst:'Alta' },
      { id_paciente: 10003, nombre:'María', apellido:'Lopez', edad:12, genero:'F', comunidad_pueblo:'Comunidad Sur', imc:17.5, peso_kg:38, altura_cm:150, _flagWorst:'Baja' },
      { id_paciente: 10004, nombre:'Carlos', apellido:'Ruiz', edad:2, genero:'M', comunidad_pueblo:'Comunidad Este', imc:14.1, peso_kg:11, altura_cm:88, _flagWorst:'Crítica' },
      { id_paciente: 10005, nombre:'Sofía', apellido:'Méndez', edad:7, genero:'F', comunidad_pueblo:'Comunidad Este', imc:18.9, peso_kg:26, altura_cm:120, _flagWorst:null },
      { id_paciente: 10006, nombre:'Diego', apellido:'Castro', edad:4, genero:'M', comunidad_pueblo:'Comunidad Sur', imc:16.4, peso_kg:17, altura_cm:107, _flagWorst:'Alta' },
      { id_paciente: 10007, nombre:'Lucía', apellido:'Fernández', edad:10, genero:'F', comunidad_pueblo:'Comunidad Norte', imc:19.2, peso_kg:34, altura_cm:140, _flagWorst:'Crítica' },
      { id_paciente: 10008, nombre:'Mateo', apellido:'Juárez', edad:6, genero:'M', comunidad_pueblo:'Comunidad Oeste', imc:15.9, peso_kg:20, altura_cm:116, _flagWorst:'Media' },
      { id_paciente: 10009, nombre:'Valentina', apellido:'Sosa', edad:8, genero:'F', comunidad_pueblo:'Comunidad Oeste', imc:21.1, peso_kg:32, altura_cm:128, _flagWorst:'Baja' },
      { id_paciente: 10010, nombre:'Javier', apellido:'Alonso', edad:11, genero:'M', comunidad_pueblo:'Comunidad Sur', imc:22.4, peso_kg:44, altura_cm:152, _flagWorst:'Alta' }
    ];
    return base;
  }, []);

  const filterDummy = (query='') => {
    const qLower = query.toLowerCase();
    return DUMMY.filter(p => (!query || `${p.nombre} ${p.apellido}`.toLowerCase().includes(qLower) || (p.comunidad_pueblo||'').toLowerCase().includes(qLower))
      && (!minEdad || p.edad >= Number(minEdad))
      && (!maxEdad || p.edad <= Number(maxEdad))
      && (!minIMC || p.imc >= Number(minIMC))
      && (!maxIMC || p.imc <= Number(maxIMC))
      && (!comunidadTxt || (p.comunidad_pueblo||'').toLowerCase().includes(comunidadTxt.toLowerCase())));
  };

  const fetchPacientes = async (query = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, limit: '50' });
      if (minEdad) params.append('minEdad', minEdad);
      if (maxEdad) params.append('maxEdad', maxEdad);
      if (minIMC) params.append('minIMC', minIMC);
      if (maxIMC) params.append('maxIMC', maxIMC);
      if (comunidadTxt) params.append('comunidad', comunidadTxt);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`http://localhost:3001/api/pacientes?${params.toString()}`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      if (list.length === 0) {
        setItems(filterDummy(query));
        return;
      }
      const ids = list.map(p => p.id_paciente).join(',');
      try {
        const rs = await fetch(`http://localhost:3001/api/pacientes/flags-summary?ids=${ids}`);
        const summary = await rs.json();
        const arr = Array.isArray(summary?.summaries) ? summary.summaries : [];
        const map = arr.reduce((acc, it) => { acc[String(it.id_paciente)] = it.maxPrioridad || null; return acc; }, {});
        const colored = list.map(p => ({ ...p, _flagWorst: map[String(p.id_paciente)] || null }));
        setItems(colored);
      } catch (_) {
        setItems(list);
      }
    } catch (e) {
      setItems(filterDummy(query));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPacientes(''); }, []);

  useEffect(()=>{
    if (route?.params?.refreshList) {
      fetchPacientes(q);
      navigation.setParams({ refreshList: false });
    }
  },[route?.params?.refreshList]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { fetchPacientes(q); });
    return unsubscribe;
  }, [navigation, q, minEdad, maxEdad, minIMC, maxIMC, comunidadTxt]);

  const worstLabelUI = (worst) => {
    if (!worst) return null;
    const map = {
      'Crítica': t('flags.critical'),
      'Alta': t('flags.high'),
      'Media': t('flags.medium'),
      'Baja': t('flags.low')
    };
    return map[worst] || worst;
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      <View style={styles.headerOuter}>
        {/* Title Card */}
        <View style={[styles.titleCard,{backgroundColor:isDarkMode? '#1E1E1E':PALETTE.cream, borderColor: isDarkMode? '#333':'#EAD8A6'}]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Image source={isDarkMode? require('../styles/logos/LogoDARK.png') : require('../styles/logos/LogoBRIGHT.png')} style={styles.avatar} resizeMode="contain" />
          <View style={{ flex:1 }}>
            <Text style={[styles.titleMain,{color:theme.text}]}>{t('top.title')}</Text>
            <Text style={styles.subtitle}>{t('top.subtitle')}</Text>
          </View>
        </View>

        {/* Search & Filters Card */}
        <View style={[styles.searchCard,{backgroundColor:isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
          <View style={[styles.search, { borderColor: isDarkMode? '#444':'#EAD8A6', backgroundColor: isDarkMode? '#2A2A2A':'#fff' }]}>
            <Ionicons name="search-outline" size={18} color={theme.secondaryText} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={t('search.placeholder')}
              placeholderTextColor={theme.placeholder || '#98A2B3'}
              style={{ flex: 1, paddingHorizontal: 8, color: theme.text }}
              onSubmitEditing={() => fetchPacientes(q)}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.applyBtnSm} onPress={() => fetchPacientes(q)}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.filtersRowAlt}>
            <TextInput placeholder={t('filters.minAge')} keyboardType="numeric" value={minEdad} onChangeText={setMinEdad} style={[styles.filterInput,{backgroundColor:isDarkMode?'#2A2A2A':'#fff', color:theme.text}]} placeholderTextColor={theme.placeholder || '#98A2B3'} />
            <TextInput placeholder={t('filters.maxAge')} keyboardType="numeric" value={maxEdad} onChangeText={setMaxEdad} style={[styles.filterInput,{backgroundColor:isDarkMode?'#2A2A2A':'#fff', color:theme.text}]} placeholderTextColor={theme.placeholder || '#98A2B3'} />
            <TextInput placeholder={t('filters.minBMI')} keyboardType="numeric" value={minIMC} onChangeText={setMinIMC} style={[styles.filterInput,{backgroundColor:isDarkMode?'#2A2A2A':'#fff', color:theme.text}]} placeholderTextColor={theme.placeholder || '#98A2B3'} />
            <TextInput placeholder={t('filters.maxBMI')} keyboardType="numeric" value={maxIMC} onChangeText={setMaxIMC} style={[styles.filterInput,{backgroundColor:isDarkMode?'#2A2A2A':'#fff', color:theme.text}]} placeholderTextColor={theme.placeholder || '#98A2B3'} />
            <TextInput placeholder={t('filters.community')} value={comunidadTxt} onChangeText={setComunidadTxt} style={[styles.filterInput, { flexBasis: '48%', backgroundColor:isDarkMode?'#2A2A2A':'#fff', color:theme.text }]} placeholderTextColor={theme.placeholder || '#98A2B3'} />
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: PALETTE.tangerine, flexGrow:1 }]} onPress={() => fetchPacientes(q)}>
              <Text style={{ color: '#fff', fontWeight: '800', textAlign:'center' }}>{t('filters.apply')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.clearBtn, { flexGrow:1, backgroundColor:isDarkMode?'#2A2A2A':'#fff', borderColor:isDarkMode?'#444':'#EAD8A6' }]} onPress={() => { setMinEdad(''); setMaxEdad(''); setMinIMC(''); setMaxIMC(''); setComunidadTxt(''); fetchPacientes(q); }}>
              <Text style={{ color: PALETTE.tangerine, fontWeight:'800', textAlign:'center' }}>{t('filters.clear')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:120 }}>
        {items.length === 0 ? (
          <Text style={{ textAlign:'center', color: theme.secondaryText, marginTop:20 }}>{t('empty')}</Text>
        ) : (
          items.map(item => {
            const worst = item._flagWorst;
            const bmi = item.imc;

            // BMI category (solo UI)
            let bmiKey = null; let bmiColor = '#6698CC';
            if (bmi || bmi === 0) {
              if (bmi < 18.5) { bmiKey = 'low'; bmiColor='#3B82F6'; }
              else if (bmi < 25) { bmiKey='normal'; bmiColor='#10B981'; }
              else if (bmi < 30) { bmiKey='overweight'; bmiColor='#F59E0B'; }
              else if (bmi < 35) { bmiKey='obesity1'; bmiColor='#F97316'; }
              else if (bmi < 40) { bmiKey='obesity2'; bmiColor='#DC2626'; }
              else { bmiKey='obesity3'; bmiColor='#8B0000'; }
            }
            const bmiLabel = bmiKey ? t(`bmi.categories.${bmiKey}`) : null;

            return (
              <TouchableOpacity
                key={item.id_paciente}
                style={[styles.card, { backgroundColor: theme.cardBackground || (isDarkMode ? '#1E1E1E':'#fff'), borderColor:'#EAD8A6' }]}
                onPress={() => navigation.navigate('DetallePaciente', { paciente: item })}
              >
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <View style={{ flexDirection:'row', alignItems:'center' }}>
                    <View style={[styles.dot, { backgroundColor: worst === 'Crítica' ? '#E53935' : worst === 'Alta' ? '#F08C21' : worst === 'Media' ? '#FFC107' : worst === 'Baja' ? '#4CAF50' : PALETTE.sea }]} />
                    <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                      {item.nombre} {item.apellido || ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.secondaryText} />
                </View>
                <Text style={{ color: theme.secondaryText, marginTop:4 }}>
                  {item.edad ? `${item.edad} ${t('units.years')} • ` : ''}
                  {item.comunidad_pueblo || t('placeholders.noCommunity')}
                  {worst ? ` • ${worstLabelUI(worst)}` : ''}
                </Text>

                {bmiLabel && (
                  <View style={{ marginTop:6, flexDirection:'row', alignItems:'center', gap:8 }}>
                    <View style={{ backgroundColor:bmiColor, paddingHorizontal:10, paddingVertical:4, borderRadius:14 }}>
                      <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>
                        {bmiLabel} ({t('bmi.short')} {bmi.toFixed ? bmi.toFixed(1) : bmi})
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <View style={{ height:50 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerOuter:{ paddingHorizontal:16, paddingTop:12 },
  titleCard:{ flexDirection:'row', alignItems:'center', borderWidth:1, borderRadius:18, padding:16, marginBottom:14 },
  backBtn:{ marginRight:12 },
  avatar:{ width:46, height:46, marginRight:14 },
  titleMain:{ fontSize:20, fontWeight:'800', marginBottom:2 },
  subtitle:{ fontSize:13, fontWeight:'600', color:'#2D60C8' },
  searchCard:{ borderWidth:1, borderRadius:18, padding:16 },
  search: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '800' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8, borderWidth: 1, borderColor: '#EAD8A6' },
  filtersRowAlt: { flexDirection:'row', flexWrap:'wrap', columnGap:10, rowGap:10, marginTop:14 },
  filterInput: { backgroundColor:'#fff', borderWidth:1, borderColor:'#EAD8A6', borderRadius:12, paddingHorizontal:10, paddingVertical:8, flexBasis:'30%', flexGrow:1, color:'#1B1B1B' },
  applyBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  applyBtnSm: { marginLeft: 8, backgroundColor: '#F08C21', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAD8A6' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color:'#fff', fontWeight:'800', textTransform:'capitalize' }
});
