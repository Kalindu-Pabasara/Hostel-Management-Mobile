import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';

const statusColors = { pending:'#f59e0b', approved:'#22c55e', rejected:'#ef4444', cancelled:'#94a3b8' };

export default function AdminBookingsScreen() {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try { const res = await api.get('/bookings'); setBookings(res.data); }
    catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchBookings(); }, []));

  const action = async (id, type) => {
    try {
      await api.patch(`/bookings/${id}/${type}`);
      fetchBookings();
    } catch (e) { Alert.alert('Error', e.response?.data?.message || e.message); }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <FlatList data={bookings} keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor="#00b4d8" />}
        renderItem={({ item: b }) => {
          const c = statusColors[b.status] || '#94a3b8';
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.roomNum}>Room {b.roomId?.roomNumber || '—'}</Text>
                <View style={[s.badge, { backgroundColor: c+'22', borderColor: c }]}>
                  <Text style={[s.badgeText, { color: c }]}>{b.status}</Text>
                </View>
              </View>
              <Text style={s.student}>👤 {b.studentId?.name || '—'}</Text>
              <Text style={s.detail}>{b.roomId?.type} · LKR {b.roomId?.price?.toLocaleString()}/mo</Text>
              <Text style={s.date}>📅 {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</Text>
              {b.status === 'pending' && (
                <View style={s.actions}>
                  <TouchableOpacity style={s.approveBtn} onPress={() => action(b._id, 'approve')}>
                    <Text style={s.approveText}>✅ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => action(b._id, 'reject')}>
                    <Text style={s.rejectText}>❌ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={s.empty}>No booking requests.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  card:        { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  roomNum:     { fontSize: 17, fontWeight: '700', color: '#f1f5f9' },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:   { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  student:     { color: '#00b4d8', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  detail:      { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  date:        { color: '#94a3b8', fontSize: 13, marginBottom: 8 },
  actions:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  approveBtn:  { flex: 1, backgroundColor: '#22c55e22', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#22c55e' },
  approveText: { color: '#22c55e', fontWeight: '600', fontSize: 13 },
  rejectBtn:   { flex: 1, backgroundColor: '#ef444422', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  rejectText:  { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  empty:       { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
});
