
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput, Alert } from 'react-native';
import OfflineStorage from '../services/OfflineStorage';
import ConnectivityService from '../services/ConnectivityService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetallePacienteScreen({ route, navigation }) {
  const { paciente } = route.params || {};
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('DetallePaciente');

  const [tab, setTab] = useState('resumen');
  const [open, setOpen] = useState({ ident:true, clin:true, repro:false, hab:false, ale:false, obs:false });
  const [editMode, setEditMode] = useState(false);
  const [localPeso, setLocalPeso] = useState(paciente.peso_kg?.toString()||'');
  const [localAltura, setLocalAltura] = useState(paciente.altura_cm?.toString()||'');
  const [localSeverity, setLocalSeverity] = useState(paciente._flagWorst || '');
  const [calcIMC, setCalcIMC] = useState(null);

  // --- helpers de traducción ---
  const severityMap = { 'Baja':'low','Media':'medium','Alta':'high','Crítica':'critical' };
  const tSeverity = (s) => s ? t(`severity.${severityMap[s] ?? 'unknown'}`) : '—';

  const bmiCategory = (bmiNum) => {
    if (bmiNum < 18.5) return { key: 'underweight', color: '#3B82F6' };
    if (bmiNum < 25)   return { key: 'normal',      color: '#10B981' };
    if (bmiNum < 30)   return { key: 'overweight',  color: '#F59E0B' };
    if (bmiNum < 35)   return { key: 'obesity1',    color: '#F97316' };
    if (bmiNum < 40)   return { key: 'obesity2',    color: '#DC2626' };
    return { key: 'obesity3', color: '#8B0000' };
  };

  const simulatedConsult1 = {
    date: '2025-09-25',
    patientName: `${paciente.nombre||''} ${paciente.apellido||''}`.trim(),
    town: paciente.comunidad_pueblo||t('placeholders.townDemo'),
    consultType: { diabetes:true, htn:false, respiratory:true, other:false, otherText:'' },
    chiefComplaint: t('seed.c1.chiefComplaint'),
    language: paciente.idioma || t('placeholders.langEs'),
    phone: paciente.telefono||'—',
    dobOrAge: paciente.edad? `${paciente.edad} ${t('units.years')}`:`12 ${t('units.years')}`,
    gender: paciente.genero||'F',
    vitals:{ bpSys:'110', bpDia:'70', hr:'82', spo2:'98', bs:'92', weight: localPeso||'28', height: localAltura||'128', temp:'37.1' },
    takenMed1:'N', fasting:'Y', takenMed2:'N',
    allergies:{ nka:false, list:t('seed.c1.allergy') }, vitaminPkts:'1', albendazoleTabs:'1',
    current:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    past:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    lmp:{ d:'05', m:'09', y:'2025' }, menopause:false,
    obstetric:{ G:'2', P:'1', Mc:'1', Ab:'0' }, birthControl:{ control:'N', method:'' },
    historyPresentIllness: t('seed.c1.hpi'),
    medicalDx: t('seed.c1.medDx'),
    surgery: t('seed.c1.surgery'),
    meds: t('seed.c1.meds'),
    physicalExam:{ heart:t('seed.c1.pe.heart'), lungs:t('seed.c1.pe.lungs'), abdomen:t('seed.c1.pe.abd'), gyn:t('seed.c1.pe.gyn') },
    impression:t('seed.c1.impression'),
    plan:t('seed.c1.plan'),
    further:{ genSurg:true, gyn:false, other:false, otherText:'' },
    provider:t('seed.c1.provider'), interpreter:'—'
  };
  const simulatedConsult2 = {
    date:'2025-09-25',
    historyPresentIllness:t('seed.c2.hpi'),
    physicalExam:t('seed.c2.pe'),
    impression:t('seed.c2.impression'),
    plan:t('seed.c2.plan'),
    medsRx:t('seed.c2.medsrx'),
    further:{ genSurg:true, gyn:false, other:true, otherText:t('seed.c2.otherRef') },
    surgeon:t('seed.c2.surgeon'),
    interpreter:'—'
  };

  const [consult1, setConsult1] = useState({
    date: '', patientName: `${paciente.nombre||''} ${paciente.apellido||''}`.trim(), town: paciente.comunidad_pueblo||'',
    consultType: { diabetes:false, htn:false, respiratory:false, other:false, otherText:'' },
    chiefComplaint:'', language: paciente.idioma || '', phone: paciente.telefono||'', dobOrAge: paciente.edad? `${paciente.edad} ${t('units.years')}`:'', gender: paciente.genero||'F',
    vitals:{ bpSys:'', bpDia:'', hr:'', spo2:'', bs:'', weight: localPeso||'', height: localAltura||'', temp:'' },
    takenMed1:null, fasting:null, takenMed2:null,
    allergies:{ nka:false, list:'' }, vitaminPkts:'', albendazoleTabs:'',
    current:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    past:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    lmp:{ d:'', m:'', y:'' }, menopause:false,
    obstetric:{ G:'', P:'', Mc:'', Ab:'' }, birthControl:{ control:null, method:'' },
    historyPresentIllness:'', medicalDx:'', surgery:'', meds:'',
    physicalExam:{ heart:'', lungs:'', abdomen:'', gyn:'' },
    impression:'', plan:'', further:{ genSurg:false, gyn:false, other:false, otherText:'' }, provider:'', interpreter:''
  });
  const [consult2, setConsult2] = useState({
    date:'', historyPresentIllness:'', physicalExam:'', impression:'', plan:'', medsRx:'', further:{ genSurg:false, gyn:false, other:false, otherText:'' }, surgeon:'', interpreter:''
  });

  const isSimulated1 = !consult1.date && !consult1.chiefComplaint;
  const isSimulated2 = !consult2.date && !consult2.historyPresentIllness;

  useEffect(()=>{
    if (isSimulated1) setConsult1(c=>({ ...c, ...simulatedConsult1 }));
    if (isSimulated2) setConsult2(c=>({ ...c, ...simulatedConsult2 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    const peso = parseFloat(String(localPeso).replace(',','.'));
    const alt = parseFloat(String(localAltura).replace(',','.'));
    if (peso>0 && alt>0) {
      const imc = peso / Math.pow(alt/100,2);
      setCalcIMC(imc.toFixed(2));
    } else {
      setCalcIMC(null);
    }
  },[localPeso, localAltura]);

  const toggle = key => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setOpen(o=>({...o,[key]:!o[key]})); };

  const worst = localSeverity || paciente?._flagWorst;
  const manualBadge = worst && paciente?.alertasMedicas?.some?.(a => /Override manual/i.test(a?.descripcion_medica||''));
  const severityColor = worst === 'Crítica' ? '#E53935' : worst === 'Alta' ? '#F08C21' : worst === 'Media' ? '#FFC107' : worst === 'Baja' ? '#4CAF50' : '#6698CC';

  const bmiVal = calcIMC || paciente.imc;
  let bmiCatKey = null; let bmiColor = '#6698CC';
  if (bmiVal) {
    const n = parseFloat(bmiVal);
    const { key, color } = bmiCategory(n);
    bmiCatKey = key; bmiColor = color;
  }

  const saveChanges = async () => {
    const payload = { id_paciente: paciente.id_paciente, peso_kg: localPeso? Number(localPeso): null, altura_cm: localAltura? Number(localAltura): null, manualSeverity: localSeverity||null };
    try {
      const online = await ConnectivityService.getConnectionStatus();
      if (!online) throw new Error('offline');
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}/update-basic`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      if (!res.ok) throw new Error('fail');
      Alert.alert(t('alerts.saved.title'), t('alerts.saved.updated'));
      setEditMode(false);
    } catch (e) {
      await OfflineStorage.savePendingPatientUpdate(payload);
      Alert.alert(t('alerts.offline.title'), t('alerts.offline.queued'));
      setEditMode(false);
    }
  };

  if (!paciente) {
    return <View style={[styles.center,{backgroundColor:theme.background}]}><Text style={{color:theme.text}}>{t('errors.notFound')}</Text></View>;
  }

  const section = (title, key, rows) => {
    const isOpen = open[key];
    return (
      <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
        <TouchableOpacity onPress={()=>toggle(key)} style={styles.sectionHeader} activeOpacity={0.8}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons name={isOpen? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
        </TouchableOpacity>
        {isOpen && rows.map(r => (
          <View key={r.label} style={styles.row}>
            <Text style={[styles.label,{color:theme.secondaryText}]}>{r.label}</Text>
            <Text style={[styles.value,{color:theme.text}]} numberOfLines={4}>{r.value??'—'}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{flex:1, backgroundColor: theme.background}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={{marginRight:12}}><Ionicons name="arrow-back" size={22} color={theme.text} /></TouchableOpacity>
        <View style={{flex:1}}>
          <Text style={[styles.title,{color:theme.text}]} numberOfLines={1}>{`${paciente.nombre||''} ${paciente.apellido||''}`.trim()}</Text>
          <Text style={[styles.subtitle,{color:theme.secondaryText}]}>{t('top.subtitle')}</Text>
        </View>
        <View style={{alignItems:'flex-end'}}>
          <TouchableOpacity onPress={()=>setEditMode(m=>!m)} style={[styles.severityChip,{backgroundColor:severityColor, flexDirection:'row', alignItems:'center'}]}>
            <Text style={styles.severityTxt}>{tSeverity(worst) || '—'}</Text>
            <Ionicons name={editMode? 'close':'create-outline'} size={14} color='#fff' style={{marginLeft:6}} />
          </TouchableOpacity>
          {manualBadge && <Text style={{ marginTop:4, fontSize:10, fontWeight:'700', color:'#F08C21' }}>{t('badges.manual')}</Text>}
        </View>
      </View>

      {editMode && (
        <View style={styles.severityEditBar}>
          {['Baja','Media','Alta','Crítica'].map(sv => (
            <TouchableOpacity key={sv} onPress={()=>setLocalSeverity(sv)} style={[styles.sevOpt, localSeverity===sv && styles.sevOptActive]}>
              <Text style={[styles.sevOptTxt, localSeverity===sv && styles.sevOptTxtActive]}>{tSeverity(sv)}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={saveChanges} style={styles.saveBtn}><Text style={styles.saveBtnTxt}>{t('buttons.save')}</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.tabsRow}>
        {[
          {k:'resumen',lbl:t('tabs.summary')},
          {k:'clinico',lbl:t('tabs.clinical')},
          {k:'pagina1',lbl:t('tabs.consult1')},
          {k:'pagina2',lbl:t('tabs.consult2')}
        ].map(ti => (
          <TouchableOpacity key={ti.k} onPress={()=>setTab(ti.k)} style={[styles.tabBtn, tab===ti.k && styles.tabBtnActive]}>
            <Text style={[styles.tabTxt, tab===ti.k && styles.tabTxtActive]}>{ti.lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{padding:16, paddingBottom:90}}>
        {tab==='resumen' && (
          <>
            {section(t('sections.ident'), 'ident', [
              {label:t('fields.name'), value:`${paciente.nombre||''} ${paciente.apellido||''}`.trim()},
              {label:t('fields.age'), value: paciente.edad ? `${paciente.edad} ${t('units.years')}` : ''},
              {label:t('fields.gender'), value: paciente.genero},
              {label:t('fields.town'), value: paciente.comunidad_pueblo},
              {label:t('fields.status'), value: paciente.estado},
            ])}
            {section(t('sections.clin'), 'clin', [
              {label:t('fields.weight'), value: editMode? null : (localPeso || paciente.peso_kg)},
              {label:t('fields.height'), value: editMode? null : (localAltura || paciente.altura_cm)},
              {label:t('fields.bmi'), value: (bmiVal) ? `${bmiVal}${bmiCatKey? ' ('+t(`bmi.${bmiCatKey}`)+')':''}`: '—'},
              {label:t('fields.vitals'), value: paciente.signos_vitales || ''},
            ])}
            {bmiCatKey && !editMode && (
              <View style={{flexDirection:'row', marginBottom:12}}>
                <View style={{ backgroundColor:bmiColor, paddingHorizontal:12, paddingVertical:6, borderRadius:16 }}>
                  <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>{t(`bmi.${bmiCatKey}`)}</Text>
                </View>
              </View>
            )}
            {editMode && (
              <View style={styles.inlineEditRow}>
                <View style={styles.editField}>
                  <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.weight')}</Text>
                  <TextInput value={localPeso} onChangeText={setLocalPeso} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='0' placeholderTextColor={theme.secondaryText} />
                </View>
                <View style={styles.editField}>
                  <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.height')}</Text>
                  <TextInput value={localAltura} onChangeText={setLocalAltura} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='0' placeholderTextColor={theme.secondaryText} />
                </View>
              </View>
            )}
          </>
        )}

        {tab==='clinico' && (
          <>
            {section(t('sections.repro'), 'repro', [{label:t('fields.reproHistory'), value: paciente.historia_reproductiva}])}
            {section(t('sections.habits'), 'hab', [{label:t('fields.habits'), value: paciente.habitos || paciente.habitos_salud}])}
            {section(t('sections.allergies'), 'ale', [{label:t('fields.allergies'), value: paciente.alergias}])}
            {section(t('sections.obs'), 'obs', [{label:t('fields.notes'), value: paciente.observaciones || paciente.notas}])}
          </>
        )}

        {tab==='pagina1' && (
          <View style={{paddingVertical:4}}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:14}}>
              <Text style={{fontSize:18,fontWeight:'900',color:theme.text,flex:1}}>{t('c1.title')}</Text>
              {(isSimulated1) && <View style={{backgroundColor:'#F59E0B',paddingHorizontal:10,paddingVertical:4,borderRadius:12}}><Text style={{color:'#fff',fontSize:10,fontWeight:'800'}}>{t('badges.simulated')}</Text></View>}
            </View>

            <Text style={[styles.groupHeader,{color:theme.text}]}>{t('c1.basic')}</Text>
            <View style={{flexDirection:'row', columnGap:18}}>
              <View style={{flex:1}}>
                <UnderlineInput label={t('c1.date')} value={consult1.date} onChange={v=>setConsult1(c=>({...c,date:v}))} />
                <UnderlineInput label={t('c1.patientName')} value={consult1.patientName} onChange={v=>setConsult1(c=>({...c,patientName:v}))} />
                <UnderlineInput label={t('c1.town')} value={consult1.town} onChange={v=>setConsult1(c=>({...c,town:v}))} />
              </View>
              <View style={{flex:1}}>
                <View style={{marginBottom:14}}>
                  <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.consultType.title')}</Text>
                  <View style={stylesCx.inlineWrap}>
                    <Check label={t('c1.consultType.diabetes')} checked={consult1.consultType.diabetes} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,diabetes:!c.consultType.diabetes}}))} />
                    <Check label={t('c1.consultType.htn')} checked={consult1.consultType.htn} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,htn:!c.consultType.htn}}))} />
                    <Check label={t('c1.consultType.respiratory')} checked={consult1.consultType.respiratory} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,respiratory:!c.consultType.respiratory}}))} />
                  </View>
                  <View style={{flexDirection:'row',alignItems:'center',marginTop:6}}>
                    <Check label={t('common.other')} checked={consult1.consultType.other} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,other:!c.consultType.other}}))} />
                    {consult1.consultType.other && (
                      <TextInput
                        placeholder={t('common.specify')}
                        value={consult1.consultType.otherText}
                        onChangeText={tval=>setConsult1(c=>({...c,consultType:{...c.consultType,otherText:tval}}))}
                        style={[stylesCx.underInput,{flex:1, marginLeft:8, color:theme.text, borderBottomColor:theme.secondaryText}]}
                        placeholderTextColor={theme.secondaryText}
                      />
                    )}
                  </View>
                </View>
                <UnderlineInput label={t('c1.cc')} value={consult1.chiefComplaint} onChange={v=>setConsult1(c=>({...c,chiefComplaint:v}))} long />
                <UnderlineInput label={t('c1.language')} value={consult1.language} onChange={v=>setConsult1(c=>({...c,language:v}))} />
                <UnderlineInput label={t('c1.phone')} value={consult1.phone} onChange={v=>setConsult1(c=>({...c,phone:v}))} />
                <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                  <View style={{flex:1}}><UnderlineInput label={t('c1.dobAge')} value={consult1.dobOrAge} onChange={v=>setConsult1(c=>({...c,dobOrAge:v}))} /></View>
                  <View style={{marginLeft:12}}>
                    <Text style={[stylesCx.label,{color:theme.secondaryText, marginBottom:4}]}>{t('c1.gender')}</Text>
                    <RadioGroup options={['M','F']} value={consult1.gender} onChange={v=>setConsult1(c=>({...c,gender:v}))} />
                  </View>
                </View>
              </View>
            </View>

            <Text style={[styles.groupHeader,{color:theme.text}]}>{t('c1.vitals.title')}</Text>
            <View style={stylesCx.sectionSep} />
            <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.vitals.subtitle')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}} contentContainerStyle={{paddingRight:20}}>
              <Vital label={t('c1.vitals.bp')} dual value1={consult1.vitals.bpSys} value2={consult1.vitals.bpDia} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,bpSys:v}}))} onChange2={v=>setConsult1(c=>({...c,vitals:{...c.vitals,bpDia:v}}))} />
              <Vital label={t('c1.vitals.hr')} value1={consult1.vitals.hr} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,hr:v}}))} />
              <Vital label={t('c1.vitals.spo2')} value1={consult1.vitals.spo2} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,spo2:v}}))} />
              <Vital label={t('c1.vitals.bs')} value1={consult1.vitals.bs} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,bs:v}}))} />
              <Vital label={t('c1.vitals.weight')} value1={consult1.vitals.weight} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,weight:v}}))} />
              <Vital label={t('c1.vitals.height')} value1={consult1.vitals.height} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,height:v}}))} />
              <Vital label={t('c1.vitals.temp')} value1={consult1.vitals.temp} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,temp:v}}))} />
            </ScrollView>

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c1.fast.title')}</Text>
            <Row>
              <Col flex={1}><RadioLabeled label={t('c1.fast.takenMed')} value={consult1.takenMed1} onChange={v=>setConsult1(c=>({...c,takenMed1:v}))} /></Col>
              <Col flex={1}><RadioLabeled label={t('c1.fast.fasting')} value={consult1.fasting} onChange={v=>setConsult1(c=>({...c,fasting:v}))} /></Col>
              <Col flex={1}><RadioLabeled label={t('c1.fast.takenMed')} value={consult1.takenMed2} onChange={v=>setConsult1(c=>({...c,takenMed2:v}))} /></Col>
            </Row>

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c1.all.title')}</Text>
            <View style={{marginTop:14}}>
              <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.all.subtitle')}</Text>
              <View style={{flexDirection:'row', alignItems:'center', flexWrap:'wrap'}}>
                <Check label={t('c1.all.nka')} checked={consult1.allergies.nka} onChange={()=>setConsult1(c=>({...c,allergies:{...c.allergies,nka:!c.allergies.nka}}))} />
                {!consult1.allergies.nka && (
                  <TextInput
                    placeholder={t('c1.all.listPlaceholder')}
                    value={consult1.allergies.list}
                    onChangeText={tv=>setConsult1(c=>({...c,allergies:{...c.allergies,list:tv}}))}
                    style={[stylesCx.underInput,{flex:1,marginLeft:10,color:theme.text,borderBottomColor:theme.secondaryText}]}
                    placeholderTextColor={theme.secondaryText}
                  />
                )}
                <Text style={[stylesCx.smallLabel,{color:theme.secondaryText,marginLeft:14}]}>{t('c1.all.vit')}</Text>
                <TextInput value={consult1.vitaminPkts} onChangeText={tv=>setConsult1(c=>({...c,vitaminPkts:tv}))} style={[stylesCx.underMini,{color:theme.text}]} placeholder="0" placeholderTextColor={theme.secondaryText} />
                <Text style={[stylesCx.smallLabel,{color:theme.secondaryText,marginLeft:14}]}>{t('c1.all.alb')}</Text>
                <TextInput value={consult1.albendazoleTabs} onChangeText={tv=>setConsult1(c=>({...c,albendazoleTabs:tv}))} style={[stylesCx.underMini,{color:theme.text}]} placeholder="0" placeholderTextColor={theme.secondaryText} />
              </View>
            </View>

            <HabitsBlock title={t('c1.hab.current')} data={consult1.current} onChange={(d)=>setConsult1(c=>({...c,current:d}))} theme={theme} />
            <HabitsBlock title={t('c1.hab.past')} data={consult1.past} onChange={(d)=>setConsult1(c=>({...c,past:d}))} theme={theme} />

            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.repro.title')}</Text>
              <Row>
                <Col flex={2}>
                  <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.repro.lmp')}</Text>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    {['d','m','y'].map(k=> (
                      <TextInput key={k} value={consult1.lmp[k]} onChangeText={v=>setConsult1(c=>({...c,lmp:{...c.lmp,[k]:v}}))} placeholder={k.toUpperCase()} placeholderTextColor={theme.secondaryText}
                        style={[stylesCx.underMini,{width: k==='y'?64:34, marginRight:8,color:theme.text}]} />
                    ))}
                    <Check label={t('c1.repro.menopause')} checked={consult1.menopause} onChange={()=>setConsult1(c=>({...c,menopause:!c.menopause}))} />
                  </View>
                </Col>
                <Col flex={3}>
                  <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.repro.obstetric')}</Text>
                  <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center'}}>
                    {['G','P','Mc','Ab'].map(k=> (
                      <View key={k} style={{flexDirection:'row',alignItems:'center',marginRight:12}}>
                        <Text style={[stylesCx.smallLabel,{color:theme.secondaryText}]}>{'#'+k}</Text>
                        <TextInput value={consult1.obstetric[k]} onChangeText={v=>setConsult1(c=>({...c,obstetric:{...c.obstetric,[k]:v}}))}
                          style={[stylesCx.underMini,{width:40,marginLeft:4,color:theme.text}]} placeholder="" placeholderTextColor={theme.secondaryText} />
                      </View>
                    ))}
                  </View>
                </Col>
                <Col flex={2}>
                  <RadioLabeled label={t('c1.repro.controlQ')} value={consult1.birthControl.control} onChange={v=>setConsult1(c=>({...c,birthControl:{...c.birthControl,control:v}}))} />
                  {consult1.birthControl.control==='Y' && (
                    <UnderlineInput label={t('c1.repro.methodQ')} value={consult1.birthControl.method} onChange={v=>setConsult1(c=>({...c,birthControl:{...c.birthControl,method:v}}))} />
                  )}
                </Col>
              </Row>
            </View>

            <Multiline label={t('c1.hpi')} value={consult1.historyPresentIllness} onChange={v=>setConsult1(c=>({...c,historyPresentIllness:v}))} theme={theme} />
            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.pmh.title')}</Text>
              <UnderlineInput label={t('c1.pmh.medDx')} value={consult1.medicalDx} onChange={v=>setConsult1(c=>({...c,medicalDx:v}))} />
              <UnderlineInput label={t('c1.pmh.surgery')} value={consult1.surgery} onChange={v=>setConsult1(c=>({...c,surgery:v}))} />
              <UnderlineInput label={t('c1.pmh.meds')} value={consult1.meds} onChange={v=>setConsult1(c=>({...c,meds:v}))} />
            </View>

            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.pe.title')}</Text>
              <UnderlineInput label={t('c1.pe.heart')} value={consult1.physicalExam.heart} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,heart:v}}))} />
              <UnderlineInput label={t('c1.pe.lungs')} value={consult1.physicalExam.lungs} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,lungs:v}}))} />
              <UnderlineInput label={t('c1.pe.abdomen')} value={consult1.physicalExam.abdomen} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,abdomen:v}}))} />
              <UnderlineInput label={t('c1.pe.gyn')} value={consult1.physicalExam.gyn} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,gyn:v}}))} />
            </View>

            <Multiline label={t('c1.impression')} value={consult1.impression} onChange={v=>setConsult1(c=>({...c,impression:v}))} theme={theme} />
            <Multiline label={t('c1.plan')} value={consult1.plan} onChange={v=>setConsult1(c=>({...c,plan:v}))} theme={theme} />
            <Text style={{marginTop:8,fontSize:12,color:theme.secondaryText,fontStyle:'italic'}}>{t('c1.rxNote')}</Text>

            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.further.title')}</Text>
              <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                <Check label={t('c1.further.genSurg')} checked={consult1.further.genSurg} onChange={()=>setConsult1(c=>({...c,further:{...c.further,genSurg:!c.further.genSurg}}))} />
                <Check label={t('c1.further.gyn')} checked={consult1.further.gyn} onChange={()=>setConsult1(c=>({...c,further:{...c.further,gyn:!c.further.gyn}}))} />
                <Check label={t('common.other')} checked={consult1.further.other} onChange={()=>setConsult1(c=>({...c,further:{...c.further,other:!c.further.other}}))} />
                {consult1.further.other && <TextInput value={consult1.further.otherText} onChangeText={tv=>setConsult1(c=>({...c,further:{...c.further,otherText:tv}}))} placeholder={t('common.specify')} placeholderTextColor={theme.secondaryText} style={[stylesCx.underInput,{flex:1,marginLeft:8,color:theme.text}]} />}
              </View>
              <UnderlineInput label={t('c1.provider')} value={consult1.provider} onChange={v=>setConsult1(c=>({...c,provider:v}))} />
              <UnderlineInput label={t('c1.interpreter')} value={consult1.interpreter} onChange={v=>setConsult1(c=>({...c,interpreter:v}))} />
            </View>
            <Text style={{marginTop:24,textAlign:'center',fontSize:11,color:theme.secondaryText,fontWeight:'700'}}>{t('c1.reverseNote')}</Text>
          </View>
        )}

        {tab==='pagina2' && (
          <View style={{paddingVertical:4}}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:14}}>
              <Text style={{fontSize:18,fontWeight:'900',color:theme.text,flex:1}}>{t('c2.title')}</Text>
              {(isSimulated2) && <View style={{backgroundColor:'#F59E0B',paddingHorizontal:10,paddingVertical:4,borderRadius:12}}><Text style={{color:'#fff',fontSize:10,fontWeight:'800'}}>{t('badges.simulated')}</Text></View>}
            </View>

            <Text style={[styles.groupHeader,{color:theme.text}]}>{t('c2.general')}</Text>
            <UnderlineInput label={t('c2.date')} value={consult2.date} onChange={v=>setConsult2(c=>({...c,date:v}))} />
            <Multiline label={t('c2.hpi')} value={consult2.historyPresentIllness} onChange={v=>setConsult2(c=>({...c,historyPresentIllness:v}))} theme={theme} />

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c2.exam')}</Text>
            <Text style={[stylesCx.subHeader,{color:theme.text,marginTop:16}]}>{t('c2.examSub')}</Text>
            <Multiline label="" value={consult2.physicalExam} onChange={v=>setConsult2(c=>({...c,physicalExam:v}))} theme={theme} placeholder={t('common.freeText')} />

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c2.assessment')}</Text>
            <Multiline label={t('c2.impression')} value={consult2.impression} onChange={v=>setConsult2(c=>({...c,impression:v}))} theme={theme} />
            <Multiline label={t('c2.plan')} value={consult2.plan} onChange={v=>setConsult2(c=>({...c,plan:v}))} theme={theme} />
            <UnderlineInput label={t('c2.medsrx')} value={consult2.medsRx} onChange={v=>setConsult2(c=>({...c,medsRx:v}))} />

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c2.refs')}</Text>
            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c2.furtherTitle')}</Text>
              <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                <Check label={t('c1.further.genSurg')} checked={consult2.further.genSurg} onChange={()=>setConsult2(c=>({...c,further:{...c.further,genSurg:!c.further.genSurg}}))} />
                <Check label={t('c1.further.gyn')} checked={consult2.further.gyn} onChange={()=>setConsult2(c=>({...c,further:{...c.further,gyn:!c.further.gyn}}))} />
                <Check label={t('common.other')} checked={consult2.further.other} onChange={()=>setConsult2(c=>({...c,further:{...c.further,other:!c.further.other}}))} />
                {consult2.further.other && <TextInput value={consult2.further.otherText} onChangeText={tv=>setConsult2(c=>({...c,further:{...c.further,otherText:tv}}))} placeholder={t('common.specify')} placeholderTextColor={theme.secondaryText} style={[stylesCx.underInput,{flex:1,marginLeft:8,color:theme.text}]} />}
              </View>
              <View style={{flexDirection:'row', columnGap:16, marginTop:14}}>
                <View style={{flex:1}}><UnderlineInput label={t('c2.surgeon')} value={consult2.surgeon} onChange={v=>setConsult2(c=>({...c,surgeon:v}))} /></View>
                <View style={{flex:1}}><UnderlineInput label={t('c1.interpreter')} value={consult2.interpreter} onChange={v=>setConsult2(c=>({...c,interpreter:v}))} /></View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop:14, paddingBottom:10 },
  title:{ fontSize:20, fontWeight:'800', maxWidth:200 },
  subtitle:{ fontSize:12, fontWeight:'600' },
  severityChip:{ paddingHorizontal:10, paddingVertical:6, borderRadius:20 },
  severityTxt:{ color:'#fff', fontWeight:'800', fontSize:12, textTransform:'uppercase' },
  tabsRow:{ flexDirection:'row', paddingHorizontal:16, columnGap:10, marginBottom:4 },
  tabBtn:{ paddingHorizontal:16, paddingVertical:8, borderRadius:20, backgroundColor:'#E5E7EB' },
  tabBtnActive:{ backgroundColor:'#2D60C8' },
  tabTxt:{ fontSize:13, fontWeight:'700', color:'#374151' },
  tabTxtActive:{ color:'#fff' },
  section:{ borderWidth:1, borderRadius:14, padding:14, marginBottom:14 },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  sectionTitle:{ fontSize:14, fontWeight:'800', color:'#6B7280', textTransform:'uppercase' },
  row:{ marginBottom:8 },
  label:{ fontSize:12, fontWeight:'600', marginBottom:2 },
  value:{ fontSize:14, fontWeight:'500' },
  center:{ flex:1, alignItems:'center', justifyContent:'center' },
  severityEditBar:{ flexDirection:'row', flexWrap:'wrap', columnGap:8, rowGap:8, paddingHorizontal:16, marginBottom:4 },
  sevOpt:{ paddingHorizontal:12, paddingVertical:6, backgroundColor:'#E5E7EB', borderRadius:16 },
  sevOptActive:{ backgroundColor:'#2D60C8' },
  sevOptTxt:{ fontSize:12, fontWeight:'700', color:'#374151' },
  sevOptTxtActive:{ color:'#fff' },
  saveBtn:{ paddingHorizontal:16, paddingVertical:8, backgroundColor:'#16A34A', borderRadius:18 },
  saveBtnTxt:{ color:'#fff', fontWeight:'800', fontSize:12 },
  inlineEditRow:{ flexDirection:'row', columnGap:14, marginBottom:12 },
  editField:{ flex:1 },
  editInput:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:10, paddingHorizontal:10, paddingVertical:6, marginTop:4 }
});

styles.groupHeader = {
  fontSize:12,
  fontWeight:'800',
  marginTop:16,
  marginBottom:6,
  letterSpacing:0.5,
  textTransform:'uppercase'
};

// ---- Subcomponentes (sin cambios de estilos) ----
const stylesCx = StyleSheet.create({
  label:{ fontSize:11, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 },
  underInput:{ borderBottomWidth:1, borderColor:'#B0B5BC', paddingVertical:4, fontSize:13, minWidth:60 },
  underMini:{ borderBottomWidth:1, borderColor:'#B0B5BC', paddingVertical:2, fontSize:12, textAlign:'center' },
  inlineWrap:{ flexDirection:'row', flexWrap:'wrap', columnGap:16, rowGap:8, marginTop:6 },
  subHeader:{ fontSize:14, fontWeight:'800', marginTop:18, marginBottom:8 },
  smallLabel:{ fontSize:11, fontWeight:'700' },
  chip:{ paddingHorizontal:10, paddingVertical:4, borderRadius:14, backgroundColor:'#E5E7EB' },
  sectionSep:{ height:1, backgroundColor:'#E5E7EB', marginVertical:16 }
});

function UnderlineInput({ label, value, onChange, long, placeholder }) {
  return (
    <View style={{marginBottom:14}}>
      {label? <Text style={[stylesCx.label,{marginBottom:4,color:'#6B7280'}]}>{label}</Text>: null}
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder||label} placeholderTextColor="#9CA3AF"
        style={[stylesCx.underInput, long && {width:'100%' , minHeight:34}]} />
    </View>
  );
}
function Vital({ label, dual, value1, value2, onChange1, onChange2 }) {
  return (
    <View style={{marginRight:16}}>
      <Text style={{fontSize:11,fontWeight:'700',color:'#6B7280',marginBottom:4}}>{label}</Text>
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <TextInput value={value1} onChangeText={onChange1} keyboardType='numeric' style={[stylesCx.underMini,{width:48, marginRight: dual?4:0}]} />
        {dual && <><Text style={{marginHorizontal:2}}>/</Text><TextInput value={value2} onChangeText={onChange2} keyboardType='numeric' style={[stylesCx.underMini,{width:48}]} /></>}
      </View>
    </View>
  );
}
function RadioGroup({ options, value, onChange }) {
  return (
    <View style={{flexDirection:'row',alignItems:'center'}}>
      {options.map(opt => (
        <TouchableOpacity key={opt} onPress={()=>onChange(opt)} style={{flexDirection:'row',alignItems:'center',marginRight:12}}>
          <View style={{width:16,height:16,borderRadius:8,borderWidth:2,borderColor:value===opt?'#2D60C8':'#9CA3AF',alignItems:'center',justifyContent:'center'}}>
            {value===opt && <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#2D60C8'}} />}
          </View>
          <Text style={{marginLeft:4,fontSize:12,fontWeight:'700'}}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
function RadioLabeled({ label, value, onChange }) {
  return (
    <View style={{marginBottom:12}}>
      <Text style={[stylesCx.label,{color:'#6B7280',marginBottom:4}]}>{label}</Text>
      <RadioGroup options={['N','Y']} value={value||''} onChange={onChange} />
    </View>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <TouchableOpacity onPress={onChange} style={{flexDirection:'row',alignItems:'center',marginRight:14, marginBottom:6}}>
      <View style={{width:18,height:18,borderWidth:2,borderColor:checked?'#2D60C8':'#9CA3AF',backgroundColor:checked?'#2D60C8':'transparent',borderRadius:4,alignItems:'center',justifyContent:'center'}}>
        {checked && <Ionicons name='check' size={12} color='#fff' />}
      </View>
      <Text style={{marginLeft:6,fontSize:12,fontWeight:'700'}}>{label}</Text>
    </TouchableOpacity>
  );
}
function HabitsBlock({ title, data, onChange, theme }) {
  const render = (k,label) => (
    <View key={k} style={{flexDirection:'row',alignItems:'center',marginRight:16,marginBottom:6}}>
      <Text style={{fontSize:11,fontWeight:'700',color:theme.secondaryText,marginRight:4}}>{label}?</Text>
      <RadioGroup options={['N','Y']} value={data[k].use? 'Y':'N'} onChange={v=>onChange({...data,[k]:{...data[k],use:v==='Y'}})} />
      {data[k].use && <TextInput value={data[k].count} onChangeText={t=>onChange({...data,[k]:{...data[k],count:t}})} placeholder='#' placeholderTextColor={theme.secondaryText} style={[stylesCx.underMini,{width:48,marginLeft:4,color:theme.text}]} />}
    </View>
  );
  return (
    <View style={{marginTop:16}}>
      <Text style={[stylesCx.subHeader,{color:theme.text}]}>{title} {t('c1.hab.titleSuffix')}</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
        {render('tobacco',t('c1.hab.tobacco'))}
        {render('alcohol',t('c1.hab.alcohol'))}
        {render('drugs',t('c1.hab.drugs'))}
      </View>
    </View>
  );
}
function Multiline({ label, value, onChange, theme, placeholder }) {
  return (
    <View style={{marginTop:16}}>
      {label ? <Text style={[stylesCx.label,{color:theme.secondaryText,marginBottom:4}]}>{label}</Text>:null}
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder||label} placeholderTextColor={theme.secondaryText}
        multiline style={{minHeight:90,borderWidth:1,borderColor:'#E5E7EB',borderRadius:12,padding:10,fontSize:13,color:theme.text,textAlignVertical:'top'}} />
    </View>
  );
}
function Row({ children }) { return <View style={{flexDirection:'row', columnGap:16, flexWrap:'wrap'}}>{children}</View>; }
function Col({ children, flex }) { return <View style={{flex:flex||1}}>{children}</View>; }
