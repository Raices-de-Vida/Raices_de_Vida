// src/screens/UserManagementScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, Modal, Switch, Platform, Animated, Easing,
  KeyboardAvoidingView, RefreshControl, Image
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

const API_BASE = 'http://localhost:3001/api/user-info'; // ⬅️ Cambia esta URL a tu backend

const BRAND = {
  primary: '#1E9E55',     // Verde de acento
  accent:  '#FF8A00',
  success: '#10B981',
  danger:  '#E11D48',
};

const PALETTE = {
  butter: '#F2D88F', // Fondo general
  cream:  '#FFF7DA', // Banner / card superior
};

const ROLES = ['ONG', 'Voluntario', 'Lider Comunitario'];

export default function UserManagementScreen() {
  const navigation = useNavigation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('GestionUsuarios');

  const [mode, setMode] = useState('email'); // 'email' | 'id' | 'rol'
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animación sutil de botón
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 80, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
    ]).start();
  };

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isValidId = (v) => /^\d+$/.test(v);

  const fetchByEmail = async (email) => {
    setLoading(true); setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/by-email`, { params: { email } });
      setUsers([data]);
    } catch {
      setUsers([]);
      setError(t('errors.getByEmailFailed'));
    } finally { setLoading(false); }
  };

  const fetchById = async (id) => {
    setLoading(true); setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/by-id/${id}`);
      setUsers([data]);
    } catch {
      setUsers([]);
      setError(t('errors.getByIdFailed'));
    } finally { setLoading(false); }
  };

  const fetchByRole = async (rol) => {
    setListLoading(true); setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/by-role`, { params: rol ? { rol } : {} });
      setUsers(data || []);
    } catch {
      setUsers([]);
      setError(t('errors.getByRoleFailed'));
    } finally { setListLoading(false); }
  };

  const onSearch = () => {
    animatePress();
    if (mode === 'email') {
      if (!isValidEmail(query)) { setError(t('errors.emailInvalid')); return; }
      fetchByEmail(query.trim());
    } else if (mode === 'id') {
      if (!isValidId(query)) { setError(t('errors.idInvalid')); return; }
      fetchById(query.trim());
    } else {
      fetchByRole(roleFilter);
    }
  };

  const openDetail = async (u) => {
    setError(null); setDetailOpen(true); setSelected(null); setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/by-email`, { params: { email: u.email } });
      setSelected(data);
    } catch {
      setSelected(u); // fallback
      setError(t('errors.detailFallback'));
    } finally { setLoading(false); }
  };

  const toggleStatus = async (id, next) => {
    setLoading(true); setError(null);
    try {
      await axios.put(`${API_BASE}/status/${id}`, { estado: next });
      setSelected((prev) => (prev ? { ...prev, estado: next } : prev));
      setUsers((prev) => prev.map((p) => (p.id_usuario === id ? { ...p, estado: next } : p)));
    } catch {
      setError(t('errors.updateStatusFailed'));
    } finally { setLoading(false); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (mode === 'rol') await fetchByRole(roleFilter);
      if (mode === 'email' && isValidEmail(query)) await fetchByEmail(query);
      if (mode === 'id' && isValidId(query)) await fetchById(query);
    } finally { setRefreshing(false); }
  };

  useEffect(() => { fetchByRole(null); }, []);

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? theme.cardBackground : '#FFFFFF',
          borderColor: isDarkMode ? theme.border : '#E5E7EB',
        }
      ]}
      onPress={() => openDetail(item)}
      activeOpacity={0.9}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? theme.text : '#1B1B1B' }]}>{item.nombre} {item.apellido}</Text>
          <Text style={[styles.cardSub, { color: isDarkMode ? theme.secondaryText : '#6B7280' }]}>{item.email}</Text>
          <View style={styles.badgeRow}>
            <Badge label={item.rol} color={BRAND.primary} />
            {item.tipo_referencia ? <Badge label={item.tipo_referencia} color={BRAND.accent} /> : null}
          </View>
        </View>
        <StatusDot active={!!item.estado} />
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? theme.background : PALETTE.butter } // Fondo pantalla: butter
        ]}
      >
        {/* ===== Banner (card superior) con ArrowBack + tema ===== */}
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream, // Banner: cream
              borderColor: isDarkMode ? (theme.border || '#EADFBF') : '#EADFBF',
            }
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={22} color={isDarkMode ? theme.text : '#1B1B1B'} />
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Image
              source={isDarkMode
                ? require('../styles/logos/LogoDARK.png')
                : require('../styles/logos/LogoBRIGHT.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.topTitle, { color: isDarkMode ? theme.text : '#1B1B1B' }]}>{t('top.title')}</Text>
              <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : BRAND.primary }]}>
                {t('top.subtitle')}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
            <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={20} color={isDarkMode ? theme.text : '#1B1B1B'} />
          </TouchableOpacity>
        </View>

        {/* Navbar (Email | ID | Rol) con acento verde (sin tinte azul del sistema) */}
        <View style={styles.segmentedWrap}>
          <View
            style={[
              styles.segmented,
              {
                backgroundColor: isDarkMode ? '#0f1a13' : '#E6F6EA', // verdoso suave
                borderColor: BRAND.primary
              }
            ]}
          >
            <SegButton
              label={t('segmented.email')}
              active={mode === 'email'}
              onPress={() => { setMode('email'); setError(null); }}
            />
            <SegButton
              label={t('segmented.id')}
              active={mode === 'id'}
              onPress={() => { setMode('id'); setError(null); }}
            />
            <SegButton
              label={t('segmented.role')}
              active={mode === 'rol'}
              onPress={() => { setMode('rol'); setError(null); }}
            />
          </View>
        </View>

        {/* Controles */}
        {mode !== 'rol' ? (
          <View style={styles.inputRow}>
            <TextInput
              placeholder={mode === 'email' ? t('inputs.emailPlaceholder') : t('inputs.idPlaceholder')}
              placeholderTextColor={isDarkMode ? theme.secondaryText : '#6B7280'}
              value={query}
              onChangeText={setQuery}
              keyboardType={mode === 'id' ? 'number-pad' : 'email-address'}
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  borderColor: isDarkMode ? theme.border : '#E5E7EB',
                  color: isDarkMode ? theme.text : '#1B1B1B',
                  backgroundColor: isDarkMode ? theme.cardBackground : '#FFFFFF'
                }
              ]}
            />
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: BRAND.primary }]} onPress={onSearch} activeOpacity={0.9}>
                <Text style={styles.primaryBtnText}>{t('buttons.search')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <RolePicker value={roleFilter} onChange={setRoleFilter} />
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: BRAND.primary }]} onPress={onSearch} activeOpacity={0.9}>
                <Text style={styles.primaryBtnText}>{t('buttons.filter')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {error ? <Text style={[styles.error, { color: BRAND.danger }]}>{error}</Text> : null}

        {/* Lista */}
        {(loading || listLoading) && users.length === 0 ? (
          <View style={styles.loader}><ActivityIndicator size="large" /></View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(it) => String(it.id_usuario)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={renderUser}
            ListEmptyComponent={<Text style={[styles.empty, { color: isDarkMode ? theme.secondaryText : '#1B1B1B' }]}>{t('list.empty')}</Text>}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}

        {/* Modal detalle */}
        <Modal visible={detailOpen} animationType="slide" onRequestClose={() => setDetailOpen(false)}>
          <View style={[
            styles.modalWrap,
            { backgroundColor: isDarkMode ? theme.background : PALETTE.butter }
          ]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? theme.text : '#1B1B1B' }]}>{t('top.title')}</Text>

            {selected ? (
              <View style={[
                styles.detailCard,
                { backgroundColor: isDarkMode ? theme.cardBackground : '#FFFFFF', borderColor: isDarkMode ? theme.border : '#E5E7EB' }
              ]}>
                <Text style={[styles.detailName, { color: isDarkMode ? theme.text : '#1B1B1B' }]}>{selected.nombre} {selected.apellido}</Text>
                <Text style={[styles.detailMail, { color: isDarkMode ? theme.secondaryText : '#6B7280' }]}>{selected.email}</Text>

                <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
                  <Badge label={selected.rol} color={BRAND.primary} />
                  {selected.tipo_referencia ? <Badge label={selected.tipo_referencia} color={BRAND.accent} /> : null}
                </View>

                <View style={styles.rowBetween}>
                  <Text style={[styles.statusLabel, { color: isDarkMode ? theme.text : '#1B1B1B' }]}>{t('status.label')}</Text>
                  <View style={styles.switchRow}>
                    <Text style={{ color: selected.estado ? BRAND.success : BRAND.danger, marginRight: 8 }}>
                      {selected.estado ? t('status.active') : t('status.inactive')}
                    </Text>
                    <Switch value={!!selected.estado} onValueChange={(v) => toggleStatus(selected.id_usuario, v)} />
                  </View>
                </View>

                {selected.detalles_referencia ? (
                  <View style={[
                    styles.refBox,
                    { borderColor: isDarkMode ? theme.border : '#E5E7EB', backgroundColor: isDarkMode ? '#0b1220' : '#FAFAFA' }
                  ]}>
                    <Text style={[styles.refTitle, { color: isDarkMode ? theme.text : '#1B1B1B' }]}>{t('labels.reference')}: {selected.detalles_referencia.tipo}</Text>
                    {selected.detalles_referencia.nombre ? (<Row label={t('labels.nombre')} value={selected.detalles_referencia.nombre} textColor={isDarkMode ? theme.text : '#1B1B1B'} sec={isDarkMode ? theme.secondaryText : '#6B7280'} />) : null}
                    {selected.detalles_referencia.tipo_ong ? (<Row label={t('labels.tipoOng')} value={selected.detalles_referencia.tipo_ong} textColor={isDarkMode ? theme.text : '#1B1B1B'} sec={isDarkMode ? theme.secondaryText : '#6B7280'} />) : null}
                    {selected.detalles_referencia.tipo_voluntario ? (<Row label={t('labels.tipoVoluntario')} value={selected.detalles_referencia.tipo_voluntario} textColor={isDarkMode ? theme.text : '#1B1B1B'} sec={isDarkMode ? theme.secondaryText : '#6B7280'} />) : null}
                    {selected.detalles_referencia.institucion ? (<Row label={t('labels.institucion')} value={selected.detalles_referencia.institucion} textColor={isDarkMode ? theme.text : '#1B1B1B'} sec={isDarkMode ? theme.secondaryText : '#6B7280'} />) : null}
                    {selected.detalles_referencia.disponibilidad ? (<Row label={t('labels.disponibilidad')} value={selected.detalles_referencia.disponibilidad} textColor={isDarkMode ? theme.text : '#1B1B1B'} sec={isDarkMode ? theme.secondaryText : '#6B7280'} />) : null}
                    {selected.detalles_referencia.direccion ? (<Row label={t('labels.direccion')} value={selected.detalles_referencia.direccion} textColor={isDarkMode ? theme.text : '#1B1B1B'} sec={isDarkMode ? theme.secondaryText : '#6B7280'} />) : null}
                    {selected.detalles_referencia.telefono ? (<Row label={t('labels.telefono')} value={selected.detalles_referencia.telefono} textColor={isDarkMode ? theme.text : '#1B1B1B'} sec={isDarkMode ? theme.secondaryText : '#6B7280'} />) : null}
                  </View>
                ) : (
                  <Text style={{ color: isDarkMode ? theme.secondaryText : '#6B7280', marginTop: 6 }}>{t('list.empty')}</Text>
                )}

                <View style={[
                  styles.futureBox,
                  { borderColor: '#F59E0B', backgroundColor: isDarkMode ? '#2b1f07' : '#FFFBEB' }
                ]}>
                  <Text style={[styles.futureTitle, { color: '#F59E0B' }]}>{t('future.title')}</Text>
                  <Text style={[styles.futureDesc, { color: isDarkMode ? '#f2d7a3' : '#92400E' }]}>
                    {t('future.desc')}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.loader}><ActivityIndicator size="large" /></View>
            )}

            {error ? <Text style={[styles.error, { color: BRAND.danger, marginTop: 8 }]}>{error}</Text> : null}

            <TouchableOpacity style={[styles.secondaryBtn, { borderColor: BRAND.primary }]} onPress={() => setDetailOpen(false)}>
              <Text style={[styles.secondaryBtnText, { color: BRAND.primary }]}>{t('buttons.close')}</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

