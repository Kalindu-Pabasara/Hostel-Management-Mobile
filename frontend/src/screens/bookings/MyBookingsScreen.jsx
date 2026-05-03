import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';

const statusColors = { pending:'#f59e0b', approved:'#22c55e', rejected:'#ef4444', cancelled:'#94a3b8' };

export default function MyBookingsScreen() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try { const res = await api.get('/bookings'); setBookings(res.data); }
    catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchBookings(); }, []));

  const cancelBooking = (id) => {
    Alert.alert('Cancel Booking', 'Cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try { await api.delete(`/bookings/${id}`); fetchBookings(); }
        catch (e) { Alert.alert('Error', e.response?.data?.message || e.message); }
      }},
    ]);
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
              <Text style={s.detail}>{b.roomId?.type} · LKR {b.roomId?.price?.toLocaleString()}/mo</Text>
              <Text style={s.date}>📅 {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</Text>
              {(b.status === 'pending' || b.status === 'approved') && (
                <TouchableOpacity style={s.cancelBtn} onPress={() => cancelBooking(b._id)}>
                  <Text style={s.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={s.empty}>No bookings yet.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  card:       { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  roomNum:    { fontSize: 17, fontWeight: '700', color: '#f1f5f9' },
  badge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:  { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  detail:     { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  date:       { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  cancelBtn:  { marginTop: 10, backgroundColor: '#ef444422', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  cancelText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  empty:      { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
});
