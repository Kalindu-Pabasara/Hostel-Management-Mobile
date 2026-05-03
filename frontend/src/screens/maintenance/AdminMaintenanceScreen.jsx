import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';
import EmptyState from '../../components/EmptyState';

const statusColors   = { pending:'#f59e0b', 'in-progress':'#3b82f6', resolved:'#22c55e' };
const priorityColors = { low:'#22c55e', medium:'#f59e0b', high:'#ef4444', urgent:'#dc2626' };
const nextStatus     = { pending: 'in-progress', 'in-progress': 'resolved' };

export default function AdminMaintenanceScreen() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert]           = useState({ visible: false, title: '', message: '', type: 'error', onConfirm: null, showCancel: false });

  const fetchItems = useCallback(async () => {
    try { const res = await api.get('/maintenance'); setItems(res.data); }
    catch (e) { setAlert({ visible: true, title: 'Error', message: 'Error fetching requests: ' + e.message, type: 'error' }); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchItems(); }, []));

  const advanceStatus = async (m) => {
    const ns = nextStatus[m.status];
    if (!ns) return;
    try { await api.patch(`/maintenance/${m._id}`, { status: ns, adminNotes: m.adminNotes }); fetchItems(); }
    catch (e) { setAlert({ visible: true, title: 'Error', message: e.message, type: 'error' }); }
  };

  const deleteItem = (id) => {
    setAlert({
      visible: true,
      title: 'Delete Request',
      message: 'Are you sure you want to delete this maintenance request?',
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try { 
          await api.delete(`/maintenance/${id}`); 
          setAlert(p => ({ ...p, visible: false }));
          fetchItems(); 
        } catch (e) { 
          setAlert({ visible: true, title: 'Error', message: e.message, type: 'error' }); 
        }
      }
    });
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <FlatList data={items} keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(); }} tintColor="#00b4d8" />}
        renderItem={({ item: m }) => {
          const sc = statusColors[m.status]     || '#94a3b8';
          const pc = priorityColors[m.priority] || '#94a3b8';
          const ns = nextStatus[m.status];
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.category}>{m.category?.toUpperCase()} · Room {m.roomNumber}</Text>
                <View style={[s.badge, { backgroundColor: sc+'22', borderColor: sc }]}>
                  <Text style={[s.badgeText, { color: sc }]}>{m.status}</Text>
                </View>
              </View>
              <Text style={s.student}>👤 {m.studentId?.name || '—'}</Text>
              <Text style={s.date}>📅 {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              <Text style={s.desc}>{m.description}</Text>
              <View style={[s.prioBadge, { borderColor: pc }]}>
                <Text style={[s.prioText, { color: pc }]}>⚡ {m.priority}</Text>
              </View>
              <View style={s.actions}>
                {ns && (
                  <TouchableOpacity style={s.advBtn} onPress={() => advanceStatus(m)}>
                    <Text style={s.advText}>→ Mark as {ns}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={s.delBtn} onPress={() => deleteItem(m._id)}>
                  <Text style={s.delText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState 
            icon="construct-outline" 
            title="No Maintenance Requests" 
            message="There are no pending or resolved service requests to show." 
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
        onClose={() => setAlert(p => ({ ...p, visible: false }))} 
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  card:      { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  category:  { fontSize: 13, fontWeight: '700', color: '#00b4d8' },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  student:   { color: '#00b4d8', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  date:      { color: '#64748b', fontSize: 11, marginBottom: 8 },
  desc:      { color: '#f1f5f9', fontSize: 14, marginBottom: 10, lineHeight: 20 },
  prioBadge: { alignSelf:'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  prioText:  { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  actions:   { flexDirection: 'row', gap: 10 },
  advBtn:    { flex: 1, backgroundColor: '#3b82f622', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  advText:   { color: '#3b82f6', fontWeight: '600', fontSize: 13, textTransform: 'capitalize' },
  delBtn:    { backgroundColor: '#ef444422', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444', paddingHorizontal: 16 },
  delText:   { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  empty:     { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
});
