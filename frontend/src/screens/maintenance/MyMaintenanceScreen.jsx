import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';

const statusColors   = { pending:'#f59e0b', 'in-progress':'#3b82f6', resolved:'#22c55e' };
const priorityColors = { low:'#22c55e', medium:'#f59e0b', high:'#ef4444', urgent:'#dc2626' };

export default function MyMaintenanceScreen({ navigation }) {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    try { const res = await api.get('/maintenance'); setItems(res.data); }
    catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchItems(); }, []));

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('MaintenanceForm')}>
        <Text style={s.addBtnText}>＋ Report New Issue</Text>
      </TouchableOpacity>
      <FlatList data={items} keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(); }} tintColor="#00b4d8" />}
        renderItem={({ item: m }) => {
          const sc = statusColors[m.status]     || '#94a3b8';
          const pc = priorityColors[m.priority] || '#94a3b8';
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.category}>{m.category?.toUpperCase()} · Room {m.roomNumber}</Text>
                <View style={[s.badge, { backgroundColor: sc+'22', borderColor: sc }]}>
                  <Text style={[s.badgeText, { color: sc }]}>{m.status}</Text>
                </View>
              </View>
              <Text style={s.date}>📅 {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              <Text style={s.desc}>{m.description}</Text>
              <View style={[s.prioBadge, { borderColor: pc }]}>
                <Text style={[s.prioText, { color: pc }]}>⚡ {m.priority} priority</Text>
              </View>
              {m.adminNotes ? <Text style={s.notes}>📝 Admin: {m.adminNotes}</Text> : null}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={s.empty}>No maintenance requests yet.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  addBtn:    { backgroundColor: '#00b4d8', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12 },
  addBtnText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
  card:      { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category:  { fontSize: 13, fontWeight: '700', color: '#00b4d8' },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  date:      { color: '#64748b', fontSize: 11, marginBottom: 8 },
  desc:      { color: '#f1f5f9', fontSize: 14, marginBottom: 10, lineHeight: 20 },
  prioBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginBottom: 6 },
  prioText:  { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  notes:     { color: '#94a3b8', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  empty:     { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
});
