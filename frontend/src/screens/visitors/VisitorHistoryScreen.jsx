import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';

const statusColors = { pending:'#f59e0b', approved:'#22c55e', rejected:'#ef4444' };

export default function VisitorHistoryScreen({ navigation }) {
  const [visitors, setVisitors]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVisitors = useCallback(async () => {
    try { const res = await api.get('/visitors'); setVisitors(res.data); }
    catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchVisitors(); }, []));

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('VisitorRegister')}>
        <Text style={s.addBtnText}>＋ Register New Visitor</Text>
      </TouchableOpacity>
      <FlatList data={visitors} keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVisitors(); }} tintColor="#00b4d8" />}
        renderItem={({ item: v }) => {
          const c = statusColors[v.status] || '#94a3b8';
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.name}>{v.visitorName}</Text>
                <View style={[s.badge, { backgroundColor: c+'22', borderColor: c }]}>
                  <Text style={[s.badgeText, { color: c }]}>{v.status}</Text>
                </View>
              </View>
              <Text style={s.detail}>📞 {v.visitorPhone} · {v.relationship}</Text>
              <Text style={s.detail}>📅 {new Date(v.visitDate).toLocaleDateString()} at {v.visitTime}</Text>
              <Text style={s.detail}>👥 {v.numVisitors} visitor(s) · Purpose: {v.visitPurpose}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={s.empty}>No visitor registrations yet.</Text>}
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
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name:      { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  detail:    { color: '#94a3b8', fontSize: 13, marginBottom: 3 },
  empty:     { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
});