function Row({ label, value, textColor, sec }) {
  if (!value) return null;
  return (
    <View style={styles.rowBetween}>
      <Text style={[styles.rowLabel, { color: sec }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

function Badge({ label, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StatusDot({ active }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[styles.dot, { backgroundColor: active ? BRAND.success : BRAND.danger }]} />
      <Text style={{ color: active ? BRAND.success : BRAND.danger, fontSize: 12 }}>
        {active ? 'Activo' : 'Inactivo'}
      </Text>
    </View>
  );
}

function RolePicker({ value, onChange }) {
  return (
    <View style={styles.roleWrap}>
      {ROLES.map((r) => (
        <TouchableOpacity
          key={r}
          style={[styles.roleChip, value === r && { backgroundColor: BRAND.primary }]}
          onPress={() => onChange(value === r ? null : r)}
          activeOpacity={0.85}
        >
          <Text style={[styles.roleChipText, value === r && { color: '#FFFFFF' }]}>{r}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SegButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.segBtn,
        active && styles.segActive,
        active && { borderColor: BRAND.primary, backgroundColor: '#CFF5DF' } // Verde claro (sin azul)
      ]}
      activeOpacity={0.9}
    >
      <Text
        style={[
          styles.segLabel,
          active && { color: BRAND.primary, fontWeight: '900' }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingBottom: 12 },

  // Banner superior
  topBar: {
    height: 72,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  backBtn: { padding: 8, borderRadius: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 4 },
  logo: { width: 30, height: 30, marginRight: 10, borderRadius: 8 },
  topTitle: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  topSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  themeToggle: { padding: 6, borderRadius: 10 },

  // Navbar (segmented)
  segmentedWrap: { marginTop: 6 },
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,              // borde verde
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segActive: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  segLabel: { fontWeight: '700', color: '#365043' }, // gris verdoso neutro (sin azul)

  // Controles
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },

  primaryBtn: { paddingHorizontal: 16, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, paddingHorizontal: 16, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  secondaryBtnText: { fontWeight: '800' },

  // Mensajes
  error: { marginVertical: 6 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 20 },

  // Tarjetas lista
  card: { borderRadius: 16, padding: 12, marginVertical: 6, borderWidth: 1 },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  cardSub: { },

  // Badges
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  badge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: '700', fontSize: 12 },

  dot: { width: 12, height: 12, borderRadius: 6 },

  // Modal & detalle
  modalWrap: { flex: 1, padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  detailCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  detailName: { fontSize: 18, fontWeight: '800' },
  detailMail: { marginBottom: 8 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { },
  rowValue: { fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  statusLabel: { fontWeight: '800' },
  switchRow: { flexDirection: 'row', alignItems: 'center' },

  refBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  refTitle: { fontWeight: '800', marginBottom: 6 },

  futureBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 16 },
  futureTitle: { fontWeight: '800' },
  futureDesc: { },
});
